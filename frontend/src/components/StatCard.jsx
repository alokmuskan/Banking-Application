import React from 'react';

const StatCard = ({ label, value, sub, icon: Icon, colorScheme = 'blue', change }) => {
  const schemes = {
    blue:    { icon: 'bg-blue-50 text-blue-600',    change: 'text-blue-600' },
    green:   { icon: 'bg-emerald-50 text-emerald-600', change: 'text-emerald-600' },
    amber:   { icon: 'bg-amber-50 text-amber-600',  change: 'text-amber-600' },
    red:     { icon: 'bg-red-50 text-red-600',      change: 'text-red-600' },
    purple:  { icon: 'bg-purple-50 text-purple-600',change: 'text-purple-600' },
    slate:   { icon: 'bg-slate-100 text-slate-600', change: 'text-slate-600' },
  };
  const s = schemes[colorScheme] || schemes.blue;

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-card p-5 flex flex-col gap-3 hover:shadow-card-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">{value}</p>
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.icon}`}>
            <Icon size={18} />
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        {change && <span className={`text-xs font-medium ${s.change}`}>{change}</span>}
        {sub && <span className="text-xs text-slate-400">{sub}</span>}
      </div>
    </div>
  );
};

export default StatCard;
