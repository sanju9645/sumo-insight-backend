import mysql from "mysql2";
import dotenv from "dotenv";

import { apiAnalysisTableName } from '../utils/envUtils';
import { apiAnalysisTableColumns } from '../utils/utils';

dotenv.config();

// Create the connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
}).promise();

// Function to test the connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Connected to database!");

    // SQL query to create api_analysis table
    const tableName = apiAnalysisTableName();
    const columns = apiAnalysisTableColumns();
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS ${tableName} (
        id int(11) NOT NULL AUTO_INCREMENT,
        ${columns.created} DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        ${columns.date} DATE NOT NULL,
        ${columns.api_endpoint} VARCHAR(255) NULL,
        ${columns.count} BIGINT NULL,
        ${columns.avg_p_time} VARCHAR(40) NULL,
        PRIMARY KEY (id),
        INDEX idx_date (${columns.date}),
        INDEX idx_api_endpoint (${columns.api_endpoint}),
        INDEX idx_avg_count (${columns.count}),
        INDEX idx_avg_processing_time (${columns.avg_p_time}),
        INDEX idx_date_api (${columns.date}, ${columns.api_endpoint}),
        INDEX idx_date_processing_time (${columns.date}, ${columns.avg_p_time}),
        INDEX idx_date_count (${columns.date}, ${columns.count})
      ) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1;
    `;
    await connection.query(createTableQuery);
    console.log(`${tableName} table created or already exists!`);

    return connection; // Return the connection instead of releasing it
  } catch (err: unknown) {
    console.error("Error connecting to database:", (err as Error).message);
    throw err;
  }
};

export { pool, testConnection };
