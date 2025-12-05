# Teacher Booking Tests

`teacher_booking/tests/` is purpose-built to keep all externalized verification layers next to the main project without cluttering the Django code. It now contains:

- `api/` — the migrated Django `TestCase` suites that call DRF endpoints with `APIClient`.  
- `bdd/` — `pytest-bdd` scenarios covering schedule guards, registration, and role behavior.  
- `gui/` — Selenium consumer flows (auth page trust, teacher onboarding plus slot creation).  
- `load/` — Locust scripts that exercise the registration/session APIs for load testing.  
- `test_cases/` — human-readable summaries of each scenario backed by the API tests.  
- `requirements.txt` — pins Django/DRF plus `pytest`, `pytest-bdd`, `locust`, and Selenium-related drivers.  
- `conftest.py` — configures Django by pointing at `../backend/teacher_booking` so tests can import the same settings and models.

## Environment
1. Keep this folder adjacent to `backend/` and `frontend/`.  
2. Install dependencies:
   ```bash
   python -m pip install -r requirements.txt
   ```

## Running the suites
- API: `pytest`  
- BDD: `pytest bdd/test_sessions_bdd.py`  
- GUI: `pytest gui/test_frontend_home.py gui/test_frontend_teacher_flow.py` (see `gui/README.md` for servers)  
- Load: `locust -f load/locustfile.py --host http://localhost:8000`

## Workflow notes
- Keep `test_cases/` in sync with the new test behavior (especially when API endpoints change).  
- Extend `gui/` with new flows, using Page Objects or front-end helpers as needed.  
- When adding dependencies for BDD/GUI/Load suites, update `requirements.txt` so `pip install -r requirements.txt` still works.
