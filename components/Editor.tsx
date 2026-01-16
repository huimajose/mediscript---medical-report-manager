
import React, { useRef, useState } from 'react';
import { formalizeReport } from '../services/geminiService';
import { Patient, ReportTemplate } from '../types';

interface EditorProps {
  content: string;
  onContentChange: (newContent: string) => void;
  patient: Patient;
  templates: ReportTemplate[];
  canManageTemplates: boolean;
  signatureName: string;
  signatureImage: string;
  onSignatureChange: (name: string, image: string) => void;
}

type ExamTab = 'vitals' | 'assessment' | 'notes';

const Editor: React.FC<EditorProps> = ({ 
  content, 
  onContentChange, 
  patient, 
  templates, 
  canManageTemplates,
  signatureName,
  signatureImage,
  onSignatureChange
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDemographicsCollapsed, setIsDemographicsCollapsed] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);
  const [activeExamTab, setActiveExamTab] = useState<ExamTab>('vitals');
  const [vitals, setVitals] = useState({ 
    bp: '', 
    hr: '', 
    temp: '', 
    spo2: '', 
    weight: '', 
    height: '', 
    notes: '', 
    diagnosis: '' 
  });

  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onContentChange(editorRef.current.innerHTML);
    }
  };

  const handleApplyTemplate = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value;
    if (!templateId) return;

    const template = templates.find(t => t.id === templateId);
    if (template) {
      const processedContent = template.content
        .replace(/\[PATIENT_NAME\]/g, patient.name)
        .replace(/\[DATE\]/g, new Date().toLocaleDateString());
      onContentChange(processedContent);
    }
    e.target.value = "";
  };

  const handleInsertExam = (e: React.FormEvent) => {
    e.preventDefault();
    const examHtml = `
      <div class="exam-entry bg-slate-50 p-4 border border-slate-200 rounded-lg my-4">
        <h4 class="font-bold text-slate-800 mb-2">Examination Entry - ${new Date().toLocaleDateString()}</h4>
        <div class="grid grid-cols-2 gap-2 text-sm mb-3">
          <div><strong>BP:</strong> ${vitals.bp || '--'} mmHg</div>
          <div><strong>HR:</strong> ${vitals.hr || '--'} bpm</div>
          <div><strong>Temp:</strong> ${vitals.temp || '--'} °F</div>
          <div><strong>SpO2:</strong> ${vitals.spo2 || '--'} %</div>
          <div><strong>Weight:</strong> ${vitals.weight || '--'} kg</div>
          <div><strong>Height:</strong> ${vitals.height || '--'} cm</div>
        </div>
        ${vitals.diagnosis ? `<div class="text-sm mb-2"><strong>Primary Diagnosis:</strong> ${vitals.diagnosis}</div>` : ''}
        ${vitals.notes ? `<div class="text-sm border-t border-slate-200 pt-2 mt-2 italic text-slate-600"><strong>Notes:</strong> ${vitals.notes}</div>` : ''}
      </div>
      <p><br/></p>
    `;
    
    if (editorRef.current) {
      const currentContent = editorRef.current.innerHTML;
      onContentChange(currentContent + examHtml);
    }
    setShowExamModal(false);
    setVitals({ bp: '', hr: '', temp: '', spo2: '', weight: '', height: '', notes: '', diagnosis: '' });
    setActiveExamTab('vitals');
  };

  const handleAIImprove = async () => {
    if (!editorRef.current) return;
    setIsProcessing(true);
    try {
      const currentContent = editorRef.current.innerText;
      const improved = await formalizeReport(currentContent);
      onContentChange(improved);
    } catch (error) {
      console.error("AI Improvement failed", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onSignatureChange(signatureName, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden w-full">
      {/* Expanded Patient Demographics */}
      <div className="no-print bg-white border-b border-slate-200 shrink-0">
        <button 
          onClick={() => setIsDemographicsCollapsed(!isDemographicsCollapsed)}
          className="w-full px-6 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors group"
        >
          <div className="flex items-center space-x-3 text-slate-700">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
              {patient.name.split(' ').map(n => n[0]).join('')}
            </div>
            <span className="text-sm font-semibold">Patient Demographics & History</span>
            {isDemographicsCollapsed && (
              <span className="text-xs text-slate-400 font-normal">
                {patient.name} • {patient.patientId} • Blood: {patient.demographics.bloodType}
              </span>
            )}
          </div>
          <svg className={`w-4 h-4 text-slate-400 transition-transform ${isDemographicsCollapsed ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
        </button>
        
        {!isDemographicsCollapsed && (
          <div className="px-6 pb-4 animate-in slide-in-from-top-2 duration-200 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</div>
                <div className="text-sm font-semibold text-slate-900">{patient.name}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Patient ID</div>
                <div className="text-sm font-semibold text-slate-900">{patient.patientId}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">DOB / Age</div>
                <div className="text-sm font-semibold text-slate-900">
                  {new Date(patient.dob).toLocaleDateString()} ({new Date().getFullYear() - new Date(patient.dob).getFullYear()})
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gender / Blood</div>
                <div className="text-sm font-semibold text-slate-900">{patient.gender} • {patient.demographics.bloodType}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact & Address</div>
                <div className="text-xs text-slate-600 mt-1">
                  <p className="flex items-center"><svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg> {patient.demographics.phone}</p>
                  <p className="flex items-center mt-1"><svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg> {patient.demographics.address}</p>
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Known Allergies</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {patient.demographics.allergies.map(a => (
                    <span key={a} className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-[10px] font-bold border border-red-100">{a}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="no-print sticky top-0 z-10 flex items-center justify-between px-6 py-2 bg-white border-b border-slate-200 shadow-sm shrink-0">
        <div className="flex items-center space-x-2">
          <div className="relative mr-2">
             <select 
               onChange={handleApplyTemplate}
               className="appearance-none pl-3 pr-8 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer text-slate-700 hover:bg-slate-100 transition-all"
               defaultValue=""
             >
               <option value="" disabled>Apply Template...</option>
               {Array.from(new Set(templates.map(t => t.category))).map(category => (
                 <optgroup key={category} label={category}>
                   {templates.filter(t => t.category === category).map(t => (
                     <option key={t.id} value={t.id}>{t.title}</option>
                   ))}
                 </optgroup>
               ))}
             </select>
             <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-slate-400">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
             </div>
          </div>

          <div className="w-px h-6 bg-slate-200 mx-1"></div>

          <button 
            onClick={() => setShowExamModal(true)}
            className="flex items-center px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 border border-blue-200 transition-all"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
            Exam Entry
          </button>

          <div className="w-px h-6 bg-slate-200 mx-1"></div>

          <button onClick={() => execCommand('bold')} className="p-2 hover:bg-slate-100 rounded text-slate-600" title="Bold">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6zM6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" /></svg>
          </button>
          <button onClick={() => execCommand('italic')} className="p-2 hover:bg-slate-100 rounded text-slate-600" title="Italic">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m-4 0h4m-6 16h4" /></svg>
          </button>
          <button onClick={() => execCommand('insertUnorderedList')} className="p-2 hover:bg-slate-100 rounded text-slate-600" title="Bullets">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          
          <div className="w-px h-6 bg-slate-200 mx-1"></div>
          
          <button 
            onClick={handleAIImprove} 
            disabled={isProcessing}
            className="flex items-center px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 border border-purple-200 disabled:opacity-50 transition-all"
          >
            {isProcessing ? 'Thinking...' : 'AI Formalize'}
            <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </button>
        </div>
        
        <div className="flex items-center space-x-3">
          <button onClick={handlePrint} className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-all">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Export PDF
          </button>
        </div>
      </div>

      {/* Editor Surface */}
      <div className="flex-1 overflow-y-auto pt-4 pb-20 px-4 bg-slate-100/50">
        <div className="report-page bg-white shadow-xl mx-auto p-12 min-h-[29.7cm] w-[21cm]">
          <div 
            key={content}
            className="prose prose-slate max-w-none focus:outline-none min-h-[20cm]"
            contentEditable
            ref={editorRef}
            onInput={(e) => onContentChange(e.currentTarget.innerHTML)}
            dangerouslySetInnerHTML={{ __html: content }}
          />

          {/* Printable Digital Signature Block */}
          <div className="mt-12 pt-8 border-t border-slate-200">
            <div className="flex flex-col items-end">
              <div className="w-64 text-center">
                {signatureImage ? (
                  <img src={signatureImage} alt="Signature" className="max-h-24 mx-auto mb-2 mix-blend-multiply" />
                ) : (
                  <div className="h-24 flex items-center justify-center text-slate-300 italic text-sm mb-2 border-b border-slate-100 border-dashed">
                    Digital Signature Placeholder
                  </div>
                )}
                <div className="border-t border-slate-900 pt-2">
                  <div className="font-bold text-slate-900">{signatureName || 'Authorized Clinician'}</div>
                  <div className="text-xs text-slate-500 uppercase tracking-widest mt-1">Medical Signature</div>
                  <div className="text-[10px] text-slate-400 mt-1">{new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Signature Controls (No-print) */}
      <div className="no-print bg-white border-t border-slate-200 p-4 flex items-center justify-center space-x-6 shrink-0">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Signer Name</label>
            <input 
              type="text" 
              value={signatureName}
              onChange={(e) => onSignatureChange(e.target.value, signatureImage)}
              placeholder="Dr. Full Name"
              className="px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-64"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Signature Image</label>
            <div className="flex items-center space-x-2">
              <label className="cursor-pointer bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors border border-blue-100">
                <span>Upload</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
              {signatureImage && (
                <button 
                  onClick={() => onSignatureChange(signatureName, '')}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Remove Signature"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Exam Entry Modal */}
      {showExamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm no-print">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-blue-600 text-white shrink-0">
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                <h3 className="text-xl font-bold">New Examination Entry</h3>
              </div>
              <button onClick={() => setShowExamModal(false)} className="text-white/70 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 pt-2 flex space-x-1 shrink-0">
              <button 
                onClick={() => setActiveExamTab('vitals')}
                className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-all flex items-center space-x-2 ${activeExamTab === 'vitals' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                <span>Vitals</span>
              </button>
              <button 
                onClick={() => setActiveExamTab('assessment')}
                className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-all flex items-center space-x-2 ${activeExamTab === 'assessment' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <span>Assessment</span>
              </button>
              <button 
                onClick={() => setActiveExamTab('notes')}
                className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-all flex items-center space-x-2 ${activeExamTab === 'notes' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                <span>Notes</span>
              </button>
            </div>

            <form onSubmit={handleInsertExam} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-6">
                {activeExamTab === 'vitals' && (
                  <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-left-2 duration-200">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Blood Pressure (mmHg)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 120/80"
                        value={vitals.bp}
                        onChange={e => setVitals({...vitals, bp: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Heart Rate (bpm)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 72"
                        value={vitals.hr}
                        onChange={e => setVitals({...vitals, hr: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Temperature (°F)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 98.6"
                        value={vitals.temp}
                        onChange={e => setVitals({...vitals, temp: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">SpO2 (%)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 98"
                        value={vitals.spo2}
                        onChange={e => setVitals({...vitals, spo2: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Weight (kg)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 70"
                        value={vitals.weight}
                        onChange={e => setVitals({...vitals, weight: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Height (cm)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 175"
                        value={vitals.height}
                        onChange={e => setVitals({...vitals, height: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      />
                    </div>
                  </div>
                )}

                {activeExamTab === 'assessment' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-200">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Primary Diagnosis / ICD-10</label>
                      <input 
                        type="text" 
                        placeholder="Search or enter diagnosis..."
                        value={vitals.diagnosis}
                        onChange={e => setVitals({...vitals, diagnosis: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      />
                      <p className="mt-2 text-xs text-slate-400">Enter clinical impressions or confirmed diagnoses for this encounter.</p>
                    </div>
                  </div>
                )}

                {activeExamTab === 'notes' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-200">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Clinical Observations</label>
                      <textarea 
                        rows={6}
                        placeholder="Enter detailed physical exam notes, observations, or patient feedback..."
                        value={vitals.notes}
                        onChange={e => setVitals({...vitals, notes: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Sticky Footer */}
              <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
                <div className="flex items-center text-xs text-slate-400">
                  <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>Auto-formatting enabled</span>
                </div>
                <div className="flex space-x-3">
                  <button 
                    type="button" 
                    onClick={() => setShowExamModal(false)}
                    className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200/50 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center"
                  >
                    Generate Entry
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Editor;
