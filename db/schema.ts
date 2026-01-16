
import { pgTable, text, timestamp, uuid, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role', { enum: ['Admin', 'Medic', 'Secretary'] }).default('Medic').notNull(),
  permissions: jsonb('permissions').$type<{
    canManageTemplates: boolean;
    canManageStaff: boolean;
    canWriteReports: boolean;
    canManagePatients: boolean;
  }>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const reports = pgTable('reports', {
  id: uuid('id').defaultRandom().primaryKey(),
  patientId: text('patient_id').notNull(),
  authorId: uuid('author_id').references(() => users.id),
  title: text('title').notNull(),
  content: text('content').notNull(),
  status: text('status', { enum: ['Draft', 'Finalized'] }).default('Draft').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
