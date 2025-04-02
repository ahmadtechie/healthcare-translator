from langcodes import standardize_tag, tag_is_valid
from rest_framework import serializers


class TextTranslationSerializer(serializers.Serializer):
    source_text = serializers.CharField()
    source_language_code = serializers.CharField(allow_blank=True)
    target_language_code = serializers.CharField(max_length=6)

    def validate_source_language_code(self, value):
        """Validate source language code using langcodes."""
        if value and not tag_is_valid(value):
            raise serializers.ValidationError(f"Invalid source language code: {value}")
        return value

    def validate_target_language_code(self, value):
        """Validate target language code using langcodes."""
        if not tag_is_valid(value):
            raise serializers.ValidationError(f"Invalid target language code: {value}")
        return value
