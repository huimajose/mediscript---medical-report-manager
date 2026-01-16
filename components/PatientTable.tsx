
import React from 'react';
import { Patient, User } from '../types';

interface PatientTableProps {
  patients: Patient[];
  onSelectReport: (patient: Patient) => void;
  currentUser: User;
}

const PatientTable: React.FC<PatientTableProps> = ({ patients, onSelectReport, currentUser }) => {
  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
      <table className="w-full text-sm text-left text-slate-500">
        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
          <tr>
            <th className="px-6 py-4 font-semibold">Patient ID</th>
            <th className="px-6 py-4 font-semibold">Name</th>
            <th className="px-6 py-4 font-semibold">Gender</th>
            <th className="px-6 py-4 font-semibold">Date of Birth</th>
            <th className="px-6 py-4 font-semibold">Last Visit</th>
            <th className="px-6 py-4 font-semibold text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {patients.map((patient) => (
            <tr key={patient.id} className="hover:bg-blue-50/50 transition-colors">
              <td className="px-6 py-4 font-medium text-slate-900">{patient.patientId}</td>
              <td className="px-6 py-4">{patient.name}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  patient.gender === 'Male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                }`}>
                  {patient.gender}
                </span>
              </td>
              <td className="px-6 py-4">{new Date(patient.dob).toLocaleDateString()}</td>
              <td className="px-6 py-4">{new Date(patient.lastVisit).toLocaleDateString()}</td>
              <td className="px-6 py-4 text-right">
                {currentUser.permissions.canWriteReports ? (
                  <button
                    onClick={() => onSelectReport(patient)}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all border border-blue-100"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Report
                  </button>
                ) : (
                  <span className="text-xs italic text-slate-400">View Only</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PatientTable;
