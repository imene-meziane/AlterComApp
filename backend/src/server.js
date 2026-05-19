require('dotenv').config();

const app = require('./app');
const { closeDatabase, connectDatabase } = require('./config/database');
const { seedDatabase } = require('./services/seedService');

const port = Number(process.env.PORT || 4000);

async function startServer() {
  await connectDatabase();

  if (process.env.AUTO_SEED !== 'false') {
    await seedDatabase();
  }

  const server = app.listen(port, () => {
    console.log(`AlterCom API disponible sur http://localhost:${port}`);
  });

  async function shutdown(signal) {
    console.log(`Arret en cours apres ${signal}...`);
    server.close(async () => {
      await closeDatabase();
      process.exit(0);
    });
  }

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

startServer().catch(async error => {
  console.error('Impossible de lancer le backend AlterCom.', error);
  await closeDatabase();
  process.exit(1);
});
