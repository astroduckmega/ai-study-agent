import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, ChevronLeft, ChevronRight, Send, AlertTriangle, HelpCircle, Loader2 } from 'lucide-react';
import { studyService } from '../services/studyService';

export default function TestRunner({ test, onSubmitComplete, onCancel }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // question_id -> selected_answer
  const [timeLeft, setTimeLeft] = useState((test.time_limit_minutes || 15) * 60);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQ = test.questions[currentIdx];
  const totalQ = test.questions.length;

  const handleSelectOption = (qId, option) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: option
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    const submissionAnswers = test.questions.map((q) => ({
      question_id: q.question_id,
      selected_answer: answers[q.question_id] || ''
    }));

    const timeTaken = (test.time_limit_minutes || 15) * 60 - timeLeft;

    try {
      const evaluationResult = await studyService.submitTest(
        test.test_id,
        test.document_id,
        submissionAnswers,
        Math.max(1, timeTaken)
      );
      if (onSubmitComplete) onSubmitComplete(evaluationResult);
    } catch (err) {
      console.error(err);
      setError('Failed to evaluate test answers.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Test Top Bar */}
      <div className="glass-panel rounded-2xl p-5 border border-white/[0.08] flex items-center justify-between">
        <div>
          <h2 className="text-base font-heading font-bold text-on-surface">{test.title}</h2>
          <div className="flex items-center gap-3 text-xs text-on-surface-variant mt-1 font-mono">
            <span>Difficulty: <strong className="text-on-surface capitalize">{test.difficulty}</strong></span>
            <span>•</span>
            <span>Document: <strong className="text-primary">{test.document_name}</strong></span>
          </div>
        </div>

        {/* Timer & Submit CTA */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-surface-lowest border border-tertiary/30 text-sm font-mono font-bold text-tertiary shadow-inner">
            <Clock className="w-4 h-4" />
            <span>{formatTime(timeLeft)}</span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 glow-button transition cursor-pointer"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>Submit Exam</span>
          </button>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="glass-panel rounded-2xl p-8 border border-white/[0.08] space-y-6">
        {/* Question Header & Pagination Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-surface-highest/60">
          <div className="flex items-center gap-2 text-xs font-mono font-medium">
            <span className="px-2.5 py-1 rounded-md bg-primary/20 text-primary font-bold border border-primary/30">
              Question {currentIdx + 1} of {totalQ}
            </span>
            <span className="text-outline">|</span>
            <span className="bg-surface-container px-2 py-0.5 rounded text-on-surface-variant">Topic: {currentQ.topic}</span>
            {currentQ.page_reference && (
              <span className="bg-surface-container px-2 py-0.5 rounded text-outline">Page {currentQ.page_reference}</span>
            )}
          </div>

          <span className="text-xs font-mono text-outline">
            {Object.keys(answers).length} / {totalQ} Answered
          </span>
        </div>

        {/* Question Text */}
        <div className="text-base font-heading font-semibold text-on-surface leading-relaxed">
          {currentQ.question}
        </div>

        {/* Options */}
        {currentQ.options && currentQ.options.length > 0 ? (
          <div className="space-y-3 pt-2">
            {currentQ.options.map((opt, oIdx) => {
              const isSelected = answers[currentQ.question_id] === opt;
              const optionLetter = String.fromCharCode(65 + oIdx);
              return (
                <div
                  key={oIdx}
                  onClick={() => handleSelectOption(currentQ.question_id, opt)}
                  className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-3.5 ${
                    isSelected
                      ? 'bg-primary/15 border-primary text-on-surface shadow-md shadow-primary/10'
                      : 'bg-surface-container-low/80 hover:bg-surface-container border-white/[0.08] text-on-surface-variant'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg font-mono font-bold text-xs flex items-center justify-center border transition ${
                      isSelected
                        ? 'bg-primary border-primary text-on-primary'
                        : 'bg-surface-container-high border-white/[0.1] text-outline'
                    }`}
                  >
                    {optionLetter}
                  </div>
                  <span className="text-sm font-sans">{opt}</span>
                </div>
              );
            })}
          </div>
        ) : (
          /* Short Answer Input */
          <div className="pt-2">
            <textarea
              rows={4}
              value={answers[currentQ.question_id] || ''}
              onChange={(e) => handleSelectOption(currentQ.question_id, e.target.value)}
              placeholder="Type your answer here..."
              className="w-full bg-surface-lowest border border-white/[0.12] rounded-xl p-4 text-sm text-on-surface focus:outline-none focus:border-primary font-sans"
            />
          </div>
        )}

        {/* Question Footer Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-surface-highest/60">
          <button
            onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
            disabled={currentIdx === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-high disabled:opacity-30 text-on-surface text-xs font-semibold border border-white/[0.08] transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          {/* Question dot indicators */}
          <div className="hidden sm:flex items-center gap-1.5">
            {test.questions.map((q, qIdx) => {
              const isAnswered = !!answers[q.question_id];
              const isCurrent = qIdx === currentIdx;
              return (
                <button
                  key={qIdx}
                  onClick={() => setCurrentIdx(qIdx)}
                  className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                    isCurrent
                      ? 'bg-primary text-on-primary ring-2 ring-primary'
                      : isAnswered
                      ? 'bg-secondary/20 text-secondary border border-secondary/40'
                      : 'bg-surface-container-high text-outline'
                  }`}
                >
                  {qIdx + 1}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentIdx((prev) => Math.min(totalQ - 1, prev + 1))}
            disabled={currentIdx === totalQ - 1}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-high disabled:opacity-30 text-on-surface text-xs font-semibold border border-white/[0.08] transition cursor-pointer"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-error/10 border border-error/25 text-xs text-error font-mono">
          {error}
        </div>
      )}
    </div>
  );
}
