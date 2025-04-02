import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { LanguageSelector } from './components/LanguageSelector';
import { TranscriptDisplay } from './components/TranscriptDisplay';
import { Language, TranscriptSegment } from './types';
import axios from 'axios';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [sourceLanguage, setSourceLanguage] = useState<Language>({ value: 'en', label: 'English' });
  const [targetLanguage, setTargetLanguage] = useState<Language>({ value: 'es', label: 'Spanish' });
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [recognition, setRecognition] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const translateText = async (text: string) => {
    try {
      console.log('Translating text:', text);
      const response = await axios.post('https://libretranslate.com/translate', {
        q: text,
        source: sourceLanguage.value,
        target: targetLanguage.value,
        format: "text",
        alternatives: 3
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Translation response:', response.data);
      return response.data.translatedText;
    } catch (error: any) {
      console.error('Translation error:', error.response?.data || error.message);
      setError(`Translation failed: ${error.response?.data?.error || 'Please try again'}`);
      return text; // Return original text if translation fails
    }
  };

  const startRecording = useCallback(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = sourceLanguage.value;

      recognition.onstart = () => {
        console.log('Speech recognition started');
        setError('');
      };

      recognition.onresult = async (event: any) => {
        console.log('Speech recognition result received');
        const last = event.results.length - 1;
        const text = event.results[last][0].transcript;
        console.log('Recognized text:', text);
        
        if (event.results[last].isFinal) {
          console.log('Final result received, translating...');
          const translation = await translateText(text);
          
          setSegments(prev => [...prev, {
            text,
            translation,
            timestamp: Date.now()
          }]);
        }
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
        if (isRecording) {
          console.log('Restarting speech recognition');
          recognition.start();
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setError(`Speech recognition error: ${event.error}`);
        setIsRecording(false);
      };

      try {
        recognition.start();
        setRecognition(recognition);
        setIsRecording(true);
        setError('');
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setError('Failed to start speech recognition. Please try again.');
        setIsRecording(false);
      }
    } else {
      setError('Speech recognition is not supported in this browser.');
    }
  }, [sourceLanguage, isRecording]);

  const stopRecording = useCallback(() => {
    if (recognition) {
      recognition.stop();
      console.log('Speech recognition stopped');
    }
    setIsRecording(false);
    setRecognition(null);
  }, [recognition]);

  useEffect(() => {
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [recognition]);

  const handleSpeak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = targetLanguage.value;
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
            onChange={setTargetLanguage}
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