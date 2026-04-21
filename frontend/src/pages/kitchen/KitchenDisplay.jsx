import React, { useEffect, useState, useCallback } from 'react';
import kitchenApi from '../../api/kitchenApi';
import useKitchenSocket from '../../hooks/useKitchenSocket';
import toast from 'react-hot-toast';

// ─── Status column configuration ─────────────────────────────────────────────
const COLUMNS = [
  {
    status: 'RECEIVED',
    label: 'NEW',
    borderColor: 'border-blue-500',
    bgColor: 'bg-blue-950',
    badgeColor: 'bg-blue-500',
    textColor: 'text-blue-300',
  },
  {
    status: 'IN_PROGRESS',
    label: 'IN PROGRESS',
    borderColor: 'border-amber-500',
    bgColor: 'bg-amber-950',
    badgeColor: 'bg-amber-500',
    textColor: 'text-amber-300',
  },
  {
    status: 'READY',
    label: 'READY',
    borderColor: 'border-green-500',
    bgColor: 'bg-green-950',
    badgeColor: 'bg-green-500',
    textColor: 'text-green-300',
  },
  {
    status: 'SERVED',
    label: 'SERVED',
    borderColor: 'border-teal-500',
    bgColor: 'bg-teal-950',
    badgeColor: 'bg-teal-500',
    textColor: 'text-teal-300',
  },
];

// ─── Time elapsed display ─────────────────────────────────────────────────────
const TimeElapsed = ({ createdAt }) => {
  const [elapsed, setElapsed] = useState('');

  useEffect(() => {
    const compute = () => {
      const created = new Date(createdAt);
      const now = new Date();
      const diffMs = now - created;
      const diffMins = Math.floor(diffMs / 60000);
      const diffSecs = Math.floor((diffMs % 60000) / 1000);
      setElapsed(`${diffMins}m ${diffSecs}s`);
    };
    compute();
    const interval = setInterval(compute, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  const isLate = (() => {
    const created = new Date(createdAt);
    return (new Date() - created) > 15 * 60 * 1000;
  })();

  return (
    <span className={`text-xs font-mono ${isLate ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
      {elapsed}
    </span>
  );
};

// ─── Single Ticket Card ───────────────────────────────────────────────────────
const TicketCard = ({ ticket, column, onStart, onReady, onServed }) => {
  return (
    <div className={`rounded-xl border-l-4 ${column.borderColor} bg-slate-800 p-4 shadow-lg mb-3 transition-all duration-300`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-white">Table {ticket.tableNumber}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${column.badgeColor} text-white font-semibold`}>
            {column.label}
          </span>
        </div>
        <TimeElapsed createdAt={ticket.createdAt} />
      </div>

      {ticket.assignedTo && (
        <p className="text-xs text-slate-400 mb-2">Assigned: <span className="text-slate-200">{ticket.assignedTo}</span></p>
      )}

      <div className="space-y-1 mb-3">
        {ticket.items && ticket.items.map((item, idx) => (
          <div key={idx} className="flex items-start gap-2 text-sm">
            <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${item.isVegetarian ? 'bg-green-400' : 'bg-red-400'}`} />
            <div>
              <span className="text-white font-medium">x{item.quantity} {item.itemName}</span>
              {item.customizationNotes && (
                <p className="text-xs text-slate-400 italic">{item.customizationNotes}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {ticket.specialInstructions && (
        <p className="text-xs text-amber-300 bg-amber-900/30 rounded p-2 mb-3">
          📝 {ticket.specialInstructions}
        </p>
      )}

      <div className="flex gap-2">
        {ticket.kitchenStatus === 'RECEIVED' && (
          <button
            onClick={() => onStart(ticket.ticketId)}
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
          >
            Start Cooking
          </button>
        )}
        {ticket.kitchenStatus === 'IN_PROGRESS' && (
          <button
            onClick={() => onReady(ticket.ticketId)}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
          >
            Mark Ready
          </button>
        )}
        {ticket.kitchenStatus === 'READY' && (
          <button
            onClick={() => onServed(ticket.ticketId)}
            className="flex-1 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
          >
            Mark Served
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Main Kitchen Display Component ──────────────────────────────────────────
const KitchenDisplay = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch all tickets on mount
  const fetchTickets = useCallback(async () => {
    try {
      const response = await kitchenApi.getAllTickets();
      setTickets(response.data);
    } catch (err) {
      toast.error('Failed to load kitchen tickets');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // WebSocket handler — upsert ticket in local state
  const handleTicketUpdate = useCallback((updatedTicket) => {
    setTickets(prev => {
      const exists = prev.find(t => t.ticketId === updatedTicket.ticketId);
      if (exists) {
        return prev.map(t => t.ticketId === updatedTicket.ticketId ? updatedTicket : t);
      } else {
        return [updatedTicket, ...prev];
      }
    });
    toast.success(`Table ${updatedTicket.tableNumber} — ${updatedTicket.kitchenStatus}`, {
      duration: 2000,
      icon: '🍴',
    });
  }, []);

  useKitchenSocket(handleTicketUpdate, true);

  const handleStart = async (ticketId) => {
    try {
      await kitchenApi.startCooking(ticketId);
    } catch (err) {
      toast.error('Failed to start cooking');
    }
  };

  const handleReady = async (ticketId) => {
    try {
      await kitchenApi.markReady(ticketId);
    } catch (err) {
      toast.error('Failed to mark ready');
    }
  };

  const handleServed = async (ticketId) => {
    try {
      await kitchenApi.markServed(ticketId);
    } catch (err) {
      toast.error('Failed to mark served');
    }
  };

  const getTicketsByStatus = (status) =>
    tickets.filter(t => t.kitchenStatus === status);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading Kitchen Display...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🍽️</span>
          <h1 className="text-xl font-bold tracking-widest uppercase text-white">
            Kitchen Display
          </h1>
        </div>
        <div className="text-slate-300 font-mono text-lg">
          {currentTime.toLocaleTimeString()}
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-4 gap-4 p-6 h-full">
        {COLUMNS.map(column => {
          const columnTickets = getTicketsByStatus(column.status);
          return (
            <div key={column.status} className="flex flex-col">
              {/* Column Header */}
              <div className={`flex items-center justify-between mb-4 pb-3 border-b ${column.borderColor} border-opacity-50`}>
                <h2 className={`font-bold text-sm tracking-widest uppercase ${column.textColor}`}>
                  {column.label}
                </h2>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${column.badgeColor} text-white`}>
                  {columnTickets.length}
                </span>
              </div>

              {/* Tickets */}
              <div className="flex-1 overflow-y-auto space-y-0 max-h-[calc(100vh-160px)]">
                {columnTickets.length === 0 ? (
                  <div className="text-center text-slate-600 text-sm py-8">
                    No orders
                  </div>
                ) : (
                  columnTickets.map(ticket => (
                    <TicketCard
                      key={ticket.ticketId}
                      ticket={ticket}
                      column={column}
                      onStart={handleStart}
                      onReady={handleReady}
                      onServed={handleServed}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KitchenDisplay;
