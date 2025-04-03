from django.urls import path

from . import views

urlpatterns = [
    path("translate/", views.TextTranslationtView.as_view(), name="translate"),
    path("transcribe/", views.SpeechToTextView.as_view(), name="transcribe"),
]
