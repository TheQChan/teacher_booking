from django.contrib.auth.models import User
from django.db import models

# Create your models here.
class Session(models.Model):
    STATUSES = [("available", "available"),
                ("scheduled", "scheduled"),
                ("completed", "completed")]
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    student = models.ForeignKey(User, null=True, blank=True, on_delete=models.CASCADE, related_name="student_session")
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name="teacher_session")
    status = models.CharField(max_length=10, choices=STATUSES, default="available")


class UserInfo(models.Model):
    ROLES = [("student", "student"),
                ("teacher", "teacher")]
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone_number = models.CharField(max_length=15)
    role = models.CharField(choices=ROLES)