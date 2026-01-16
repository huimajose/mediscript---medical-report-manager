
import React, { useState, useEffect } from 'react';
import { Patient, ReportTemplate, User, ReportVersion } from './types';
import { MOCK_PATIENTS, REPORT_TEMPLATES } from './constants';
import PatientTable from './components/PatientTable';
import Editor from './components/Editor';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import { getCurrentUser, logout } from './services/authService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'list' | 'editor' | 'admin'>('list');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [reportContent, setReportContent] = useState<string>('');
  const [signatureName, setSignatureName] = useState<string>('');
  const [signatureImage, setSignatureImage] = useState<string>('');
  const [reportVersions, setReportVersions] = useState<ReportVersion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [templates, setTemplates] = useState<ReportTemplate[]>(REPORT_TEMPLATES);

  useEffect(() => {
    const existingUser = getCurrentUser();
    if (existingUser) {
      setUser(existingUser);
      if (existingUser.role === 'Admin') setView('admin');
      else setView('list');
    }
  }, []);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    if (loggedInUser.role === 'Admin') setView('admin');
    else setView('list');
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setSelectedPatient(null);
    setReportContent('');
    setSignatureName('');
    setSignatureImage('');
    setReportVersions([]);
    setView('list');
  };

  const handleOpenReport = (patient: Patient) => {
    if (!user?.permissions.canWriteReports) return;
    setSelectedPatient(patient);
    const initialContent = `<h1>Medical Report: ${patient.name}</h1><p>Patient ID: ${patient.patientId}</p><p>Date: ${new Date().toLocaleDateString()}</p><hr/><p>Start typing report here...</p>`;
    setReportContent(initialContent);
    setSignatureName(user.name); 
    setSignatureImage('');
    
    // Initial version
    setReportVersions([{
      id: `v-${Date.now()}`,
      timestamp: new Date().toISOString(),
      content: initialContent,
      authorName: user.name
    }]);
    
    setView('editor');
  };

  const handleSaveVersion = () => {
    if (!user) return;
    const newVersion: ReportVersion = {
      id: `v-${Date.now()}`,
      timestamp: new Date().toISOString(),
      content: reportContent,
      authorName: user.name
    };
    setReportVersions(prev => [newVersion, ...prev]);
  };

  const handleRevertVersion = (version: ReportVersion) => {
    if (confirm(`Are you sure you want to revert to the version from ${new Date(version.timestamp).toLocaleString()}? Current unsaved changes will be lost.`)) {
      setReportContent(version.content);
    }
  };

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const filteredPatients = MOCK_PATIENTS.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.patientId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="no-print h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setView(user.role === 'Admin' ? 'admin' : 'list')}>
            <div className="bg-blue-600 p-2 rounded-lg">
               <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">MediScript</h1>
          </div>
          
          <nav className="hidden md:flex items-center space-x-1">
            {user.role === 'Admin' && (
              <button 
                onClick={() => setView('admin')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${view === 'admin' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Admin Panel
              </button>
            )}
            {(user.role === 'Medic' || user.role === 'Admin' || user.role === 'Secretary') && (
              <button 
                onClick={() => setView('list')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${view === 'list' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Patients
              </button>
            )}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex flex-col items-end mr-2 hidden sm:flex">
             <div className="text-sm font-bold text-slate-900">{user.name}</div>
             <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
               user.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 
               user.role === 'Medic' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
             }`}>
                {user.role}
             </div>
          </div>
          <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {view === 'admin' && user.role === 'Admin' ? (
          <div className="flex-1 overflow-y-auto bg-slate-50">
            <AdminDashboard templates={templates} onUpdateTemplates={setTemplates} />
          </div>
        ) : view === 'list' ? (
          <div className="flex-1 p-8 overflow-y-auto">
            <div className="max-w-6xl mx-auto space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">Patient Directory</h2>
                  <p className="text-slate-500 mt-1">Search and manage patient records.</p>
                </div>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search patients..." 
                    className="w-full md:w-80 pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                </div>
              </div>
              <PatientTable 
                patients={filteredPatients} 
                onSelectReport={handleOpenReport} 
                currentUser={user}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-1 overflow-hidden">
             {selectedPatient && user.permissions.canWriteReports && (
               <Editor 
                 content={reportContent} 
                 onContentChange={setReportContent} 
                 patient={selectedPatient}
                 templates={templates.filter(t => user.permissions.canManageTemplates || templates.includes(t))}
                 canManageTemplates={user.permissions.canManageTemplates}
                 signatureName={signatureName}
                 signatureImage={signatureImage}
                 onSignatureChange={(name, img) => {
                   setSignatureName(name);
                   setSignatureImage(img);
                 }}
                 versions={reportVersions}
                 onSaveVersion={handleSaveVersion}
                 onRevertVersion={handleRevertVersion}
               />
             )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
