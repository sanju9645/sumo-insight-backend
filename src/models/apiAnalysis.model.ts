import mongoose, { Schema, Document } from "mongoose";

import { apiAnalysisTableName } from '../utils/envUtils';
import { apiAnalysisTableColumns } from '../utils/utils';
import { ApiAnalysisModel } from "../types";

const columns = apiAnalysisTableColumns();

// Create the schema for the ApiAnalysis collection
const ApiAnalysisSchema: Schema = new Schema<ApiAnalysisModel>({
  [columns.created]: {
    type: Date,
    default: Date.now, // Default to current timestamp
    required: true,
    immutable: true,
  },
  [columns.date]: {
    type: Date,
    required: true,
  },
  [columns.api_endpoint]: {
    type: String,
    maxlength: 255,
  },
  [columns.count]: {
    type: Number,
    min: 0, // Optional: Enforce non-negative count
  },
  [columns.avg_p_time]: {
    type: String,
    maxlength: 40,
  },
});

// Add indexes for optimized queries
ApiAnalysisSchema.index({ [columns.date]: 1 });
ApiAnalysisSchema.index({ [columns.api_endpoint]: 1 });
ApiAnalysisSchema.index({ [columns.count]: 1 });
ApiAnalysisSchema.index({ [columns.avg_p_time]: 1 });
ApiAnalysisSchema.index({ [columns.date]: 1, [columns.api_endpoint]: 1 });
ApiAnalysisSchema.index({ [columns.date]: 1, [columns.avg_p_time]: 1 });
ApiAnalysisSchema.index({ [columns.date]: 1, [columns.count]: 1 });

// Export the model
const ApiAnalysis = mongoose.model<ApiAnalysisModel>(apiAnalysisTableName(), ApiAnalysisSchema);

export default ApiAnalysis;
