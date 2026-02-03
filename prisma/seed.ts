import { PrismaClient, SoilReport } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import chalk from 'chalk';

const prisma = new PrismaClient();

// Sample data constants
const INDIAN_STATES = [
  'Maharashtra',
  'Karnataka',
  'Punjab',
  'Gujarat',
  'Madhya Pradesh'
];

const DISTRICTS: Record<string, string[]> = {
  'Maharashtra': ['Pune', 'Nagpur', 'Nashik'],
  'Karnataka': ['Bangalore Rural', 'Mysore', 'Belgaum'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Patiala'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Gwalior']
};

const VILLAGES: Record<string, string[]> = {
  'Pune': ['Wagholi', 'Lohegaon', 'Manjri'],
  'Nagpur': ['Hingna', 'Wadi', 'Kamptee'],
  // Add more villages for other districts...
};

interface SeedStats {
  created: number;
  failed: number;
}

async function clearExistingData(): Promise<void> {
  try {
    console.log(chalk.yellow('Clearing existing soil reports...'));
    await prisma.soilReport.deleteMany({});
    console.log(chalk.green('✓ Existing data cleared'));
  } catch (error) {
    console.error(chalk.red('Error clearing existing data:'), error);
    throw error;
  }
}

function generateRandomSoilData(): Omit<SoilReport, 'id'> {
  const state = INDIAN_STATES[Math.floor(Math.random() * INDIAN_STATES.length)];
  const district = DISTRICTS[state][Math.floor(Math.random() * DISTRICTS[state].length)];
  const village = VILLAGES[district]?.[Math.floor(Math.random() * VILLAGES[district]?.length)] || 'Default Village';

  return {
    state,
    district,
    village,
    ph: Number((Math.random() * 14).toFixed(2)),
    nitrogen: Number((Math.random() * 500 + 100).toFixed(2)),
    phosphorus: Number((Math.random() * 300 + 50).toFixed(2)),
    potassium: Number((Math.random() * 400 + 100).toFixed(2))
  };
}

async function seedSoilReports(count: number): Promise<SeedStats> {
  const stats: SeedStats = { created: 0, failed: 0 };
  
  console.log(chalk.blue(`\nSeeding ${count} soil reports...`));

  for (let i = 0; i < count; i++) {
    try {
      const soilData = generateRandomSoilData();
      await prisma.soilReport.create({
        data: {
          id: uuidv4(),
          ...soilData
        }
      });
      stats.created++;
      process.stdout.write(chalk.green('.'));
    } catch (error) {
      stats.failed++;
      console.error(chalk.red('\nError creating soil report:'), error);
    }
  }

  return stats;
}

export async function main() {
  try {
    await clearExistingData();
    const stats = await seedSoilReports(10);
    
    console.log(chalk.green(`\n\nSeeding completed successfully!`));
    console.log(chalk.blue(`Created: ${stats.created}`));
    console.log(chalk.yellow(`Failed: ${stats.failed}`));
  } catch (error) {
    console.error(chalk.red('Fatal error during seeding:'), error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute if running directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}