import React from 'react';
import { TrendingUp, Award, CheckCircle, Flame, Clock } from 'lucide-react';

export default function PerformanceCharts({ overview }) {
  if (!overview) return null;

  const {
    total_tests_taken = 0,
    average_score = 0,
    overall_accuracy = 0,
    total_questions_answered = 0,
    recent_tests = [],
    study_activity_streak_days = 1
  } = overview;

  return (
    <div className="space-y-6">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-white/[0.08] space-y-1">
          <div className="flex items-center justify-between text-outline text-xs font-mono">
            <span>Tests Taken</span>
            <Award className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-mono font-bold text-on-surface">{total_tests_taken}</p>
          <p className="text-[11px] text-outline font-sans">Total Exams Completed</p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/[0.08] space-y-1">
          <div className="flex items-center justify-between text-outline text-xs font-mono">
            <span>Average Score</span>
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-mono font-bold text-primary">{average_score}%</p>
          <p className="text-[11px] text-outline font-sans">Mean Exam Grade</p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/[0.08] space-y-1">
          <div className="flex items-center justify-between text-outline text-xs font-mono">
            <span>Overall Accuracy</span>
            <CheckCircle className="w-4 h-4 text-secondary" />
          </div>
          <p className="text-2xl font-mono font-bold text-secondary">{Math.round(overall_accuracy * 100)}%</p>
          <p className="text-[11px] text-outline font-sans">{total_questions_answered} Questions Graded</p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/[0.08] space-y-1">
          <div className="flex items-center justify-between text-outline text-xs font-mono">
            <span>Study Streak</span>
            <Flame className="w-4 h-4 text-tertiary" />
          </div>
          <p className="text-2xl font-mono font-bold text-tertiary">{study_activity_streak_days} Days</p>
          <p className="text-[11px] text-outline font-sans">Active Learning Record</p>
        </div>
      </div>

      {/* Score Trend History */}
      <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-4">
        <h3 className="text-sm font-heading font-bold text-on-surface flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Score Trajectory Across Recent Exams
        </h3>

        {recent_tests.length > 0 ? (
          <div className="space-y-3 pt-2">
            {recent_tests.map((t, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-on-surface-variant font-medium">
                  <div className="flex items-center gap-2 truncate max-w-[200px] sm:max-w-md">
                    <span className="text-outline font-mono font-bold">#{recent_tests.length - idx}</span>
                    <span className="truncate font-sans text-on-surface">{t.document_name}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-outline text-[11px]">{t.date}</span>
                    <span
                      className={`font-bold ${
                        t.score >= 80
                          ? 'text-secondary'
                          : t.score >= 60
                          ? 'text-primary'
                          : 'text-tertiary'
                      }`}
                    >
                      {t.score}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-surface-highest rounded-full h-2 overflow-hidden border border-white/[0.06]">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      t.score >= 80
                        ? 'bg-gradient-to-r from-secondary-container to-secondary'
                        : t.score >= 60
                        ? 'bg-gradient-to-r from-brand-500 to-primary'
                        : 'bg-gradient-to-r from-tertiary to-error'
                    }`}
                    style={{ width: `${Math.max(5, t.score)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-outline font-sans text-center py-6">
            Take mock exams to visualize your learning trajectory and mastery over time.
          </p>
        )}
      </div>
    </div>
  );
}
