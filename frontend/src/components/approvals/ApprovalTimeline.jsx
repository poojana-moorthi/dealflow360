import React from 'react';

export function ApprovalTimeline({ steps = [] }) {
  return (
    <div className="flex items-center justify-between relative py-2">
      {steps.map((step, idx) => (
        <div key={idx} className="flex flex-col items-center flex-1 relative">
          {idx > 0 && (
            <div className={`absolute top-3 right-1/2 w-full h-0.5 ${step.completed ? 'bg-blue-600' : 'bg-slate-200'}`} />
          )}
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold z-10 ${
            step.completed ? 'bg-blue-600 text-white' : (step.current ? 'bg-amber-500 text-white ring-2 ring-amber-200' : 'bg-slate-200 text-slate-500')
          }`}>
            {idx + 1}
          </div>
          <span className="text-[11px] font-medium text-slate-700 mt-1.5 text-center">{step.label}</span>
          <span className="text-[10px] text-slate-400">{step.role}</span>
        </div>
      ))}
    </div>
  );
}

export default ApprovalTimeline;
