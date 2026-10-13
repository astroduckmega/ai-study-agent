import React, { useState, useEffect } from 'react';
import { TrendingUp, Target, Award, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { studyService } from '../services/studyService';
import { useNavigate } from 'react-router-dom';
import PerformanceCharts from '../components/PerformanceCharts';
import WeakTopicsCard from '../components/WeakTopicsCard';

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const { activeDocument } = useStudy();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const data = await studyService.getPerformanceOverview(activeDocument?.id);
        setOverview(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [activeDocument]);

  const handleRemedialTest = async (topic) => {
    navigate('/tests');
  };

  return (
    <div className="space-y-8 pb-12 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-on-surface tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            Performance & Personalized Learning
          </h1>
          <p className="text-xs text-on-surface-variant font-sans mt-1">
            Continuous diagnostic tracking of your knowledge strengths, recurring errors, and tailored remedial recommendations.
          </p>
        </div>

        <button
          onClick={() => handleRemedialTest()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-500/20 glow-button transition cursor-pointer"
        >
          <Target className="w-4 h-4 text-purple-200" />
          <span>Generate Adaptive Remedial Test</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center text-primary">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Charts & Metric Overview */}
          <PerformanceCharts overview={overview} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weak Topics */}
            <WeakTopicsCard
              weakTopics={overview?.weak_topics || []}
              onGenerateRemedial={handleRemedialTest}
            />

            {/* Strong Mastery Topics */}
            <div className="glass-panel rounded-2xl p-6 border border-white/[0.08] space-y-4">
              <h3 className="text-sm font-heading font-bold text-on-surface flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-secondary" />
                Verified Mastery & Strong Topics
              </h3>
              <p className="text-xs text-on-surface-variant font-sans">
                Topics where you consistently scored ≥80% accuracy
              </p>

              {overview?.strong_topics && overview.strong_topics.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-2">
                  {overview.strong_topics.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-mono bg-secondary/15 text-secondary px-3 py-1.5 rounded-xl border border-secondary/30 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-secondary" />
                      <span>{t}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-outline font-sans italic py-4">
                  Complete more tests to unlock verified strong topic badges.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
