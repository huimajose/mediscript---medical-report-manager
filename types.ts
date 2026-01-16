
export type Role = 'Admin' | 'Medic' | 'Secretary';

export interface UserPermissions {
  canManageTemplates: boolean;
  canManageStaff: boolean;
  canWriteReports: boolean;
  canManagePatients: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  permissions: UserPermissions;
}

export interface PatientDemographics {
  address: string;
  phone: string;
  email: string;
  bloodType: string;
  allergies: string[];
}

export interface Patient {
  id: string;
  name: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  patientId: string;
  lastVisit: string;
  demographics: PatientDemographics;
}

export interface ReportTemplate {
  id: string;
  title: string;
  category: string;
  content: string;
}

export interface ReportVersion {
  id: string;
  timestamp: string;
  content: string;
  authorName: string;
}

export interface MedicalReport {
  id: string;
  patientId: string;
  content: string;
  title: string;
  createdAt: string;
  status: 'Draft' | 'Finalized';
}
