from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver


# Create your models here.
class Session(models.Model):
    AVAILABLE = "available"
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    CANCELED = "canceled"
    STATUS_CHOICES = {AVAILABLE: "Свободно",
                      SCHEDULED: "Забронировано",
                      COMPLETED: "Завершено",
                      CANCELED: "Отменено"}
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    student = models.ForeignKey(User, null=True, blank=True, on_delete=models.CASCADE, related_name="student_session")
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name="teacher_session")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="available")

    def clean(self):
        super().clean()

        if self.end_time <= self.start_time:
            raise ValidationError("Время окончания занятия должно быть позже начала")

        overlapping_sessions = Session.objects.filter(
            teacher=self.teacher,
            start_time__lt=self.end_time,
            end_time__gt=self.start_time
        )

        if self.pk:
            overlapping_sessions = overlapping_sessions.exclude(pk=self.pk)

        if overlapping_sessions.exists():
            raise ValidationError("Время занятия пересекается с уже существующими")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

class UserInfo(models.Model):
    STUDENT = "student"
    TEACHER = "teacher"
    ROLE_CHOICES = {STUDENT: "Ученик",
                    TEACHER: "Преподаватель"}
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone_number = models.CharField(max_length=15)
    role = models.CharField(choices=ROLE_CHOICES)

    def is_teacher(self):
        return self.role == self.TEACHER

    def is_student(self):
        return self.role == self.STUDENT

    @receiver(post_save, sender=User)
    def create_user_info(sender, instance, created, **kwargs):
        if created:
            UserInfo.objects.create(user=instance)

    @receiver(post_save, sender=User)
    def save_user_info(sender, instance, **kwargs):
        instance.userinfo.save()