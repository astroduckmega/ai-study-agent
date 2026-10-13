import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, BookOpen, FileText, Loader2, Bookmark, CheckCircle2 } from 'lucide-react';
import { studyService } from '../services/studyService';
import { useStudy } from '../context/StudyContext';
import AgentStepsViewer from './AgentStepsViewer';

export default function ChatInterface() {
  const { activeDocument } = useStudy();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am your **Agentic AI Study Tutor** powered by LangGraph.
I can answer grounded questions from your PDF with exact page references, generate comprehensive summaries, build customized practice exams, and analyze your weak areas.

**What would you like to explore today?**`,
      citations: [],
      agent_steps: [
        {
          step_number: 1,
          agent_name: "coordinator",
          action: "Session Initialized & Ready for student queries.",
          status: "completed",
          output_summary: "Multi-Agent Coordinator graph ready."
        }
      ],
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => 'sess_' + Math.random().toString(36).substring(2, 9));
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const quickPrompts = [
    "What are the core concepts covered in this document?",
    "Explain deadlock and normalization in simple terms.",
    "Which page discusses primary keys and indexing?",
    "Analyze my weak topics and test me on them.",
  ];

  const handleSend = async (textToSend) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt || loading) return;

    const userMessage = {
      id: 'usr_' + Date.now(),
      role: 'student',
      content: prompt,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setLoading(true);

    try {
      const response = await studyService.sendChatMessage(
        prompt,
        activeDocument?.id || null,
        sessionId
      );

      const botMessage = {
        id: 'bot_' + Date.now(),
        role: 'assistant',
        content: response.message || "I've processed your request.",
        citations: response.citations || [],
        agent_steps: response.agent_steps || [],
        suggested_followups: response.suggested_followups || [],
        timestamp: new Date().toISOString()
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage = {
        id: 'err_' + Date.now(),
        role: 'assistant',
        content: "Sorry, I encountered an issue processing your query. Please make sure a PDF document is uploaded and selected.",
        citations: [],
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface-lowest/70 rounded-2xl border border-white/[0.08] overflow-hidden">
      {/* Chat Header */}
      <div className="px-6 py-3.5 bg-surface-container-low/90 border-b border-surface-highest/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md border border-primary/25">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-sm text-on-surface flex items-center gap-2">
              Ask the PDF Tutor
              {activeDocument && (
                <span className="text-[11px] font-mono text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-md border border-white/[0.08]">
                  {activeDocument.filename}
                </span>
              )}
            </h3>
            <p className="text-[11px] text-on-surface-variant font-sans">Strict RAG Grounding & Page-Level Verification</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono text-secondary bg-secondary/15 border border-secondary/30 px-2.5 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
          <span>Grounded Mode Active</span>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3.5 ${msg.role === 'student' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/30 text-primary flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[82%] rounded-2xl p-4 text-sm leading-relaxed ${
                msg.role === 'student'
                  ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-500/10'
                  : 'bg-surface-container/90 border border-white/[0.08] text-on-surface shadow-sm'
              }`}
            >
              {/* Message Content */}
              <div className="whitespace-pre-wrap font-sans text-[13.5px]">
                {msg.content}
              </div>

              {/* Agent Workflow Steps */}
              {msg.agent_steps && msg.agent_steps.length > 0 && (
                <AgentStepsViewer steps={msg.agent_steps} />
              )}

              {/* Source Page Citations */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/[0.08] space-y-2">
                  <p className="text-[11px] font-mono font-semibold text-primary flex items-center gap-1 uppercase tracking-wider">
                    <Bookmark className="w-3 h-3" /> Grounded Source Citations
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {msg.citations.map((cite, i) => (
                      <div
                        key={i}
                        className="p-2 rounded-lg bg-surface-lowest/90 border border-white/[0.08] text-[11px] text-on-surface-variant space-y-1 hover:border-primary/40 transition"
                      >
                        <div className="flex items-center justify-between text-primary font-medium">
                          <span className="truncate max-w-[130px] font-heading">{cite.document_name}</span>
                          <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">
                            Page {cite.page_number}
                          </span>
                        </div>
                        <p className="text-on-surface-variant line-clamp-2 italic text-[10px] font-sans">
                          "{cite.snippet}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Follow-ups */}
              {msg.suggested_followups && msg.suggested_followups.length > 0 && (
                <div className="mt-3 pt-2.5 flex flex-wrap gap-1.5">
                  {msg.suggested_followups.map((sug, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => handleSend(sug)}
                      className="text-[11px] font-mono bg-primary/10 hover:bg-primary/20 text-primary px-2.5 py-1 rounded-md border border-primary/25 transition flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-2.5 h-2.5" /> {sug}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {msg.role === 'student' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-md border border-primary/30">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3 text-xs text-on-surface-variant p-2">
            <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center text-primary">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <div className="space-y-1">
              <span className="font-heading font-semibold text-primary">Coordinator Agent is reasoning...</span>
              <p className="text-[11px] font-mono text-outline">Retrieving chunks & generating grounded response</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-6 py-2 bg-surface-container-low/60 border-t border-surface-highest/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-mono font-semibold text-outline uppercase shrink-0">Quick Prompts:</span>
        {quickPrompts.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="text-[11px] font-mono text-on-surface-variant hover:text-on-surface bg-surface-container-high/60 hover:bg-surface-container-high px-2.5 py-1 rounded-lg border border-white/[0.08] whitespace-nowrap transition cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-4 bg-surface-container-low/95 border-t border-surface-highest/60 flex items-center gap-3"
      >
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder={
            activeDocument
              ? `Ask anything about "${activeDocument.filename}"...`
              : 'Ask a question or type a study instruction...'
          }
          className="flex-1 bg-surface-lowest text-on-surface text-sm px-4 py-3 rounded-xl border border-white/[0.12] focus:outline-none focus:border-primary transition placeholder:text-outline font-sans"
        />
        <button
          type="submit"
          disabled={!inputPrompt.trim() || loading}
          className="p-3 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 disabled:opacity-40 text-white rounded-xl shadow-md glow-button transition cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
