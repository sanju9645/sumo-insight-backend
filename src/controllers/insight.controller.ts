import { Request, Response, RequestHandler } from "express";
import dotenv from "dotenv";

import ApiAnalysis from "../models/apiAnalysis.model";
import { apiAnalysisTableColumns } from '../utils/utils';
import {InsightApiLogsResponse, ApiAnalysisModel } from "../types";
import Configuration from '../models/configuration.model';
import ApiAnalysisEndpointClassification from "../models/ApiEndpointClassification";

dotenv.config();

const columns = apiAnalysisTableColumns();

const getSumoApiLogs: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      res.status(400).json({ error: "Missing start or end date" });
    }
    const startDate = new Date(start as string);
    const endDate = new Date(end as string);
    endDate.setHours(23, 59, 59, 999); // Include the entire end day

    const rows = await ApiAnalysis.find({
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }).lean();
    const records = rows;

    const formattedData: InsightApiLogsResponse[] = records.map((record: ApiAnalysisModel, index: number) => ({
      id: index + 1,
      date: record[columns.date as keyof ApiAnalysisModel]?.toISOString().split('T')[0] || null, // Format date to 'YYYY-MM-DD'
      api_endpoint: record[columns.api_endpoint as keyof ApiAnalysisModel] || null, // Type assertion for dynamic access
      count: record[columns.count as keyof ApiAnalysisModel] || null, // Type assertion for dynamic access
      avg_p_time: record[columns.avg_p_time as keyof ApiAnalysisModel] || null, // Type assertion for dynamic access
    }));

    // Get all API endpoint classifications
    const apiEndpointClassifications = await ApiAnalysisEndpointClassification.find({}).lean();
    
    // Create a mapping of API endpoint to classification color
    const colorMap: Record<string, string> = {};
    apiEndpointClassifications.forEach(item => {
      colorMap[item.api_endpoint] = item.classification_color;
    });
    
    // Add classification color to each record
    const finalData = formattedData.map(item => ({
      ...item,
      classification_color: colorMap[item.api_endpoint as string] || null
    }));

    res.json(finalData);
  } catch (error) {
    console.error('Error fetching or formatting API analysis data:', error);
    res.status(500).json({ error: 'Error fetching data' });
  }
};

export const configureInsights = async (req: Request, res: Response) => {
  try {
    const configurations = req.body;
    const savedConfigurations = [];

    for (const [key, content] of Object.entries(configurations)) {
      if (key in ['notesDescription', 'sumologicQuery']) {
        let existingInsight = await Configuration.findOne({ key });

        if (existingInsight) {
          existingInsight.content = content as string;
          await existingInsight.save();
          savedConfigurations.push(existingInsight);
        } else {
          const newInsight = new Configuration({ key, content });
          await newInsight.save();
          savedConfigurations.push(newInsight);
        }
      } else if (key === 'alertConfig') {
        let existingInsight = await Configuration.findOne({ key });
        
        if (existingInsight) {
          existingInsight.content = content as Record<string, any>;
          await existingInsight.save();
          savedConfigurations.push(existingInsight);
        } else {
          const newInsight = new Configuration({ key, content });
          await newInsight.save();
          savedConfigurations.push(newInsight);
        }
      } else if (key === 'selectedApiColors') {
        // Handle updating API endpoint colors
        for (const [apiEndpoint, color] of Object.entries(content as Record<string, string>)) {
          let existingEndpoint = await ApiAnalysisEndpointClassification.findOne({ api_endpoint: apiEndpoint });
          
          if (existingEndpoint) {
            existingEndpoint.classification_color = color;
            await existingEndpoint.save();
          } else {
            const newEndpoint = new ApiAnalysisEndpointClassification({ 
              api_endpoint: apiEndpoint, 
              classification_color: color 
            });
            await newEndpoint.save();
          }
        }
        
        // Also save the selection to Configuration for persistence
        let existingInsight = await Configuration.findOne({ key });
        if (existingInsight) {
          existingInsight.content = JSON.stringify(content);
          await existingInsight.save();
          savedConfigurations.push(existingInsight);
        } else {
          const newInsight = new Configuration({ key, content: JSON.stringify(content) });
          await newInsight.save();
          savedConfigurations.push(newInsight);
        }
      }
    }

    res.status(201).send(savedConfigurations);
  } catch (error) {
    res.status(400).send(error);
  }
};

export const getConfigureInsight: RequestHandler = async (req: Request, res: Response) => {
  try {
    const configurations = await Configuration.find({});
    res.status(200).json(configurations);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching configurations' });
  }
};

export const getAllApiEndpoints: RequestHandler = async (req: Request, res: Response) => {
  try {
    const apiEndpointDocs = await ApiAnalysisEndpointClassification.find({});
    const apiEndpoints = apiEndpointDocs.map(doc => ({
      api_endpoint: doc.api_endpoint,
      classification_color: doc.classification_color
    }));
    res.status(200).json(apiEndpoints);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching API endpoints' });
  }
};

export default {
  getSumoApiLogs,
  configureInsights,
  getConfigureInsight,
  getAllApiEndpoints
};
