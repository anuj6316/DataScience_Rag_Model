import React from 'react';

interface MetricsCardProps {
  label: string;
  value: string;
}

export const MetricsCard: React.FC<MetricsCardProps> = ({ label, value }) => {
  // Simple parser to separate value from percentage if present
  // Example: "12,450 +15.7%"
  let mainValue = value;
  let percent = '';
  let isPositive = true;

  // Heuristic to split spaces or brackets
  if (value.includes(' ')) {
    const parts = value.split(' ');
    mainValue = parts[0];
    percent = parts.slice(1).join(' '); // Capture the rest
  }

  // Check positivity
  if (percent.includes('-')) isPositive = false;
  if (percent.includes('+')) isPositive = true;
  
  // Clean up parenthesis if needed
  percent = percent.replace(/[()]/g, '');

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col gap-2 min-w-[140px] flex-1 transition-colors duration-300">
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</span>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{mainValue}</span>
        {percent && (
           <span className={`text-xs font-bold ${isPositive ? 'text-emerald-500' : 'text-rose-500'} bg-opacity-10 px-1.5 py-0.5 rounded`}>
             {percent}
           </span>
        )}
      </div>
    </div>
  );
};