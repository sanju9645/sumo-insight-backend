import mongoose from 'mongoose';
import csv from 'csv-parser';
import fs from 'fs';
import dotenv from "dotenv";

import { apiAnalysisTableName } from '../utils/envUtils';
import { apiAnalysisTableColumns } from '../utils/utils';
import { testConnection } from '../config/mysql';
import { connectMongoDb } from "../config/mongodb";
import { ApiAnalysisModel } from "../types";

dotenv.config();

const columns = apiAnalysisTableColumns();

// Define the schema
const apiAnalysisSchema = new mongoose.Schema({
  [columns.date]: { type: Date, required: true },
  [columns.api_endpoint]: { type: String, required: true },
  [columns.count]: { type: Number, required: true },
  [columns.avg_p_time]: { type: Number, required: true }
});

// Create the model
const ApiAnalysis = mongoose.model<ApiAnalysisModel>(apiAnalysisTableName(), apiAnalysisSchema);

const csvFilePath = './src/uploads/api_logs.csv';

const processMySQLData = async (logs: any[]): Promise<void> => {
  const connection = await testConnection();
  try {
    // Process logs in smaller batches
    const batchSize = 100;
    for (let i = 0; i < logs.length; i += batchSize) {
      const batch = logs.slice(i, i + batchSize);
      const values = batch.map(log => [
        log[columns.date],
        log[columns.api_endpoint],
        log[columns.count],
        log[columns.avg_p_time]
      ]);
      const tableName = apiAnalysisTableName();
      
      const query = `
        INSERT INTO ${tableName} (${columns.date}, ${columns.api_endpoint}, ${columns.count}, ${columns.avg_p_time})
        VALUES ? 
        ON DUPLICATE KEY UPDATE 
        ${columns.count} = VALUES(${columns.count}),
        ${columns.avg_p_time} = VALUES(${columns.avg_p_time})
      `;
      
      await connection.query(query, [values]);
      console.log(`Processed ${i + batch.length} of ${logs.length} records`);
    }
  } finally {
    connection.release();
  }
};

const processMongoData = async (logs: any[]): Promise<void> => {
  // Process logs in smaller batches
  const batchSize = 100;
  for (let i = 0; i < logs.length; i += batchSize) {
    const batch = logs.slice(i, i + batchSize);
    const promises = batch.map(log => 
      ApiAnalysis.updateOne(
        { [columns.date]: log[columns.date], [columns.api_endpoint]: log[columns.api_endpoint] },
        { $set: log },
        { upsert: true }
      )
    );
    await Promise.all(promises);
    console.log(`Processed ${i + batch.length} of ${logs.length} records`);
  }
};

const processCsvData = async (): Promise<void> => {
  const logs: any[] = [];

  return new Promise<void>((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        const parsedDate = new Date(row.date);
        const count = parseInt(row.count, 10);
        const cleanAvgPTime = row.avg_p_time.replace(/["\s]/g, '');
        const avgPTime = parseFloat(cleanAvgPTime);

        if (isNaN(parsedDate.getTime()) || isNaN(count) || isNaN(avgPTime)) {
          console.warn(`Invalid data found in row, skipping: ${JSON.stringify(row)}`);
          return;
        }

        const logEntry = {
          [columns.created]: new Date(),
          [columns.date]: parsedDate,
          [columns.api_endpoint]: row.api_endpoint,
          [columns.count]: count,
          [columns.avg_p_time]: avgPTime,
        };
        logs.push(logEntry);
      })
      .on('end', async () => {
        try {
          if (process.env.DATABASE_TYPE === 'MySQL') {
            await processMySQLData(logs);
          } else if (process.env.DATABASE_TYPE === 'MongoDB') {
            await connectMongoDb({
              serverSelectionTimeoutMS: 30000,
              socketTimeoutMS: 45000,
            });
            await processMongoData(logs);
            await mongoose.disconnect();
          } else {
            throw new Error('Invalid DATABASE_TYPE specified in');
          }
          resolve();
        } catch (error) {
          reject(error);
        }
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

const main = async () => {
  try {
    await processCsvData();
    console.log('CSV data uploaded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during CSV upload:', error);
    process.exit(1);
  }
};

main();