function SiteFooter() {
  return (
    <footer id="contact" className="border-t border-[color:var(--border)] bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
        <div>
          <h3 className="font-heading text-2xl text-[color:var(--primary)]">RTROM</h3>
          <p className="mt-3 text-sm text-[color:var(--text-secondary)]">
            Elevating restaurant operations with intelligent reservations, service flow, and order execution.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-[color:var(--text-primary)]">Product</h4>
          <ul className="mt-3 space-y-2 text-sm text-[color:var(--text-secondary)]">
            <li>Table Management</li>
            <li>Reservations</li>
            <li>Menu & Ordering</li>
            <li>Payments</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-[color:var(--text-primary)]">Company</h4>
          <ul className="mt-3 space-y-2 text-sm text-[color:var(--text-secondary)]">
            <li>About</li>
            <li>Careers</li>
            <li>Partners</li>
            <li>Support</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-[color:var(--text-primary)]">Contact</h4>
          <ul className="mt-3 space-y-2 text-sm text-[color:var(--text-secondary)]">
            <li>rtrom@rtrom.com</li>
            <li>+1 9987612345</li>
            <li>24 Culvar Street Paddington</li>
            <li>San Francisco, CA</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[color:var(--border)] px-6 py-4 text-center text-sm text-[color:var(--text-muted)]">
        <p>© {new Date().getFullYear()} Eat healthy, Stay Healthy.</p>
      </div>
    </footer>
  );
}

export default SiteFooter;
