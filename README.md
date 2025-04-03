# AI-Powered Voice-to-Text Translator

## 📌 Overview
AI-Powered Voice-to-Text Translator is a web application designed to convert spoken input into text with AI-enhanced accuracy, particularly for medical terms. It provides real-time translation of the transcript and enables audio playback of the translated text. The application is optimized for both mobile and desktop use.

---

## 🚀 Features
### 🔹 Core Functionalities
- **🎙 Voice-to-Text with Generative AI:** Uses AI to enhance transcription accuracy, particularly for medical terminology.
- **🌍 Real-Time Translation & Audio Playback:** Provides real-time translation of the transcribed text with an option to play back the translated audio.
- **📱 Mobile-First Design:** Ensures responsiveness and usability on both mobile and desktop devices.

### 🎨 User Interface & Experience
- **📜 Dual Transcript Display:** Shows both the original and translated transcripts in real-time.
- **🔊 Speak Button:** Allows users to listen to the translated text.
- **🌎 Language Selection:** Enables users to choose input and output languages easily.

---

## 🛠 Technology Stack
### 🧠 AI & APIs
- **🤖 Generative AI Tools:** Google Cloud API for enhanced transcription and translation.
- **🎤 Speech Recognition API:** Google Speech-to-Text for real-time voice-to-text conversion.

### 💻 Development & Deployment
- **🖥 Frontend:** React.js with Tailwind CSS for a responsive UI.
- **🔙 Backend:** Django for API handling.

---

## 🔒 Security & Privacy
- Ensures **patient confidentiality** and data security.
- Implements **basic security measures** to protect sensitive data.

---

## ✅ Testing & Quality Assurance
- Comprehensive testing to ensure accurate transcription, translation, and audio playback.
- Robust **error handling** for transcription or translation failures.

---

## 🔧 Installation & Setup
### 📌 Prerequisites
- Node.js (for frontend development)
- Python (for backend, if applicable)
- API keys for Google Cloud Translation and Google Speech-to-Text

### 🛠 Steps to Run Locally
1. **Clone the repository:**
   ```sh
   git clone https://github.com/ahmadtechie/healthcare-translator.git
   cd healthcare-translator
   ```
2. **Install dependencies:**
   ```sh
   cd frontend
   npm install

   cd backend
   python manage.py runserver
   ```
3. **Set up environment variables in a `.env` file:**
   Refer to the example.env file in both the frontend and backend directories 

4. **Start the development server:**
   ```sh
   cd frontend
   npm run dev

   cd backend
   python manage.py runserver
   ```
5. **Access the app at** `http://localhost:5173/`

---

## 🤝 Contributing
We welcome contributions! To contribute:
1. **Fork the repository.**
2. **Create a feature branch:**
   ```sh
   git checkout -b feature-name
   ```
3. **Commit changes and push:**
   ```sh
   git commit -m "Added a new feature"
   git push origin feature-name
   ```
4. **Submit a pull request.**

---

## 📜 License
This project is licensed under the **MIT License** 

---

## 📩 Contact
For inquiries, contact **Ahmad Sharafudeen** at **ahmadsharafudeen@gmail.com**.
