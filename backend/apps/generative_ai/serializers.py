from rest_framework import serializers


class TextToImageSerializer(serializers.Serializer):
    audio = serializers.FileField()
