import React from 'react';
import { AlertTriangle, Target, ArrowRight, CheckCircle } from 'lucide-react';

export default function WeakTopicsCard({ weakTopics = [], onGenerateRemedial }) {
  if (!weakTopics || weakTopics.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 text-center space-y-2">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-semibold text-slate-200">No Weak Topics Recorded</h4>
        <p className="text-xs text-slate-400">
          Complete mock tests to automatically track topics that require additional review.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/[0.08] space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-heading font-bold text-on-surface flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-tertiary" />
            Knowledge Gap & Weak Topics Analysis
          </h3>
          <p className="text-xs text-on-surface-variant font-sans mt-0.5">
            Diagnosed by the Performance Analysis Agent across all exam attempts
          </p>
        </div>

        {onGenerateRemedial && (
          <button
            onClick={() => onGenerateRemedial()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md glow-button transition cursor-pointer"
          >
            <Target className="w-3.5 h-3.5" />
            <span>Target All Weak Areas</span>
          </button>
        )}
      </div>

      <div className="space-y-3">
        {weakTopics.map((item, idx) => {
          const errorPercent = Math.round((item.error_rate || 0) * 100);
          return (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-surface-container-low/80 border border-white/[0.08] flex items-center justify-between gap-4 hover:border-primary/40 transition"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-heading font-semibold text-on-surface text-xs">{item.topic}</span>
                  <span className="text-[10px] font-mono text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded">
                    {item.document_name}
                  </span>
                </div>
                <div className="w-full max-w-xs bg-surface-highest rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-tertiary to-error h-1.5 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(10, errorPercent))}%` }}
                  ></div>
                </div>
                <div className="text-[11px] font-mono text-outline flex items-center gap-3">
                  <span>{item.incorrect_attempts} errors / {item.total_questions_attempted} attempts</span>
                  <span>•</span>
                  <span className="text-tertiary">{errorPercent}% Error Rate</span>
                </div>
              </div>

              {onGenerateRemedial && (
                <button
                  onClick={() => onGenerateRemedial(item.topic)}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-high text-on-surface-variant hover:text-on-surface border border-white/[0.08] text-xs font-mono font-medium flex items-center gap-1 transition cursor-pointer"
                >
                  <span>Quiz Topic</span>
                  <ArrowRight className="w-3 h-3 text-primary" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
