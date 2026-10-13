import React, { useState } from 'react';
import { Cpu, ChevronDown, ChevronUp, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

export default function AgentStepsViewer({ steps = [], defaultExpanded = false }) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (!steps || steps.length === 0) return null;

  return (
    <div className="my-2 rounded-xl bg-surface-container-low/90 border border-primary/20 overflow-hidden text-xs">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3.5 py-2 flex items-center justify-between bg-surface-container/60 hover:bg-surface-container text-on-surface-variant transition cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-primary/15 text-primary flex items-center justify-center border border-primary/25">
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <span className="font-heading font-semibold text-on-surface">
            Agent Reasoning & Multi-Step Trace ({steps.length} {steps.length === 1 ? 'Step' : 'Steps'})
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-outline text-[11px] font-mono">
          <span>{expanded ? 'Hide Details' : 'View Workflow'}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {expanded && (
        <div className="p-3.5 space-y-2.5 border-t border-surface-highest/60 bg-surface-lowest/70">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-[11px]">
              <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/30 text-primary flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                {step.step_number || idx + 1}
              </div>
              <div className="flex-1 space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-primary uppercase tracking-wider text-[10px] bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                    {step.agent_name || 'Coordinator'}
                  </span>
                  <span className="text-on-surface font-medium font-sans">{step.action}</span>
                </div>
                {step.output_summary && (
                  <p className="text-on-surface-variant text-[10.5px] leading-relaxed bg-surface-container-low p-2 rounded-lg border border-white/[0.06] mt-1 font-mono">
                    {step.output_summary}
                  </p>
                )}
              </div>
              <CheckCircle2 className="w-3.5 h-3.5 text-secondary shrink-0 mt-0.5" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
