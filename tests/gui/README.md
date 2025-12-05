## GUI-тесты (Selenium)

В `gui/` есть два примера Selenium-тестов:
1. `gui/test_admin_login.py` — авторизует суперпользователя в `http://localhost:8000/admin/` через UI.
2. `gui/test_frontend_home.py` — открывает `http://localhost:5173/` и убеждается, что заголовок `Teacher Booking` отображается на странице авторизации.

Оба теста используют общий `webdriver` из `gui/conftest.py`, который скачивает Chrome Driver через `webdriver-manager` и запускает браузер в headless-режиме.

### Запуск
1. Установите зависимости:
   ```bash
   python -m pip install -r requirements.txt
   ```
2. Поднимите backend:
   ```bash
   cd backend
   python manage.py runserver
   ```
3. (Для frontend-одного теста) запустите dev-сервер frontend:
   ```bash
   cd frontend
   npm install
   npm run dev -- --host 0.0.0.0 --port 5173
   ```
4. Выполните GUI-скрипт:
   ```bash
   cd teacher_booking/tests
   pytest gui/test_admin_login.py gui/test_frontend_home.py
   ```
