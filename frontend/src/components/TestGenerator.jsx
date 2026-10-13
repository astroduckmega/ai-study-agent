import React, { useState } from 'react';
import { Award, Zap, Sparkles, Loader2, Sliders, CheckCircle2, Target } from 'lucide-react';
import { studyService } from '../services/studyService';
import { useStudy } from '../context/StudyContext';

export default function TestGenerator({ onTestGenerated }) {
  const { activeDocument } = useStudy();
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  const [questionType, setQuestionType] = useState('mixed');
  const [loading, setLoading] = useState(false);
  const [loadingPersonalized, setLoadingPersonalized] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!activeDocument) {
      setError('Please select or upload a PDF document first.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const test = await studyService.generateMockTest(
        activeDocument.id,
        numQuestions,
        difficulty,
        questionType
      );
      if (onTestGenerated) onTestGenerated(test);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to generate mock test.');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePersonalized = async () => {
    setError(null);
    setLoadingPersonalized(true);

    try {
      const test = await studyService.generatePersonalizedTest(
        activeDocument?.id || null,
        'hard',
        5
      );
      if (onTestGenerated) onTestGenerated(test);
    } catch (err) {
      console.error(err);
      setError('Failed to generate personalized remedial test.');
    } finally {
      setLoadingPersonalized(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/[0.08] space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-surface-highest/60">
        <div>
          <h3 className="text-base font-heading font-bold text-on-surface flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Generate Custom Mock Exam
          </h3>
          <p className="text-xs text-on-surface-variant font-sans mt-0.5">
            Strictly grounded questions extracted from: <span className="text-primary font-mono font-medium">{activeDocument?.filename || 'Active PDF'}</span>
          </p>
        </div>

        {/* 1-Click Remedial Test Button */}
        <button
          onClick={handleGeneratePersonalized}
          disabled={loadingPersonalized || loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-500/20 glow-button transition cursor-pointer"
        >
          {loadingPersonalized ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Target className="w-4 h-4 text-purple-200" />
          )}
          <span>Adaptive Remedial Quiz (From Weak Topics)</span>
        </button>
      </div>

      {/* Test Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Number of Questions */}
        <div className="space-y-2.5">
          <label className="text-xs font-mono font-semibold text-on-surface block">Number of Questions</label>
          <div className="grid grid-cols-4 gap-2">
            {[5, 10, 20, 30].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setNumQuestions(count)}
                className={`py-2 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                  numQuestions === count
                    ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-500/30 border border-primary/40 glow-button'
                    : 'bg-surface-container-high/70 text-on-surface-variant hover:text-on-surface border border-white/[0.08]'
                }`}
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div className="space-y-2.5">
          <label className="text-xs font-mono font-semibold text-on-surface block">Difficulty Level</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'easy', label: 'Easy' },
              { id: 'medium', label: 'Medium' },
              { id: 'hard', label: 'Hard' },
            ].map((diff) => (
              <button
                key={diff.id}
                type="button"
                onClick={() => setDifficulty(diff.id)}
                className={`py-2 rounded-xl text-xs font-mono font-semibold transition cursor-pointer ${
                  difficulty === diff.id
                    ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md shadow-indigo-500/30 border border-primary/40 glow-button'
                    : 'bg-surface-container-high/70 text-on-surface-variant hover:text-on-surface border border-white/[0.08]'
                }`}
              >
                {diff.label}
              </button>
            ))}
          </div>
        </div>

        {/* Question Type */}
        <div className="space-y-2.5">
          <label className="text-xs font-mono font-semibold text-on-surface block">Question Format</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'mixed', label: 'Mixed' },
              { id: 'mcq', label: 'MCQs' },
              { id: 'true_false', label: 'True/False' },
            ].map((fmt) => (
              <button
                key={fmt.id}
                type="button"
                onClick={() => setQuestionType(fmt.id)}
                className={`py-2 rounded-xl text-xs font-mono font-semibold transition cursor-pointer ${
                  questionType === fmt.id
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/30 border border-primary/40 glow-button'
                    : 'bg-surface-container-high/70 text-on-surface-variant hover:text-on-surface border border-white/[0.08]'
                }`}
              >
                {fmt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-error/10 border border-error/25 text-xs text-error font-mono">
          {error}
        </div>
      )}

      {/* Generate CTA */}
      <button
        onClick={handleGenerate}
        disabled={loading || loadingPersonalized || !activeDocument}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 disabled:opacity-50 text-white font-heading font-bold text-sm shadow-lg shadow-brand-500/25 glow-button transition flex items-center justify-center gap-2 cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Mock Test Agent is generating questions...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            <span>Generate & Start Exam ({numQuestions} Questions)</span>
          </>
        )}
      </button>
    </div>
  );
}
