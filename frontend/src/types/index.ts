export interface Language {
  value: string;
  label: string;
}

export interface TranscriptSegment {
  text: string;
  translation: string;
  timestamp: number;
  sourceLanguageCode: string,
  targetLanguageCode: string
}