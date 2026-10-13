import React, { useState, useEffect } from 'react';
import { Award, Clock, History, RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { studyService } from '../services/studyService';
import TestGenerator from '../components/TestGenerator';
import TestRunner from '../components/TestRunner';
import TestResultModal from '../components/TestResultModal';

export default function TestsPage() {
  const { activeDocument } = useStudy();
  const [currentTest, setCurrentTest] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [testHistory, setTestHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const history = await studyService.getTestHistory(activeDocument?.id);
      setTestHistory(history);
    } catch (err) {
      console.error('Failed to load test history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [activeDocument]);

  const handleTestGenerated = (test) => {
    setTestResult(null);
    setCurrentTest(test);
  };

  const handleTestSubmitted = (result) => {
    setCurrentTest(null);
    setTestResult(result);
    fetchHistory();
  };

  const handleRetake = () => {
    setTestResult(null);
    setCurrentTest(null);
  };

  const handleGenerateRemedial = async () => {
    try {
      const remedialTest = await studyService.generatePersonalizedTest(
        activeDocument?.id,
        'hard',
        5
      );
      setTestResult(null);
      setCurrentTest(remedialTest);
    } catch (err) {
      console.error(err);
      alert('Failed to generate remedial test.');
    }
  };

  return (
    <div className="space-y-8 pb-12 font-sans">
      <div>
        <h1 className="text-2xl font-heading font-extrabold text-on-surface tracking-tight flex items-center gap-2">
          <Award className="w-6 h-6 text-primary" />
          Mock Examinations & Adaptive Testing
        </h1>
        <p className="text-xs text-on-surface-variant font-sans mt-1">
          Generate rigorous PDF-grounded exams, practice under timed conditions, and receive instant diagnostic explanations.
        </p>
      </div>

      {/* State View 1: Active Exam Runner */}
      {currentTest && (
        <TestRunner
          test={currentTest}
          onSubmitComplete={handleTestSubmitted}
          onCancel={() => setCurrentTest(null)}
        />
      )}

      {/* State View 2: Post-Test Result Diagnostic */}
      {testResult && (
        <TestResultModal
          result={testResult}
          onRetake={handleRetake}
          onRemedialTest={handleGenerateRemedial}
        />
      )}

      {/* State View 3: Generator Form & History */}
      {!currentTest && !testResult && (
        <div className="space-y-8">
          <TestGenerator onTestGenerated={handleTestGenerated} />

          {/* Past Test History Section */}
          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-heading font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-primary" />
              Past Exam History ({testHistory.length})
            </h3>

            {testHistory.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testHistory.map((h, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl glass-panel border border-white/[0.08] flex items-center justify-between gap-4 hover:border-primary/40 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-semibold text-on-surface text-sm">{h.document_name}</span>
                        <span className="text-[10px] font-mono bg-surface-container text-on-surface-variant px-2 py-0.5 rounded border border-white/[0.06]">
                          {h.total_questions} Questions
                        </span>
                      </div>
                      <p className="text-xs font-mono text-outline">
                        Submitted: {new Date(h.submitted_at).toLocaleDateString()}
                      </p>
                      {h.weak_topics_identified && h.weak_topics_identified.length > 0 && (
                        <div className="flex items-center gap-1 text-[11px] font-mono text-tertiary">
                          <AlertCircle className="w-3 h-3" />
                          <span>Weak: {h.weak_topics_identified.slice(0, 2).join(', ')}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-xl font-mono font-extrabold block ${
                          h.score_percentage >= 80
                            ? 'text-secondary'
                            : h.score_percentage >= 60
                            ? 'text-primary'
                            : 'text-tertiary'
                        }`}
                      >
                        {h.score_percentage}%
                      </span>
                      <span className="text-[10px] font-mono text-outline">
                        {h.correct_count} / {h.total_questions} correct
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-surface-container-low border border-white/[0.06] text-center text-outline text-xs font-sans">
                No previous tests taken yet. Generate your first mock exam above!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
