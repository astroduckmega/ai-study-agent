import React from 'react';
import { FileText, Trash2, BookOpen, MessageSquare, Award, CheckCircle2, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStudy } from '../context/StudyContext';

export default function DocumentCard({ document, onDelete }) {
  const navigate = useNavigate();
  const { activeDocument, setActiveDocument } = useStudy();
  const isActive = activeDocument?.id === document.id;

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleSelect = () => {
    setActiveDocument(document);
  };

  return (
    <div
      onClick={handleSelect}
      className={`p-5 rounded-2xl transition-all duration-200 cursor-pointer border ${
        isActive
          ? 'glass-panel-glow border-primary/50 shadow-lg shadow-primary/10 scale-[1.01]'
          : 'glass-card hover:border-primary/40 bg-surface-container/70 hover:bg-surface-container'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600/30 to-indigo-600/30 border border-primary/30 flex items-center justify-center text-primary shrink-0 mt-0.5">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-heading font-semibold text-on-surface text-sm leading-snug line-clamp-1" title={document.filename}>
              {document.filename}
            </h4>
            <div className="flex items-center gap-2 text-xs font-mono text-outline mt-1">
              <span>{document.metadata?.total_pages || 1} Pages</span>
              <span>•</span>
              <span>{document.metadata?.total_chunks || 0} Chunks</span>
              <span>•</span>
              <span>{formatBytes(document.metadata?.file_size_bytes)}</span>
            </div>
          </div>
        </div>

        {/* Active badge or delete button */}
        <div className="flex items-center gap-2">
          {isActive && (
            <span className="flex items-center gap-1 text-[11px] font-mono font-medium bg-secondary/15 text-secondary border border-secondary/30 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3 h-3" /> Selected
            </span>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(document.id);
              }}
              title="Delete Document"
              className="p-1.5 text-outline hover:text-error hover:bg-error/10 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Topics badges */}
      {document.metadata?.topics && document.metadata.topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-white/[0.08]">
          {document.metadata.topics.slice(0, 3).map((t, idx) => (
            <span key={idx} className="text-[10px] font-mono bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-md border border-white/[0.08] truncate max-w-[120px]">
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Action Shortcut Buttons */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/[0.08]">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setActiveDocument(document);
            navigate('/summary');
          }}
          className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-surface-container-high hover:bg-surface-high text-on-surface-variant hover:text-on-surface border border-white/[0.08] text-xs font-medium transition cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5 text-primary" /> Summary
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setActiveDocument(document);
            navigate('/chat');
          }}
          className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-surface-container-high hover:bg-surface-high text-on-surface-variant hover:text-on-surface border border-white/[0.08] text-xs font-medium transition cursor-pointer"
        >
          <MessageSquare className="w-3.5 h-3.5 text-primary" /> Ask PDF
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setActiveDocument(document);
            navigate('/tests');
          }}
          className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-surface-container-high hover:bg-surface-high text-on-surface-variant hover:text-on-surface border border-white/[0.08] text-xs font-medium transition cursor-pointer"
        >
          <Award className="w-3.5 h-3.5 text-primary" /> Quiz
        </button>
      </div>
    </div>
  );
}
