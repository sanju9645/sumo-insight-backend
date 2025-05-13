import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Function to check if the environment is production
export const isProd = (): boolean => {
  return process.env.NODE_ENV === 'production';
};

// Function to get the API analysis table name based on the environment
export const apiAnalysisTableName = (): string => {
  if (isProd()) {
    // Return the production table name
    return process.env.API_ANALYSIS_TABLE_NAME_PROD || 'api_analysis_prod';
  } else {
    // Return the development table name
    // return process.env.API_ANALYSIS_TABLE_NAME_DEV || 'api_analysis_dev';
    return process.env.API_ANALYSIS_TABLE_NAME_PROD || 'api_analysis_prod';
  }
};

// Function to get the API analysis endpoint classification table name based on the environment
export const apiAnalysisEndpointClassificationTableName = (): string => {
  if (isProd()) {
    return process.env.API_ANALYSIS_ENDPOINT_CLASSIFICATION_TABLE_NAME_PROD || 'api_analysis_endpoint_classification_prod';
  } else {
    // return process.env.API_ANALYSIS_ENDPOINT_CLASSIFICATION_TABLE_NAME_DEV || 'api_analysis_endpoint_classification_dev';
    return process.env.API_ANALYSIS_ENDPOINT_CLASSIFICATION_TABLE_NAME_PROD || 'api_analysis_endpoint_classification_prod';
  }
};
