# Стандарты разработки Go-микросервисов: Clean Architecture, Валидация Config и Локальные транзакции

Этот стандарт устанавливает единые правила для проектирования, структурирования папок, безопасной инициализации конфигурации и управления транзакциями в микросервисах MathalamaEdu.

---

## 1. Структура папок Go-микросервиса (Clean Architecture)

Каждый микросервис MathalamaEdu строится по принципам **Чистой Архитектуры (Clean Architecture)** с элементами гексагональной архитектуры. Бизнес-логика (Use Cases) должна быть полностью изолирована от внешних деталей (базы данных, транспортных протоколов HTTP/gRPC, брокеров сообщений).

### Рекомендуемая файловая структура микросервиса (на примере `Auth & User Service`):

```
.
├── cmd/
│   └── auth_service/
│       └── main.go         # Точка входа. Собирает зависимости (DI) и запускает серверы
├── config/
│   ├── config.go           # Структуры конфигурации, валидация .env и метод Load()
│   └── config.yml          # Локальный файл конфигурации (опционально)
├── internal/
│   ├── domain/             # Слои сущностей (Entities). Чистые структуры без внешних библиотек
│   │   ├── user.go         # Сущность User (структура данных пользователя)
│   │   └── errors.go       # Общесистемные ошибки бизнес-логики (например, ErrUserNotFound)
│   ├── usecase/            # Бизнес-логика (Use Cases / Interactors)
│   │   ├── user.go         # Реализация юзкейсов (например, RegisterUser, AnonymizeUser)
│   │   ├── interfaces.go   # Описание интерфейсов репозиториев (Порты)
│   │   └── tx_manager.go   # Интерфейс менеджера транзакций
│   ├── repository/         # Адаптеры базы данных (Infrastructure / Repositories)
│   │   └── postgres/
│   │       ├── user.go     # Конкретная реализация интерфейса репозитория для PostgreSQL
│   │       └── pg_tx.go    # Конкретная реализация менеджера транзакций
│   └── delivery/           # Внешние адаптеры ввода-вывода (HTTP, gRPC, NATS)
│       ├── http/           # HTTP REST адаптеры (например, Gin, Fiber или net/http)
│       │   ├── v1/
│       │   │   ├── router.go
│       │   │   └── user.go # Хэндлеры для работы с пользователями
│       │   └── middleware/
│       ├── grpc/           # gRPC сервер и хэндлеры (protobuf)
│       │   └── user.go
│       └── nats_pub/       # Обработчики событий (Publishers / Subscribers) NATS
│           └── gdpr.go     # Воркер анонимизации (подписчик на события GDPR)
├── pkg/                    # Общие утилиты (могут использоваться в других проектах)
│   ├── logger/             # Инициализация логгера (Zap/Zerolog)
│   └── postgres/           # Клиент базы данных PostgreSQL (соединение, пулы)
├── .env                    # Локальные переменные окружения (игнорируется в git)
├── .env.example            # Пример файла окружения (коммитится в репозиторий)
├── Dockerfile
├── go.mod
└── go.sum
```

---

## 2. Строгая валидация конфигурации (`.env`)

Инициализация приложения должна следовать принципу **Fail-Fast (Падай быстро)**: если при старте микросервиса отсутствует обязательная переменная окружения или имеет некорректный формат (например, невалидный порт), приложение должно немедленно завершить работу с ошибкой, а не пытаться работать в сломанном состоянии.

Для парсинга и строгой валидации `.env` рекомендуется использовать библиотеку `cleanenv` (`github.com/ilyakaznacheev/cleanenv`).

### Пример реализации конфигурации с валидацией (`config/config.go`):

```go
package config

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/ilyakaznacheev/cleanenv"
)

type (
	// Config объединяет все настройки микросервиса
	Config struct {
		App      AppConfig  `yaml:"app" env-required:"true"`
		HTTP     HTTPConfig `yaml:"http" env-required:"true"`
		PG       PGConfig   `yaml:"postgres" env-required:"true"`
		NATS     NATSConfig `yaml:"nats" env-required:"true"`
		Security SecConfig  `yaml:"security" env-required:"true"`
	}

	AppConfig struct {
		Name    string `env:"APP_NAME" env-default:"auth-service" env-required:"true"`
		Version string `env:"APP_VERSION" env-default:"1.0.0"`
		Env     string `env:"APP_ENV" env-default:"development" env-required:"true"` // development, production
	}

	HTTPConfig struct {
		Port            int           `env:"HTTP_PORT" env-default:"8080" env-required:"true"`
		ReadTimeout     time.Duration `env:"HTTP_READ_TIMEOUT" env-default:"5s"`
		WriteTimeout    time.Duration `env:"HTTP_WRITE_TIMEOUT" env-default:"5s"`
		ShutdownTimeout time.Duration `env:"HTTP_SHUTDOWN_TIMEOUT" env-default:"10s"`
	}

	PGConfig struct {
		URL          string `env:"PG_URL" env-required:"true"` // Example: postgres://user:pass@localhost:5432/db?sslmode=disable
		MaxPoolSize  int    `env:"PG_MAX_POOL_SIZE" env-default:"20"`
		ConnAttempts int    `env:"PG_CONN_ATTEMPTS" env-default:"10"`
		ConnTimeout  time.Duration `env:"PG_CONN_TIMEOUT" env-default:"2s"`
	}

	NATSConfig struct {
		URL           string `env:"NATS_URL" env-required:"true"` // Example: nats://localhost:4222
		ClientName    string `env:"NATS_CLIENT_NAME" env-required:"true"`
		RetryAttempts int    `env:"NATS_RETRY_ATTEMPTS" env-default:"5"`
	}

	SecConfig struct {
		JWTSecret string        `env:"JWT_SECRET" env-required:"true"`
		JWTTTL    time.Duration `env:"JWT_TTL" env-default:"24h"`
		Salt      string        `env:"PASSWORD_SALT" env-required:"true"`
	}
)

// Load считывает файл .env и валидирует его значения
func Load() (*Config, error) {
	var cfg Config

	// Проверяем наличие файла .env. Если его нет — читаем переменные окружения хоста
	envPath := ".env"
	if _, err := os.Stat(envPath); err == nil {
		err = cleanenv.ReadConfig(envPath, &cfg)
		if err != nil {
			return nil, fmt.Errorf("ошибка чтения .env файла: %w", err)
		}
	} else {
		err = cleanenv.ReadEnv(&cfg)
		if err != nil {
			return nil, fmt.Errorf("ошибка чтения переменных окружения: %w", err)
		}
	}

	// Кастомная валидация критичных полей
	if cfg.HTTP.Port < 1 || cfg.HTTP.Port > 65535 {
		return nil, fmt.Errorf("невалидный порт HTTP: %d (должен быть в диапазоне 1-65535)", cfg.HTTP.Port)
	}

	if len(cfg.Security.JWTSecret) < 32 {
		return nil, fmt.Errorf("JWT_SECRET слишком короткий (%d символов), должен быть не менее 32 символов", len(cfg.Security.JWTSecret))
	}

	return &cfg, nil
}
```

### Использование в `cmd/auth_service/main.go`:

```go
package main

import (
	"log"
	"mathalama-edu/config"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		// Приложение моментально прекращает работу с информативным сообщением
		log.Fatalf("Критическая ошибка инициализации конфигурации: %v", err)
	}

	log.Printf("Сервис %s запущен в режиме: %s", cfg.App.Name, cfg.App.Env)
	// Дальнейший запуск БД, брокеров и серверов...
}
```

---

## 3. Локальные SQL-транзакции в Clean Architecture

Одной из сложнейших задач в Чистой Архитектуре является управление транзакциями на уровне Use Case (бизнес-логики), не привязываяUse Case к конкретной реализации БД (библиотеке `sql/sqlx` или gorm). 

В Go-микросервисах MathalamaEdu используется **патент TxManager через context.Context**. Бизнес-логика ничего не знает о SQL, она просто просит запустить операцию в транзакции. 

### Шаг 3.1: Описание интерфейсов в слое бизнес-логики (`internal/usecase/interfaces.go`):

```go
package usecase

import "context"

// TxManager определяет интерфейс для управления локальными транзакциями
type TxManager interface {
	WithinTransaction(ctx context.Context, fn func(ctx context.Context) error) error
}

// UserRepo описывает методы работы с пользователями в БД
type UserRepo interface {
	Create(ctx context.Context, u *User) error
	GetByID(ctx context.Context, id string) (*User, error)
	Update(ctx context.Context, u *User) error
}
```

### Шаг 3.2: Пример бизнес-логики (Use Case) с использованием транзакции (`internal/usecase/user.go`):

Мы хотим атомарно создать пользователя и записать событие лога действий пользователя в БД в рамках одной транзакции.

```go
package usecase

import (
	"context"
	"fmt"
)

type UserUseCase struct {
	userRepo  UserRepo
	txManager TxManager
}

func NewUserUseCase(ur UserRepo, tx TxManager) *UserUseCase {
	return &UserUseCase{userRepo: ur, txManager: tx}
}

// RegisterUser выполняет регистрацию пользователя
func (uc *UserUseCase) RegisterUser(ctx context.Context, user *User) error {
	// Запускаем локальную транзакцию в БД
	return uc.txManager.WithinTransaction(ctx, func(txCtx context.Context) error {
		
		// 1. Создаем пользователя в БД (используется контекст транзакции txCtx!)
		if err := uc.userRepo.Create(txCtx, user); err != nil {
			return fmt.Errorf("ошибка создания пользователя: %w", err)
		}

		// 2. Если бы у нас было другое действие (например, создание лога или прогресса), 
		// мы бы также выполнили его здесь через txCtx.
		// Если fn вернет ошибку, TxManager автоматически сделает ROLLBACK.

		return nil // Успешное выполнение — TxManager сделает COMMIT
	})
}
```

### Шаг 3.3: Реализация `TxManager` на базе PostgreSQL (`internal/repository/postgres/pg_tx.go`):

Мы используем стандартный пакет `database/sql`. `TxManager` берет транзакцию, кладет ее в `context.Context` и передает дальше. Репозитории смотрят в контекст: если в контексте есть транзакция — они выполняют запросы в ней. Если нет — выполняют запросы вне транзакции.

```go
package postgres

import (
	"context"
	"database/sql"
	"fmt"
)

type contextKey string

const txKey contextKey = "pg_transaction"

type PgTxManager struct {
	db *sql.DB
}

func NewPgTxManager(db *sql.DB) *PgTxManager {
	return &PgTxManager{db: db}
}

// WithinTransaction оборачивает выполнение функции fn в SQL-транзакцию
func (m *PgTxManager) WithinTransaction(ctx context.Context, fn func(ctx context.Context) error) error {
	// Начинаем транзакцию
	tx, err := m.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("не удалось начать транзакцию: %w", err)
	}

	// Записываем объект транзакции в контекст
	txCtx := context.WithValue(ctx, txKey, tx)

	// Выполняем бизнес-логику
	err = fn(txCtx)
	if err != nil {
		// В случае ошибки делаем откат
		if rollbackErr := tx.Rollback(); rollbackErr != nil {
			return fmt.Errorf("ошибка отката транзакции: %v (исходная ошибка: %w)", rollbackErr, err)
		}
		return err
	}

	// Если ошибок нет — фиксируем транзакцию
	if commitErr := tx.Commit(); commitErr != nil {
		return fmt.Errorf("ошибка коммита транзакции: %w", commitErr)
	}

	return nil
}

// getTxExtractor возвращает транзакцию из контекста, если она есть
func extractTx(ctx context.Context) *sql.Tx {
	if tx, ok := ctx.Value(txKey).(*sql.Tx); ok {
		return tx
	}
	return nil
}
```

### Шаг 3.4: Использование транзакции в репозитории (`internal/repository/postgres/user.go`):

Репозиторий теперь полностью автономен и не привязан к ручному открытию транзакций:

```go
package postgres

import (
	"context"
	"database/sql"
	"mathalama-edu/internal/domain"
)

type UserRepository struct {
	db *sql.DB // Общее подключение к БД
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(ctx context.Context, u *domain.User) error {
	query := `
		INSERT INTO users (id, email, email_hash, first_name, last_name, password_hash, role, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`
	// Извлекаем транзакцию из контекста
	tx := extractTx(ctx)
	
	// Если транзакция существует, выполняем запрос в ней. Если нет — в общей БД.
	if tx != nil {
		_, err := tx.ExecContext(ctx, query, u.ID, u.Email, u.EmailHash, u.FirstName, u.LastName, u.PasswordHash, u.Role, u.Status)
		return err
	}

	_, err := r.db.ExecContext(ctx, query, u.ID, u.Email, u.EmailHash, u.FirstName, u.LastName, u.PasswordHash, u.Role, u.Status)
	return err
}
```

---

## 4. Единые стандарты обработки ошибок (Error Handling)

Качественная обработка ошибок — основа стабильности распределенной микросервисной системы. Мы придерживаемся строгих стандартов обработки и логирования ошибок на всех трех слоях Clean Architecture.

### 4.1. Доменные ошибки (Слой Domain)
База данных или протокол передачи данных (HTTP/gRPC) **никогда не должны диктовать логику**. Все системные ошибки описываются в виде типизированных переменных в слое `internal/domain/errors.go`:

```go
package domain

import "errors"

var (
	ErrUserNotFound      = errors.New("user not found")
	ErrCohortNotFound    = errors.New("cohort not found")
	ErrValidationFailed  = errors.New("validation failed")
	ErrUnauthorized      = errors.New("unauthorized access")
	ErrLessonLocked      = errors.New("lesson is locked for the student")
	ErrAlreadyExists     = errors.New("resource already exists")
)
```

### 4.2. Трансляция ошибок в репозиториях (Слой Repository)
Репозитории перехватывают низкоуровневые ошибки драйвера базы данных (например, `sql.ErrNoRows` или ошибку уникального ключа PostgreSQL `23505`) и транслируют их в чистые доменные ошибки:

```go
if err == sql.ErrNoRows {
	return domain.ErrUserNotFound
}
if pgErr, ok := err.(*pgconn.PgError); ok && pgErr.Code == "23505" {
	return domain.ErrAlreadyExists
}
```

### 4.3. Унифицированные HTTP-ответы об ошибках (Слой Delivery HTTP)
Клиент (веб/мобильное приложение) никогда не должен получать сырые системные строки вроде `sql: database connection refused`. 
Для всех HTTP-ошибок отдается стандартный JSON-конверт:

```json
{
  "error_code": "VALIDATION_FAILED",
  "message": "Ошибка валидации переданных параметров.",
  "details": {
    "email": "формат email-адреса невалиден"
  }
}
```

#### Вспомогательная структура и хэндлер в Go:
```go
type APIError struct {
	ErrorCode string            `json:"error_code"`
	Message   string            `json:"message"`
	Details   map[string]string `json:"details,omitempty"`
}

func RespondWithError(c *gin.Context, err error) {
	var apiErr APIError
	var status int

	switch {
	case errors.Is(err, domain.ErrUserNotFound):
		status = http.StatusNotFound
		apiErr = APIError{ErrorCode: "USER_NOT_FOUND", Message: err.Error()}
	case errors.Is(err, domain.ErrValidationFailed):
		status = http.StatusBadRequest
		apiErr = APIError{ErrorCode: "VALIDATION_FAILED", Message: "Invalid parameters."}
	case errors.Is(err, domain.ErrUnauthorized):
		status = http.StatusUnauthorized
		apiErr = APIError{ErrorCode: "UNAUTHORIZED", Message: "Access denied."}
	default:
		status = http.StatusInternalServerError
		apiErr = APIError{ErrorCode: "INTERNAL_ERROR", Message: "Произошла внутренняя ошибка сервера."}
	}
	
	c.JSON(status, apiErr)
}
```

### 4.4. Сопоставление ошибок в gRPC (Слой Delivery gRPC)
gRPC общается стандартными кодами состояния Google. При передаче ошибок через gRPC доменные ошибки сопоставляются со статус-кодами пакета `google.golang.org/grpc/status`:
*   `domain.ErrUserNotFound` $\rightarrow$ `codes.NotFound`
*   `domain.ErrUnauthorized` $\rightarrow$ `codes.Unauthenticated`
*   `domain.ErrValidationFailed` $\rightarrow$ `codes.InvalidArgument`

```go
func (s *GRPCServer) GetUser(ctx context.Context, req *pb.UserRequest) (*pb.UserResponse, error) {
	user, err := s.useCase.GetUserByID(ctx, req.Id)
	if err != nil {
		if errors.Is(err, domain.ErrUserNotFound) {
			return nil, status.Error(codes.NotFound, "пользователь не найден")
		}
		return nil, status.Error(codes.Internal, "внутренняя ошибка")
	}
	return &pb.UserResponse{Id: user.ID, Email: user.Email}, nil
}
```

### 4.5. Асинхронные ошибки в воркерах (NATS JetStream)
Обработка ошибок в подписчиках NATS строго разделяется по типу сбоя:
1.  **Временные ошибки (Transient Errors):** Перегрузка БД, сетевой сбой, недоступность S3. В этом случае воркер логирует ошибку и вызывает метод **`msg.Nak()`** (Negative Acknowledgment). Брокер NATS поймет, что сообщение не обработано, и повторно отправит его через увеличивающийся интервал времени (backoff).
2.  **Неисправимые ошибки (Fatal Errors):** Сломанный JSON, обращение к несуществующей сущности по неверному ID. Воркер логирует фатальный сбой с обязательным логированием `correlation_id`, пересылает сообщение в специальную очередь брака (**Dead Letter Queue / DLQ**) для ручного разбора администратором и вызывает **`msg.Ack()`**, чтобы не блокировать обработку очереди.

---

## 5. Почему эта архитектура превосходна?

1. **Идеальная тестируемость:** Слои бизнес-логики (`internal/usecase`) покрываются юнит-тестами на 100%, используя моки репозиториев (например, сгенерированные через `mockgen`). База данных для тестов логики не нужна.
2. **Безопасность по Fail-Fast:** Вы мгновенно узнаете о любой забытой или сломанной переменной окружения в `.env` еще при сборке контейнера, до запуска в продакшене.
3. **Безопасные транзакции:** Код бизнес-логики остается чистым, не содержит SQL-зависимостей, но транзакции отрабатывают надежно, гарантируя целостность данных в PostgreSQL.
4. **Консистентная обработка ошибок:** Фронтенд-разработчики и мобильные клиенты всегда получают предсказуемые коды ошибок и могут красиво их отрисовывать, а распределенная очередь никогда не блокируется благодаря разделению Nak/DLQ.
