from rest_framework import permissions

class IsTeacher(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.user.is_anonymous:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.userinfo.is_teacher())

class IsStudent(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.user.is_anonymous:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.userinfo.is_student())