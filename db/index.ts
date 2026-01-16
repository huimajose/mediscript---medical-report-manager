
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// This URL would typically come from your Neon dashboard environment variables
const sql = neon(process.env.DATABASE_URL || 'postgres://user:pass@host/db');
export const db = drizzle(sql, { schema });
