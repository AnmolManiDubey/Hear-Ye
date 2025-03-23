import React, { useState } from 'react';
import axios from 'axios';
import './AudioProcessor.css';

function AudioProcessor() {
  // State declarations
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState('en');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Supported languages
  const supportedLanguages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' }
  ];

  // Event handlers
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Clear previous results when a new file is selected
      setResult(null);
    }
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleLanguageSelect = (code) => {
    setLanguage(code);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a video file.");
      return;
    }
    
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('video', file);
    formData.append('language', language);

    try {
      const response = await axios.post('/process-audio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred while processing your request.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to get language name from code
  const getLanguageName = (code) => {
    const lang = supportedLanguages.find(l => l.code === code);
    return lang ? lang.name : code;
  };

  return (
    <div className="audio-processor wide-layout">
      <div className="header-container">
        <h1>Audio Translation Studio</h1>
        <p className="subtitle">Transform video content across languages with professional-grade audio processing</p>
      </div>

      <form onSubmit={handleSubmit} className="upload-form form-section">
        <div className="form-container">
          <div className="file-input-container">
            <label className="file-input-label">
              <span className="button-style">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                Select Video File
              </span>
              <input 
                type="file" 
                onChange={handleFileChange} 
                accept="video/*" 
                className="hidden-input"
              />
              {file ? (
                <span className="file-name">{file.name}</span>
              ) : (
                <span className="file-name">No file selected (MP4, MOV, AVI formats supported)</span>
              )}
            </label>
          </div>

          <div className="language-input-group">
            <div className="language-input-container">
              <label className="language-label">Target Language</label>
              <input 
                type="text" 
                value={language} 
                onChange={handleLanguageChange}
                placeholder="Enter language code (e.g., en, es, fr)"
                className="language-input"
              />
              <div className="language-hint">
                {supportedLanguages.map(lang => (
                  <div 
                    key={lang.code} 
                    className="language-badge" 
                    onClick={() => handleLanguageSelect(lang.code)}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="language-code">{lang.code}</span> {lang.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="action-row">
            <button 
              type="submit" 
              className="submit-button"
              disabled={loading || !file}
            >
              {loading ? (
                <span className="button-loading">
                  <span className="spinner mini-spinner"></span>
                  Processing...
                </span>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Begin Translation
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      <div className="results-wrapper">
        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">Analyzing and processing your video...</p>
          </div>
        )}

        {error && (
          <div className="error-container">
            <div className="error-icon">!</div>
            <p className="error-message">{error}</p>
          </div>
        )}

        {result && (
          <div className="results-container">
            <h3 className="results-title">Processing Results</h3>
            
            <div className="text-results">
              <div className="result-card transcription-card">
                <div className="result-header">
                  <span className="result-icon">📝</span>
                  <h4 className="result-label">Original Transcription</h4>
                </div>
                <p className="transcription-text">{result.transcription}</p>
              </div>
              
              <div className="result-card translation-card">
                <div className="result-header">
                  <span className="result-icon">🌐</span>
                  <h4 className="result-label">{getLanguageName(result.target_language)} Translation</h4>
                </div>
                <p className="translation-text">{result.translation}</p>
              </div>
            </div>

            <div className="media-results">
              {result.audio_base64 && (
                <div className="media-card audio-card">
                  <div className="media-header">
                    <span className="media-icon">🔊</span>
                    <h4 className="media-title">Translated Audio</h4>
                  </div>
                  <audio controls className="audio-player">
                    <source
                      src={`data:audio/mp3;base64,${result.audio_base64}`}
                      type="audio/mp3"
                    />
                    Your browser doesn't support audio playback.
                  </audio>
                </div>
              )}

              {result.video_base64 && (
                <div className="media-card video-card">
                  <div className="media-header">
                    <span className="media-icon">🎥</span>
                    <h4 className="media-title">Processed Video</h4>
                  </div>
                  <video controls className="video-player">
                    <source
                      src={`data:video/mp4;base64,${result.video_base64}`}
                      type="video/mp4"
                    />
                    Your browser doesn't support video playback.
                  </video>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AudioProcessor;