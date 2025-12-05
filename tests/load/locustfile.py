from datetime import datetime, timedelta, timezone
from uuid import uuid4

from locust import HttpUser, between, task

TEACHER_ROLE = "teacher"
STUDENT_ROLE = "student"


def make_registration_payload(role):
    suffix = uuid4().hex[:6]
    common = {
        "username": f"{role}_{suffix}",
        "email": f"{role}_{suffix}@example.com",
        "password": "Password123!",
        "password_confirm": "Password123!",
        "phone_number": f"800{suffix}",
        "role": role,
        "first_name": role.title(),
        "last_name": "Load",
    }
    return common


def make_slot_payload():
    now = datetime.now(timezone.utc)
    start = now + timedelta(minutes=5)
    end = start + timedelta(minutes=30)
    return {"start_time": start.isoformat(), "end_time": end.isoformat()}


class BaseUser(HttpUser):
    abstract = True
    wait_time = between(1, 3)
    role = None
    csrf_token = ""

    def _refresh_csrf(self):
        self.csrf_token = self.client.cookies.get("csrftoken", "")

    def _csrf_headers(self):
        return {"X-CSRFToken": self.csrf_token} if self.csrf_token else {}

    def on_start(self):
        self.client.get("/api/v1/drf-auth/login/")
        self._refresh_csrf()
        payload = make_registration_payload(self.role)
        self.client.post("/api/v1/register/", json=payload, headers=self._csrf_headers())
        self._refresh_csrf()
        self.client.post(
            "/api/v1/drf-auth/login/",
            data={"username": payload["username"], "password": payload["password"]},
            headers=self._csrf_headers(),
        )
        self._refresh_csrf()


class TeacherUser(BaseUser):
    role = TEACHER_ROLE

    @task(3)
    def create_slot(self):
        self.client.post("/api/v1/session/", json=make_slot_payload(), headers=self._csrf_headers())

    @task(1)
    def list_slots(self):
        self.client.get("/api/v1/session/")


class StudentUser(BaseUser):
    role = STUDENT_ROLE

    @task(2)
    def list_sessions(self):
        self.client.get("/api/v1/session/")

    @task(1)
    def schedule_random_slot(self):
        resp = self.client.get("/api/v1/session/")
        if resp.status_code != 200:
            return
        for slot in resp.json():
            if slot.get("status") == "available":
                slot_id = slot["id"]
                self.client.post(f"/api/v1/session/{slot_id}/schedule/", headers=self._csrf_headers())
                self.client.post(f"/api/v1/session/{slot_id}/free/", headers=self._csrf_headers())
                break
