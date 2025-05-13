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
    // return process.env.API_ANALYSIS_TABLE_NAME_PROD || 'api_analysis_prod';
    return process.env.API_ANALYSIS_TABLE_NAME_DEV || 'api_analysis_dev';
  } else {
    // Return the development table name
    return process.env.API_ANALYSIS_TABLE_NAME_DEV || 'api_analysis_dev';
  }
};

// Function to get the API analysis endpoint classification table name based on the environment
export const apiAnalysisEndpointClassificationTableName = (): string => {
  if (isProd()) {
    // return process.env.API_ANALYSIS_ENDPOINT_CLASSIFICATION_TABLE_NAME_PROD || 'api_analysis_endpoint_classification_prod';
    return process.env.API_ANALYSIS_ENDPOINT_CLASSIFICATION_TABLE_NAME_DEV || 'api_analysis_endpoint_classification_dev';
  } else {
    return process.env.API_ANALYSIS_ENDPOINT_CLASSIFICATION_TABLE_NAME_DEV || 'api_analysis_endpoint_classification_dev';
  }
};

export const apiAnalysisConfigurationTableName = (): string => {
  if (isProd()) {
    // return process.env.API_ANALYSIS_CONFIGURATION_TABLE_NAME_PROD || 'api_analysis_configuration_prod';
    return process.env.API_ANALYSIS_CONFIGURATION_TABLE_NAME_DEV || 'api_analysis_configuration_dev';
  } else {
    return process.env.API_ANALYSIS_CONFIGURATION_TABLE_NAME_DEV || 'api_analysis_configuration_dev';
  }
};
