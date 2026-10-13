import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, FileText, Sparkles } from 'lucide-react';
import { documentService } from '../services/documentService';
import { useStudy } from '../context/StudyContext';

export default function PDFUploader({ onUploadComplete }) {
  const { fetchDocuments, setActiveDocument } = useStudy();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a PDF file only.');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('File size exceeds the 50MB limit.');
      return;
    }

    setError(null);
    setUploading(true);
    setProgress(15);
    setStatusMessage('Uploading PDF document...');

    try {
      setStatusMessage('Extracting text, chunking & generating vector embeddings...');
      const uploadedDoc = await documentService.uploadDocument(file, (p) => {
        setProgress(Math.min(90, Math.max(20, p)));
      });

      setProgress(100);
      setStatusMessage('Document indexed successfully!');
      await fetchDocuments();
      setActiveDocument(uploadedDoc);

      setTimeout(() => {
        setUploading(false);
        setProgress(0);
        setStatusMessage('');
        if (onUploadComplete) onUploadComplete(uploadedDoc);
      }, 1200);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to process and index PDF.');
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-primary bg-primary/10 scale-[1.01]'
            : 'border-surface-highest/80 hover:border-primary/50 bg-surface-container-low/70 hover:bg-surface-container-low'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="application/pdf"
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600/30 to-indigo-600/30 border border-primary/30 flex items-center justify-center text-primary shadow-lg">
            {uploading ? (
              <Loader2 className="w-7 h-7 animate-spin" />
            ) : (
              <UploadCloud className="w-7 h-7" />
            )}
          </div>

          <div>
            <h3 className="text-base font-heading font-semibold text-on-surface">
              {uploading ? 'Processing Study Document' : 'Upload Textbook or Study PDF'}
            </h3>
            <p className="text-xs text-on-surface-variant font-sans mt-1">
              {uploading
                ? statusMessage
                : 'Drag and drop your PDF here, or click to browse (up to 50MB)'}
            </p>
          </div>

          {/* RAG pipeline feature chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px] font-mono text-on-surface-variant">
            <span className="flex items-center gap-1 bg-surface-container px-2.5 py-1 rounded-md border border-white/[0.08]">
              <Sparkles className="w-3 h-3 text-primary" /> PyPDF Parsing
            </span>
            <span className="flex items-center gap-1 bg-surface-container px-2.5 py-1 rounded-md border border-white/[0.08]">
              <FileText className="w-3 h-3 text-primary" /> Page-Level Citations
            </span>
            <span className="flex items-center gap-1 bg-surface-container px-2.5 py-1 rounded-md border border-white/[0.08]">
              <CheckCircle2 className="w-3 h-3 text-secondary" /> Vector Store
            </span>
          </div>

          {/* Progress Bar */}
          {uploading && (
            <div className="w-full max-w-xs space-y-1.5 pt-2">
              <div className="w-full bg-surface-highest rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-brand-500 to-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[11px] font-mono text-outline font-medium">
                <span>{statusMessage}</span>
                <span>{progress}%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-3 p-3 rounded-xl bg-error/10 border border-error/25 flex items-center gap-2 text-xs text-error font-mono">
          <AlertCircle className="w-4 h-4 shrink-0 text-error" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
