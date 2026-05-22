# MathalamaEdu: Событийно-Ориентированный Конвейер Обучения (Event-Driven LMS)

**MathalamaEdu** — это высоконагруженная, событийно-ориентированная онлайн-платформа для интерактивного обучения математике, спроектированная как современная, сфокусированная альтернатива перегруженным системам вроде GetCourse. Платформа полностью очищена от маркетингового шума, ворон продаж и ориентирована на европейский рынок с жестким соблюдением приватности (GDPR Compliance).

---

## 1. Продуктовая концепция: Гибридный конвейер обучения

Каждый урок представляет собой комплексную цепочку последовательного прохождения на одной странице. Студент продвигается вперед по принципу **Content Dripping** (последовательного капельного доступа).

### Визуальный флоу прохождения урока студентом:
```mermaid
graph TD
    Start([1. Студент открывает Урок]) --> Video[2. Просмотр видеолекции]
    Video --> |Отметка о просмотре| Test{3. Интерактивный Тест}
    
    Test --> |Провал < 70%| TestRetry[Мгновенная пересдача]
    TestRetry --> Test
    
    Test --> |Успех >= 70%| Synopsis[4. Рукописный конспект лекции в PDF]
    Synopsis --> |Загрузка файла| Webhook{5. Проверка куратором}
    
    Webhook --> |Отклонено / Доработка| Synopsis
    Webhook --> |Одобрено куратором| Unlock([6. Разблокировка следующего урока])
    
    style Start fill:#4F46E5,stroke:#312E81,stroke-width:2px,color:#fff
    style Test fill:#F59E0B,stroke:#78350F,stroke-width:2px,color:#fff
    style Webhook fill:#10B981,stroke:#065F46,stroke-width:2px,color:#fff
    style Unlock fill:#8B5CF6,stroke:#4C1D95,stroke-width:2px,color:#fff
```

### Роли и возможности на платформе:

| Возможности / Роли | Студент (Student) | Куратор (Curator) | Администратор (Admin) |
| :--- | :---: | :---: | :---: |
| **Доступ к курсам** | Только своя когорта | Только закрепленная группа | Полный доступ |
| **Прогресс уроков** | Последовательный (Dripping) | Просмотр успеваемости группы | Управление структурой |
| **Интерактивные тесты** | Бесконечные мгновенные попытки | Просмотр истории попыток | Импорт вопросов из JSON |
| **Проверка конспектов** | Сдача PDF-файлов | Оценивание (0-100%) + Фидбек | Назначение кураторов |
| **Интеграция с Telegram** | — | Управление проверкой одной кнопкой | — |
| **GDPR Удаление аккаунта**| Самостоятельно в 1 клик | — | — |

---

## 2. Быстрое управление куратора через Telegram-бота

Для кураторов реализован интерактивный бот **`MathalamaEduBot`**, позволяющий проверять работы в реальном времени прямо с мобильного телефона без входа на сайт платформы.

```mermaid
sequenceDiagram
    autonumber
    actor Студент
    actor Куратор
    participant Бэкенд
    participant Telegram-Бот

    Студент->>Бэкенд: Загружает конспект лекции (PDF)
    Бэкенд-->>Telegram-Бот: Публикация события submission.created в NATS
    Telegram-Бот->>Куратор: Сообщение с карточкой студента, ссылкой на PDF и кнопками
    Note over Куратор: Куратор изучает PDF конспекта
    Куратор->>Telegram-Бот: Нажимает inline-кнопку "Одобрить (Approve)"
    Telegram-Бот->>Бэкенд: Отправляет gRPC-запрос с оценкой 100% и статусом
    Бэкенд-->>Студент: Колокольчик: "Конспект одобрен. Открыт следующий урок!"
```

---

## 3. Микросервисная архитектура системы

Платформа спроектирована как децентрализованное облако независимых микросервисов на Go, взаимодействующих асинхронно через шину событий **NATS JetStream** и синхронно по высокопроизводительному протоколу **gRPC**.

```mermaid
graph TD
    Client[Браузер / Клиент] -->|HTTPS| Gateway[Nginx API Gateway]
    
    subgraph Microservices [Микросервисы на Go]
        Gateway -->|/api/v1/auth| AuthServ[Auth & User Service]
        Gateway -->|/api/v1/student/courses| ContentServ[Course & Content Service]
        Gateway -->|/api/v1/student/lessons| ProgressServ[Progress & Submissions Service]
        
        TG_API[Telegram Bot API] <-->|Webhooks| TG_Serv[Telegram Bot Service]
        ProgressServ -.->|События NATS| NotificationServ[Notification Service]
    end

    subgraph EventMesh [Шина Событий]
        AuthServ <-->|gRPC / NATS| ProgressServ
        ProgressServ <-->|gATS JetStream| TG_Serv
        ProgressServ <-->|NATS JetStream| NotificationServ
        NATS[NATS JetStream Broker]
    end

    subgraph StorageLayer [Слой Данных и Хранилищ]
        AuthServ --> AuthDB[(PostgreSQL Auth DB)]
        ContentServ --> ContentDB[(PostgreSQL Content DB)]
        ProgressServ --> ProgressDB[(PostgreSQL Progress DB)]
        TG_Serv --> Redis[(Redis FSM Store)]
        ProgressServ --> MinIO[(MinIO S3 Object Storage)]
    end

    style Gateway fill:#3B82F6,stroke:#1D4ED8,stroke-width:2px,color:#fff
    style NATS fill:#EC4899,stroke:#9D174D,stroke-width:2px,color:#fff
    style MinIO fill:#F97316,stroke:#C2410C,stroke-width:2px,color:#fff
```

---

## 4. Двухфазный конвейер GDPR-Анонимизации (Право на забвение)

Для полного соответствия европейскому законодательству GDPR, удаление аккаунта студента происходит в два этапа, защищая базу данных от разрушения аналитических связей.

```mermaid
sequenceDiagram
    autonumber
    actor Студент
    participant Auth Service
    participant NATS JetStream
    participant Progress Service
    participant MinIO S3

    Студент->>Auth Service: Нажимает "Удалить профиль"
    Note over Auth Service: Фаза 1 (Soft Lock): Статус = deleted_scheduled
    Auth Service-->>Студент: Учетная запись заблокирована на 14 дней (можно восстановить)
    
    Note over Auth Service: Проходит 14 дней. Ежедневный Cron-воркер находит запись.
    
    Auth Service->>NATS JetStream: Публикация события user.gdpr_delete_requested
    
    par Анонимизация в Auth Service
        Auth Service->>Auth Service: SHA-256 хэширование email,<br/>стирание ФИО, сброс Telegram
    and Очистка файлов в Progress Service
        NATS JetStream-->>Progress Service: Событие получено воркером
        Progress Service->>MinIO S3: Физическое удаление всех PDF-конспектов студента
        Progress Service->>Progress Service: Анонимизация метаданных попыток сдачи
    end
    
    Note over Auth Service, Progress Service: Фаза 2 завершена: Аналитика курсов цела,<br/>персональные данные стерты навсегда
```

---

## 5. Паттерны отказоустойчивости и надежности

Для предотвращения каскадных сбоев при синхронном общении микросервисов на gRPC-клиентах реализован паттерн **Circuit Breaker** (Предохранитель) с криптографическим локальным резервом (Fallback).

```mermaid
stateDiagram-v2
    [*] --> CLOSED : Старт системы (Нормальный режим)
    CLOSED --> OPEN : Процент ошибок gRPC > 50% за 10с
    Note right of CLOSED : Запросы gRPC к Auth проходят штатно
    OPEN --> HALF_OPEN : Прошло 30 секунд (cooldown)
    Note right of OPEN : gRPC блокируется. Включается Fallback (проверка JWT локальным ключом)
    HALF_OPEN --> CLOSED : 5 успешных тестовых gRPC-запросов подряд
    HALF_OPEN --> OPEN : Хотя бы 1 ошибка
```

> [!NOTE]
> **Локальный Fallback:** Если `Auth & User Service` недоступен (Circuit Breaker в состоянии `OPEN`), `Progress Service` временно переходит на локальную криптографическую проверку JWT-токена студента с помощью общего `JWT_SECRET`. Студент может продолжать просматривать теорию и видео, но операции записи блокируются до восстановления связи.

---

## 6. Гексагональная структура Go-микросервиса (Clean Architecture)

Вся кодовая база микросервисов MathalamaEdu пишется строго в соответствии с принципами чистой архитектуры. Бизнес-логика полностью отделена от внешних драйверов СУБД, HTTP и gRPC фреймворков.

```
internal/
├── domain/             # Слои сущностей (Entities). Чистые структуры Go (errors.go, user.go)
├── usecase/            # Бизнес-логика (Use Cases). Чистые алгоритмы, порты (interfaces.go)
├── repository/         # Адаптеры баз данных. Реализация SQL запросов (PgTxManager, PostgresRepo)
└── delivery/           # Внешние адаптеры ввода-вывода (HTTP-хэндлеры, gRPC-сервер, NATS-воркеры)
```

### Ключевые паттерны в коде:
*   **Fail-Fast Config:** Микросервис мгновенно падает при запуске с информативным логом, если в `.env` отсутствует обязательная настройка или допущен невалидный формат порта.
*   **TxManager в context.Context:** Управление SQL-транзакциями вынесено на слой бизнес-логики (`usecase`), при этом логика остается полностью чистой от импортов SQL-пакетов благодаря передаче транзакции в контексте.
*   **Nak/DLQ в NATS:** Фоновые очереди разделяют ошибки на временные (перевызов через `msg.Nak()`) и фатальные (сброс в Dead Letter Queue для ручного анализа с вызовом `msg.Ack()`).
