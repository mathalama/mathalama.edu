# Инфраструктура и Развертывание: Docker Compose, Настройка Сетей и Observability

Этот стандарт описывает инфраструктурную часть MathalamaEdu, необходимую для локального запуска всех 5 микросервисов и сопутствующих баз данных, а также стратегию мониторинга (Observability) системы в продакшене.

---

## 1. Схема локальной инфраструктуры (Docker Compose)

Поскольку проект состоит из 5 микросервисов и множества внешних хранилищ (3 раздельные БД PostgreSQL, 1 инстанс Redis для FSM бота, брокер NATS JetStream и S3-хранилище MinIO), ручной запуск невозможен. 

Все компоненты разворачиваются локально с помощью **Docker Compose** с разделением на изолированные сети для безопасности.

### Изоляция сетей (Docker Networks):
1. **`frontend-net`:** Сеть между внешним API Gateway (Nginx) и микросервисами. Студенты и кураторы общаются с бэкендом только через эту сеть. Базы данных в эту сеть **не входят**.
2. **`backend-net`:** Закрытая внутренняя сеть. В ней общаются микросервисы между собой по gRPC и общаются с брокером NATS JetStream.
3. **`db-net`:** Полностью изолированная внутренняя сеть для баз данных и хранилищ (PostgreSQL, Redis, MinIO). Доступ к ней имеют **только микросервисы**. Из внешнего мира подключиться напрямую к БД невозможно.

---

## 2. Локальный манифест `docker-compose.yml`

Ниже приведен готовый инфраструктурный файл для развертывания всего окружения MathalamaEdu одной командой `docker compose up -d`.

```yaml
version: '3.8'

services:
  # --- ХРАНИЛИЩА ДАННЫХ (БАЗЫ ДАННЫХ) ---
  auth-db:
    image: postgres:15-alpine
    container_name: mathalama-auth-db
    environment:
      POSTGRES_USER: auth_user
      POSTGRES_PASSWORD: auth_password
      POSTGRES_DB: auth_db
    volumes:
      - auth_db_data:/var/lib/postgresql/data
    networks:
      - db-net
    ports:
      - "5431:5432" # Проброс портов только для локальной отладки разработчиком

  content-db:
    image: postgres:15-alpine
    container_name: mathalama-content-db
    environment:
      POSTGRES_USER: content_user
      POSTGRES_PASSWORD: content_password
      POSTGRES_DB: content_db
    volumes:
      - content_db_data:/var/lib/postgresql/data
    networks:
      - db-net
    ports:
      - "5432:5432"

  progress-db:
    image: postgres:15-alpine
    container_name: mathalama-progress-db
    environment:
      POSTGRES_USER: progress_user
      POSTGRES_PASSWORD: progress_password
      POSTGRES_DB: progress_db
    volumes:
      - progress_db_data:/var/lib/postgresql/data
    networks:
      - db-net
    ports:
      - "5433:5432"

  redis:
    image: redis:7-alpine
    container_name: mathalama-redis
    command: redis-server --save 60 1 --loglevel warning
    volumes:
      - redis_data:/data
    networks:
      - db-net
    ports:
      - "6379:6379"

  minio:
    image: minio/minio:RELEASE.2023-05-18T00-12-52Z
    container_name: mathalama-minio
    environment:
      MINIO_ROOT_USER: minio_admin
      MINIO_ROOT_PASSWORD: minio_admin_password
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"
    networks:
      - db-net
    ports:
      - "9000:9000" # API S3
      - "9001:9001" # Web-консоль управления MinIO

  # --- ОЧЕРЕДЬ СОБЫТИЙ ---
  nats:
    image: nats:2.9-alpine
    container_name: mathalama-nats
    command: "-js -sd /data" # Включение JetStream и указание директории для персистентного хранения очередей
    volumes:
      - nats_data:/data
    networks:
      - backend-net
    ports:
      - "4222:4222" # Клиентский порт
      - "8222:8222" # HTTP мониторинг NATS

  # --- API GATEWAY (РЕВЕРС-ПРОКСИ) ---
  api-gateway:
    image: nginx:1.25-alpine
    container_name: mathalama-api-gateway
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    ports:
      - "80:80"
    networks:
      - frontend-net
    depends_on:
      - auth-service
      - content-service
      - progress-service

  # --- МИКРОСЕРВИСЫ MATHALAMAEDU ---
  auth-service:
    build:
      context: ./services/auth-service
      dockerfile: Dockerfile
    container_name: mathalama-auth-service
    environment:
      - APP_ENV=development
      - HTTP_PORT=8080
      - PG_URL=postgres://auth_user:auth_password@auth-db:5432/auth_db?sslmode=disable
      - JWT_SECRET=super-secret-key-that-must-be-very-long-32-chars
      - PASSWORD_SALT=some-random-salt-string
      - NATS_URL=nats://nats:4222
      - NATS_CLIENT_NAME=auth-service
    networks:
      - frontend-net
      - backend-net
      - db-net
    depends_on:
      - auth-db
      - nats

  content-service:
    build:
      context: ./services/content-service
      dockerfile: Dockerfile
    container_name: mathalama-content-service
    environment:
      - APP_ENV=development
      - HTTP_PORT=8080
      - PG_URL=postgres://content_user:content_password@content-db:5432/content_db?sslmode=disable
      - NATS_URL=nats://nats:4222
      - NATS_CLIENT_NAME=content-service
    networks:
      - frontend-net
      - backend-net
      - db-net
    depends_on:
      - content-db
      - nats

  progress-service:
    build:
      context: ./services/progress-service
      dockerfile: Dockerfile
    container_name: mathalama-progress-service
    environment:
      - APP_ENV=development
      - HTTP_PORT=8080
      - PG_URL=postgres://progress_user:progress_password@progress-db:5432/progress_db?sslmode=disable
      - NATS_URL=nats://nats:4222
      - NATS_CLIENT_NAME=progress-service
      - S3_ENDPOINT=minio:9000
      - S3_ACCESS_KEY=minio_admin
      - S3_SECRET_KEY=minio_admin_password
      - S3_BUCKET_NAME=student-submissions
    networks:
      - frontend-net
      - backend-net
      - db-net
    depends_on:
      - progress-db
      - minio
      - nats

  telegram-bot-service:
    build:
      context: ./services/telegram-bot-service
      dockerfile: Dockerfile
    container_name: mathalama-telegram-service
    environment:
      - APP_ENV=development
      - TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u1
      - REDIS_URL=redis://redis:6379/0
      - NATS_URL=nats://nats:4222
      - NATS_CLIENT_NAME=telegram-service
      - AUTH_SERVICE_GRPC=auth-service:9090
    networks:
      - backend-net
      - db-net
    depends_on:
      - redis
      - nats

  notification-service:
    build:
      context: ./services/notification-service
      dockerfile: Dockerfile
    container_name: mathalama-notification-service
    environment:
      - APP_ENV=development
      - NATS_URL=nats://nats:4222
      - NATS_CLIENT_NAME=notification-service
      - SMTP_HOST=smtp.gmail.com
      - SMTP_PORT=587
      - SMTP_USER=edu@mathalama.com
      - SMTP_PASS=app-password-from-google
    networks:
      - backend-net
    depends_on:
      - nats

networks:
  frontend-net:
    driver: bridge
  backend-net:
    driver: bridge
  db-net:
    driver: bridge

volumes:
  auth_db_data:
  content_db_data:
  progress_db_data:
  redis_data:
  minio_data:
  nats_data:
```

---

## 3. Настройка Апи-Шлюза (Nginx Reverse Proxy)

Фронтенд общается только с одним доменом платформы. Вся маршрутизация запросов к конкретным микросервисам лежит на Nginx, который парсит заголовки пути (`/api/v1/auth`, `/api/v1/student`, `/api/v1/curator`).

### Конфигурация шлюза (`nginx.conf`):

```nginx
events { worker_connections 1024; }

http {
    include       mime.types;
    default_type  application/octet-stream;
    sendfile        on;
    keepalive_timeout  65;

    # Конфигурация таймаутов и лимита загрузки PDF-файлов (до 20МБ)
    client_max_body_size 20M;

    server {
        listen 80;
        server_name api.mathalama.edu;

        # 1. Запросы авторизации и пользователей
        location /api/v1/auth/ {
            proxy_pass http://auth-service:8080/api/v1/auth/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        location /api/v1/profile/ {
            proxy_pass http://auth-service:8080/api/v1/profile/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # 2. Запросы учебного контента
        location /api/v1/student/courses {
            proxy_pass http://content-service:8080/api/v1/student/courses;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        location /api/v1/admin/courses {
            proxy_pass http://content-service:8080/api/v1/admin/courses;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        location /api/v1/admin/lessons/ {
            proxy_pass http://content-service:8080/api/v1/admin/lessons/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # 3. Запросы успеваемости, тестов и ДЗ (PDF)
        location /api/v1/student/lessons/ {
            proxy_pass http://progress-service:8080/api/v1/student/lessons/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        location /api/v1/curator/ {
            proxy_pass http://progress-service:8080/api/v1/curator/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # Глобальные CORS-заголовки для фронтенда
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type' always;
    }
}
```

---

## 4. Концепция Observability (Продакшен-мониторинг)

Чтобы система не была «черным ящиком» в продакшене, в архитектуру заложен стек **Prometheus + Grafana + Loki**.

### 📊 4.1. Метрики (Prometheus)
Каждый микросервис на Go запускает фоновый веб-сервер на порту `:9090/metrics`, используя библиотеку `prometheus/client_golang`. Prometheus раз в 15 секунд обращается (scrapes) к каждому сервису по внутренней сети `backend-net` и собирает следующие метрики:
1. **Бизнес-метрики:**
   * `http_requests_total{path, status}` — общее число запросов по эндпоинтам.
   * `submissions_received_total` — количество загруженных конспектов.
   * `test_attempts_total{passed}` — количество попыток прохождения тестов.
2. **Метрики очередей (NATS):**
   * `nats_messages_lag` — отставание воркеров от хвоста очереди NATS JetStream (показывает, если уведомления или проверки зависли).
3. **Технические метрики (Go Runtime):**
   * `go_goroutines` — количество активных горутин (для обнаружения утечек памяти/горутин).
   * `go_memstats_alloc_bytes` — потребление оперативной памяти процессом.

### 📝 4.2. Логирование (Grafana Loki)
* Логирование ведется строго в **структурированном формате JSON** в стандартный поток вывода `stdout` контейнеров.
* Агент **Promtail** автоматически собирает логи контейнеров Docker/Kubernetes и отправляет их в централизованное хранилище **Grafana Loki**.
* В Grafana настраивается дашборд, где кураторы и разработчики могут в реальном времени искать ошибки в логах по `correlation_id` события. Это позволяет отследить весь путь запроса (от клика в Telegram до записи в БД) за одну секунду.
