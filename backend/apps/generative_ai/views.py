import logging

from apps.generative_ai.serializers import TextTranslationSerializer
from django.conf import settings
from google.cloud import translate_v3
from rest_framework import generics, serializers
from rest_framework.response import Response

logger = logging.getLogger(__name__)


class TextTranslationtView(generics.GenericAPIView):
    permission_classes = []
    authentication_classes = []
    serializer_class = TextTranslationSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        source_text = serializer.validated_data["source_text"]
        source_language_code = serializer.validated_data["source_language_code"]
        target_language_code = serializer.validated_data["target_language_code"]
        PROJECT_ID = settings.GOOGLE_CLOUD_PROJECT

        client = translate_v3.TranslationServiceClient()
        parent = f"projects/{PROJECT_ID}/locations/global"
        mime_type = "text/plain"

        try:
            response = client.translate_text(
                contents=[source_text],
                parent=parent,
                mime_type=mime_type,
                source_language_code=source_language_code,
                target_language_code=target_language_code,
            )
        except Exception as e:
            logger.error(str(e))
            raise serializers.ValidationError("Error translating text.")

        translated_text = response.translations[0].translated_text
        return Response({"translated_text": translated_text})
