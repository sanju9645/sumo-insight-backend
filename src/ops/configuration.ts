import Configuration from '../models/configuration.model';

async function getConfigurationAsJson(): Promise<{ [key: string]: any }> {
  try {
    const configurations = await Configuration.find({});
    const configJson: { [key: string]: any } = {};

    configurations.forEach((config) => {
      configJson[config.key] = config.content;
    });

    return configJson;
  } catch (error) {
    console.error('Error fetching configurations:', error);
    throw error;
  }
}

export default getConfigurationAsJson;