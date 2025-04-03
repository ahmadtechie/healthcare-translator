import React from 'react';
import Select from 'react-select';
import { Language } from '../types';

interface LanguageSelectorProps {
  value: Language;
  onChange: (language: Language) => void;
  label: string;
}

const languages: Language[] = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ru', label: 'Russian' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'ar', label: 'Arabic' },
  { value: 'hi', label: 'Hindi' },
  { value: 'yo', label: 'Yoruba' },
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  value,
  onChange,
  label,
}) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <Select
        value={value}
        onChange={(newValue) => onChange(newValue as Language)}
        options={languages}
        className="basic-single"
        classNamePrefix="select"
      />
    </div>
  );
};