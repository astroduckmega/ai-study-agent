import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Files,
  FileText,
  MessageSquare,
  Award,
  TrendingUp,
  Cpu,
  Sparkles
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';

export default function Sidebar() {
  const { activeDocument } = useStudy();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/documents', label: 'Study PDFs', icon: Files },
    { to: '/summary', label: 'AI Summaries', icon: FileText },
    { to: '/chat', label: 'Ask PDF (RAG)', icon: MessageSquare },
    { to: '/tests', label: 'Mock Exams', icon: Award },
    { to: '/analytics', label: 'Performance', icon: TrendingUp },
  ];

  return (
    <aside className="w-64 border-r border-surface-highest/60 bg-surface-lowest/95 flex flex-col justify-between py-6 px-4 shrink-0">
      <div className="space-y-6">
        {/* Navigation List */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-mono font-medium tracking-wider text-outline uppercase mb-2">
            Study Modules
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-primary/15 to-brand-600/20 text-on-surface border border-primary/30 shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-high/40'
                  }`
                }
              >
                <Icon className="w-4 h-4 text-primary" />
                <span className="font-sans">{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Current Active PDF Badge */}
        {activeDocument && (
          <div className="p-3.5 rounded-xl bg-surface-container-low border border-white/[0.08] text-xs space-y-1.5">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-semibold text-on-surface">Active Material</span>
              <span className="text-[10px] font-mono bg-secondary/15 text-secondary border border-secondary/30 px-1.5 py-0.5 rounded">Ready</span>
            </div>
            <p className="text-on-surface font-medium truncate" title={activeDocument.filename}>
              {activeDocument.filename}
            </p>
            <div className="text-[11px] font-mono text-outline flex items-center gap-2">
              <span>{activeDocument.metadata?.total_pages || 1} Pages</span>
              <span>•</span>
              <span>{activeDocument.metadata?.total_chunks || 0} Chunks</span>
            </div>
          </div>
        )}
      </div>

      {/* Coordinator Agent Status Footer */}
      <div className="pt-4 border-t border-surface-highest/60">
        <div className="p-3 rounded-xl bg-surface-container border border-primary/20 flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0 mt-0.5 border border-primary/25">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-on-surface font-heading">LangGraph Agent</span>
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            </div>
            <p className="text-[11px] text-on-surface-variant leading-tight mt-0.5 font-sans">
              Multi-Agent Orchestrator Online
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
