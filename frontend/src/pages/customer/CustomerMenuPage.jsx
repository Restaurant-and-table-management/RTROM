import DashboardShell from '../../components/layout/DashboardShell';

const navItems = [
  { to: '/customer', label: 'Dashboard', end: true },
  { to: '/customer/menu', label: 'Menu' },
  { to: '/customer/reservations', label: 'Reservations' },
];

function CustomerMenuPage() {
  const items = [
    { name: 'Truffle Mushroom Risotto', price: '$24', tag: 'Chef Special' },
    { name: 'Charred Salmon Bowl', price: '$21', tag: 'Popular' },
    { name: 'Smoked Burrata Salad', price: '$16', tag: 'Fresh' },
    { name: 'Dark Chocolate Torte', price: '$12', tag: 'Dessert' },
  ];

  return (
    <DashboardShell title="Digital Menu" subtitle="Browse and pre-select dishes before your reservation." navItems={navItems}>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <article key={item.name} className="rounded-xl border border-[color:var(--border)] bg-white p-6 shadow-[var(--shadow-sm)]">
            <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--accent)]">{item.tag}</p>
            <h3 className="mt-2 text-lg font-semibold text-[color:var(--text-primary)]">{item.name}</h3>
            <p className="mt-4 text-xl font-bold text-[color:var(--primary)]">{item.price}</p>
          </article>
        ))}
      </section>
    </DashboardShell>
  );
}

export default CustomerMenuPage;
