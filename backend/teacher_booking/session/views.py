from django.shortcuts import render
from rest_framework import generics
from .models import Session
from .serializers import SessionSerializer
from rest_framework import viewsets

class SessionViewSet(viewsets.ModelViewSet):
    queryset = Session.objects.all()
    serializer_class = SessionSerializer

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