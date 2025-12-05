# Teacher Booking Tests

В каталоге `teacher_booking/tests/` собраны все вынесенные проверки бэкенда: API-тесты, BDD-сценарии, GUI-заготовки и нагрузочные сценарии. Это позволяет держать тесты отдельно от самого приложения, но при этом использовать его настройки через `conftest.py`.

## Структура
- `api/` — перенесённые Django `TestCase` с `APIClient`, которые проверяют расписание, регистрацию и профиль.  
- `bdd/` — Gherkin-сценарии с шагами на `pytest-bdd` для ключевых флоу.  
- `gui/` — заготовка для будущих Selenium/Playwright-тестов (пока только README).  
- `load/` — сценарии на Locust для имитации нагрузки со стороны учителя и студента.  
- `test_cases/` — человекочитаемые описания тестов, которые соответствуют `api/`.  
- `requirements.txt` — зависимости Django/DRF + `pytest`, `pytest-bdd` и `locust`.  
- `conftest.py` — конфиг для подгрузки соседнего бэкенда (`../backend/teacher_booking`) и инициализации Django.

## Подготовка
1. Убедитесь, что папка `teacher_booking/tests/` находится рядом с `backend/` и `frontend/`.  
2. Установите зависимости:
   ```bash
   python -m pip install -r requirements.txt
   ```

## Запуск
- API-тесты: `pytest`  
- BDD-сценарии: `pytest bdd/test_sessions_bdd.py`  
- Нагрузочные: `locust -f load/locustfile.py --host http://localhost:8000`

## Что дальше
- Добавляйте новые сценарии и шаги в соответствующие папки (`api/`, `bdd/`, `gui/`, `load/`), описывайте их в `test_cases/`.  
- Обновляйте `requirements.txt`, если потребуется новый фреймворк.  
- Для каждого раздела можно хранить собственный `README`, как это сделано для `api/`, `bdd/`, `load/`.
