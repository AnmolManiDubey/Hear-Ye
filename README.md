# Hear-Ye

**Hear-Ye** is a full-stack web app that enhances multimedia accessibility by processing video files. It extracts audio, transcribes speech, translates it into a target language, and converts it back to audio. Users can view the original video, transcription, translation, and translated audio using a clean, responsive interface.

## Features
- **Video Upload:** Upload videos via the React frontend.
- **Audio Extraction:** Extract audio using MoviePy.
- **Speech Recognition:** Transcribe audio with SpeechRecognition.
- **Translation:** Translate text using googletrans.
- **Text-to-Speech:** Convert translations to audio using gTTS.
- **Result Playback:** View transcriptions, translations, and listen to the audio, all displayed side-by-side with the video.

## Technologies
- **Backend:** Flask, MoviePy, Pydub, SpeechRecognition, googletrans, gTTS
- **Frontend:** React, Axios
- **Other:** Base64 encoding for media delivery

## How It Works
1. **Upload Video:** Provide a video file and target language.
2. **Process Audio:** The backend extracts, transcribes, translates, and converts the audio.
3. **Display Results:** View and listen to results side-by-side with the original video.

## Getting Started

**Backend Setup:**
```bash
pip install flask[async] moviepy pydub speechrecognition googletrans==4.0.0-rc1 gTTS
```
Ensure FFmpeg is installed and in your system PATH.
```bash
python app.py
```

**Frontend Setup:**
```bash
cd client
npm install
npm start
```
Ensure the proxy in `package.json` is set to `http://localhost:5000`.

**Usage:**
- Open `http://localhost:3000`
- Upload a video and enter the target language.
- View transcription, translation, and playback results.

