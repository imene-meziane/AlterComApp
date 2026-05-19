require('dotenv').config();

const { closeDatabase, connectDatabase } = require('../config/database');
const { seedDatabase } = require('../services/seedService');

async function runSeed() {
  await connectDatabase();
  const result = await seedDatabase({ reset: true });
  console.log('Seed AlterCom termine.', result);
  await closeDatabase();
}

runSeed().catch(async error => {
  console.error('Echec du seed AlterCom.', error);
  await closeDatabase();
  process.exit(1);
});
