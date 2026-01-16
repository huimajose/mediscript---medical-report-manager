
import { User } from '../types';
import { db } from '../db';
import { users } from '../db/schema';
import { eq, and } from 'drizzle-orm';

// In a real production app, use a library like 'bcryptjs' for hashing
// For this demo, we simulate the hashing logic
const mockHash = (pw: string) => `hashed_${pw}`;

export const signIn = async (email: string, password: string): Promise<User | null> => {
  try {
    // In a real environment, this would be an API call to a serverless function
    // For the UI demo, we show how the Drizzle query would look
    const result = await db.query.users.findFirst({
      where: and(
        eq(users.email, email),
        eq(users.passwordHash, mockHash(password))
      ),
    });

    if (result) {
      const user: User = {
        id: result.id,
        name: result.name,
        email: result.email,
        role: result.role as any,
        permissions: result.permissions,
      };
      localStorage.setItem('mediscript_user', JSON.stringify(user));
      return user;
    }
  } catch (error) {
    console.error("Database Sign In Error:", error);
  }
  return null;
};

export const signUp = async (name: string, email: string, password: string, role: 'Medic' | 'Secretary' = 'Medic'): Promise<User | null> => {
  try {
    const newUser = await db.insert(users).values({
      name,
      email,
      passwordHash: mockHash(password),
      role,
      permissions: {
        canManageTemplates: false,
        canManageStaff: false,
        canWriteReports: role === 'Medic',
        canManagePatients: true,
      },
    }).returning();

    if (newUser[0]) {
      const user: User = {
        id: newUser[0].id,
        name: newUser[0].name,
        email: newUser[0].email,
        role: newUser[0].role as any,
        permissions: newUser[0].permissions,
      };
      localStorage.setItem('mediscript_user', JSON.stringify(user));
      return user;
    }
  } catch (error) {
    console.error("Database Sign Up Error:", error);
  }
  return null;
};

// Added getMockStaff to fix the missing export error in AdminDashboard.tsx
export const getMockStaff = (): User[] => {
  return [
    {
      id: 'u1',
      name: 'Dr. Sarah Vance',
      email: 's.vance@mediscript.com',
      role: 'Medic',
      permissions: {
        canManageTemplates: false,
        canManageStaff: false,
        canWriteReports: true,
        canManagePatients: true,
      }
    },
    {
      id: 'u2',
      name: 'Dr. Gregory House',
      email: 'g.house@mediscript.com',
      role: 'Admin',
      permissions: {
        canManageTemplates: true,
        canManageStaff: true,
        canWriteReports: true,
        canManagePatients: true,
      }
    },
    {
      id: 'u3',
      name: 'Lisa Cuddy',
      email: 'l.cuddy@mediscript.com',
      role: 'Secretary',
      permissions: {
        canManageTemplates: false,
        canManageStaff: false,
        canWriteReports: false,
        canManagePatients: true,
      }
    }
  ];
};

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem('mediscript_user');
  return stored ? JSON.parse(stored) : null;
};

export const logout = () => {
  localStorage.removeItem('mediscript_user');
};
