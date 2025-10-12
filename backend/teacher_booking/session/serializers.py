from rest_framework import serializers
from .models import Session


class SessionSerializer(serializers.ModelSerializer):
    teacher = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = Session
        fields = "__all__"