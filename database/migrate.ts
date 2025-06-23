import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db, connection } from './index';

async function runMigrations() {
  console.log('🚀 Starting database migrations...');
  
  try {
    await migrate(db, { migrationsFolder: './database/migrations' });
    console.log('✅ Migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

// Run migrations if called directly
if (require.main === module) {
  runMigrations();
}

export default runMigrations; 