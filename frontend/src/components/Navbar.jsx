import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useStudy } from '../context/StudyContext';
import { Bot, FileText, ChevronDown, User, LogOut, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { documents, activeDocument, setActiveDocument } = useStudy();

  return (
    <header className="h-16 border-b border-surface-highest/60 bg-surface-lowest/90 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform border border-primary/20">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-lg text-on-surface tracking-tight">AI Study Agent</span>
              <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-primary/10 text-primary border border-primary/25 rounded-md flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Agentic RAG
              </span>
            </div>
            <p className="text-xs text-on-surface-variant font-sans">Multi-Agent Personalized Tutor</p>
          </div>
        </Link>
      </div>

      {/* Center: Active Study Document Selector */}
      <div className="hidden md:flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container-low border border-white/[0.08] text-sm">
          <FileText className="w-4 h-4 text-primary" />
          <span className="text-on-surface-variant text-xs font-medium">Active PDF:</span>
          {documents.length > 0 ? (
            <select
              value={activeDocument?.id || ''}
              onChange={(e) => {
                const doc = documents.find((d) => d.id === e.target.value);
                if (doc) setActiveDocument(doc);
              }}
              className="bg-transparent text-on-surface text-xs font-mono font-medium focus:outline-none cursor-pointer max-w-[200px] truncate"
            >
              {documents.map((d) => (
                <option key={d.id} value={d.id} className="bg-surface-container text-on-surface">
                  {d.filename} ({d.metadata?.total_pages || 1}p)
                </option>
              ))}
            </select>
          ) : (
            <span className="text-outline text-xs italic">No document selected</span>
          )}
        </div>
      </div>

      {/* Right: User Profile & Actions */}
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-medium text-on-surface">{user.full_name || 'Student'}</span>
              <span className="text-xs text-on-surface-variant font-mono truncate max-w-[150px]">{user.email}</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center font-bold text-white text-sm border border-primary/30 shadow-md">
              {user.full_name ? user.full_name[0].toUpperCase() : 'S'}
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-2 text-outline hover:text-error hover:bg-surface-high/60 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-4 py-1.5 text-sm font-medium text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-high/60 transition"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="px-4 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 rounded-lg shadow-md glow-button transition"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
