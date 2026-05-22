# Руководство по реализации Event-Driven архитектуры в Go на базе NATS JetStream

Событийно-ориентированная архитектура (Event-Driven) требует надежной основы для обмена сообщениями, обработки ошибок, повторных попыток и отслеживания сквозного пути запроса (Distributed Tracing).

В этом руководстве описывается, как спроектировать и написать надежный событийный слой для **MathalamaEdu** на языке **Go (Golang)** с использованием **NATS JetStream**.

---

## 1. Концепция обертки событий (Event Envelope)

Все события в системе должны иметь единую стандартизированную структуру (конверт). Это позволяет воркерам логировать сквозной путь событий, фильтровать сообщения и обеспечивать безопасность.

### Структура Event Envelope (JSON):
```json
{
  "event_id": "a90dfc11-9e28-4ad0-b883-7c30932bb82a",
  "event_type": "submission.approved",
  "timestamp": "2026-05-22T21:58:00Z",
  "actor_id": "curator_uuid",
  "correlation_id": "trace-uuid-12345",
  "payload": {
    "submission_id": "submission_uuid",
    "student_id": "student_uuid",
    "cohort_id": "cohort_uuid",
    "lesson_id": "lesson_uuid"
  }
}
```

*   **`correlation_id` (Идентификатор корреляции):** Создается в HTTP-запросе и прокидывается через все очереди в воркеры. Позволяет в логах (через Kibana или Grafana Loki) увидеть всю цепочку действий: от клика куратора до отправки письма и открытия уроков.

---

## 2. Инициализация NATS JetStream в Go

Для работы с JetStream в Go используется официальная библиотека `github.com/nats-io/nats.go`. Мы реализуем автоматическое создание стримов (Streams) при запуске приложения, чтобы инфраструктура настраивалась сама.

### Шаблон инициализации (internal/platform/nats/nats.go):
```go
package nats

import (
	"context"
	"time"

	"github.com/nats-io/nats.go"
	"github.com/rs/zerolog/log"
)

type JetStreamBroker struct {
	nc *nats.Conn
	js nats.JetStreamContext
}

func NewJetStreamBroker(url string) (*JetStreamBroker, error) {
	// Подключение с автоматическим переподключением
	nc, err := nats.Connect(url,
		nats.MaxReconnects(-1),
		nats.ReconnectWait(2*time.Second),
		nats.DisconnectErrHandler(func(c *nats.Conn, err error) {
			log.Warn().Err(err).Msg("NATS disconnected! Attempting to reconnect...")
		}),
		nats.ReconnectHandler(func(c *nats.Conn) {
			log.Info().Msg("NATS reconnected successfully.")
		}),
	)
	if err != nil {
		return nil, err
	}

	js, err := nc.JetStream()
	if err != nil {
		nc.Close()
		return nil, err
	}

	broker := &JetStreamBroker{nc: nc, js: js}
	
	// Авто-инициализация стрима для Mathalama
	if err := broker.setupStreams(); err != nil {
		nc.Close()
		return nil, err
	}

	return broker, nil
}

func (b *JetStreamBroker) setupStreams() error {
	// Настройка стрима "mathalama" для обработки событий обучения
	streamConfig := &nats.StreamConfig{
		Name:      "MATHALAMA",
		Subjects:  []string{"mathalama.events.>"},
		Retention: nats.LimitsPolicy, // Удалять сообщения при превышении лимитов
		MaxAge:    72 * time.Hour,     // Хранить сообщения не более 3 дней
		Storage:   nats.FileStorage,   // Сохранять сообщения на диск
	}

	_, err := b.js.AddStream(streamConfig)
	if err != nil && err != nats.ErrStreamNameAlreadyInUse {
		return err
	}

	log.Info().Msg("NATS JetStream initialized successfully. Stream [MATHALAMA] is ready.")
	return nil
}

func (b *JetStreamBroker) Close() {
	b.nc.Close()
}
```

---

## 3. Шаблон Публикации (Publisher Pattern)

Издатель формирует конверт события и публикует его в топик с префиксом `mathalama.events.`.

```go
package nats

import (
	"context"
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"github.com/nats-io/nats.go"
)

type EventEnvelope struct {
	EventID       string          `json:"event_id"`
	EventType     string          `json:"event_type"`
	Timestamp     time.Time       `json:"timestamp"`
	ActorID       string          `json:"actor_id"`
	CorrelationID string          `json:"correlation_id"`
	Payload       json.RawMessage `json:"payload"`
}

func (b *JetStreamBroker) Publish(ctx context.Context, subject string, eventType string, actorID string, correlationID string, payload interface{}) error {
	rawPayload, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	envelope := EventEnvelope{
		EventID:       uuid.New().String(),
		EventType:     eventType,
		Timestamp:     time.Now().UTC(),
		ActorID:       actorID,
		CorrelationID: correlationID,
		Payload:       rawPayload,
	}

	envelopeBytes, err := json.Marshal(envelope)
	if err != nil {
		return err
	}

	// Публикация события с подтверждением доставки (JetStream Publish)
	_, err = b.js.Publish(subject, envelopeBytes, nats.Context(ctx))
	return err
}
```

---

## 4. Шаблон Подписчика и Воркеров (Idempotent Consumer & Queue Group)

Чтобы масштабировать обработку событий и гарантировать, что сообщение обрабатывается только одним инстансом воркера, мы используем **Queue Groups (Группы очередей)**.

```go
package workers

import (
	"context"
	"encoding/json"
	"time"

	"github.com/nats-io/nats.go"
	"github.com/rs/zerolog/log"
)

type SubmissionApprovedPayload struct {
	SubmissionID string `json:"submission_id"`
	StudentID    string `json:"student_id"`
	CohortID     string `json:"cohort_id"`
	LessonID     string `json:"lesson_id"`
}

type DrippingWorker struct {
	js nats.JetStreamContext
	// Тут инжектируются репозитории (usecase) бэкенда
}

func (w *DrippingWorker) Start(ctx context.Context) error {
	// Подписка через Queue Group "dripping-group"
	// Все запущенные копии этого воркера делят нагрузку между собой
	sub, err := w.js.QueueSubscribe(
		"mathalama.events.submission.approved", // Топик
		"dripping-worker-group",               // Имя группы (балансировщик)
		func(msg *nats.Msg) {
			w.handleEvent(msg)
		},
		nats.ManualAck(), // Ручное подтверждение обработки (защита от падений)
		nats.AckWait(30*time.Second), // Таймаут на обработку
	)
	if err != nil {
		return err
	}

	// Ожидаем отмены контекста для Graceful Shutdown
	<-ctx.Done()
	log.Info().Msg("DrippingWorker is shutting down...")
	return sub.Unsubscribe()
}

func (w *DrippingWorker) handleEvent(msg *nats.Msg) {
	var envelope struct {
		CorrelationID string          `json:"correlation_id"`
		Payload       json.RawMessage `json:"payload"`
	}

	if err := json.Unmarshal(msg.Data, &envelope); err != nil {
		log.Error().Err(err).Msg("Failed to unmarshal event envelope")
		msg.Nak() // Сообщаем NATS, что обработка не удалась (событие вернется в очередь)
		return
	}

	// Настройка контекста логгера для трассировки
	logger := log.With().Str("correlation_id", envelope.CorrelationID).Logger()

	var payload SubmissionApprovedPayload
	if err := json.Unmarshal(envelope.Payload, &payload); err != nil {
		logger.Error().Err(err).Msg("Failed to unmarshal event payload")
		msg.Term() // Терминируем сообщение (битый JSON не нужно пытаться обработать снова)
		return
	}

	logger.Info().Str("submission_id", payload.SubmissionID).Msg("Processing submission approval...")

	// --- ВЫЗОВ БИЗНЕС-ЛОГИКИ ---
	// err := w.drippingUsecase.UnlockNextLesson(context.Background(), payload.StudentID, payload.LessonID)
	// ---------------------------

	// Подтверждаем успешную обработку
	if err := msg.Ack(); err != nil {
		logger.Error().Err(err).Msg("Failed to ACK message to NATS")
	} else {
		logger.Info().Msg("Event processed and ACKed successfully.")
	}
}
```

---

## 5. Защита от сбоев (Failure Recovery)

1.  **Manual ACK (Ручное подтверждение):** Воркер посылает `msg.Ack()` только после того, как транзакция в PostgreSQL успешно завершена. Если воркер крашнется в процессе обработки, NATS JetStream перенаправит сообщение другому воркеру по истечении `AckWait`.
2.  **Nak (Negative Acknowledgment):** Если произошел временный сбой (например, просела сеть до PostgreSQL), воркер вызывает `msg.Nak()`. Сообщение сразу же возвращается в очередь и пробуется снова.
3.  **Term (Termination):** Если обнаружена критическая логическая ошибка (битый формат JSON, несуществующий ID курса), воркер вызывает `msg.Term()`. Это удаляет сообщение из очереди окончательно, предотвращая бесконечные циклы обработки (poison pill).

---

## 6. Почему это решение вызовет восторг у интервьюеров?

*   **Надежность (Resilience):** Использование ручного подтверждения (Manual Ack) исключает потерю сообщений при сбоях бэкенда.
*   **Трассируемость (Traceability):** Поле `correlation_id` позволяет отслеживать лог-цепочки в распределенной системе.
*   **Изоляция ошибок:** Использование `Nak` и `Term` показывает глубокое понимание паттернов работы с message-брокерами в реальном продакшене.
