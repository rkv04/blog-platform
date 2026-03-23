import { db, pool } from './db/db.js';
import { setupContainer } from './container.js';


async function main() {
    const container = setupContainer();
    const httpServer = container.resolve('httpServer');
    httpServer.start(3000);
}

process.on('SIGINT', async () => {
    await pool.end();
    console.log('Connection was closed');
    process.exit(0);
});

main();