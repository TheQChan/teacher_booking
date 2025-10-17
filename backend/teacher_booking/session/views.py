from django.contrib.auth import authenticate, login
from django.core.exceptions import ValidationError
from rest_framework.decorators import action, permission_classes
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.generics import CreateAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Session
from django.contrib.auth.models import User
from .serializers import SessionSerializer, UserRegistrationSerializer
from .permissions import IsTeacher, IsStudent
from rest_framework import viewsets, permissions, status


class SessionViewSet(viewsets.ModelViewSet):
    """
    View for interactions with session slots
    """
    queryset = Session.objects.all()
    serializer_class = SessionSerializer

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy', 'create']:
            permission_classes = [IsTeacher]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except ValidationError as e:
            return Response(
                {'error': 'Время занятия пересекается с уже существующими'},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(methods=['post'], detail=True, permission_classes=[IsStudent])
    def schedule(self, request, pk=None):
        """Endpoint to schedule the appointment"""
        session = self.get_object()
        if session.status != Session.AVAILABLE:
            return Response({"error": f"Невозможно записаться! Текущий статус: {session.status}"})
        session.status = Session.SCHEDULED
        session.student = User.objects.get(pk=request.user.id)
        session.save()
        return Response({"message": f"Session {pk} status changed to '{Session.SCHEDULED}'"})


    @action(methods=['post'], detail=True, permission_classes=[IsStudent])
    def free(self, request, pk=None):
        """Endpoint to cancel the appointment for student"""
        session = self.get_object()
        if session.student != User.objects.get(pk=request.user.id):
            return Response({"error": f"Невозможно отменить чужую запись!"})
        if session.status != Session.SCHEDULED:
            return Response({"error": f"Невозможно отменить запись! Текущий статус: {session.status}"})
        session.status = Session.AVAILABLE
        session.student = None
        session.save()

        return Response({"message": f"Session {pk} status changed to '{Session.AVAILABLE}'"})

    @action(methods=['post'], detail=True, permission_classes=[IsTeacher])
    def cancel(self, request, pk=None):
        """Endpoint to cancel the appointment for teacher"""
        session = self.get_object()
        if session.teacher != User.objects.get(pk=request.user.id):
            return Response({"error": f"Невозможно отменить чужую запись!"})
        if session.status != Session.SCHEDULED:
            return Response({"error": f"Невозможно отменить запись! Текущий статус: {session.status}"})
        session.status = Session.CANCELED
        session.save()

        return Response({"message": f"Session {pk} status changed to '{Session.CANCELED}'"})

    @action(methods=['post'], detail=True, permission_classes=[IsTeacher])
    def complete(self, request, pk=None):
        """Endpoint to complete the session"""
        session = self.get_object()
        if session.teacher != User.objects.get(pk=request.user.id):
            return Response({"error": f"Невозможно завершить чужое занятие!"})
        if session.status != Session.SCHEDULED:
            return Response({"error": f"Невозможно завершить занятие! Текущий статус: {session.status}"})
        session.status = Session.COMPLETED
        session.save()

        return Response({"message": f"Session {pk} status changed to '{Session.COMPLETED}'"})


class UserRegistrationView(APIView):
    """
    View for registration
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()

            # refresh = RefreshToken.for_user(user)

            return Response({
                "message": "Пользователь успешно зарегистрирован",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "phone_number": user.userinfo.phone_number,
                    "role": user.userinfo.role
                },
                # "tokens": {
                #     "refresh": str(refresh),
                #     "access": str(refresh.access_token),
                # }
            }, status=status.HTTP_201_CREATED)

        return Response({
            "message": "Ошибка регистрации",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
