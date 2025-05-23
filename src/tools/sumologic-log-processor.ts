import mongoose from 'mongoose';
import moment from 'moment-timezone';
import fetch from 'node-fetch';
import yargs from 'yargs';

// Import the existing model and utilities
import ApiAnalysis from '../models/apiAnalysis.model';
import { apiAnalysisTableColumns } from '../utils/utils';
import { connectMongoDb } from "../config/mongodb";
import getConfigurationAsJson from '../ops/configuration';
import ApiAnalysisEndpointClassification from '../models/ApiEndpointClassification';
import { apiAnalysisEndpointClassificationTableColumns } from '../utils/utils';
import Configuration from '../models/configuration.model';
import {AlertCondition, AlertConfiguration } from "../types";
import { sendMail } from '../config/smtp';
import { EmailContentGenerator } from '../utils/email-content-generator';
import { makeVoiceCall } from '../config/twilio-voice';
import { rewriteApiEndpoint } from '../utils/utils';
const columns = apiAnalysisTableColumns();

export class SumoLogicProcessor {
  private uri: string;
  private accessId: string;
  private accessKey: string;
  private sumologicQuery: string;

  constructor() {
    if (!process.env.SUMO_BASE_URL || !process.env.SUMO_ACCESS_ID || !process.env.SUMO_ACCESS_KEY) {
      throw new Error('Required Sumo Logic credentials are missing');
    }
    this.uri = process.env.SUMO_BASE_URL;
    this.accessId = process.env.SUMO_ACCESS_ID;
    this.accessKey = process.env.SUMO_ACCESS_KEY;
    this.sumologicQuery = '';
  }

  async initialize() {
    await connectMongoDb();
    // const config = await getConfigurationAsJson();
    // this.sumologicQuery = config.sumologicQuery.replace(/\\n/g, ' ').replace(/\\/g, '');
  }

  private createQuery(targetDate: string): any {
    const query = this.sumologicQuery;

    return {
      query: `_sourceCategory=s3_aws_logs | parse "* * *:* *:* * * * * * * * \\"* *://*:*/* HTTP" as f1, elb_server, clientIP, port, backend, backend_port, requestProc, ba_Response, cli_Response, ELB_StatusCode, be_StatusCode, rcvd, send, method, protocol, domain, server_port, path nodrop | parse "* * *:* *:* * * * * * * * \\"* *://*:*/*?* HTTP" as f1, elb_server, clientIP, port, backend, backend_port, requestProc, ba_Response, cli_Response, ELB_StatusCode, be_StatusCode, rcvd, send, method, protocol, domain, server_port, path,rest_of_path | parse regex field=path "(?<path>\\S*\\/)?(?<rem>\\S*)" 
      | length(rem) <= 31 ? concat(path,rem):path as path | timeslice 1d | formatDate(_timeslice, "yyyy/MM/dd") as period | sum(requestProc) as a1, sum(ba_Response) as a2, sum(cli_Response) as a3,count as count_value by period, path | (a1+a2+a3) as total_process_time | fields path,total_process_time, period, count_value | sort by total_process_time`,
      from: `${targetDate}T00:00:00`,
      to: `${targetDate}T23:59:59`,
      timeZone: "UTC"
    };
  }

  private getAuthHeader(): string {
    return `Basic ${Buffer.from(`${this.accessId}:${this.accessKey}`).toString('base64')}`;
  }

  private async makeRequest(url: string, method: string = 'GET', body?: any): Promise<any> {
    const headers = {
      'Authorization': this.getAuthHeader(),
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };

    const options = {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    };

    const response = await fetch(url, options);
      
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async processLogs(targetDate?: string): Promise<void> {
    // Use provided date or default to current date
    const processDate = targetDate 
      ? moment(targetDate, 'YYYY-MM-DD').format('YYYY-MM-DD')
      : moment().format('YYYY-MM-DD');

    console.log(`Processing logs for date: ${processDate}`);

    const query = this.createQuery(processDate);

    try {
      // Create Sumo Logic search job
      const searchJobResponse = await this.makeRequest(`${this.uri}/search/jobs`, 'POST', query);
      
      const searchJobId = searchJobResponse.id;

      // Wait for job to complete
      await this.waitForJobCompletion(searchJobId);

      // Fetch search job results
      const resultsResponse = await this.makeRequest(
        `${this.uri}/search/jobs/${searchJobId}/records?offset=0&limit=100`
      );

      // Process and insert records
      await this.processMongoBatch(resultsResponse.records, processDate);
      console.log('Log processing completed successfully');
    } catch (error) {
      console.error('Error processing logs:', error);
      throw error;
    }
  }

  private async processMongoBatch(logs: any[], processDate: string): Promise<void> {
    // Process logs in smaller batches
    const batchSize = 100;
    const configurations = await Configuration.find({});
    const alertConfig = configurations.find(config => config.key === 'alertConfig');
    const alertConfiguration = alertConfig?.content as AlertConfiguration;
    const transformedConditions = this.transformAlertConditions(alertConfiguration.conditions || []);
    
    for (let i = 0; i < logs.length; i += batchSize) {
      const batch = logs.slice(i, i + batchSize);
      const promises = batch.map(async log => {
        let rewrittenApiEndpoint = log.map.path;
        if (process.env.API_REWRITE_MAP) {
          rewrittenApiEndpoint = rewriteApiEndpoint(log.map.path);
        }

        const processedLog = {
          [columns.date]: moment(log.map.period, 'YYYY/MM/DD').toDate(),
          [columns.api_endpoint]: rewrittenApiEndpoint,
          [columns.count]: parseInt(log.map.count_value, 10),
          [columns.avg_p_time]: log.map.total_process_time.toString()
        };

        if (transformedConditions[rewrittenApiEndpoint]) {
          const alertCondition = transformedConditions[rewrittenApiEndpoint];
          const value = parseFloat(alertCondition.metricType === 'PTime' ? log.map.total_process_time : log.map.count_value);
          const threshold = parseFloat(alertCondition.thresholdValue);
          
          if (this.evaluateCondition(value, alertCondition.operator, threshold)) {
            const alertContent = await EmailContentGenerator.generateAlertContent(
              rewrittenApiEndpoint,
              alertCondition.metricType,
              value,
              parseFloat(alertCondition.thresholdValue),
              alertCondition.operator
            );
            const { html, plain } = alertContent;

            if (alertCondition.alertType === 'email' || alertCondition.alertType === 'both') {
              if (alertConfiguration.emails) {
                await this.sendAlertEmail(alertConfiguration.emails, rewrittenApiEndpoint, alertCondition, html);
              }
            }

            if (alertCondition.alertType === 'phone' || alertCondition.alertType === 'both') {
              if (alertConfiguration.phoneNumbers) {
                await makeVoiceCall(alertConfiguration.phoneNumbers, plain);
              }
            }
          }
        }

        // Ensure the API endpoint exists in classification table
        await this.ensureEndpointExists(rewrittenApiEndpoint);

        return ApiAnalysis.updateOne(
          {
            [columns.date]: processedLog[columns.date], 
            [columns.api_endpoint]: processedLog[columns.api_endpoint]
          },
          { $set: processedLog },
          { upsert: true }
        );
      });
      
      await Promise.all(promises);
      console.log(`Processed ${i + batch.length} of ${logs.length} records`);
    }
  }

  /**
   * Transforms an array of alert conditions into an object with API paths as keys
   */
  private transformAlertConditions(conditions: AlertCondition[]): Record<string, Omit<AlertCondition, 'api'>> {
    return conditions.reduce((result, condition) => {
      const { api, ...conditionWithoutApi } = condition;
      result[api] = conditionWithoutApi;
      return result;
    }, {} as Record<string, Omit<AlertCondition, 'api'>>);
  }

  /**
   * Ensures the API endpoint exists in the ApiAnalysisEndpointClassification collection
   * Creates a new record if it doesn't exist
   */
  private async ensureEndpointExists(apiEndpoint: string): Promise<void> {
    const endpointClassificationColumns = apiAnalysisEndpointClassificationTableColumns();
    const existingEndpoint = await ApiAnalysisEndpointClassification.findOne({
      [endpointClassificationColumns.api_endpoint]: apiEndpoint
    });

    // If endpoint doesn't exist, create a new record
    if (!existingEndpoint) {
      await ApiAnalysisEndpointClassification.create({
        [endpointClassificationColumns.api_endpoint]: apiEndpoint,
        [endpointClassificationColumns.created]: new Date()
      });
    }
  }

  private async waitForJobCompletion(searchJobId: string, maxAttempts = 30): Promise<void> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const statusResponse = await this.makeRequest(
        `${this.uri}/search/jobs/${searchJobId}`
      );

      if (statusResponse.state === 'DONE GATHERING RESULTS') {
        return;
      }

      // Wait 10 seconds between attempts
      await new Promise(resolve => setTimeout(resolve, 10000));
    }

    throw new Error('Search job did not complete in time');
  }

  async processLogsInDateRange(startDate: string, endDate: string): Promise<void> {
    // Convert start and end dates to moment objects
    const start = moment(startDate, 'YYYY-MM-DD');
    const end = moment(endDate, 'YYYY-MM-DD');

    // Validate date range
    if (!start.isValid() || !end.isValid()) {
      throw new Error('Invalid date format. Use YYYY-MM-DD');
    }

    if (end.isBefore(start)) {
      throw new Error('End date must be after or equal to start date');
    }

    console.log(`Processing logs from ${startDate} to ${endDate}`);

    // Process logs for each day in the range
    const currentDate = start.clone();
    while (!currentDate.isAfter(end)) {
      const processDate = currentDate.format('YYYY-MM-DD');
      
      try {
        await this.processLogs(processDate);
      } catch (error) {
        console.error(`Error processing logs for ${processDate}:`, error);
        // Continue processing other dates even if one fails
      }

      // Move to next day
      currentDate.add(1, 'day');
    }

    console.log('Date range log processing completed');
  }

  private evaluateCondition(value: number, operator: string, threshold: number): boolean {
    switch (operator) {
      case '>': return value > threshold;
      case '>=': return value >= threshold;
      case '<': return value < threshold;
      case '<=': return value <= threshold;
      case '==': return value === threshold;
      case '!=': return value !== threshold;
      default: return false;
    }
  }

  private async sendAlertEmail(alertMails: string[], apiPath: string, alertCondition: any, mailContent: string): Promise<void> {
    try {
      const subject = `Sumo Insight Alert: ${apiPath} ${alertCondition.metricType} Threshold Exceeded`;
      await sendMail(alertMails, subject, mailContent);
      console.log(`Alert email sent for ${apiPath}`);
    } catch (error) {
      console.error('Error sending alert email:', error);
    }
  }

  async initProcessLogs(startDate?: string, endDate?: string, date?: string): Promise<void> {
    if (startDate && endDate) {
      await this.processLogsInDateRange(startDate, endDate);
    } else if (date) {
      await this.processLogs(date);
    } else {
      await this.processLogs(); 
    }
  }
}

// Main function to connect to MongoDB and run the processor
async function main() {
  try {
    // Parse command-line arguments with support for start and end dates
    const argv = await yargs(process.argv.slice(2))
      .option('start-date', {
        alias: 's',
        type: 'string',
        description: 'Start date to fetch logs from (YYYY-MM-DD format)'
      })
      .option('end-date', {
        alias: 'e',
        type: 'string',
        description: 'End date to fetch logs to (YYYY-MM-DD format)'
      })
      .option('date', {
        alias: 'd',
        type: 'string',
        description: 'Single date to fetch logs for (YYYY-MM-DD format)'
      })
      .help()
      .alias('help', 'h')
      .parse();

    const processor = new SumoLogicProcessor();
    await processor.initialize();
    await processor.initProcessLogs(argv.startDate, argv.endDate, argv.date);
  } catch (error) {
    console.error('Error in main process:', error);
    process.exit(1);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
  }
}

// Run the main function
main().catch(console.error);

// Updated usage examples:
// Process logs for current date
// npm run process-logs

// Process logs for a specific date
// npm run process-logs -- -d 2025-04-20

// Process logs for a date range
// npm run process-logs -- -s 2024-04-10 -e 2024-04-23

// Crontab setup (optional):
// Run daily at midnight
// 0 0 * * * /path/to/node /path/to/project/node_modules/.bin/ts-node /path/to/sumologic-log-processor.ts