import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { LanguageSelector } from './components/LanguageSelector';
import { TranscriptDisplay } from './components/TranscriptDisplay';
import { Language, TranscriptSegment } from './types';

const BASE_URL = 'http://localhost:8007';

// Constants for voice activity detection
const SILENCE_THRESHOLD = -50; // dB
const SILENCE_DURATION = 2000; // ms

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [sourceLanguage, setSourceLanguage] = useState<Language>({ value: 'en', label: 'English' });
  const [targetLanguage, setTargetLanguage] = useState<Language>({ value: 'ar', label: 'Arabic' });
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [error, setError] = useState<string>('');
  const [lastVoiceActivity, setLastVoiceActivity] = useState<number>(Date.now());
  const [audioContext] = useState<AudioContext>(() => new (window.AudioContext || (window as any).webkitAudioContext)());
  const [silenceTimer, setSilenceTimer] = useState<number | null>(null);

  const detectSilence = useCallback((audioData: Float32Array) => {
    // Calculate RMS value
    const rms = Math.sqrt(audioData.reduce((sum, val) => sum + val * val, 0) / audioData.length);
    
    // Convert to dB
    const db = 20 * Math.log10(rms);

    if (db > SILENCE_THRESHOLD) {
      setLastVoiceActivity(Date.now());
      if (silenceTimer) {
        window.clearTimeout(silenceTimer);
        setSilenceTimer(null);
      }
    } else {
      // If we haven't set a silence timer yet, set one
      if (!silenceTimer) {
        const timer = window.setTimeout(() => {
          const timeSinceLastVoice = Date.now() - lastVoiceActivity;
          if (timeSinceLastVoice >= SILENCE_DURATION) {
            stopRecording();
          }
        }, SILENCE_DURATION);
        setSilenceTimer(timer);
      }
    }
  }, [lastVoiceActivity, silenceTimer]);

  const processAudioChunk = async (audioBlob: Blob) => {
    try {
      // Create FormData for the audio file
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');
      formData.append("language_code", sourceLanguage.value)

      // Step 1: Get transcription
      const transcriptionResponse = await fetch(`${BASE_URL}/ai/transcribe/`, {
        method: 'POST',
        body: formData,
      });

      console.log(transcriptionResponse)

      if (!transcriptionResponse.ok) {
        const errorData = await transcriptionResponse.json(); // Try to parse JSON error
        console.error("Transcription Error:", errorData);
        throw new Error(errorData.detail || "Transcription failed");
      }


      const transcriptionData = await transcriptionResponse.json();
      const transcribedText = transcriptionData.Transcript;

      // Step 2: Get translation
      const translationResponse = await fetch(`${BASE_URL}/ai/translate/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source_text: transcribedText,
          source_language_code: sourceLanguage.value,
          target_language_code: targetLanguage.value,
        }),
      });

      if (!translationResponse.ok) {
        throw new Error('Translation failed');
      }

      const translationData = await translationResponse.json();
      
      setSegments(prev => [...prev, {
        text: transcribedText,
        translation: translationData.translated_text,
        timestamp: Date.now(),
        sourceLanguageCode: sourceLanguage.value,
        targetLanguageCode: targetLanguage.value
      }]);
    } catch (error: any) {
      console.error('Processing error: ', error);
      setError(`Processing failed: ${error.message}`);
    }
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });

      // Set up audio analysis for voice activity detection
      const audioSource = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      audioSource.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Float32Array(bufferLength);

      const checkAudio = () => {
        if (isRecording) {
          analyser.getFloatTimeDomainData(dataArray);
          detectSilence(dataArray);
          requestAnimationFrame(checkAudio);
        }
      };

      const audioChunks: Blob[] = [];

      recorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          await processAudioChunk(audioBlob);
          audioChunks.length = 0;
        }
      };

      recorder.start(5000);
      setMediaRecorder(recorder);
      setIsRecording(true);
      setError('');
      checkAudio();
    } catch (error: any) {
      console.error('Recording error:', error);
      setError(`Failed to start recording: ${error.message}`);
      setIsRecording(false);
    }
  }, [sourceLanguage.value, targetLanguage.value, audioContext, detectSilence]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
    setMediaRecorder(null);
    if (silenceTimer) {
      window.clearTimeout(silenceTimer);
      setSilenceTimer(null);
    }
  }, [mediaRecorder, silenceTimer]);

  useEffect(() => {
    return () => {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
      }
      if (silenceTimer) {
        window.clearTimeout(silenceTimer);
      }
    };
  }, [mediaRecorder, silenceTimer]);

  const handleSpeak = (text: string, languageCode: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = languageCode;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Healthcare Translator
          </h1>
          <p className="text-gray-600">
            Real-time translation for healthcare providers and patients
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <LanguageSelector
            value={sourceLanguage}
            onChange={(lang) => {
              setSourceLanguage(lang);
              if (isRecording) {
                stopRecording();
              }
            }}
            label="Source Language"
          />
          <LanguageSelector
            value={targetLanguage}
            onChange={(lang) => {
              setTargetLanguage(lang);
              if (isRecording) {
                stopRecording();
              }
            }}
            label="Target Language"
          />
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex justify-center mb-8">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`px-6 py-3 rounded-full flex items-center gap-2 text-white transition-colors ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isRecording ? (
              <>
                <MicOff size={20} /> Stop Recording
              </>
            ) : (
              <>
                <Mic size={20} /> Start Recording
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TranscriptDisplay
            segments={segments}
            onSpeak={handleSpeak}
            title="Original Transcript"
            isOriginal
          />
          <TranscriptDisplay
            segments={segments}
            onSpeak={handleSpeak}
            title="Translation"
          />
        </div>
      </div>
    </div>
  );
}

export default App;