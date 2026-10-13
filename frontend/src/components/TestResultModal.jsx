import React from 'react';
import { Award, CheckCircle2, XCircle, AlertCircle, Sparkles, ArrowRight, RotateCcw, Target, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TestResultModal({ result, onRetake, onRemedialTest }) {
  const navigate = useNavigate();
  if (!result) return null;

  const isPassing = result.score_percentage >= 60;

  return (
    <div className="space-y-6">
      {/* Top Score Banner */}
      <div className="glass-panel-glow rounded-2xl p-6 border border-primary/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-mono font-extrabold text-2xl shadow-xl ${
              isPassing
                ? 'bg-gradient-to-tr from-secondary-container to-secondary shadow-secondary/20 text-on-secondary'
                : 'bg-gradient-to-tr from-tertiary-container to-error shadow-error/20 text-white'
            }`}
          >
            {result.score_percentage}%
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-heading font-bold text-on-surface">Examination Diagnostic Report</h2>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                  isPassing
                    ? 'bg-secondary/15 text-secondary border border-secondary/30'
                    : 'bg-tertiary/15 text-tertiary border border-tertiary/30'
                }`}
              >
                {isPassing ? 'Mastery Demonstrated' : 'Review Recommended'}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant font-sans mt-1">{result.improvement_feedback}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-surface-highest/60 pt-4 md:pt-0 md:pl-6 text-xs font-mono">
          <div className="text-center">
            <span className="text-outline block text-[11px]">Correct</span>
            <span className="text-lg font-bold text-secondary">
              {result.correct_count} / {result.total_questions}
            </span>
          </div>
          <div className="text-center">
            <span className="text-outline block text-[11px]">Accuracy</span>
            <span className="text-lg font-bold text-primary">
              {Math.round(result.accuracy * 100)}%
            </span>
          </div>
          <div className="text-center">
            <span className="text-outline block text-[11px]">Time</span>
            <span className="text-lg font-bold text-on-surface">
              {Math.floor((result.time_taken_seconds || 0) / 60)}m {(result.time_taken_seconds || 0) % 60}s
            </span>
          </div>
        </div>
      </div>

      {/* Weak and Strong Topics Diagnosis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weak Topics */}
        <div className="p-4 rounded-xl bg-error/10 border border-error/25 space-y-2">
          <h4 className="text-xs font-mono font-bold text-error uppercase tracking-wider flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-error" /> Weak Topics Identified
          </h4>
          {result.weak_topics_identified && result.weak_topics_identified.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {result.weak_topics_identified.map((t, idx) => (
                <span key={idx} className="text-xs font-mono bg-error/15 text-error px-2.5 py-1 rounded-lg border border-error/25">
                  {t}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-outline font-sans">No major weaknesses identified in this test!</p>
          )}
        </div>

        {/* Strong Topics */}
        <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/25 space-y-2">
          <h4 className="text-xs font-mono font-bold text-secondary uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-secondary" /> Strong Mastery Topics
          </h4>
          {result.strong_topics_identified && result.strong_topics_identified.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {result.strong_topics_identified.map((t, idx) => (
                <span key={idx} className="text-xs font-mono bg-secondary/15 text-secondary px-2.5 py-1 rounded-lg border border-secondary/25">
                  {t}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-outline font-sans">Keep practicing to establish high-confidence mastery areas.</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-surface-container-low/80 border border-white/[0.08]">
        <button
          onClick={onRetake}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-high text-on-surface text-xs font-semibold border border-white/[0.08] transition cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" /> Retake Another Test
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/analytics')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-high text-on-surface-variant hover:text-on-surface text-xs font-medium border border-white/[0.08] transition cursor-pointer"
          >
            View Full Progress
          </button>
          <button
            onClick={onRemedialTest}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-500/20 glow-button transition cursor-pointer"
          >
            <Target className="w-4 h-4" />
            <span>Generate Adaptive Remedial Test</span>
          </button>
        </div>
      </div>

      {/* Question-by-Question Detailed Results */}
      <div className="space-y-4">
        <h3 className="text-sm font-heading font-bold text-on-surface uppercase tracking-wider">
          Question-by-Question Diagnostic Analysis
        </h3>

        {result.questions_result && result.questions_result.map((q, idx) => (
          <div
            key={idx}
            className={`p-5 rounded-2xl border transition-all ${
              q.is_correct
                ? 'bg-surface-container/60 border-white/[0.08]'
                : 'bg-error/5 border-error/25'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                    q.is_correct
                      ? 'bg-secondary/15 text-secondary border border-secondary/30'
                      : 'bg-error/15 text-error border border-error/30'
                  }`}
                >
                  {q.is_correct ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-outline mb-1">
                    <span className="font-bold text-on-surface">Question {idx + 1}</span>
                    <span>•</span>
                    <span className="bg-surface-container px-2 py-0.5 rounded text-on-surface-variant">Topic: {q.topic}</span>
                    {q.page_reference && (
                      <span className="bg-surface-container px-2 py-0.5 rounded text-outline">Page {q.page_reference}</span>
                    )}
                  </div>
                  <h4 className="text-sm font-heading font-semibold text-on-surface">{q.question}</h4>
                </div>
              </div>
            </div>

            {/* Answer Comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs font-mono">
              <div
                className={`p-3 rounded-xl border ${
                  q.is_correct
                    ? 'bg-secondary/10 border-secondary/30 text-secondary'
                    : 'bg-error/10 border-error/30 text-error'
                }`}
              >
                <span className="block text-[11px] font-semibold opacity-70 mb-1">Your Answer:</span>
                <span className="font-medium">{q.student_answer || '(No answer selected)'}</span>
              </div>

              <div className="p-3 rounded-xl bg-surface-lowest border border-white/[0.08] text-on-surface">
                <span className="block text-[11px] font-semibold text-outline mb-1">Expected Correct Answer:</span>
                <span className="font-medium text-secondary">{q.correct_answer}</span>
              </div>
            </div>

            {/* In-depth Explanation */}
            {q.explanation && (
              <div className="mt-3 p-3 rounded-xl bg-surface-lowest/80 border border-white/[0.08] text-xs text-on-surface-variant font-sans">
                <strong className="text-primary block mb-1 font-mono">Diagnostic Explanation:</strong>
                {q.explanation}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
