import db from './lib/db';

console.log('Prisma models:', Object.keys(db).filter(key => !key.startsWith('_')));
