
import { Patient, ReportTemplate } from './types';

export const MOCK_PATIENTS: Patient[] = [
  { 
    id: '1', 
    name: 'John Doe', 
    dob: '1985-05-12', 
    gender: 'Male', 
    patientId: 'P-10023', 
    lastVisit: '2023-10-15',
    demographics: {
      address: '123 Health St, Medical City, MC 54321',
      phone: '+1 (555) 012-3456',
      email: 'john.doe@email.com',
      bloodType: 'A+',
      allergies: ['Penicillin', 'Peanuts']
    }
  },
  { 
    id: '2', 
    name: 'Jane Smith', 
    dob: '1992-08-22', 
    gender: 'Female', 
    patientId: 'P-10045', 
    lastVisit: '2023-11-02',
    demographics: {
      address: '456 Wellness Ave, Caretown, CT 12345',
      phone: '+1 (555) 987-6543',
      email: 'jane.smith@email.com',
      bloodType: 'O-',
      allergies: ['Latex']
    }
  },
  { 
    id: '3', 
    name: 'Robert Wilson', 
    dob: '1970-03-10', 
    gender: 'Male', 
    patientId: 'P-10112', 
    lastVisit: '2023-09-28',
    demographics: {
      address: '789 Recovery Ln, Healing Springs, HS 67890',
      phone: '+1 (555) 456-7890',
      email: 'r.wilson@email.com',
      bloodType: 'B+',
      allergies: ['None']
    }
  },
  { 
    id: '4', 
    name: 'Emily Chen', 
    dob: '1998-12-05', 
    gender: 'Female', 
    patientId: 'P-10256', 
    lastVisit: '2023-12-01',
    demographics: {
      address: '321 Lotus Dr, Zen Garden, ZG 11223',
      phone: '+1 (555) 111-2222',
      email: 'emily.chen@email.com',
      bloodType: 'AB-',
      allergies: ['Dust', 'Dairy']
    }
  },
];

export const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 't1',
    title: 'General Physical Exam',
    category: 'General',
    content: `<h1>Physical Examination Report</h1>
<p><strong>Patient Name:</strong> [PATIENT_NAME]</p>
<p><strong>Date of Exam:</strong> [DATE]</p>
<hr/>
<h3>Chief Complaint</h3>
<p>Patient presents for a routine annual physical examination.</p>
<h3>Vital Signs</h3>
<p>BP: 120/80 mmHg | HR: 72 bpm | Temp: 98.6°F | SpO2: 98%</p>
<h3>Physical Findings</h3>
<ul>
  <li><strong>HEENT:</strong> Normocephalic, atraumatic. Pupils equal and reactive.</li>
  <li><strong>Neck:</strong> Supple, no lymphadenopathy.</li>
  <li><strong>Lungs:</strong> Clear to auscultation bilaterally.</li>
  <li><strong>Heart:</strong> Regular rate and rhythm, no murmurs.</li>
  <li><strong>Abdomen:</strong> Soft, non-tender, non-distended.</li>
</ul>
<h3>Assessment & Plan</h3>
<p>Healthy individual. Recommended follow-up in 12 months.</p>`
  },
  {
    id: 't2',
    title: 'Cardiology Assessment',
    category: 'Specialty',
    content: `<h1>Cardiology Consultation</h1>
<p><strong>Specialist:</strong> Dr. Sarah Vance</p>
<hr/>
<h3>Clinical Summary</h3>
<p>Patient referred for evaluation of intermittent palpitations.</p>
<h3>Diagnostic Results</h3>
<p>ECG shows normal sinus rhythm. No significant ST-segment changes noted during stress test.</p>
<h3>Impression</h3>
<p>Unremarkable cardiac evaluation. Palpitations likely secondary to excessive caffeine intake or stress.</p>`
  },
  {
    id: 't3',
    title: 'Radiology Report',
    category: 'Diagnostics',
    content: `<h1>Radiology Report (Chest X-Ray)</h1>
<hr/>
<h3>Findings</h3>
<p>Bony thorax and soft tissues are unremarkable. Heart size is within normal limits. Lungs are clear without focal consolidation, effusion, or pneumothorax.</p>
<h3>Impression</h3>
<p>No acute cardiopulmonary disease.</p>`
  }
];
