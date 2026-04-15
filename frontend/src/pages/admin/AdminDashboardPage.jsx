import DashboardShell from '../../components/layout/DashboardShell';

const navItems = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/tables', label: 'Tables' },
  { to: '/admin/reservations', label: 'Reservations' },
];

function AdminDashboardPage() {
  const cards = [
    { label: 'Active Tables', value: '28' },
    { label: 'Today Reservations', value: '63' },
    { label: 'Avg Turn Time', value: '46m' },
    { label: 'Orders In Queue', value: '19' },
  ];

  return (
    <DashboardShell
      title="Admin Overview"
      subtitle="Monitor performance across floor, reservations, and service quality."
      navItems={navItems}
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.label} className="rounded-xl border border-[color:var(--border)] bg-white p-6 shadow-[var(--shadow-sm)]">
            <p className="text-sm text-[color:var(--text-secondary)]">{card.label}</p>
            <p className="mt-3 text-3xl font-bold text-[color:var(--primary)]">{card.value}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-[color:var(--border)] bg-white p-6 shadow-[var(--shadow-sm)]">
          <h3 className="text-lg font-semibold text-[color:var(--text-primary)]">Floor Efficiency</h3>
          <p className="mt-2 text-sm text-[color:var(--text-secondary)]">Table utilization is up 12% compared to last week.</p>
          <div className="mt-4 h-3 rounded-full bg-slate-100">
            <div className="h-3 w-[72%] rounded-full bg-[color:var(--accent)]" />
          </div>
        </article>

        <article className="rounded-xl border border-[color:var(--border)] bg-white p-6 shadow-[var(--shadow-sm)]">
          <h3 className="text-lg font-semibold text-[color:var(--text-primary)]">Service Health</h3>
          <ul className="mt-4 space-y-3 text-sm text-[color:var(--text-secondary)]">
            <li className="flex items-center justify-between"><span>Order Delay Alerts</span><span className="font-semibold text-[color:var(--error)]">4</span></li>
            <li className="flex items-center justify-between"><span>Guest Satisfaction</span><span className="font-semibold text-[color:var(--success)]">4.7/5</span></li>
            <li className="flex items-center justify-between"><span>Pending Complaints</span><span className="font-semibold">1</span></li>
          </ul>
        </article>
      </section>
    </DashboardShell>
  );
}

export default AdminDashboardPage;
