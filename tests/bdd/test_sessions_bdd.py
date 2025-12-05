from datetime import timedelta
from uuid import uuid4

import pytest
from django.contrib.auth.models import User
from django.utils import timezone
from pytest_bdd import given, parsers, scenario, then, when
from rest_framework.test import APIClient

from session.models import UserInfo


@scenario("session.feature", "Учитель может создавать собственные слоты")
def test_teacher_can_create_slot():
    pass


@scenario("session.feature", "Студент не может создать слот")
def test_student_cannot_create_slot():
    pass


@scenario("session.feature", "Учитель не может создавать перекрывающиеся слоты")
def test_teacher_cannot_create_overlapping_slot():
    pass


@scenario("session.feature", "Студент может записаться и освободить слот")
def test_student_can_schedule_and_free_slot():
    pass


@scenario("session.feature", "Другой студент не может освободить чужой слот")
def test_other_student_cannot_free_slot():
    pass


@scenario("session.feature", "Регистрация запрещает повторный e-mail")
def test_registration_rejects_duplicate_emails():
    pass


@scenario("session.feature", "Регистрация с разными паролями возвращает ошибку")
def test_registration_password_mismatch():
    pass


def _create_user(username, role_value):
    suffix = uuid4().hex[:6]
    user = User.objects.create_user(
        username=f"{username}_{suffix}", password="pwd12345", email=f"{username}{suffix}@example.com"
    )
    user.userinfo.role = role_value
    user.userinfo.phone_number = f"555{suffix}"
    user.userinfo.save()
    return user


def _registration_payload(role, *, email=None, confirm=True):
    suffix = uuid4().hex[:6]
    username = f"{role}_{suffix}"
    payload = {
        "username": username,
        "email": email or f"{role}_{suffix}@example.com",
        "password": "Password123!",
        "password_confirm": "Password123!" if confirm else "Password123!!",
        "phone_number": f"800{suffix}",
        "role": role,
        "first_name": "Test",
        "last_name": "User",
    }
    return payload


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def slot_payload():
    start = timezone.now() + timedelta(hours=1)
    end = start + timedelta(hours=1)
    return {
        "payload": {"start_time": start.isoformat(), "end_time": end.isoformat()},
        "start": start,
        "end": end,
    }


@pytest.fixture
def context():
    return {}


@given("существует пользователь-учитель", target_fixture="teacher_user")
def teacher_user():
    return _create_user("teacher", UserInfo.TEACHER)


@given("существует пользователь-студент", target_fixture="student_user")
def student_user():
    return _create_user("student", UserInfo.STUDENT)


@given("существует другой студент", target_fixture="other_student")
def other_student():
    return _create_user("student_other", UserInfo.STUDENT)


@when("учитель создаёт слот")
def teacher_creates_slot(api_client, teacher_user, slot_payload, context):
    api_client.force_authenticate(teacher_user)
    response = api_client.post("/api/v1/session/", slot_payload["payload"], format="json")
    context["response"] = response
    context["user"] = teacher_user
    context["slot_id"] = response.data.get("id")
    context["slot_times"] = (slot_payload["start"], slot_payload["end"])


@when("учитель пытается создать перекрывающийся слот")
def teacher_creates_overlapping_slot(api_client, teacher_user, context):
    api_client.force_authenticate(teacher_user)
    start = context["slot_times"][0] + timedelta(minutes=30)
    end = start + timedelta(hours=1)
    payload = {"start_time": start.isoformat(), "end_time": end.isoformat()}
    response = api_client.post("/api/v1/session/", payload, format="json")
    context["response"] = response


@when("студент пытается создать слот")
def student_creates_slot(api_client, student_user, slot_payload, context):
    api_client.force_authenticate(student_user)
    response = api_client.post("/api/v1/session/", slot_payload["payload"], format="json")
    context["response"] = response
    context["user"] = student_user


@when("студент записывается на слот")
def student_schedules_slot(api_client, student_user, context):
    api_client.force_authenticate(student_user)
    slot_id = context["slot_id"]
    response = api_client.post(f"/api/v1/session/{slot_id}/schedule/", format="json")
    context["response"] = response


@when("студент освобождает слот")
def student_frees_slot(api_client, student_user, context):
    api_client.force_authenticate(student_user)
    slot_id = context["slot_id"]
    response = api_client.post(f"/api/v1/session/{slot_id}/free/", format="json")
    context["response"] = response


@when("другой студент пытается освободить слот")
def other_student_frees_slot(api_client, other_student, context):
    api_client.force_authenticate(other_student)
    slot_id = context["slot_id"]
    response = api_client.post(f"/api/v1/session/{slot_id}/free/", format="json")
    context["response"] = response


@when(parsers.parse("регистрирует пользователя ролью {role}"))
def register_user(api_client, role, context):
    payload = _registration_payload(role)
    response = api_client.post("/api/v1/register/", payload, format="json")
    context["response"] = response
    context["registration_role"] = role
    context["registration_email"] = payload["email"]


@when("повторно регистрирует по тому же email")
def register_duplicate_email(api_client, context):
    payload = _registration_payload(context["registration_role"], email=context["registration_email"])
    response = api_client.post("/api/v1/register/", payload, format="json")
    context["response"] = response


@when("регистрирует пользователя с разными паролями")
def register_with_mismatch(api_client, context):
    payload = _registration_payload("student", confirm=False)
    response = api_client.post("/api/v1/register/", payload, format="json")
    context["response"] = response


@then(parsers.parse("код ответа должен быть {status:d}"))
def then_status_code(status, context):
    assert context["response"].status_code == status


@then("ответ содержит id учителя")
def response_contains_teacher_id(context):
    response = context["response"]
    teacher = context["user"]
    assert response.status_code == 201
    assert response.data["teacher"] == teacher.id


@then("ответ содержит ошибку")
def response_contains_error(context):
    response = context["response"]
    assert "error" in (response.data or {})
