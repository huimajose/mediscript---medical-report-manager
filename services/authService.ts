
import { User } from '../types';

const MOCK_USERS: User[] = [
  { 
    id: 'u1', 
    name: 'Dr. Gregory House', 
    email: 'medic@mediscript.com', 
    role: 'Medic',
    permissions: {
      canManageTemplates: false,
      canManageStaff: false,
      canWriteReports: true,
      canManagePatients: true
    }
  },
  { 
    id: 'u2', 
    name: 'Admin User', 
    email: 'admin@mediscript.com', 
    role: 'Admin',
    permissions: {
      canManageTemplates: true,
      canManageStaff: true,
      canWriteReports: true,
      canManagePatients: true
    }
  },
  { 
    id: 'u3', 
    name: 'Sarah Secretary', 
    email: 'secretary@mediscript.com', 
    role: 'Secretary',
    permissions: {
      canManageTemplates: false,
      canManageStaff: false,
      canWriteReports: false,
      canManagePatients: true
    }
  }
];

export const login = async (email: string): Promise<User | null> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  const user = MOCK_USERS.find(u => u.email === email);
  if (user) {
    localStorage.setItem('mediscript_user', JSON.stringify(user));
    return user;
  }
  return null;
};

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem('mediscript_user');
  return stored ? JSON.parse(stored) : null;
};

export const logout = () => {
  localStorage.removeItem('mediscript_user');
};

export const getMockStaff = (): User[] => MOCK_USERS;
