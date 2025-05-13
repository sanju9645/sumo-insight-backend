import mongoose, { Schema, Document } from "mongoose";

import { apiAnalysisEndpointClassificationTableName } from '../utils/envUtils';
import { apiAnalysisEndpointClassificationTableColumns } from '../utils/utils';
import { ApiAnalysisEndpointClassificationModel } from "../types";

const columns = apiAnalysisEndpointClassificationTableColumns();

const ApiAnalysisEndpointClassificationSchema: Schema = new Schema<ApiAnalysisEndpointClassificationModel>({
  [columns.created]: {
    type: Date,
    default: Date.now,
    required: true,
    immutable: true,
  },
  [columns.api_endpoint]: {
    type: String,
    maxlength: 255,
    required: true,
    unique: true,
  },
  [columns.classification_color]: {
    type: String,
    maxlength: 50,
  },
  [columns.classification_data]: {
    type: mongoose.Schema.Types.Mixed,
  },
});

ApiAnalysisEndpointClassificationSchema.index({ [columns.created]: 1 });
ApiAnalysisEndpointClassificationSchema.index({ [columns.api_endpoint]: 1 }, { unique: true });
ApiAnalysisEndpointClassificationSchema.index({ [columns.classification_color]: 1 });

const ApiAnalysisEndpointClassification = mongoose.model<ApiAnalysisEndpointClassificationModel>(
  apiAnalysisEndpointClassificationTableName(), 
  ApiAnalysisEndpointClassificationSchema
);

export default ApiAnalysisEndpointClassification;