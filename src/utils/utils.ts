import { ApiAnalysisTableColumns, ApiAnalysisEndpointClassificationTableColumns } from '../types';
import dotenv from 'dotenv';

dotenv.config();

export const apiAnalysisTableColumns = (): ApiAnalysisTableColumns => ({
  created: 'created',
  date: 'date',
  api_endpoint: 'api_endpoint',
  count: 'count',
  avg_p_time: 'avg_p_time'
} as const);

export const apiAnalysisEndpointClassificationTableColumns = (): ApiAnalysisEndpointClassificationTableColumns => ({
  created: 'created',
  api_endpoint: 'api_endpoint',
  classification_color: 'classification_color',
  classification_data: 'classification_data',
} as const);

const map: Record<string, string> = JSON.parse(process.env.API_REWRITE_MAP || '{}');

/**
 * Rewrites words in the given API endpoint using the rewrite map.
 * It handles plural forms like "messages" => "smss".
 */
export function rewriteApiEndpoint(apiEndpoint: string): string {
  return apiEndpoint
    .split('/')
    .map(part => {
      const singular = map[part];
      if (singular) return singular;

      // Check for plural form
      const isPlural = part.endsWith('s');
      const baseWord = isPlural ? part.slice(0, -1) : part;
      const pluralReplacement = map[baseWord];

      if (isPlural && pluralReplacement) return pluralReplacement + 's';

      return part;
    })
    .join('/');
}
