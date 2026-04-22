import React from 'react';
import TimeElapsed from './TimeElapsed';

/**
 * Individual kitchen ticket card — pixel-matched to reference UI.
 *
 * Layout per reference image:
 *  Row 1:  "Table # X"  ............ ⏱ N min
 *  Items:  • Item name          x N (right-aligned, green)
 *          ↳ customization note (indented, small grey)
 *  Notes:  Notes: <text>  (blue label + text)
 *  Button: [▶ Start Cooking] / [✓ Mark Ready] / [Ready to Serve]
 *          OR served state: green "Served at HH:MM AM ✓"
 */
function KitchenTicketCard({ ticket, onStart, onReady, onServed }) {
  const { kitchenStatus, ticketId, tableNumber, items, specialInstructions, notes, createdAt, completedAt } = ticket;

  // ── Border colors per status
  const borderMap = {
    RECEIVED:    'border-blue-500/70',
    IN_PROGRESS: 'border-amber-500/70',
    READY:       'border-green-500/70',
    SERVED:      'border-green-500/50',
  };
  const border = borderMap[kitchenStatus] ?? borderMap.RECEIVED;

  // ── Format completedAt for SERVED cards
  const servedTime = completedAt
    ? new Date(completedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    : null;

  // ── Merged notes/instructions string
  const notesText = specialInstructions || notes || null;

  return (
    <div
      id={`ticket-card-${ticketId}`}
      className={`rounded-lg border ${border} bg-[#0d1526] p-3 space-y-2`}
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.4)' }}
    >
      {/* ── Header: Table number + timer ────────────────────── */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[15px] font-bold text-white leading-none">
          Table # {tableNumber}
        </span>
        <TimeElapsed createdAt={createdAt} />
      </div>

      {/* ── Item list ───────────────────────────────────────── */}
      {items && items.length > 0 && (
        <div className="space-y-1">
          {items.map((item) => (
            <div key={item.orderItemId}>
              {/* Main item row */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-slate-300 text-sm flex-shrink-0">•</span>
                  <span className="text-slate-200 text-sm truncate">{item.itemName}</span>
                </div>
                <span className="text-green-400 text-xs font-semibold flex-shrink-0">x {item.quantity}</span>
              </div>
              {/* Customization note (indented) */}
              {item.customizationNotes && (
                <p className="text-xs text-slate-500 pl-4 leading-tight">
                  ↳ {item.customizationNotes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Notes ───────────────────────────────────────────── */}
      {notesText && (
        <p className="text-xs leading-snug">
          <span className="text-blue-400 font-semibold">Notes: </span>
          <span className="text-slate-300">{notesText}</span>
        </p>
      )}

      {/* ── Action button / Served state ────────────────────── */}
      {kitchenStatus === 'RECEIVED' && (
        <div className="flex justify-end pt-1">
          <button
            id={`btn-start-${ticketId}`}
            onClick={() => onStart(ticketId)}
            className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-600 active:bg-blue-800 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-3 h-3" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
            Start Cooking
          </button>
        </div>
      )}

      {kitchenStatus === 'IN_PROGRESS' && (
        <div className="flex justify-end pt-1">
          <button
            id={`btn-ready-${ticketId}`}
            onClick={() => onReady(ticketId)}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black text-xs font-bold px-3 py-1.5 rounded-md transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Mark Ready
          </button>
        </div>
      )}

      {kitchenStatus === 'READY' && (
        <button
          id={`btn-served-${ticketId}`}
          onClick={() => onServed(ticketId)}
          className="w-full bg-green-600 hover:bg-green-500 active:bg-green-700 text-white text-xs font-bold py-2 rounded-md transition-colors mt-1"
        >
          Ready to Serve
        </button>
      )}

      {kitchenStatus === 'SERVED' && servedTime && (
        <div className="flex items-center gap-1.5 pt-1">
          <span className="text-green-400 text-xs font-semibold">Served at {servedTime}</span>
          <span className="w-4 h-4 rounded-full border border-green-500 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 text-green-400" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </span>
        </div>
      )}
    </div>
  );
}

export default KitchenTicketCard;
