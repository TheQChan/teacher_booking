## GUI-тесты (Selenium)

В этом каталоге два сценария, которые используют Selenium/`webdriver-manager` и реальный frontend из `frontend/`:

1. `gui/test_frontend_home.py` открывает `http://localhost:5173/` и проверяет, что на странице авторизации показан заголовок `Teacher Booking`.  
2. `gui/test_frontend_teacher_flow.py` регистрирует нового пользователя через UI, переводит его роль в `teacher`, открывает форму создания слота и проверяет, что на странице появилась карточка с созданной сессией.

Общий браузер настраивается в `gui/conftest.py`: Chrome запускается в headless-режиме, а драйвер скачивается автоматически через `webdriver-manager`.

### Подготовка
1. Установите зависимости (Selenium и драйвер включены в `requirements.txt`):
   ```bash
   python -m pip install -r requirements.txt
   ```
2. Запустите backend:
   ```bash
   cd backend
   python manage.py runserver
   ```
3. Запустите frontend (Vite) на 5173:
   ```bash
   cd frontend
   npm install
   npm run dev -- --host 0.0.0.0 --port 5173
   ```

### Запуск тестов
```bash
cd teacher_booking/tests
pytest gui/test_frontend_home.py gui/test_frontend_teacher_flow.py
```