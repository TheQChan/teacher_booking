## Нагрузочные тесты (Locust)

1. Учителя, которые регистрируются и создают слоты.
2. Студентов, которые просматривают расписание и по возможности записываются/освобождают доступный слот.

### Запуск
1. Установите зависимости (включая `locust`):  
   ```bash
   python -m pip install -r requirements.txt
   ```
2. Запустите бэкенд (например, `python manage.py runserver`) и убедитесь, что он доступен на `http://localhost:8000`.
3. Запустите Locust:
   ```bash
   cd teacher_booking/tests
   locust -f load/locustfile.py --host http://localhost:8000
   ```
4. Откройте `http://localhost:8089`, задайте количество пользователей/скорость и начните тест.
