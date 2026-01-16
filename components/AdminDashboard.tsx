
import React, { useState, useEffect } from 'react';
import { ReportTemplate, User } from '../types';
import { getMockStaff } from '../services/authService';

interface AdminDashboardProps {
  templates: ReportTemplate[];
  onUpdateTemplates: (templates: ReportTemplate[]) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ templates, onUpdateTemplates }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'templates' | 'staff'>('overview');
  const [editingTemplate, setEditingTemplate] = useState<ReportTemplate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [staffList, setStaffList] = useState<User[]>([]);

  useEffect(() => {
    setStaffList(getMockStaff());
  }, []);

  const stats = [
    { label: 'Total Patients', value: '1,248', color: 'bg-blue-500', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { label: 'Reports Generated', value: templates.length.toString(), color: 'bg-emerald-500', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { label: 'Active Medics', value: '18', color: 'bg-purple-500', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { label: 'Pending AI Analysis', value: '7', color: 'bg-amber-500', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  ];

  const handleSaveTemplate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
    const content = formData.get('content') as string;

    if (editingTemplate) {
      onUpdateTemplates(templates.map(t => t.id === editingTemplate.id ? { ...t, title, category, content } : t));
    } else {
      const newTemplate: ReportTemplate = {
        id: `t-${Date.now()}`,
        title,
        category,
        content
      };
      onUpdateTemplates([...templates, newTemplate]);
    }
    setIsModalOpen(false);
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      onUpdateTemplates(templates.filter(t => t.id !== id));
    }
  };

  const toggleStaffPermission = (userId: string, permissionKey: keyof User['permissions']) => {
    setStaffList(prev => prev.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          permissions: {
            ...user.permissions,
            [permissionKey]: !user.permissions[permissionKey]
          }
        };
      }
      return user;
    }));
  };

  const openEdit = (template: ReportTemplate) => {
    setEditingTemplate(template);
    setIsModalOpen(true);
  };

  const openCreate = () => {
    setEditingTemplate(null);
    setIsModalOpen(true);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">System Administration</h2>
          <p className="text-slate-500 mt-1">Manage infrastructure, templates, and staff roles.</p>
        </div>
        <div className="bg-white p-1 rounded-xl border border-slate-200 flex shadow-sm">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'templates' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Templates
          </button>
          <button 
            onClick={() => setActiveTab('staff')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'staff' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Staff
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-white mb-4 shadow-inner`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} />
                  </svg>
                </div>
                <div className="text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</div>
                <div className="text-sm font-medium text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800">Recent Activity</h3>
              </div>
              <div className="divide-y divide-slate-50">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-4 flex items-center space-x-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900">System generated monthly report summary</div>
                      <div className="text-xs text-slate-500">24 minutes ago</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-900">Manage Report Templates</h3>
            <button 
              onClick={openCreate}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold flex items-center shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              New Template
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left text-slate-500">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">Template Name</th>
                  <th className="px-6 py-4 font-semibold">Category</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {templates.map(template => (
                  <tr key={template.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {template.title}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] uppercase font-bold tracking-wider rounded">
                        {template.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => openEdit(template)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <button 
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'staff' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-900">Staff Management</h3>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left text-slate-500">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">Permissions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staffList.map(member => (
                  <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{member.name}</div>
                      <div className="text-xs text-slate-500">{member.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        member.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 
                        member.role === 'Medic' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                         <label className="flex items-center space-x-2 cursor-pointer bg-slate-50 px-2 py-1 rounded border border-slate-200">
                            <input 
                              type="checkbox" 
                              checked={member.permissions.canManageTemplates} 
                              onChange={() => toggleStaffPermission(member.id, 'canManageTemplates')}
                              className="w-3 h-3 text-blue-600 rounded"
                            />
                            <span className="text-[10px] font-semibold text-slate-600">Manage Templates</span>
                         </label>
                         <label className="flex items-center space-x-2 cursor-pointer bg-slate-50 px-2 py-1 rounded border border-slate-200">
                            <input 
                              type="checkbox" 
                              checked={member.permissions.canWriteReports} 
                              onChange={() => toggleStaffPermission(member.id, 'canWriteReports')}
                              className="w-3 h-3 text-blue-600 rounded"
                            />
                            <span className="text-[10px] font-semibold text-slate-600">Write Reports</span>
                         </label>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Template Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">{editingTemplate ? 'Edit Template' : 'Create New Template'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSaveTemplate} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Template Title</label>
                  <input 
                    name="title"
                    defaultValue={editingTemplate?.title || ''}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="e.g., Neurology Assessment"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                  <select 
                    name="category"
                    defaultValue={editingTemplate?.category || 'General'}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  >
                    <option>General</option>
                    <option>Specialty</option>
                    <option>Diagnostics</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">HTML Content</label>
                <textarea 
                  name="content"
                  defaultValue={editingTemplate?.content || ''}
                  required
                  rows={10}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-sm"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl">Cancel</button>
                <button type="submit" className="px-8 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
