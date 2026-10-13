import React from 'react';
import { BookOpen, FileText, Sparkles } from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import SummaryViewer from '../components/SummaryViewer';

export default function SummaryPage() {
  const { activeDocument } = useStudy();

  return (
    <div className="space-y-6 pb-12 font-sans">
      <div>
        <h1 className="text-2xl font-heading font-extrabold text-on-surface tracking-tight flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" />
          AI Summary Agent
        </h1>
        <p className="text-xs text-on-surface-variant font-sans mt-1">
          Distill textbooks and lecture notes into concise, exam-focused formats with key takeaways and formulas.
        </p>
      </div>

      <SummaryViewer />
    </div>
  );
}
