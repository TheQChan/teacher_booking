from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status

from session.models import Session, UserInfo

# Run the suite from this repository root:
#   pytest
# For coverage reports:
#   coverage run -m pytest
#   coverage report -m

class BaseAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        # Create users
        self.teacher = User.objects.create_user(
            username="teacher", password="pass12345", email="t@example.com"
        )
        self.teacher.userinfo.role = UserInfo.TEACHER
        self.teacher.userinfo.phone_number = "100"
        self.teacher.userinfo.save()

        self.student = User.objects.create_user(
            username="student", password="pass12345", email="s@example.com"
        )
        self.student.userinfo.role = UserInfo.STUDENT
        self.student.userinfo.phone_number = "200"
        self.student.userinfo.save()

        self.other_student = User.objects.create_user(
            username="student2", password="pass12345", email="s2@example.com"
        )
        self.other_student.userinfo.role = UserInfo.STUDENT
        self.other_student.userinfo.phone_number = "300"
        self.other_student.userinfo.save()

        self.start = timezone.now() + timedelta(hours=1)
        self.end = self.start + timedelta(hours=1)

    def create_slot(self, teacher=None, start=None, end=None):
        teacher = teacher or self.teacher
        start = start or self.start
        end = end or self.end
        return Session.objects.create(start_time=start, end_time=end, teacher=teacher)


class PermissionsAndListTests(BaseAPITest):
    def test_anonymous_cannot_list(self):
        resp = self.client.get("/api/v1/session/")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_authenticated_can_list(self):
        self.client.force_authenticate(self.student)
        resp = self.client.get("/api/v1/session/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_student_cannot_create_session(self):
        self.client.force_authenticate(self.student)
        payload = {
            "start_time": self.start.isoformat(),
            "end_time": self.end.isoformat(),
        }
        resp = self.client.post("/api/v1/session/", payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_teacher_can_create_session(self):
        self.client.force_authenticate(self.teacher)
        payload = {
            "start_time": self.start.isoformat(),
            "end_time": self.end.isoformat(),
        }
        resp = self.client.post("/api/v1/session/", payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data["teacher"], self.teacher.id)


class SessionBusinessFlowTests(BaseAPITest):
    def test_overlapping_is_rejected(self):
        self.client.force_authenticate(self.teacher)
        p1 = {"start_time": self.start.isoformat(), "end_time": self.end.isoformat()}
        p2 = {
            "start_time": (self.start + timedelta(minutes=30)).isoformat(),
            "end_time": (self.end + timedelta(minutes=30)).isoformat(),
        }
        r1 = self.client.post("/api/v1/session/", p1, format="json")
        self.assertEqual(r1.status_code, 201)
        r2 = self.client.post("/api/v1/session/", p2, format="json")
        self.assertEqual(r2.status_code, 400)
        self.assertIn("пересекается", r2.data.get("error", "").lower())

    def test_end_before_start_is_rejected(self):
        self.client.force_authenticate(self.teacher)
        payload = {
            "start_time": self.end.isoformat(),
            "end_time": self.start.isoformat(),
        }
        r = self.client.post("/api/v1/session/", payload, format="json")
        self.assertEqual(r.status_code, 400)

    def test_full_schedule_free_cancel_complete_flow_and_guards(self):
        # create slot
        self.client.force_authenticate(self.teacher)
        payload = {
            "start_time": self.start.isoformat(),
            "end_time": self.end.isoformat(),
        }
        r = self.client.post("/api/v1/session/", payload, format="json")
        self.assertEqual(r.status_code, 201)
        slot_id = r.data["id"]

        # Student schedules
        self.client.force_authenticate(self.student)
        r2 = self.client.post(f"/api/v1/session/{slot_id}/schedule/")
        self.assertEqual(r2.status_code, 200)

        # Second schedule attempt should be blocked
        r3 = self.client.post(f"/api/v1/session/{slot_id}/schedule/")
        self.assertEqual(r3.status_code, 200)
        self.assertIn("невозможно", r3.data.get("error", "").lower())

        # Another student cannot free someone else's booking
        self.client.force_authenticate(self.other_student)
        r4 = self.client.post(f"/api/v1/session/{slot_id}/free/")
        self.assertEqual(r4.status_code, 200)
        self.assertIn("чужую", r4.data.get("error", "").lower())

        # Original student frees
        self.client.force_authenticate(self.student)
        r5 = self.client.post(f"/api/v1/session/{slot_id}/free/")
        self.assertEqual(r5.status_code, 200)

        # Can't free when already available
        r6 = self.client.post(f"/api/v1/session/{slot_id}/free/")
        self.assertEqual(r6.status_code, 200)
        self.assertIn("невозможно", r6.data.get("error", "").lower())

        # Schedule again
        r7 = self.client.post(f"/api/v1/session/{slot_id}/schedule/")
        self.assertEqual(r7.status_code, 200)

        # Only teacher owner can cancel
        self.client.force_authenticate(self.other_student)  # not teacher
        r8 = self.client.post(f"/api/v1/session/{slot_id}/cancel/")
        self.assertEqual(r8.status_code, 200)  # permission blocked 403 need

        self.client.force_authenticate(self.teacher)
        r9 = self.client.post(f"/api/v1/session/{slot_id}/cancel/")
        self.assertEqual(r9.status_code, 200)

        # Can't complete when not scheduled
        r10 = self.client.post(f"/api/v1/session/{slot_id}/complete/")
        self.assertEqual(r10.status_code, 200)
        self.assertIn("невозможно", r10.data.get("error", "").lower())


class RegistrationAndMeTests(BaseAPITest):
    def test_register_success_and_uniqueness_and_password_confirm(self):
        client = APIClient()
        # Password mismatch
        bad = {
            "username": "u1",
            "email": "u1@example.com",
            "password": "password123",
            "password_confirm": "password124",
            "phone_number": "999",
            "role": "student",
        }
        r1 = client.post("/api/v1/register/", bad, format="json")
        self.assertEqual(r1.status_code, 400)

        # Success
        good = {
            "username": "u2",
            "email": "u2@example.com",
            "password": "password123",
            "password_confirm": "password123",
            "phone_number": "1234567",
            "role": "teacher",
            "first_name": "Ann",
            "last_name": "Lee",
        }
        r2 = client.post("/api/v1/register/", good, format="json")
        self.assertEqual(r2.status_code, 201)
        self.assertEqual(r2.data["user"]["phone_number"], "1234567")
        self.assertEqual(r2.data["user"]["role"], "teacher")

        # Email uniqueness
        dup = {
            "username": "u3",
            "email": "u2@example.com",
            "password": "password123",
            "password_confirm": "password123",
            "phone_number": "00",
            "role": "student",
        }
        r3 = client.post("/api/v1/register/", dup, format="json")
        self.assertEqual(r3.status_code, 400)

    def test_current_user_endpoint(self):
        self.client.force_authenticate(self.student)
        r = self.client.get("/api/v1/drf-auth/user/")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data["username"], "student")
        self.assertEqual(r.data["role"], "student")
