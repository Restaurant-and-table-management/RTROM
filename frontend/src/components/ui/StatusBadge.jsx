function StatusBadge({ status }) {
  const map = {
    Available: 'bg-emerald-100 text-emerald-700',
    Reserved: 'bg-amber-100 text-amber-700',
    Occupied: 'bg-rose-100 text-rose-700',
    Preparing: 'bg-blue-100 text-blue-700',
    Ready: 'bg-emerald-100 text-emerald-700',
    Served: 'bg-slate-100 text-slate-700',
    Pending: 'bg-amber-100 text-amber-700',
    Completed: 'bg-emerald-100 text-emerald-700',
  };

  return (
    <span className={["rounded-full px-2.5 py-1 text-xs font-semibold", map[status] || 'bg-slate-100 text-slate-700'].join(' ')}>
      {status}
    </span>
  );
}

export default StatusBadge;
