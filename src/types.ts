import { Document } from "mongoose";

export type ApiAnalysisModel = Document & {
  created: Date;
  date: Date;
  api_endpoint?: string; // Optional field
  count?: number; // Optional field
  avg_p_time?: string; // Optional field
};

export type ApiAnalysisTableColumns = {
  created: string;
  date: string;
  api_endpoint: string;
  count: string;
  avg_p_time: string;
};

export type ApiAnalysisEndpointClassificationModel = Document & {
  created: Date;
  api_endpoint: string;
  classification_color: string;
  classification_data: string;
};

export type ApiAnalysisEndpointClassificationTableColumns = {
  created: string;
  api_endpoint: string;
  classification_color: string;
  classification_data: string;
};

export type InsightApiLogsResponse = {
  id: number;
  date: string | null;
  api_endpoint: string | null;
  count: string | null;
  avg_p_time: string | null;
};

export type AlertConfiguration = {
  emails?: string[];
  phoneNumbers?: string[];
  conditions?: AlertCondition[];
}

export type AlertCondition = {
  api: string;
  metricType: string;
  operator: string;
  thresholdValue: string;
  alertPriority: string;
  alertType: string;
}