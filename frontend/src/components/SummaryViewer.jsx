import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, Copy, Check, Award, Loader2, List, FileText, BookmarkCheck } from 'lucide-react';
import { studyService } from '../services/studyService';
import { useStudy } from '../context/StudyContext';
import { useNavigate } from 'react-router-dom';

export default function SummaryViewer() {
  const navigate = useNavigate();
  const { activeDocument } = useStudy();
  const [summaryType, setSummaryType] = useState('detailed');
  const [customInstruction, setCustomInstruction] = useState('');
  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [copied, setCopied] = useState(false);

  const summaryTypes = [
    { id: 'detailed', label: 'Detailed Summary' },
    { id: 'short', label: '1-Page Short' },
    { id: 'exam_oriented', label: 'Exam High-Yield' },
    { id: 'definitions', label: 'Definitions' },
    { id: 'key_points', label: 'Key Points' },
    { id: 'formulas', label: 'Formulas' },
    { id: 'chapter_wise', label: 'Chapter-Wise' },
  ];

  const handleGenerate = async (typeToUse) => {
    if (!activeDocument) return;
    const targetType = typeToUse || summaryType;
    setLoading(true);

    try {
      const data = await studyService.generateSummary(
        activeDocument.id,
        targetType,
        customInstruction
      );
      setSummaryData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeDocument && !summaryData) {
      handleGenerate('detailed');
    }
  }, [activeDocument]);

  const handleCopy = () => {
    if (summaryData?.content) {
      navigator.clipboard.writeText(summaryData.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Type Selector Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-surface-container-low/80 border border-white/[0.08]">
        {summaryTypes.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setSummaryType(t.id);
              handleGenerate(t.id);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              summaryType === t.id
                ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-500/20 glow-button'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="glass-panel rounded-2xl p-6 relative border border-white/[0.08]">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-surface-highest/60">
          <div>
            <h2 className="text-lg font-heading font-bold text-on-surface flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              {summaryData?.title || 'Academic Summary'}
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5 font-sans">
              Source: <span className="font-mono text-outline">{activeDocument?.filename || 'No document selected'}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={!summaryData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-high text-on-surface text-xs font-medium border border-white/[0.08] transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-secondary" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={() => navigate('/tests')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md glow-button transition cursor-pointer"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Quiz Me On This</span>
            </button>
          </div>
        </div>

        {/* Loading Indicator */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 text-on-surface-variant">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-on-surface font-sans">
              Summary Agent is distilling key concepts from the PDF...
            </p>
          </div>
        ) : summaryData ? (
          <div className="mt-6 space-y-6">
            {/* Key Takeaways Card */}
            {summaryData.key_takeaways && summaryData.key_takeaways.length > 0 && (
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/25">
                <h4 className="text-xs font-mono font-bold text-primary uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <BookmarkCheck className="w-4 h-4 text-primary" /> Key High-Yield Takeaways
                </h4>
                <ul className="space-y-1.5 text-xs text-on-surface font-sans">
                  {summaryData.key_takeaways.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Markdown Body */}
            <div className="prose prose-invert max-w-none text-sm text-on-surface leading-relaxed whitespace-pre-wrap font-sans">
              {summaryData.content}
            </div>
          </div>
        ) : (
          <div className="py-16 text-center text-outline text-sm font-sans">
            Select a study PDF and click generate to synthesize your summary.
          </div>
        )}
      </div>
    </div>
  );
}
