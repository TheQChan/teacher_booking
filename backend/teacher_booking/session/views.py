from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Session
from .serializers import SessionSerializer
from rest_framework import viewsets

class SessionViewSet(viewsets.ModelViewSet):
    queryset = Session.objects.all()
    serializer_class = SessionSerializer

    @action(methods=['post'], detail=True)
    def schedule(self, request, pk=None):
        """Student scheduled the appointment"""
        session = self.get_object()
        if session.status != Session.AVAILABLE:
            return Response({"error": f"Невозможно записаться! Текущий статус: {session.status}"})
        session.status = Session.SCHEDULED
        session.save()
        return Response({"message": f"Session {pk} status changed to '{Session.SCHEDULED}'"})


    @action(methods=['post'], detail=True)
    def free(self, request, pk=None):
        """Student canceled the appointment"""
        session = self.get_object()
        if session.status != Session.SCHEDULED:
            return Response({"error": f"Невозможно отменить запись! Текущий статус: {session.status}"})
        session.status = Session.AVAILABLE
        session.save()

        return Response({"message": f"Session {pk} status changed to '{Session.AVAILABLE}'"})

    @action(methods=['post'], detail=True)
    def cancel(self, request, pk=None):
        """Teacher canceled the appointment"""
        session = self.get_object()
        if session.status != Session.SCHEDULED:
            return Response({"error": f"Невозможно отменить запись! Текущий статус: {session.status}"})
        session.status = Session.CANCELED
        session.save()

        return Response({"message": f"Session {pk} status changed to '{Session.CANCELED}'"})

    @action(methods=['post'], detail=True)
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