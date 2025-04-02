from django.urls import path

from . import views

urlpatterns = [
    path("translate/", views.TextTranslationtView.as_view(), name="translate")
]
