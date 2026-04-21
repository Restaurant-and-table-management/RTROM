import React from 'react';
import KitchenTicketCard from './KitchenTicketCard';

/**
 * Column header colors — pixel-matched to reference image.
 * NEW=blue, IN PROGRESS=amber, READY=green, SERVED=green/teal
 */
const COLUMN_COLORS = {
  RECEIVED:    { text: 'text-blue-400',    badge: 'bg-blue-500',    divider: 'border-blue-500/40' },
  IN_PROGRESS: { text: 'text-amber-400',   badge: 'bg-amber-500',   divider: 'border-amber-500/40' },
  READY:       { text: 'text-green-400',   badge: 'bg-green-500',   divider: 'border-green-500/40' },
  SERVED:      { text: 'text-green-400',   badge: 'bg-green-600',   divider: 'border-green-500/40' },
};

/** Empty state text per column */
const EMPTY_TEXT = {
  RECEIVED:    '+ New order will appear here',
  IN_PROGRESS: '+ New order will appear here',
  READY:       '+ New order will appear here',
  SERVED:      '+ Completed orders',
};

function KitchenColumn({ status, label, tickets, onStart, onReady, onServed }) {
  const colors = COLUMN_COLORS[status] ?? COLUMN_COLORS.RECEIVED;

  return (
    <div id={`column-${status}`} className="flex flex-col h-full">
      {/* ── Column header ──────────────────────────────── */}
      <div className={`flex items-center justify-between mb-3 pb-2 border-b ${colors.divider}`}>
        <h2 className={`text-xs font-extrabold tracking-[0.14em] uppercase ${colors.text}`}>
          {label}
        </h2>
        <span className={`text-[11px] font-bold ${colors.badge} text-white w-6 h-6 rounded-full flex items-center justify-center`}>
          {tickets.length}
        </span>
      </div>

      {/* ── Scrollable ticket list ─────────────────────── */}
      <div
        className="flex-1 space-y-2.5 overflow-y-auto"
        style={{
          maxHeight: 'calc(100vh - 126px)',
          scrollbarWidth: 'thin',
          scrollbarColor: '#1e293b transparent',
        }}
      >
        {tickets.length === 0 ? (
          <p className="text-center text-[11px] text-slate-600 mt-6 select-none">
            {EMPTY_TEXT[status]}
          </p>
        ) : (
          tickets.map((ticket) => (
            <KitchenTicketCard
              key={ticket.ticketId}
              ticket={ticket}
              onStart={onStart}
              onReady={onReady}
              onServed={onServed}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default KitchenColumn;
