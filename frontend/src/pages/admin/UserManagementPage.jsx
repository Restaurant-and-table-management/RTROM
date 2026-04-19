import { useEffect, useState } from 'react';
import DashboardShell from '../../components/layout/DashboardShell';
import ToastMessage from '../../components/ui/ToastMessage';
import { getUsers, updateUserRole, deleteUser } from '../../api/userApi';
import useAuthStore from '../../store/useAuthStore';

const navItems = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/tables', label: 'Tables' },
  { to: '/admin/reservations', label: 'Reservations' },
  { to: '/admin/menu', label: 'Menu' },
  { to: '/admin/users', label: 'Users' },
];

const ROLES = ['ADMIN', 'CUSTOMER', 'KITCHEN_STAFF', 'WAITER'];

const ROLE_DESCRIPTIONS = {
  ADMIN: 'Full access to all systems, settings, and user management.',
  CUSTOMER: 'Regular guest account for making reservations.',
  KITCHEN_STAFF: 'Access to the kitchen monitor and order fulfillment.',
  WAITER: 'Can manage live floor tables, walk-in guests, and place orders.',
};

function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ type: 'error', message: '' });
  const currentUserEmail = useAuthStore((state) => state.email);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to load users.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      setToast({ type: 'success', message: 'User role updated successfully.' });
      await loadUsers();
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to update user role.' });
    }
  };

  const handleUserDelete = async (userId, email) => {
    console.log('UserManagementPage: Delete requested for', email, 'ID:', userId);
    if (window.confirm(`Are you sure you want to delete user ${email}? This action cannot be undone.`)) {
      try {
        await deleteUser(userId);
        console.log('UserManagementPage: Delete successful');
        setToast({ type: 'success', message: 'User deleted successfully.' });
        await loadUsers();
      } catch (error) {
        console.error('UserManagementPage: Delete failed', error);
        const errorMsg = error.response?.data?.error || error.message || 'Failed to delete user.';
        setToast({ type: 'error', message: errorMsg });
      }
    }
  };

  return (
    <DashboardShell
      title="User Management"
      subtitle="Control platform access and delegate operational permissions across the team."
      navItems={navItems}
    >
      <ToastMessage type={toast.type} message={toast.message} onClose={() => setToast({ type: 'error', message: '' })} />

      <section className="rounded-2xl border border-[color:var(--border)] bg-white shadow-[var(--shadow-sm)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[color:var(--border)] bg-[color:var(--surface-alt)]">
                <th className="px-6 py-4 font-semibold text-[color:var(--text-secondary)]">User</th>
                <th className="px-6 py-4 font-semibold text-[color:var(--text-secondary)]">Email</th>
                <th className="px-6 py-4 font-semibold text-[color:var(--text-secondary)]">Current Role</th>
                <th className="px-6 py-4 font-semibold text-[color:var(--text-secondary)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--border)]">
              {loading ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-[color:var(--text-secondary)]">Loading users...</td></tr>
              ) : null}
              {!loading && users.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-[color:var(--text-secondary)]">No users found.</td></tr>
              ) : null}
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-[color:var(--surface-alt)]/50 transition">
                  <td className="px-6 py-4">
                    <p className="font-medium text-[color:var(--text-primary)]">{user.firstName} {user.lastName}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-[color:var(--text-secondary)]">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className="inline-block rounded-full bg-[color:var(--primary)]/10 px-3 py-1 text-xs font-bold text-[color:var(--primary)] uppercase">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <select
                        className="rounded-lg border border-[color:var(--border)] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]"
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      >
                        {ROLES.map((role) => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                      <div className="group relative">
                        <span className="cursor-help text-lg text-[color:var(--text-secondary)]">ⓘ</span>
                        <div className="invisible absolute bottom-full left-1/2 mb-2 w-48 -translate-x-1/2 rounded-lg bg-slate-800 p-2 text-xs text-white opacity-0 transition group-hover:visible group-hover:opacity-100">
                          {ROLE_DESCRIPTIONS[user.role] || 'No description available.'}
                          <div className="absolute top-full left-1/2 -ml-1 border-4 border-transparent border-t-slate-800"></div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleUserDelete(user.id, user.email)}
                        disabled={user.email === currentUserEmail}
                        className={`rounded-lg p-2 transition ${
                          user.email === currentUserEmail
                            ? 'cursor-not-allowed text-gray-300'
                            : 'text-red-500 hover:bg-red-50'
                        }`}
                        title={user.email === currentUserEmail ? "You cannot delete yourself" : "Delete User"}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardShell>
  );
}

export default UserManagementPage;
