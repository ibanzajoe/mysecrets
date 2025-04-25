// src/config/index.ts
import * as dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'fallback_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  // clientUrl: process.env.CLIENT_URL || 'http://localhost:3001',
  clientUrl: 'http://localhost:3001'
};

if (!config.databaseUrl) {
  console.error("FATAL ERROR: DATABASE_URL is not defined.");
  process.exit(1);
}
 if (config.jwtSecret === 'fallback_secret') {
  console.warn("WARNING: JWT_SECRET using fallback value. Set a strong secret in .env");
}