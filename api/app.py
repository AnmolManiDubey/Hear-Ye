import os
import time
import base64
import uuid
from flask import Flask, jsonify, request
from moviepy.editor import VideoFileClip
from pydub import AudioSegment
import speech_recognition as sr
from googletrans import Translator, LANGUAGES
from gtts import gTTS

app = Flask(__name__)
translator = Translator()
recognizer = sr.Recognizer()

# Supported video formats and max file size (50MB)
ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov', 'mkv', 'flv'}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB

def safe_remove(filepath, retries=5, delay=1):
    """Safely remove files with retry logic and error suppression"""
    for _ in range(retries):
        try:
            if os.path.exists(filepath):
                os.remove(filepath)
                return True
        except (PermissionError, OSError) as e:
            time.sleep(delay)
    return False

def allowed_file(filename):
    """Validate file extension and name"""
    return ('.' in filename and 
            filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS and
            len(filename) < 255 and
            not os.path.isabs(filename))

@app.route('/process-audio', methods=['POST'])
def process_audio():  # Removed async as we're not using async operations
    # Validate request
    if 'video' not in request.files:
        return jsonify({'error': 'No video file provided'}), 400
        
    video_file = request.files['video']
    if video_file.filename == '':
        return jsonify({'error': 'Empty filename'}), 400
    if not allowed_file(video_file.filename):
        return jsonify({'error': 'Unsupported file type'}), 400
    if video_file.content_length > MAX_FILE_SIZE:
        return jsonify({'error': 'File size exceeds 50MB limit'}), 400

    # Validate language code
    target_language = request.form.get('language', 'en').lower()
    if target_language not in LANGUAGES:
        return jsonify({'error': f'Unsupported language code: {target_language}'}), 400

    # Create unique temp directory
    temp_dir = os.path.join(os.getcwd(), 'temp', str(uuid.uuid4()))
    os.makedirs(temp_dir, exist_ok=True)
    temp_files = []

    try:
        # Generate unique filenames to prevent collisions
        base_name = os.path.join(temp_dir, 'video_file')
        video_path = f"{base_name}_original.{video_file.filename.rsplit('.', 1)[1].lower()}"
        audio_output = f"{base_name}_audio.mp3"
        audio_wav = f"{base_name}_audio.wav"
        final_audio = f"{base_name}_translated.mp3"

        # Save uploaded file
        video_file.save(video_path)
        temp_files.append(video_path)

        # Audio extraction
        with VideoFileClip(video_path) as clip:
            if not clip.audio:
                return jsonify({'error': 'Video file has no audio track'}), 400
            clip.audio.write_audiofile(audio_output, verbose=False, logger=None)
            temp_files.append(audio_output)

        # Audio conversion
        audio = AudioSegment.from_mp3(audio_output)
        audio.export(audio_wav, format="wav")
        temp_files.append(audio_wav)

        # Speech recognition
        with sr.AudioFile(audio_wav) as source:
            audio_data = recognizer.record(source)
            try:
                text = recognizer.recognize_google(audio_data)
            except sr.UnknownValueError:
                return jsonify({'error': 'Could not understand audio'}), 400
            except sr.RequestError as e:
                return jsonify({'error': f'Speech recognition error: {str(e)}'}), 500

        # Translation
        try:
            translation_result = translator.translate(text, dest=target_language)
            translation = translation_result.text
        except Exception as e:
            return jsonify({'error': f'Translation failed: {str(e)}'}), 500

        # Speech synthesis
        try:
            tts = gTTS(text=translation, lang=target_language)
            tts.save(final_audio)
            temp_files.append(final_audio)
        except Exception as e:
            return jsonify({'error': f'Speech synthesis failed: {str(e)}'}), 500

        # Base64 encoding
        try:
            with open(final_audio, "rb") as f:
                audio_base64 = base64.b64encode(f.read()).decode('utf-8')
            
            with open(video_path, "rb") as f:
                video_base64 = base64.b64encode(f.read()).decode('utf-8')
        except Exception as e:
            return jsonify({'error': f'File encoding failed: {str(e)}'}), 500

        return jsonify({
            'transcription': text,
            'translation': translation,
            'target_language': target_language,
            'audio_base64': audio_base64,
            'video_base64': video_base64
        })

    except Exception as e:
        app.logger.error(f'Processing error: {str(e)}')
        return jsonify({'error': 'Internal processing error'}), 500

    finally:
        # Cleanup with enhanced error suppression
        for file_path in temp_files:
            safe_remove(file_path)
        
        try:
            if os.path.exists(temp_dir):
                os.rmdir(temp_dir)
        except OSError:
            pass

if __name__ == '__main__':
    app.run(debug=True)