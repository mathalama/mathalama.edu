# Спецификация межсервисного gRPC-взаимодействия (Protobuf-контракты)

Для обеспечения строгого типизированного синхронного взаимодействия с субмиллисекундными задержками в микросервисной архитектуре **MathalamaEdu** используется протокол **gRPC** поверх **HTTP/2**. 

Все контракты сообщений и интерфейсы описаны в формате **Protocol Buffers v3** (Protobuf).

---

## 1. Схема межсервисного gRPC-трафика

```mermaid
flowchart LR
    subgraph Микросервисы
        MS_Progress[Progress Service]
        MS_Bot[Telegram Bot Service]
        MS_Auth[Auth & User Service]
        MS_Content[Content Service]
    end

    MS_Progress -->|VerifyToken / GetCuratorProfile| MS_Auth
    MS_Progress -->|GetLessonStructure| MS_Content
    MS_Bot -->|VerifyToken / GetCuratorProfile| MS_Auth
```

---

## 2. Контракт службы авторизации и пользователей (`auth.proto`)

Этот контракт обеспечивает проверку подлинности сессий (JWT) и получение авторизационных профилей кураторов и студентов.

```protobuf
syntax = "proto3";

package mathalama.auth.v1;

option go_package = "mathalama/auth/v1;authv1";

import "google/protobuf/timestamp.proto";

// AuthService предоставляет методы для аутентификации и авторизации запросов
service AuthService {
  // VerifyToken проверяет JWT токен и возвращает метаданные пользователя
  rpc VerifyToken (VerifyTokenRequest) returns (VerifyTokenResponse);

  // GetCuratorProfile возвращает детальный профиль куратора по его Telegram Chat ID
  rpc GetCuratorProfile (GetCuratorProfileRequest) returns (GetCuratorProfileResponse);
}

message VerifyTokenRequest {
  // Сырой JWT токен из HTTP заголовка Authorization (без префикса Bearer)
  // Валидация: обязательное поле, длина от 10 до 2048 символов
  string token = 1;
}

message VerifyTokenResponse {
  // Уникальный идентификатор пользователя
  string user_id = 1;
  // Роль пользователя: student, curator, admin
  string role = 2;
  // Статус учетной записи: active, inactive, deleted_scheduled
  string status = 3;
  // Срок истечения действия JWT
  google.protobuf.Timestamp expires_at = 4;
}

message GetCuratorProfileRequest {
  // Идентификатор чата в Telegram, полученный из вебхука Bot API
  // Валидация: обязательное поле, только числовой формат в строке
  string telegram_chat_id = 1;
}

message GetCuratorProfileResponse {
  // Уникальный идентификатор куратора в системе
  string curator_id = 1;
  // Email куратора
  string email = 2;
  // Имя
  string first_name = 3;
  // Фамилия
  string last_name = 4;
  // Список идентификаторов когорт (групп), которые ведет этот куратор
  repeated string cohort_ids = 5;
  // Время последней синхронизации сессии с Redis
  google.protobuf.Timestamp cached_at = 6;
}
```

---

## 3. Контракт службы управления контентом (`content.proto`)

Этот контракт используется другими микросервисами (например, сервисом успеваемости `Progress Service`) для сверки структуры уроков и ограничений.

```protobuf
syntax = "proto3";

package mathalama.content.v1;

option go_package = "mathalama/content/v1;contentv1";

import "google/protobuf/timestamp.proto";

// ContentService управляет курсами, модулями, уроками и тестами
service ContentService {
  // GetLessonStructure возвращает структуру и требования конкретного урока
  rpc GetLessonStructure (GetLessonStructureRequest) returns (GetLessonStructureResponse);

  // ValidateCourseAccess сверяет, принадлежит ли урок указанному курсу
  rpc ValidateCourseAccess (ValidateCourseAccessRequest) returns (ValidateCourseAccessResponse);
}

message GetLessonStructureRequest {
  // Уникальный ID урока
  string lesson_id = 1;
}

message GetLessonStructureResponse {
  // ID урока
  string lesson_id = 1;
  // ID модуля, к которому принадлежит урок
  string module_id = 2;
  // ID курса
  string course_id = 3;
  // Флаг, требующий прохождения теста
  bool has_test = 4;
  // Флаг, требующий сдачи PDF конспекта
  bool has_assignment = 5;
  // Абсолютный порядковый номер урока в курсе (для переходов по absolute_order)
  int32 absolute_order = 6;
  
  reserved 7; // Ранее next_lesson_id (удален для перехода на absolute_order)
  
  // Провайдер видеовещания (s3, youtube, kinoscope, vimeo, wistia и т.д.)
  string video_provider = 8;
  // Внешний идентификатор эмбеда/видеолекции
  string video_id = 9;
}

message ValidateCourseAccessRequest {
  // ID проверяемого урока
  string lesson_id = 1;
  // ID целевого курса
  string course_id = 2;
}

message ValidateCourseAccessResponse {
  // Доступность: true, если урок входит в структуру данного курса
  bool is_valid = 1;
}
```

---

## 4. Контракт службы успеваемости и прогресса (`progress.proto`)

Позволяет другим микросервисам (например, API Gateway или Telegram Bot) запрашивать консолидированные данные о прохождении обучения.

```protobuf
syntax = "proto3";

package mathalama.progress.v1;

option go_package = "mathalama/progress/v1;progressv1";

import "google/protobuf/timestamp.proto";

// ProgressService управляет отслеживанием успеваемости студентов, геймификацией и обучением
service ProgressService {
  // GetStudentProgress возвращает агрегированный прогресс студента по курсу
  rpc GetStudentProgress (GetStudentProgressRequest) returns (GetStudentProgressResponse);

  // GetLeaderboard возвращает срез рейтинга студентов (глобальный или по когорте)
  rpc GetLeaderboard (GetLeaderboardRequest) returns (GetLeaderboardResponse);

  // GetActivityHeatmap возвращает сетку ежедневной активности студента за год
  rpc GetActivityHeatmap (GetActivityHeatmapRequest) returns (GetActivityHeatmapResponse);

  // CreateVideoNote создает личную заметку студента с привязкой к секунде лекции
  rpc CreateVideoNote (CreateVideoNoteRequest) returns (VideoNoteDetail);

  // GetVideoNotes возвращает все заметки студента по конкретному уроку
  rpc GetVideoNotes (GetVideoNotesRequest) returns (GetVideoNotesResponse);

  // GetReviewQueue возвращает ежедневную очередь повторения вопросов (SM2)
  rpc GetReviewQueue (GetReviewQueueRequest) returns (GetReviewQueueResponse);

  // SubmitReviewAnswer принимает ответ на вопрос и пересчитывает его интервал в SM2
  rpc SubmitReviewAnswer (SubmitReviewAnswerRequest) returns (SubmitReviewAnswerResponse);
}

message GetStudentProgressRequest {
  // ID студента
  string student_id = 1;
  // ID курса
  string course_id = 2;
}

message LessonProgressDetail {
  // ID урока
  string lesson_id = 1;
  // Текущий статус: locked, unlocked, completed
  string status = 2;
  // Время открытия урока (может быть пустым, если locked)
  google.protobuf.Timestamp unlocked_at = 3;
  // Время завершения урока (может быть пустым)
  google.protobuf.Timestamp completed_at = 4;
  // Результат прохождения теста (процент правильных ответов 0-100)
  int32 test_score = 5;
  // Ссылка на сданный PDF конспект (если есть)
  string assignment_file_url = 6;
}

message GetStudentProgressResponse {
  // ID студента
  string student_id = 1;
  // ID курса
  string course_id = 2;
  // Процент завершения курса (0-100%)
  int32 completion_percentage = 3;
  // Количество завершенных уроков
  int32 completed_lessons_count = 4;
  // Всего уроков в курсе
  int32 total_lessons_count = 5;
  // Подробный прогресс по каждому уроку
  repeated LessonProgressDetail lessons = 6;
}

message GetLeaderboardRequest {
  // ID когорты (потока). Если пусто — возвращается глобальный лидерборд
  string cohort_id = 1;
  // Сколько записей пропустить (offset)
  int32 offset = 2;
  // Сколько записей вернуть (limit)
  int32 limit = 3;
}

message LeaderboardEntry {
  string student_id = 1;
  string student_name = 2;
  int32 xp_score = 3;
  int32 rank = 4;
}

message GetLeaderboardResponse {
  repeated LeaderboardEntry entries = 1;
  int32 total_count = 2;
}

message GetActivityHeatmapRequest {
  string student_id = 1;
  // Год выборки (например, 2026)
  int32 year = 2;
}

message ActivityDay {
  // Дата в формате YYYY-MM-DD
  string date = 1;
  // Количество завершенных действий
  int32 activity_count = 2;
  // Заработанные очки опыта за этот день
  int32 xp_earned = 3;
}

message GetActivityHeatmapResponse {
  string student_id = 1;
  repeated ActivityDay days = 2;
}

message CreateVideoNoteRequest {
  string student_id = 1;
  string lesson_id = 2;
  int32 video_timestamp_seconds = 3;
  string note_text = 4;
}

message VideoNoteDetail {
  string id = 1;
  string student_id = 2;
  string lesson_id = 3;
  int32 video_timestamp_seconds = 4;
  string note_text = 5;
  google.protobuf.Timestamp created_at = 6;
}

message GetVideoNotesRequest {
  string student_id = 1;
  string lesson_id = 2;
}

message GetVideoNotesResponse {
  repeated VideoNoteDetail notes = 1;
}

message GetReviewQueueRequest {
  string student_id = 1;
  int32 limit = 2;
}

message ReviewQuestionDetail {
  string id = 1;
  string text = 2;
  repeated string options = 3;
  string lesson_id = 4;
}

message GetReviewQueueResponse {
  int32 queue_length = 1;
  repeated ReviewQuestionDetail questions = 2;
}

message SubmitReviewAnswerRequest {
  string student_id = 1;
  string question_id = 2;
  string chosen_option = 3;
}

message SubmitReviewAnswerResponse {
  bool is_correct = 1;
  string correct_option = 2;
  int32 xp_earned = 3;
  int32 next_review_in_days = 4;
}
```

---

## 5. Правила генерации кода из Protobuf

Для автоматической кодогенерации из описанных контрактов в Go-проекте используется утилита **`buf`** (`buf.build`).

### Файл конфигурации генератора (`buf.gen.yaml`):
```yaml
version: v1
plugins:
  - plugin: go
    out: internal/platform/grpc/gen
    opt: paths=source_relative
  - plugin: go-grpc
    out: internal/platform/grpc/gen
    opt: paths=source_relative
```

### Команда кодогенерации:
```bash
# Генерация заглушек клиента и сервера в Go
buf generate
```
