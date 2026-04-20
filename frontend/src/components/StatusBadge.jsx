import React from 'react';

const statusConfig = {
  success:  { bg: 'bg-emerald-50',  text: 'text-emerald-700',  dot: 'bg-emerald-500',  label: 'Success'  },
  active:   { bg: 'bg-emerald-50',  text: 'text-emerald-700',  dot: 'bg-emerald-500',  label: 'Active'   },
  approved: { bg: 'bg-emerald-50',  text: 'text-emerald-700',  dot: 'bg-emerald-500',  label: 'Approved' },
  pending:  { bg: 'bg-amber-50',    text: 'text-amber-700',    dot: 'bg-amber-500',    label: 'Pending'  },
  warning:  { bg: 'bg-amber-50',    text: 'text-amber-700',    dot: 'bg-amber-500',    label: 'Warning'  },
  failed:   { bg: 'bg-red-50',      text: 'text-red-700',      dot: 'bg-red-500',      label: 'Failed'   },
  rejected: { bg: 'bg-red-50',      text: 'text-red-700',      dot: 'bg-red-500',      label: 'Rejected' },
  broken:   { bg: 'bg-red-50',      text: 'text-red-700',      dot: 'bg-red-500',      label: 'Broken'   },
  info:     { bg: 'bg-blue-50',     text: 'text-blue-700',     dot: 'bg-blue-500',     label: 'Info'     },
  deposit:  { bg: 'bg-emerald-50',  text: 'text-emerald-700',  dot: 'bg-emerald-500',  label: 'Deposit'  },
  withdrawal: { bg: 'bg-red-50',    text: 'text-red-700',      dot: 'bg-red-500',      label: 'Withdrawal'},
  transfer: { bg: 'bg-blue-50',     text: 'text-blue-700',     dot: 'bg-blue-500',     label: 'Transfer' },
  matured:  { bg: 'bg-slate-100',   text: 'text-slate-600',    dot: 'bg-slate-400',    label: 'Matured'  },
  open:     { bg: 'bg-blue-50',     text: 'text-blue-700',     dot: 'bg-blue-500',     label: 'Open'     },
  resolved: { bg: 'bg-emerald-50',  text: 'text-emerald-700',  dot: 'bg-emerald-500',  label: 'Resolved' },
};

const sizes = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
};

const StatusBadge = ({ status = 'pending', size = 'md', label }) => {
  const key = (status || '').toLowerCase();
  const config = statusConfig[key] || statusConfig.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full ${config.bg} ${config.text} ${sizes[size]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {label || config.label}
    </span>
  );
};

export default StatusBadge;
