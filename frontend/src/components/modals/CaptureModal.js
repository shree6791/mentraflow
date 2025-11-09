import React from 'react';
import { X, Upload, PenTool, Video, Brain, Filter, CheckCircle, Loader } from 'lucide-react';

const CaptureModal = ({
  show,
  onClose,
  onCustomizeQuiz,
  activeTab,
  setActiveTab,
  processingFile,
  uploadedFileName,
  uploadedContent,
  setUploadedContent,
  youtubeUrl,
  setYoutubeUrl,
  handleFileUpload,
  removeUploadedFile,
  generateSummaryAndQuiz,
  generating
}) => {
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content fab-capture-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Capture New Knowledge</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          <div className="fab-capture-header">
            <button 
              className="btn-customize-small"
              onClick={onCustomizeQuiz}
              title="Customize quiz settings"
            >
              <Filter size={16} /> Customize Quiz
            </button>
          </div>

          <div className="capture-tabs">
            <button 
              className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => setActiveTab('upload')}
            >
              <Upload size={18} /> Upload File
            </button>
            <button 
              className={`tab ${activeTab === 'paste' ? 'active' : ''}`}
              onClick={() => setActiveTab('paste')}
            >
              <PenTool size={18} /> Paste Text
            </button>
            <button 
              className={`tab ${activeTab === 'youtube' ? 'active' : ''}`}
              onClick={() => setActiveTab('youtube')}
            >
              <Video size={18} /> YouTube
            </button>
          </div>

          {activeTab === 'upload' ? (
            <div className="upload-zone">
              <input
                type="file"
                id="fab-file-upload"
                accept=".txt,.pdf,.docx"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                disabled={processingFile}
              />
              {processingFile ? (
                <div className="processing-file-display">
                  <Loader size={48} className="processing-icon" />
                  <p className="processing-text">Processing {uploadedFileName}...</p>
                  <p className="processing-hint">Extracting text content</p>
                </div>
              ) : !uploadedFileName ? (
                <label htmlFor="fab-file-upload" className="upload-label">
                  <Upload size={48} className="upload-icon" />
                  <p className="upload-text">Drag & drop or click to upload</p>
                  <p className="upload-hint">Supports .txt, .pdf, and .docx files</p>
                </label>
              ) : (
                <div className="uploaded-file-display">
                  <div className="uploaded-file-info">
                    <CheckCircle size={24} className="file-success-icon" />
                    <div className="file-details">
                      <p className="file-name">{uploadedFileName}</p>
                      <p className="file-status">Ready to generate</p>
                    </div>
                  </div>
                  <button 
                    className="btn-remove-file"
                    onClick={removeUploadedFile}
                    type="button"
                  >
                    <X size={18} /> Change File
                  </button>
                </div>
              )}
            </div>
          ) : activeTab === 'paste' ? (
            <div className="paste-zone">
              <textarea
                placeholder="Paste your notes, articles, or any text you want to remember..."
                value={uploadedContent}
                onChange={(e) => setUploadedContent(e.target.value)}
                rows={10}
              />
            </div>
          ) : (
            <div className="youtube-zone">
              <div className="youtube-input-container">
                <Video size={24} className="youtube-icon" />
                <input
                  type="url"
                  placeholder="Enter YouTube URL (e.g., https://www.youtube.com/watch?v=...)"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="youtube-input"
                />
              </div>
              <p className="youtube-hint">
                Paste a YouTube video link to generate a summary and quiz from the video content
              </p>
            </div>
          )}

          <button 
            className={`btn-primary btn-generate ${
              (activeTab === 'youtube' && youtubeUrl) || 
              (activeTab === 'upload' && uploadedFileName) || 
              (activeTab === 'paste' && uploadedContent) 
                ? 'btn-generate-ready' 
                : ''
            }`}
            onClick={generateSummaryAndQuiz}
            disabled={generating || (activeTab === 'youtube' ? !youtubeUrl : !uploadedContent)}
            style={{marginTop: '1rem'}}
          >
            {generating ? (
              <>
                <div className="spinner-small"></div> Generating...
              </>
            ) : (
              <>
                <Brain size={18} /> Generate Summary & Quiz
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaptureModal;
