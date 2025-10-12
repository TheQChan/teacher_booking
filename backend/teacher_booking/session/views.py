from rest_framework.decorators import action, permission_classes
from rest_framework.response import Response

from .models import Session
from django.contrib.auth.models import User
from .serializers import SessionSerializer
from .permissions import IsTeacher, IsStudent
from rest_framework import viewsets, permissions

class SessionViewSet(viewsets.ModelViewSet):
    queryset = Session.objects.all()
    serializer_class = SessionSerializer

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy', 'create']:
            permission_classes = [IsTeacher]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    @action(methods=['post'], detail=True, permission_classes=[IsStudent])
    def schedule(self, request, pk=None):
        """Student scheduled the appointment"""
        session = self.get_object()
        if session.status != Session.AVAILABLE:
            return Response({"error": f"Невозможно записаться! Текущий статус: {session.status}"})
        session.status = Session.SCHEDULED
        session.student = User.objects.get(pk=request.user.id)
        session.save()
        return Response({"message": f"Session {pk} status changed to '{Session.SCHEDULED}'"})


    @action(methods=['post'], detail=True, permission_classes=[IsStudent])
    def free(self, request, pk=None):
        """Student canceled the appointment"""
        session = self.get_object()
        if session.status != Session.SCHEDULED:
            return Response({"error": f"Невозможно отменить запись! Текущий статус: {session.status}"})
        session.status = Session.AVAILABLE
        session.student = None
        session.save()

        return Response({"message": f"Session {pk} status changed to '{Session.AVAILABLE}'"})

    @action(methods=['post'], detail=True, permission_classes=[IsTeacher])
    def cancel(self, request, pk=None):
        """Teacher canceled the appointment"""
        session = self.get_object()
        if session.status != Session.SCHEDULED:
            return Response({"error": f"Невозможно отменить запись! Текущий статус: {session.status}"})
        session.status = Session.CANCELED
        session.save()

        return Response({"message": f"Session {pk} status changed to '{Session.CANCELED}'"})

    @action(methods=['post'], detail=True, permission_classes=[IsTeacher])
    def complete(self, request, pk=None):
        """Session was completed"""
        session = self.get_object()
        if session.status != Session.SCHEDULED:
            return Response({"error": f"Невозможно завершить занятие! Текущий статус: {session.status}"})
        session.status = Session.COMPLETED
        session.save()

        return Response({"message": f"Session {pk} status changed to '{Session.COMPLETED}'"})

# Create your views here.
# class SessionsAPIList(generics.ListCreateAPIView):
#     queryset = Session.objects.all()
#     serializer_class = SessionSerializer
#
#
# class SessionAPIUpdate(generics.UpdateAPIView):
#     queryset = Session.objects.all()
#     serializer_class = SessionSerializer
#
#
# class SessionAPIDetailView(generics.RetrieveUpdateDestroyAPIView):
#     queryset = Session.objects.all()
#     serializer_class = SessionSerializer