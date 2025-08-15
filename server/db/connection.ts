import 'dotenv/config';
import sql from 'mssql/msnodesqlv8';

const config: sql.config = {
  server: process.env.DB_SERVER || 'BTR\\ABSERVERPB', // Escape backslash
  database: process.env.DB_NAME || 'vihariDB',
  options: {
    trustedConnection: true,     // Windows Authentication
    trustServerCertificate: true // For local dev
  }
};

export const pool = new sql.ConnectionPool(config)
  .connect()
  .then(conn => {
    console.log(`✅ Connected to SQL Server: ${config.server}/${config.database}`);
    return conn;
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  });
