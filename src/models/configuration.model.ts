import mongoose, { Document, Schema } from 'mongoose';

import { apiAnalysisConfigurationTableName } from '../utils/envUtils';

interface Configuration extends Document {
  key: string;
  content: string | Record<string, any>;
}

const ConfigurationSchema: Schema = new Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  content: {
    type: Schema.Types.Mixed,
    required: true
  }
});

export default mongoose.model<Configuration>(apiAnalysisConfigurationTableName(), ConfigurationSchema);
