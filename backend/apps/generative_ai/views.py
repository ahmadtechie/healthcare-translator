import io

from google.cloud import speech
from rest_framework import generics
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response

from backend.apps.generative_ai.serializers import TextToImageSerializer


class SpeechToTextView(generics.GenericAPIView):
    permission_classes = []
    authentication_classes = []
    parser_classes = (MultiPartParser,)
    serializer_class = TextToImageSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        audio_file = serializer.validated_data["audio"]
        audio_content = audio_file.read()

        client = speech.SpeechClient()
        audio = speech.RecognitionAudio(content=audio_content)
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
            sample_rate_hertz=16000,
            language_code="en-US",
        )

        response = client.recognize(config=config, audio=audio)

        # Process the response and extract the transcript
        transcripts = []
        for result in response.results:
            transcripts.append(result.alternatives[0].transcript)

        return Response({"transcripts": transcripts})
