import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  BookOpen,
  MessageSquare,
  Award,
  TrendingUp,
  FileText,
  UploadCloud,
  ArrowRight,
  Target,
  Zap,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStudy } from '../context/StudyContext';
import { studyService } from '../services/studyService';
import PDFUploader from '../components/PDFUploader';
import DocumentCard from '../components/DocumentCard';
import WeakTopicsCard from '../components/WeakTopicsCard';
import PerformanceCharts from '../components/PerformanceCharts';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { documents, activeDocument, setActiveDocument } = useStudy();
  const [overview, setOverview] = useState(null);
  const [weakTopics, setWeakTopics] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    const loadOverview = async () => {
      setLoadingStats(true);
      try {
        const data = await studyService.getPerformanceOverview();
        setOverview(data);
        setWeakTopics(data.weak_topics || []);
      } catch (err) {
        console.error('Error fetching dashboard metrics:', err);
      } finally {
        setLoadingStats(false);
      }
    };
    loadOverview();
  }, [activeDocument]);

  const handleRemedialTest = () => {
    navigate('/tests');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-surface-container-high/90 via-surface-container/95 to-surface-container-low border border-primary/25 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-mono font-medium">
            <Sparkles className="w-3.5 h-3.5" /> LangGraph Coordinator Active
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-on-surface tracking-tight">
            Welcome, <span className="gradient-text">{user?.full_name || 'Student'}</span>
          </h1>
          <p className="text-on-surface-variant text-sm leading-relaxed font-sans">
            Your personalized AI Tutor is ready. Upload your lecture notes or textbooks to generate deep summaries, ask grounded questions with exact page references, and take adaptive mock exams tailored to your weak areas.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => navigate('/chat')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-brand-500/25 glow-button transition cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Ask the PDF</span>
            </button>
            <button
              onClick={() => navigate('/tests')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-high/70 hover:bg-surface-high text-on-surface text-xs font-semibold border border-white/10 transition cursor-pointer"
            >
              <Award className="w-4 h-4 text-primary" />
              <span>Generate Mock Exam</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-primary/10 to-transparent pointer-events-none"></div>
      </div>

      {/* 3 Core Agent Quick Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Summary Agent */}
        <div
          onClick={() => navigate('/summary')}
          className="glass-panel p-6 rounded-2xl border border-white/[0.08] hover:border-primary/40 transition-all duration-200 cursor-pointer group space-y-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600/25 to-indigo-600/25 border border-primary/30 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-heading font-bold text-on-surface flex items-center justify-between">
              <span>AI Summaries</span>
              <ArrowRight className="w-4 h-4 text-outline group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-xs text-on-surface-variant font-sans mt-1">
              Short, Detailed, Exam-Oriented, Formula sheets, and Chapter-Wise syntheses.
            </p>
          </div>
        </div>

        {/* Card 2: Ask the PDF */}
        <div
          onClick={() => navigate('/chat')}
          className="glass-panel p-6 rounded-2xl border border-white/[0.08] hover:border-primary/40 transition-all duration-200 cursor-pointer group space-y-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600/25 to-purple-600/25 border border-indigo-500/30 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-heading font-bold text-on-surface flex items-center justify-between">
              <span>Ask the PDF (RAG)</span>
              <ArrowRight className="w-4 h-4 text-outline group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-xs text-on-surface-variant font-sans mt-1">
              Conversational interactive Q&A with strict grounding and exact page number citations.
            </p>
          </div>
        </div>

        {/* Card 3: Adaptive Mock Tests */}
        <div
          onClick={() => navigate('/tests')}
          className="glass-panel p-6 rounded-2xl border border-white/[0.08] hover:border-primary/40 transition-all duration-200 cursor-pointer group space-y-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600/25 to-pink-600/25 border border-purple-500/30 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-heading font-bold text-on-surface flex items-center justify-between">
              <span>Adaptive Mock Exams</span>
              <ArrowRight className="w-4 h-4 text-outline group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-xs text-on-surface-variant font-sans mt-1">
              Timed MCQs and short answers with detailed diagnostic explanations & mistake tracking.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: PDF Uploader & Documents */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-heading font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-primary" />
              Upload Study Material
            </h3>
            <PDFUploader />
          </div>

          {/* Uploaded Documents List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-heading font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Your Study Materials ({documents.length})
              </h3>
              {documents.length > 0 && (
                <button
                  onClick={() => navigate('/documents')}
                  className="text-xs text-primary hover:text-white font-mono font-semibold transition"
                >
                  Manage All
                </button>
              )}
            </div>

            {documents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {documents.slice(0, 4).map((doc) => (
                  <DocumentCard key={doc.id} document={doc} />
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-surface-container-low border border-white/[0.06] text-center text-outline text-xs">
                No study documents uploaded yet. Drop a PDF above to begin.
              </div>
            )}
          </div>

          {/* Performance Trend Charts */}
          {overview && (
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-heading font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Study Performance Overview
              </h3>
              <PerformanceCharts overview={overview} />
            </div>
          )}
        </div>

        {/* Right 1 Col: Weak Topics & Learning Recommendations */}
        <div className="space-y-6">
          <WeakTopicsCard weakTopics={weakTopics} onGenerateRemedial={handleRemedialTest} />

          {/* Recommendations Card */}
          {overview?.recommendations && overview.recommendations.length > 0 && (
            <div className="glass-panel rounded-2xl p-6 border border-white/[0.08] space-y-3">
              <h4 className="text-xs font-mono font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" /> AI Coach Recommendations
              </h4>
              <ul className="space-y-2 text-xs text-on-surface-variant font-sans">
                {overview.recommendations.map((rec, rIdx) => (
                  <li key={rIdx} className="flex items-start gap-2 bg-surface-container-low p-2.5 rounded-xl border border-white/[0.06]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-secondary shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
