import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { parseDate } from '../utils/date';
import { Company, Contact, Assignment, User } from '../types';
import { ClipboardList, Plus, Building, User as UserIcon, Shield, Check, AlertCircle } from 'lucide-react';

export const Assignments: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [targetType, setTargetType] = useState<'company' | 'contact'>('company');
  const [assignedUserId, setAssignedUserId] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [selectedContactId, setSelectedContactId] = useState('');
  const [role, setRole] = useState('');

  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [assignRes, userRes, compRes, contRes] = await Promise.all([
        api.get('/assignments'),
        api.get('/users'),
        api.get('/companies'),
        api.get('/contacts'),
      ]);
      setAssignments(assignRes.data);
      setUsers(userRes.data);
      setCompanies(compRes.data);
      setContacts(contRes.data);

      // Default select values
      if (userRes.data.length > 0) {
        setAssignedUserId(userRes.data[0].id.toString());
      }
      if (compRes.data.length > 0) {
        setSelectedCompanyId(compRes.data[0].id.toString());
      }
      if (contRes.data.length > 0) {
        setSelectedContactId(contRes.data[0].id.toString());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!assignedUserId) {
      setFormError('Please select a user.');
      return;
    }
    if (targetType === 'company' && !selectedCompanyId) {
      setFormError('Please select a company.');
      return;
    }
    if (targetType === 'contact' && !selectedContactId) {
      setFormError('Please select a contact.');
      return;
    }
    if (!role.trim()) {
      setFormError('Please specify a role.');
      return;
    }

    setSubmitLoading(true);

    const payload = {
      user_id: parseInt(assignedUserId, 10),
      company_id: targetType === 'company' ? parseInt(selectedCompanyId, 10) : null,
      contact_id: targetType === 'contact' ? parseInt(selectedContactId, 10) : null,
      role: role.trim(),
    };

    try {
      await api.post('/assignments', payload);
      setFormSuccess('Assignment created successfully! Real-time notifications dispatched.');
      setRole('');
      // Refetch assignments list
      const assignRes = await api.get('/assignments');
      setAssignments(assignRes.data);
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Failed to create assignment.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Helper resolvers
  const getUserName = (id: number) => {
    const u = users.find((item) => item.id === id);
    return u ? u.name : `User #${id}`;
  };

  const getTargetName = (assign: Assignment) => {
    if (assign.company_id) {
      const c = companies.find((item) => item.id === assign.company_id);
      return c ? `Company: ${c.name}` : `Company #${assign.company_id}`;
    }
    if (assign.contact_id) {
      const k = contacts.find((item) => item.id === assign.contact_id);
      return k ? `Contact: ${k.name}` : `Contact #${assign.contact_id}`;
    }
    return 'None';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-400"></div>
      </div>
    );
  }

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Assignments</h1>
        <p className="text-slate-400 text-xs">Assign contacts or companies to employee users</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Admin form */}
        <div className="lg:col-span-1">
          {isAdmin ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-sky-400" />
                New Assignment
              </h3>

              {formError && (
                <div className="p-3 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs rounded-xl">
                  {formError}
                </div>
              )}

              {formSuccess && (
                <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  {formSuccess}
                </div>
              )}

              <form onSubmit={handleAssignSubmit} className="space-y-4">
                {/* Target Type Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Assignment Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTargetType('company')}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        targetType === 'company'
                          ? 'bg-sky-500 text-white border-sky-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      Company Account
                    </button>
                    <button
                      type="button"
                      onClick={() => setTargetType('contact')}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        targetType === 'contact'
                          ? 'bg-sky-500 text-white border-sky-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      Contact Person
                    </button>
                  </div>
                </div>

                {/* Target Selection Dropdown */}
                {targetType === 'company' ? (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Select Company</label>
                    <select
                      required
                      value={selectedCompanyId}
                      onChange={(e) => setSelectedCompanyId(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all text-sm text-slate-100 font-medium"
                    >
                      {companies.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    {companies.length === 0 && (
                      <p className="text-[10px] text-amber-500 mt-1">Please create a company first.</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Select Contact</label>
                    <select
                      required
                      value={selectedContactId}
                      onChange={(e) => setSelectedContactId(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all text-sm text-slate-100 font-medium"
                    >
                      {contacts.map((c) => (
                        <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                      ))}
                    </select>
                    {contacts.length === 0 && (
                      <p className="text-[10px] text-amber-500 mt-1">Please create a contact first.</p>
                    )}
                  </div>
                )}

                {/* Assign to User Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Assign To Employee</label>
                  <select
                    required
                    value={assignedUserId}
                    onChange={(e) => setAssignedUserId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all text-sm text-slate-100 font-medium"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Role text input */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Assigned Role</label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Account Executive"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all text-sm text-slate-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitLoading}
                  className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50 mt-6 shadow-lg shadow-sky-500/20"
                >
                  {submitLoading ? 'Creating Assignment...' : 'Assign Account'}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-850 rounded-3xl p-6 shadow-xl flex gap-3 items-start text-amber-500">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div>
                <h4 className="font-bold text-sm text-slate-200">Role Restriction</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Only users with the Administrator role can create new assignments.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Existing Assignments */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-white mb-6 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-sky-400" />
              Existing Assignments
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-medium">
                    <th className="py-3 px-4">Assigned User</th>
                    <th className="py-3 px-4">Account Target</th>
                    <th className="py-3 px-4">Role Role</th>
                    <th className="py-3 px-4">Assigned By</th>
                    <th className="py-3 px-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {assignments.map((assign) => (
                    <tr key={assign.id} className="text-slate-300 hover:bg-slate-850 transition-all">
                      <td className="py-4 px-4 font-semibold text-slate-200">
                        {getUserName(assign.user_id)}
                      </td>
                      <td className="py-4 px-4 text-xs font-medium">
                        {assign.company_id ? (
                          <span className="flex items-center gap-1 text-sky-400 bg-sky-500/5 px-2 py-1 rounded-lg border border-sky-500/10 w-fit font-bold">
                            <Building className="w-3 h-3 shrink-0" />
                            {getTargetName(assign)}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/5 px-2 py-1 rounded-lg border border-emerald-500/10 w-fit font-bold">
                            <UserIcon className="w-3. h-3. shrink-0" />
                            {getTargetName(assign)}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-slate-300 text-xs">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-850 border border-slate-700 font-semibold">
                          {assign.role}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-400">
                        {assign.assigned_by ? getUserName(assign.assigned_by) : 'System'}
                      </td>
                      <td className="py-4 px-4 text-right text-xs text-slate-500">
                        {parseDate(assign.assigned_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {assignments.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500">
                        No assignments have been registered yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
