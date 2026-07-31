import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Company } from '../types';
import { Plus, Edit2, Trash2, X, Globe, Phone, MapPin } from 'lucide-react';

export const Companies: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);

  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  const [formError, setFormError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchCompanies = async () => {
    try {
      const res = await api.get('/companies');
      setCompanies(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setName('');
    setIndustry('');
    setAddress('');
    setPhone('');
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (company: Company) => {
    setIsEditing(true);
    setCurrentId(company.id);
    setName(company.name);
    setIndustry(company.industry || '');
    setAddress(company.address || '');
    setPhone(company.phone || '');
    setFormError('');
    setShowModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitLoading(true);

    const payload = { name, industry, address, phone };

    try {
      if (isEditing && currentId) {
        await api.put(`/companies/${currentId}`, payload);
      } else {
        await api.post('/companies', payload);
      }
      setShowModal(false);
      fetchCompanies();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Validation error. Please verify input.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this company? All related contacts and assignments will be deleted.')) {
      try {
        await api.delete(`/companies/${id}`);
        fetchCompanies();
      } catch (err: any) {
        alert(err.response?.data?.detail || 'Failed to delete company.');
      }
    }
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
          <h1 className="text-2xl font-extrabold text-white">Companies</h1>
          <p className="text-slate-400 text-xs">Manage CRM account companies</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-sky-500/10"
        >
          <Plus className="w-4 h-4" />
          Add Company
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="py-4 px-6">Company Name</th>
                <th className="py-4 px-6">Industry</th>
                <th className="py-4 px-6">Phone</th>
                <th className="py-4 px-6">Address</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {companies.map((company) => (
                <tr key={company.id} className="text-slate-300 hover:bg-slate-800/20 transition-all">
                  <td className="py-4 px-6 font-semibold text-slate-100">{company.name}</td>
                  <td className="py-4 px-6">
                    {company.industry ? (
                      <span className="flex items-center gap-1.5 text-xs text-sky-400 bg-sky-500/5 px-2 py-1 rounded-lg border border-sky-500/10 w-fit">
                        <Globe className="w-3 h-3" />
                        {company.industry}
                      </span>
                    ) : (
                      <span className="text-slate-500 text-xs">N/A</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-slate-400">
                    {company.phone ? (
                      <span className="flex items-center gap-1.5 text-xs">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        {company.phone}
                      </span>
                    ) : 'N/A'}
                  </td>
                  <td className="py-4 px-6 text-slate-400 max-w-xs truncate text-xs">
                    {company.address ? (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        {company.address}
                      </span>
                    ) : 'N/A'}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2.5">
                      <button
                        onClick={() => openEditModal(company)}
                        className="p-2 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-sky-400 border border-slate-800 transition-all"
                        title="Edit company"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(company.id)}
                        className="p-2 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 transition-all"
                        title="Delete company"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {companies.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No companies created yet. Click "Add Company" to add one.
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
                {isEditing ? 'Edit Company Details' : 'Add New Company'}
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
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Company Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. TechCorp"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all text-sm text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Industry</label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. Technology"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all text-sm text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 555-0199"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all text-sm text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 100 Main St, NY"
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
                  {submitLoading ? 'Saving...' : 'Save Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
