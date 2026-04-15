import useAuthStore from '../../store/useAuthStore';
import StatusBadge from '../../components/ui/StatusBadge';

function WaiterPage() {
  const logout = useAuthStore((state) => state.logout);

  const tables = [
    { table: 'T1', guests: 2, status: 'Occupied' },
    { table: 'T2', guests: 4, status: 'Reserved' },
    { table: 'T3', guests: 3, status: 'Available' },
    { table: 'T4', guests: 2, status: 'Occupied' },
  ];

  const orders = [
    { table: 'T1', order: 'Pasta + Lemonade', status: 'Preparing' },
    { table: 'T4', order: 'Seafood Platter', status: 'Ready' },
    { table: 'T2', order: 'Wine Pairing', status: 'Pending' },
  ];

  return (
    <main className="min-h-screen bg-[color:var(--surface-alt)] p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[color:var(--border)] bg-white p-6 shadow-[var(--shadow-sm)]">
          <div>
            <h1 className="font-heading text-3xl text-[color:var(--primary)]">Waiter Screen</h1>
            <p className="text-sm text-[color:var(--text-secondary)]">Live table service and order status overview.</p>
          </div>
          <button onClick={logout} type="button" className="btn-accent">Logout</button>
        </header>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-xl border border-[color:var(--border)] bg-white p-6 shadow-[var(--shadow-sm)]">
            <h2 className="text-lg font-semibold text-[color:var(--text-primary)]">Table View</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {tables.map((item) => (
                <div key={item.table} className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-alt)] p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-[color:var(--text-primary)]">{item.table}</p>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="mt-2 text-sm text-[color:var(--text-secondary)]">Guests: {item.guests}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-xl border border-[color:var(--border)] bg-white p-6 shadow-[var(--shadow-sm)]">
            <h2 className="text-lg font-semibold text-[color:var(--text-primary)]">Order Status</h2>
            <ul className="mt-4 space-y-3">
              {orders.map((item) => (
                <li key={`${item.table}-${item.order}`} className="flex items-center justify-between rounded-lg border border-[color:var(--border)] p-4">
                  <div>
                    <p className="font-semibold text-[color:var(--text-primary)]">{item.table}</p>
                    <p className="text-sm text-[color:var(--text-secondary)]">{item.order}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </li>
              ))}
            </ul>
          </article>
        </section>
      </div>
    </main>
  );
}

export default WaiterPage;
