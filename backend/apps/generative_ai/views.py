import logging
import os
import wave

import ffmpeg
from apps.generative_ai.serializers import (
    SpeechToTextSerializer,
    TextTranslationSerializer,
)
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from google.cloud import speech, translate_v3
from google.cloud.speech import RecognizeResponse
from rest_framework import generics, serializers
from rest_framework.parsers import MultiPartParser
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


class SpeechToTextView(generics.GenericAPIView):
    permission_classes = []
    authentication_classes = []
    serializer_class = SpeechToTextSerializer
    parser_classes = [MultiPartParser]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        client = speech.SpeechClient()
        converted_path = None
        language_code = serializer.validated_data.get("language_code")
        audio_file = serializer.validated_data["audio"]

        # Convert WebM to WAV if necessary
        if audio_file.name.endswith(".webm"):
            converted_path = self.convert_webm_to_wav(audio_file)
            audio_file = open(converted_path, "rb")

        # Extract sample rate
        try:
            with wave.open(audio_file, "rb") as wf:
                sample_rate = wf.getframerate()
        except Exception as e:
            logger.error(f"Error extracting sample rate: {e}")
            raise serializers.ValidationError("Invalid audio file.")

        audio_content = audio_file.read()
        audio = speech.RecognitionAudio(content=audio_content)
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
            sample_rate_hertz=sample_rate,
            language_code=language_code,
        )

        # Send WAV file to Google Speech-to-Text
        try:
            response = client.recognize(config=config, audio=audio)
        except Exception as e:
            logger.error(f"Error transcribing text: {e}")
            raise serializers.ValidationError("Error transcribing text.")

        if converted_path:
            try:
                os.remove(converted_path)  # cleanup
            except Exception:
                ...

        extracted_transcript = self.extract_transcripts(response)
        return Response({"Transcript": extracted_transcript})

    def convert_webm_to_wav(self, audio_file):
        """Converts WebM audio to WAV format with mono channel using FFmpeg."""
        temp_input_path = default_storage.save(
            f"temp/{audio_file.name}", ContentFile(audio_file.read())
        )
        output_path = temp_input_path.replace(".webm", ".wav")
        try:
            # Use FFmpeg to convert to mono channel (1) and 16kHz sample rate
            ffmpeg.input(temp_input_path).output(
                output_path,
                ac=1,
                ar="16000",
                format="wav",
            ).run(overwrite_output=True)

            os.remove(temp_input_path)  # cleanup webm file

            return output_path
        except Exception as e:
            logger.error(f"Audio conversion failed: {e}")
            raise serializers.ValidationError("Failed to process audio.")

    def extract_transcripts(self, response: RecognizeResponse):
        """Extracts transcript texts from a Google Speech-to-Text RecognizeResponse object."""
        transcripts = []
        for result in response.results:
            if result.alternatives:
                transcripts.append(result.alternatives[0].transcript)
        return " ".join(transcripts)
