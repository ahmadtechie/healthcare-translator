import React from 'react';
import { Volume2 } from 'lucide-react';
import { TranscriptSegment } from '../types';

interface TranscriptDisplayProps {
  segments: TranscriptSegment[];
  onSpeak: (text: string) => void;
  title: string;
  isOriginal?: boolean;
}

export const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({
  segments,
  onSpeak,
  title,
  isOriginal = false,
}) => {
  return (
    <div className="w-full bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="space-y-4 max-h-[400px] overflow-y-auto">
        {segments.map((segment, index) => (
          <div
            key={index}
            className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
          >
            <p className="text-gray-800">
              {isOriginal ? segment.text : segment.translation}
            </p>
            <button
              onClick={() => onSpeak(isOriginal ? segment.text : segment.translation)}
              className="ml-2 p-2 text-gray-600 hover:text-gray-800 transition-colors"
              aria-label="Speak text"
            >
              <Volume2 size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};