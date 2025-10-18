from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Session, UserInfo


class SessionSerializer(serializers.ModelSerializer):
    # teacher = serializers.HiddenField(default=serializers.CurrentUserDefault())
    teacher = serializers.PrimaryKeyRelatedField(
        read_only=True,
        default=serializers.CurrentUserDefault()
    )

    class Meta:
        model = Session
        fields = "__all__"

    def validate(self, attrs):
        teacher =  attrs.get("teacher")
        start_time = attrs.get("start_time")
        end_time = attrs.get("end_time")

        if end_time <= start_time:
            raise serializers.ValidationError("Время окончания занятия должно быть позже начала")

        if teacher and start_time and end_time:
            overlapping_sessions = Session.objects.filter(
                teacher=teacher,
                start_time__lt=end_time,
                end_time__gt=start_time
            )

            if self.instance:
                overlapping_sessions = overlapping_sessions.exclude(pk=self.instance.pk)

            if overlapping_sessions.exists():
                raise serializers.ValidationError("Время занятия пересекается с уже существующими")

        return attrs


class UserInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserInfo
        fields = ['phone_number', 'role']


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    phone_number = serializers.CharField(max_length=15)
    role = serializers.ChoiceField(choices=UserInfo.ROLE_CHOICES)

    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'password',
            'password_confirm',
            'phone_number',
            'role',
            'first_name',
            'last_name'
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Пароли не совпадают"})

        if User.objects.filter(email=attrs.get('email')).exists():
            raise serializers.ValidationError({"email": "Пользователь с таким email уже существует"})

        return attrs

    def create(self, validated_data):
        phone_number = validated_data.pop('phone_number')
        role = validated_data.pop('role')
        validated_data.pop('password_confirm')

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )

        user_info = user.userinfo
        user_info.phone_number = phone_number
        user_info.role = role
        user_info.save()

        return user