import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { parseDate } from '../utils/date';
import { Company, Contact, Assignment } from '../types';
import { useNotifications } from '../contexts/NotificationContext';
import { Building2, Users, ClipboardList, Bell, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { unreadCount } = useNotifications();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [compRes, contRes, assignRes] = await Promise.all([
          api.get('/companies'),
          api.get('/contacts'),
          api.get('/assignments'),
        ]);
        setCompanies(compRes.data);
        setContacts(contRes.data);
        setAssignments(assignRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { name: 'Total Companies', value: companies.length, icon: Building2, color: 'text-sky-400 bg-sky-500/10 border-sky-500/20', path: '/companies' },
    { name: 'Total Contacts', value: contacts.length, icon: Users, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', path: '/contacts' },
    { name: 'Total Assignments', value: assignments.length, icon: ClipboardList, color: 'text-violet-400 bg-violet-500/10 border-violet-500/20', path: '/assignments' },
    { name: 'Unread Alerts', value: unreadCount, icon: Bell, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20', path: '/notifications' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-950/20 via-slate-900 to-slate-900 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Live CRM Hub</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Monitor real-time contact assignments, view instant notification pushes, and coordinate account workflows.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.name}
              to={stat.path}
              className="block bg-slate-900 border border-slate-800/80 rounded-2xl p-6 hover:border-slate-700 hover:bg-slate-900/60 transition-all group hover:shadow-xl hover:shadow-sky-500/[0.02]"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-slate-400 group-hover:text-slate-300">{stat.name}</span>
                <div className={`p-2.5 rounded-xl border ${stat.color} shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-100">{stat.value}</p>
            </Link>
          );
        })}
      </div>

      {/* Recent Assignments section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
          <Shield className="w-5 h-5 text-sky-400" />
          Recent Database Workflows
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="py-3 px-4">Assignment ID</th>
                <th className="py-3 px-4">Target Type</th>
                <th className="py-3 px-4">Role Assigned</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {assignments.slice(0, 5).map((assign) => (
                <tr key={assign.id} className="text-slate-300 hover:bg-slate-850 transition-all">
                  <td className="py-4 px-4 font-mono text-xs text-sky-400">#ASN-00{assign.id}</td>
                  <td className="py-4 px-4 font-semibold text-slate-200">
                    {assign.company_id ? 'Company Account' : 'Contact Person'}
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {assign.role}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-xs text-slate-500">
                    {parseDate(assign.assigned_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {assignments.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500">
                    No assignments created yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
