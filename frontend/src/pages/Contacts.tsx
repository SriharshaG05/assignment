import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Contact, Company } from '../types';
import { Plus, Edit2, Trash2, X, User as UserIcon, Mail, Phone, Building } from 'lucide-react';

export const Contacts: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);

  const [companyId, setCompanyId] = useState<string>('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('');

  const [formError, setFormError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [contactRes, companyRes] = await Promise.all([
        api.get('/contacts'),
        api.get('/companies'),
      ]);
      setContacts(contactRes.data);
      setCompanies(companyRes.data);
      if (companyRes.data.length > 0) {
        setCompanyId(companyRes.data[0].id.toString());
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

  const openAddModal = () => {
    setIsEditing(false);
    setName('');
    setEmail('');
    setPhone('');
    setDesignation('');
    setFormError('');
    if (companies.length > 0) {
      setCompanyId(companies[0].id.toString());
    } else {
      setCompanyId('');
    }
    setShowModal(true);
  };

  const openEditModal = (contact: Contact) => {
    setIsEditing(true);
    setCurrentId(contact.id);
    setName(contact.name);
    setEmail(contact.email);
    setPhone(contact.phone || '');
    setDesignation(contact.designation || '');
    setCompanyId(contact.company_id.toString());
    setFormError('');
    setShowModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!companyId) {
      setFormError('Please select a company first. If none exist, create one.');
      return;
    }

    setSubmitLoading(true);

    const payload = {
      company_id: parseInt(companyId, 10),
      name,
      email,
      phone,
      designation,
    };

    try {
      if (isEditing && currentId) {
        await api.put(`/contacts/${currentId}`, payload);
      } else {
        await api.post('/contacts', payload);
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Validation error. Please verify input.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this contact? Related assignments will be deleted.')) {
      try {
        await api.delete(`/contacts/${id}`);
        fetchData();
      } catch (err: any) {
        alert(err.response?.data?.detail || 'Failed to delete contact.');
      }
    }
  };

  const getCompanyName = (compId: number) => {
    const c = companies.find((comp) => comp.id === compId);
    return c ? c.name : 'Unknown';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Contacts</h1>
          <p className="text-slate-400 text-xs">Manage CRM contact list</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-sky-500/10"
        >
          <Plus className="w-4 h-4" />
          Add Contact
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="py-4 px-6">Name / Designation</th>
                <th className="py-4 px-6">Company</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">Phone</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {contacts.map((contact) => (
                <tr key={contact.id} className="text-slate-300 hover:bg-slate-800/20 transition-all">
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-semibold text-slate-100 flex items-center gap-1.5 text-sm">
                        <UserIcon className="w-4 h-4 text-sky-400" />
                        {contact.name}
                      </p>
                      <p className="text-xs text-slate-500 pl-5">{contact.designation || 'No Designation'}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700 w-fit">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      {getCompanyName(contact.company_id)}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-400 text-xs">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      {contact.email}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-400 text-xs">
                    {contact.phone ? (
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        {contact.phone}
                      </span>
                    ) : 'N/A'}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2.5">
                      <button
                        onClick={() => openEditModal(contact)}
                        className="p-2 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-sky-400 border border-slate-800 transition-all"
                        title="Edit contact"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(contact.id)}
                        className="p-2 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 transition-all"
                        title="Delete contact"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {contacts.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No contacts created yet. Click "Add Contact" to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl z-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">
                {isEditing ? 'Edit Contact Details' : 'Add New Contact'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs rounded-xl mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Select Company</label>
                <select
                  required
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all text-sm text-slate-100"
                >
                  <option value="" disabled>-- Choose Company --</option>
                  {companies.map((comp) => (
                    <option key={comp.id} value={comp.id}>{comp.name}</option>
                  ))}
                </select>
                {companies.length === 0 && (
                  <p className="text-[10px] text-amber-500 mt-1">No companies found. Create a company first.</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all text-sm text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. john@company.com"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all text-sm text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 555-0144"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all text-sm text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Designation</label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Tech Lead"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all text-sm text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50 shadow-lg shadow-sky-500/10"
                >
                  {submitLoading ? 'Saving...' : 'Save Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
