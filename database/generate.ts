import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function generateMigrations() {
  console.log('🔄 Generating new migrations from TypeScript schemas...');
  
  try {
    // Generate migrations using drizzle-kit
    const { stdout, stderr } = await execAsync('npx drizzle-kit generate');
    
    if (stderr) {
      console.error('⚠️ Warnings:', stderr);
    }
    
    console.log('✅ Migration generation output:');
    console.log(stdout);
    
    console.log('✅ Migrations generated successfully!');
    console.log('📝 Review the generated migration files in database/migrations/');
    console.log('🚀 Run migrations with: npm run migrate');
    
  } catch (error) {
    console.error('❌ Migration generation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  generateMigrations();
}

export default generateMigrations; 