# Спецификация REST API: MathalamaEdu

Платформа **MathalamaEdu** использует RESTful API для взаимодействия между фронтендом и бэкендом. Все запросы и ответы осуществляются в формате **JSON**. Авторизация выполняется с помощью **JWT-токенов**, передаваемых в заголовке `Authorization: Bearer <token>`.

---

## 1. Аутентификация и GDPR (Общие эндпоинты)

### 1.1. Вход в систему (POST /api/v1/auth/login)
*   **Доступ:** Публичный
*   **Request Body:**
    ```json
    {
      "email": "student@example.com",
      "password": "securepassword123"
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsIn...",
      "role": "student",
      "expires_in": 86400
    }
    ```

### 1.2. GDPR-запрос на забвение (POST /api/v1/profile/delete)
*   **Доступ:** Авторизованный пользователь (любая роль)
*   **Описание:** Переводит пользователя в статус `deleted_scheduled`, записывает время деактивации (`deleted_at = NOW()`) и сбрасывает сессии. Окончательное удаление файлов и анонимизация PII данных произойдет автоматически через 14 дней. В течение этого времени пользователь может восстановить аккаунт через службу поддержки.
*   **Headers:** `Authorization: Bearer <token>`
*   **Response (200 OK):**
    ```json
    {
      "message": "Account has been deactivated and scheduled for deletion in 14 days.",
      "scheduled_deletion_at": "2026-06-05T21:58:00Z"
    }
    ```

---

## 2. API для Студента (Student API)

Студент видит только курсы своей группы и не имеет доступа к урокам со статусом `locked`.

### 2.1. Получить список моих курсов (GET /api/v1/student/courses)
*   **Headers:** `Authorization: Bearer <token>`
*   **Response (200 OK):**
    ```json
    [
      {
        "id": "e4125b04-efbd-4172-baef-c3a28b9d3002",
        "title": "Основы Go (Golang) для начинающих",
        "description": "Изучаем базы языка, конкурентность и создание REST API.",
        "cohort_name": "Поток — Весна 2026",
        "curator_name": "Алексей Иванов"
      }
    ```

### 2.2. Получить структуру уроков курса (GET /api/v1/student/courses/{id}/lessons)
*   **Описание:** Возвращает модули и уроки курса с отметками о доступности, а также статусом прохождения каждого компонента (видео, тест, конспект).
*   **Response (200 OK):**
    ```json
    [
      {
        "module_id": "m1-uuid",
        "module_title": "Модуль 1: Сложение и вычитание (Плюс и Минус)",
        "lessons": [
          {
            "id": "lesson-1-uuid",
            "title": "Урок 1. Арифметика сложения",
            "status": "completed",
            "unlocked_at": "2026-05-20T10:00:00Z",
            "video_url": "https://s3.mathalama.edu/videos/lesson1-addition.mp4",
            "theory_content": "### Сложение\n\nСложение — это базовая операция...",
            "components": {
              "video_watched": true,
              "test": {
                "required": true,
                "passed": true,
                "score": 100
              },
              "assignment": {
                "required": true,
                "status": "approved",
                "file_url": "https://s3.mathalama.edu/submissions/2026/05/student-lesson-1-synopsis.pdf"
              }
            }
          },
          {
            "id": "lesson-2-uuid",
            "title": "Урок 2. Вычитание чисел",
            "status": "unlocked",
            "unlocked_at": "2026-05-21T14:30:00Z",
            "video_url": "https://s3.mathalama.edu/videos/lesson2-subtraction.mp4",
            "theory_content": "### Вычитание...",
            "components": {
              "video_watched": false,
              "test": {
                "required": true,
                "passed": false,
                "score": 0
              },
              "assignment": {
                "required": true,
                "status": "not_submitted",
                "file_url": null
              }
            }
          }
        ]
      }
    ]
    ```

### 2.3. Сдать конспект лекции (PDF) (POST /api/v1/student/lessons/{id}/submit)
*   **Описание:** Студент загружает написанный от руки и отсканированный конспект лекции (строго в формате PDF) или выполненное домашнее задание. Файл сохраняется в MinIO/S3, а куратор группы получает уведомление о необходимости проверки конспекта.
*   **Content-Type:** `multipart/form-data`
*   **Правила валидации и лимиты:**
    1.  **Тип файла:** Строго PDF.
    2.  **Размер файла:** Максимум **20 МБ**.
    3.  **Ограничение спама в S3:** Не более **3 активных субмитов** (в статусах `pending` или `rejected`) на этот урок от одного студента.
    4.  **Длина комментария `student_notes`:** Не более **5 000 символов**.
*   **Request Fields:**
    *   `file` (Binary File, строго PDF)
    *   `student_notes` (Text, комментарий студента, до 5000 символов)
*   **Response (201 Created):**
    ```json
    {
      "submission_id": "sub-uuid-777",
      "status": "pending",
      "file_url": "https://s3.mathalama.edu/submissions/2026/05/student-uuid-lesson-2-synopsis.pdf",
      "created_at": "2026-05-22T21:58:00Z"
    }
    ```
*   **Response (400 Bad Request при превышении лимита размера или формата):**
    ```json
    {
      "error_code": "VALIDATION_FAILED",
      "message": "Размер файла превышает максимально допустимый лимит (20 МБ)."
    }
    ```
*   **Response (400 Bad Request при превышении лимита активных попыток):**
    ```json
    {
      "error_code": "LIMIT_EXCEEDED",
      "message": "У вас уже есть 3 активные попытки сдачи ДЗ (в обработке или отклонены) по этому уроку. Дождитесь проверки или удалите старые перед загрузкой новых."
    }
    ```


### 2.4. Отметить просмотр видеолекции (POST /api/v1/student/lessons/{id}/video/watch)
*   **Описание:** Отмечает видеолекцию как просмотренную студентом. Это действие является одной из трех фаз прохождения гибридного урока.
*   **Headers:** `Authorization: Bearer <token>`
*   **Response (200 OK):**
    ```json
    {
      "message": "Video marked as watched successfully.",
      "watched_at": "2026-05-22T22:00:15Z"
    }
    ```

### 2.5. Сдать ответы на интерактивный тест (POST /api/v1/student/lessons/{id}/test/submit)
*   **Описание:** Отправляет ответы студента на вопросы теста урока. Результат рассчитывается на бэкенде автоматически. Если процент верных ответов равен или превышает порог 70%, тест считается сданным (`passed = true`).
*   **Headers:** `Authorization: Bearer <token>`
*   **Request Body:**
    ```json
    {
      "answers": [
        {
          "question_id": "q-uuid-111",
          "selected_option_id": "opt-uuid-11" // Выбранный вариант ответа
        },
        {
          "question_id": "q-uuid-222",
          "text_answer": "gofmt" // Свободный ввод (если применимо)
        }
      ]
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "attempt_id": "attempt-uuid-999",
      "score": 100, // Процент правильных ответов (университетская шкала 0-100)
      "passed": true, // Успешность сдачи теста (score >= 70)
      "correct_answers_count": 2,
      "total_questions_count": 2,
      "created_at": "2026-05-22T22:05:00Z"
    }
    ```

---

## 3. API для Куратора (Curator API)

Куратор видит работы *только тех студентов*, которые зачислены в закрепленную за ним группу (когорту).

### 3.1. Список работ, ожидающих проверки (GET /api/v1/curator/submissions/pending)
*   **Headers:** `Authorization: Bearer <token>`
*   **Response (200 OK):**
    ```json
    [
      {
        "submission_id": "sub-uuid-777",
        "student_name": "Иван Смирнов",
        "cohort_name": "Поток — Весна 2026",
        "course_title": "Основы Go",
        "lesson_title": "Урок 2. Структуры данных и слайсы",
        "file_url": "https://s3.mathalama.edu/submissions/2026/05/student-uuid-lesson-2.zip",
        "student_notes": "Сделал все задания, кроме бонусного.",
        "submitted_at": "2026-05-22T21:58:00Z"
      }
    ]
    ```

### 3.2. Проверить домашнюю работу (POST /api/v1/curator/submissions/{id}/review)
*   **Описание:** Выставить оценку (по университетской шкале 0-100%) и написать фидбек. Публикует событие `submission.approved` или `submission.rejected` в NATS.
*   **Request Body:**
    ```json
    {
      "status": "approved", // "approved" или "rejected"
      "feedback": "Отличная работа! Код отформатирован через gofmt, слайсы используются верно.",
      "grade": 95 // Оценка от 0 до 100 (в процентах)
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "message": "Submission reviewed successfully. Status updated to approved."
    }
    ```

### 3.3. Мониторинг прогресса группы (GET /api/v1/curator/cohorts/{id}/progress)
*   **Response (200 OK):**
    ```json
    [
      {
        "student_id": "student-uuid-1",
        "student_name": "Иван Смирнов",
        "completed_lessons_count": 5,
        "total_lessons_count": 12,
        "progress_percentage": 41,
        "last_activity_at": "2026-05-22T21:00:00Z"
      }
    ]
    ```

### 3.4. Привязать Telegram-аккаунт куратора (POST /api/v1/curator/profile/telegram/bind)
*   **Описание:** Связывает аккаунт куратора в системе с его Telegram-аккаунтом для отправки оповещений о новых работах и проведения быстрой проверки. Куратор запускает официального бота `MathalamaEduBot`, вводит команду `/bind`, получает одноразовый верификационный код и отправляет его через это API.
*   **Headers:** `Authorization: Bearer <token>`
*   **Request Body:**
    ```json
    {
      "verification_code": "TG-5819-CUR"
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "message": "Telegram chat bound successfully.",
      "telegram_chat_id": "184920482",
      "telegram_username": "math_curator_alex"
    }
    ```

---

## 4. API для Администратора (Admin API)

Администратор обладает полным доступом к созданию контента и управлению ролями.

### 4.1. Создать учебную когорту/группу (POST /api/v1/admin/cohorts)
*   **Request Body:**
    ```json
    {
      "course_id": "course-uuid-1",
      "curator_id": "curator-uuid-2",
      "name": "Поток — Весна 2026"
    }
    ```
*   **Response (201 Created):**
    ```json
    {
      "cohort_id": "cohort-uuid-spring2026",
      "name": "Поток — Весна 2026",
      "created_at": "2026-05-22T21:58:00Z"
    }
    ```

### 4.2. Зачислить студента в группу (POST /api/v1/admin/cohorts/{id}/enroll)
*   **Request Body:**
    ```json
    {
      "student_id": "student-uuid-999"
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "message": "Student successfully enrolled in the cohort."
    }
    ```

### 4.3. Добавление вопроса в тест (Ручное управление) (POST /api/v1/admin/lessons/{lesson_id}/questions)
*   **Описание:** Используется для ручного добавления или редактирования единичного вопроса через интерфейс администратора.
*   **Request Body:**
    ```json
    {
      "question_text": "Какое ключевое слово используется для запуска горутины в Go?",
      "question_type": "single",
      "sort_order": 1,
      "options": [
        { "option_text": "go", "is_correct": true },
        { "option_text": "run", "is_correct": false },
        { "option_text": "thread", "is_correct": false }
      ]
    }
    ```
*   **Response (201 Created):**
    ```json
    {
      "question_id": "q-uuid-111",
      "message": "Question and options created successfully."
    }
    ```

### 4.4. Массовый импорт тестов через JSON (POST /api/v1/admin/lessons/{lesson_id}/questions/import)
*   **Описание:** Используется для быстрой массовой загрузки большого количества тестов из подготовленных файлов.
*   **Атомарность:** Весь импорт выполняется в рамках одной транзакции базы данных. Если хотя бы один вопрос не проходит валидацию, вся транзакция откатывается (All-or-Nothing).
*   **Обязательные правила валидации и лимиты:**
    1.  **Лимит импорта:** Максимум **100 вопросов** в одном JSON-пакете.
    2.  **Лимит вариантов ответов:** Максимум **8 вариантов ответов (`options`)** на один вопрос.
    3.  Поле `question_text` должно быть заполнено и не быть пустым.
    4.  Поле `question_type` должно иметь значение строго `single`, `multiple` или `text`.
    5.  Для вопросов типа `single` и `multiple` массив вариантов `options` должен содержать не менее 2 вариантов ответа.
    6.  Для вопросов типа `single` (одиночный выбор) должен быть выбран **ровно один** правильный ответ (`is_correct = true`).
    7.  Для вопросов типа `multiple` (множественный выбор) должен быть выбран **хотя бы один** правильный ответ (`is_correct = true`).
    8.  Для вопросов типа `text` (свободный текстовый ввод) массив `options` должен быть пустым (ответ проверяется куратором).
*   **Request Body:**
    ```json
    [
      {
        "question_text": "Какие из этих типов являются встроенными в Go?",
        "question_type": "multiple",
        "sort_order": 1,
        "options": [
          { "option_text": "string", "is_correct": true },
          { "option_text": "int32", "is_correct": true },
          { "option_text": "float128", "is_correct": false }
        ]
      },
      {
        "question_text": "Как называется стандартный инструмент форматирования кода в Go?",
        "question_type": "single",
        "sort_order": 2,
        "options": [
          { "option_text": "gofmt", "is_correct": true },
          { "option_text": "go-format", "is_correct": false }
        ]
      }
    ]
    ```
*   **Response (200 OK):**
    ```json
    {
      "message": "Successfully imported 25 questions.",
      "imported_count": 25
    }
    ```
*   **Response (400 Bad Request при превышении системных лимитов):**
    ```json
    {
      "error_code": "LIMIT_EXCEEDED",
      "message": "Превышен максимальный лимит импорта вопросов (максимум 100 вопросов в одном пакете)."
    }
    ```
*   **Response (400 Bad Request при ошибке валидации структуры вопроса):**
    ```json
    {
      "error_code": "VALIDATION_FAILED",
      "message": "Ошибка валидации во 2-м вопросе (индекс [1]): для типа 'single' должен быть указан ровно один верный вариант ответа.",
      "details": {
        "failed_index": "1"
      }
    }
    ```


### 4.5. Создать новый курс (POST /api/v1/admin/courses)
*   **Описание:** Создает новую учебную программу (курс).
*   **Headers:** `Authorization: Bearer <token>` (строго роль 'admin')
*   **Request Body:**
    ```json
    {
      "title": "Введение в алгоритмы и структуры данных",
      "description": "Базовый курс по фундаментальным основам программирования."
    }
    ```
*   **Response (201 Created):**
    ```json
    {
      "course_id": "course-uuid-111",
      "title": "Введение в алгоритмы и структуры данных",
      "created_at": "2026-05-22T23:00:00Z"
    }
    ```

### 4.6. Создать модуль внутри курса (POST /api/v1/admin/courses/{id}/modules)
*   **Описание:** Создает тематический модуль внутри указанного курса.
*   **Headers:** `Authorization: Bearer <token>` (строго роль 'admin')
*   **Request Body:**
    ```json
    {
      "title": "Модуль 1. Сложение чисел (Плюс)",
      "sort_order": 1
    }
    ```
*   **Response (201 Created):**
    ```json
    {
      "module_id": "module-uuid-222",
      "course_id": "course-uuid-111",
      "title": "Модуль 1. Сложение чисел (Плюс)",
      "sort_order": 1,
      "created_at": "2026-05-22T23:05:00Z"
    }
    ```

### 4.7. Создать комбинированный урок внутри модуля (POST /api/v1/admin/modules/{id}/lessons)
*   **Описание:** Создает комплексный урок внутри модуля. В зависимости от переданных флагов `has_test` и `has_assignment` урок автоматически потребует от студента прохождения теста и/или загрузки PDF-конспекта для завершения урока.
*   **Headers:** `Authorization: Bearer <token>` (строго роль 'admin')
*   **Request Body:**
    ```json
    {
      "title": "Урок 2. Сложение двузначных чисел",
      "video_url": "https://s3.mathalama.edu/videos/lesson2-addition-2d.mp4", // Ссылка на видео (может быть null)
      "theory_content": "### Сложение двузначных чисел...\n\nДля сложения в столбик...", // Текстовая теория (может быть null)
      "has_test": true, // Требуется ли сдача интерактивного теста
      "has_assignment": true, // Требуется ли загрузка рукописного конспекта (PDF)
      "sort_order": 2
    }
    ```
*   **Response (201 Created):**
    ```json
    {
      "lesson_id": "lesson-uuid-333",
      "module_id": "module-uuid-222",
      "title": "Урок 2. Сложение двузначных чисел",
      "has_test": true,
      "has_assignment": true,
      "sort_order": 2,
      "created_at": "2026-05-22T23:10:00Z"
    }
    ```

### 4.8. Создать учетную запись пользователя (POST /api/v1/admin/users)
*   **Описание:** Создает нового пользователя в системе (студента или куратора). Пароль генерируется автоматически на бэкенде в криптографически стойком формате и отправляется пользователю на email. При первом входе пользователь обязан сменить пароль.
*   **Headers:** `Authorization: Bearer <token>` (строго роль 'admin')
*   **Request Body:**
    ```json
    {
      "email": "newstudent@example.com",
      "first_name": "Дмитрий",
      "last_name": "Петров",
      "role": "student" // "student" или "curator"
    }
    ```
*   **Response (201 Created):**
    ```json
    {
      "user_id": "user-uuid-8888",
      "email": "newstudent@example.com",
      "temporary_password": "aB3!dE9#kL", // Отображается админу один раз при создании
      "created_at": "2026-05-22T23:15:00Z"
    }
    ```

---

## 5. Внутриплатформенные уведомления (Notification API)

Уведомления хранятся в системе для отображения в реальном времени через веб-интерфейс («колокольчик»).

### 5.1. Получить мои уведомления (GET /api/v1/notifications)
*   **Описание:** Возвращает список личных уведомлений пользователя.
*   **Headers:** `Authorization: Bearer <token>` (доступно любой роли)
*   **Response (200 OK):**
    ```json
    [
      {
        "id": "notif-uuid-111",
        "title": "Домашняя работа проверена",
        "message": "Куратор Алексей Иванов проверил ваш конспект по Уроку 1. Оценка: 95%. Следующий урок разблокирован!",
        "is_read": false,
        "created_at": "2026-05-22T22:15:00Z"
      }
    ]
    ```

### 5.2. Отметить уведомление как прочитанное (POST /api/v1/notifications/{id}/read)
*   **Headers:** `Authorization: Bearer <token>`
*   **Response (200 OK):**
    ```json
    {
      "message": "Notification marked as read successfully."
    }
    ```



