import { callHuggingFaceAPI } from '../config/huggingface-client';
import { generateDeepSeekContent } from '../config/deepseek-client';

interface ApiPerformanceData {
  apiPath: string;
  currentValue: number;
  threshold: number;
  metricType: string;
  operator: string;
  historicalData?: {
    previousDayValue: number;
    weeklyAverage: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
}

export class EmailContentGenerator {
  /**
   * Generates email content for an API alert using AI
   */
  public static async generateAlertContent(
    apiPath: string,
    metricType: string,
    value: number,
    threshold: number,
    operator: string,
    historicalData?: {
      previousDayValue: number;
      weeklyAverage: number;
      trend: 'increasing' | 'decreasing' | 'stable';
    }
  ): Promise<{ html: string; plain: string }> {
    const prompt = this.createPrompt({
      apiPath,
      currentValue: value,
      threshold,
      metricType,
      operator,
      historicalData
    });
    
    try {
      const response = await generateDeepSeekContent(prompt);
      const content = await callHuggingFaceAPI(prompt);
      return {
        html: this.formatEmailContent(content.html, apiPath, metricType, value, threshold, operator, historicalData),
        plain: content.plain
      };
    } catch (error) {
      console.error('Error generating email content:', error);
      return this.generateFallbackContent(apiPath, metricType, value, threshold, operator, historicalData);
    }
  }

  /**
   * Creates a prompt for the AI model
   */
  private static createPrompt(data: ApiPerformanceData): string {
    const metricDescription = data.metricType === 'PTime' ? 'Processing Time' : 'Request Count';
    const operatorDescription = this.getOperatorDescription(data.operator);
    let prompt = `Write a short and crisp API performance alert email body (no subject or footer, no greetings or sign-offs) for the following situation:
API Endpoint: ${data.apiPath}  
Metric Type: ${metricDescription}  
Current Value: ${data.currentValue}  
Threshold: ${data.threshold}  
Condition: ${operatorDescription}`;

    if (data.historicalData) {
      prompt += `
Historical Context:
- Previous Day Value: ${data.historicalData.previousDayValue}
- Weekly Average: ${data.historicalData.weeklyAverage}
- Trend: ${data.historicalData.trend}`;
    }

    prompt += `   
Format:
Return a JSON object with two keys:
1. "plain": Plaintext version using concise bullet points
2. "html": HTML and CSS version styled for readability using bullet points

Do not include subject line, greeting, sign-off, or footer. Keep it brief, direct, and professional.
Ensure the value of 'content' is valid JSON, not just a JSON-like string. Only return the JSON object and the object should have only two keys 1. plain and 2. html. the value of plain key should be a text string and the value of the html key should be a html formatted string.`;

    return prompt;
  }

  /**
   * Formats the AI-generated content into a proper email format
   */
  private static formatEmailContent(
    content: string,
    apiPath: string,
    metricType: string,
    value: number,
    threshold: number,
    operator: string,
    historicalData?: {
      previousDayValue: number;
      weeklyAverage: number;
      trend: 'increasing' | 'decreasing' | 'stable';
    }
  ): string {
    const metricDescription = metricType === 'PTime' ? 'Processing Time' : 'Request Count';
    const operatorDescription = this.getOperatorDescription(operator);

    return `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <p>Dear Team,</p>

  <div style="margin: 20px 0;">
    ${content}
  </div>

  <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
    <h3 style="color: #007bff; margin-top: 0;">Technical Details:</h3>
    <ul style="list-style-type: none; padding-left: 0;">
      <li style="margin-bottom: 8px;"><strong>API Endpoint:</strong> ${apiPath}</li>
      <li style="margin-bottom: 8px;"><strong>Metric Type:</strong> ${metricDescription}</li>
      <li style="margin-bottom: 8px;"><strong>Current Value:</strong> ${value}</li>
      <li style="margin-bottom: 8px;"><strong>Threshold:</strong> ${threshold}</li>
      <li style="margin-bottom: 8px;"><strong>Condition:</strong> ${operatorDescription}</li>
      ${historicalData ? `
      <li style="margin-bottom: 8px;"><strong>Previous Day Value:</strong> ${historicalData.previousDayValue}</li>
      <li style="margin-bottom: 8px;"><strong>Weekly Average:</strong> ${historicalData.weeklyAverage}</li>
      <li style="margin-bottom: 8px;"><strong>Trend:</strong> ${historicalData.trend}</li>
      ` : ''}
    </ul>
  </div>

  <p>Best regards,<br>
  <strong>Sumo Insight Monitoring System</strong></p>
</div>
    `.trim();
  }

  /**
   * Generates fallback content in case AI generation fails
   */
  private static generateFallbackContent(
    apiPath: string,
    metricType: string,
    value: number,
    threshold: number,
    operator: string,
    historicalData?: {
      previousDayValue: number;
      weeklyAverage: number;
      trend: 'increasing' | 'decreasing' | 'stable';
    }
  ): { plain: string; html: string } {
    const metricDescription = metricType === 'PTime' ? 'Processing Time' : 'Request Count';
    const operatorDescription = this.getOperatorDescription(operator);

    const plainContent = `ALERT: API Endpoint ${apiPath} has crossed its threshold.
Details:
- Metric Type: ${metricDescription}
- Current Value: ${value}
- Threshold: ${threshold}
- Condition: ${operatorDescription}
${historicalData ? `
Historical Data:
- Previous Day Value: ${historicalData.previousDayValue}
- Weekly Average: ${historicalData.weeklyAverage}
- Trend: ${historicalData.trend}` : ''}

Recommended Actions:
1. Review the API endpoint's recent performance
2. Check for any recent changes or deployments
3. Monitor the endpoint for further anomalies
4. Consider scaling if the trend continues

Please investigate this issue promptly.`;

    const htmlContent = `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <p>Dear Team,</p>

  <p>This is an automated alert from the Sumo Insight Monitoring System.</p>

  <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
    <h3 style="color: #856404; margin-top: 0;">ALERT: API Endpoint ${apiPath} has crossed its threshold.</h3>
  </div>

  <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
    <h3 style="color: #007bff; margin-top: 0;">Details:</h3>
    <ul style="list-style-type: none; padding-left: 0;">
      <li style="margin-bottom: 8px;"><strong>Metric Type:</strong> ${metricDescription}</li>
      <li style="margin-bottom: 8px;"><strong>Current Value:</strong> ${value}</li>
      <li style="margin-bottom: 8px;"><strong>Threshold:</strong> ${threshold}</li>
      <li style="margin-bottom: 8px;"><strong>Condition:</strong> ${operatorDescription}</li>
      ${historicalData ? `
      <li style="margin-bottom: 8px;"><strong>Previous Day Value:</strong> ${historicalData.previousDayValue}</li>
      <li style="margin-bottom: 8px;"><strong>Weekly Average:</strong> ${historicalData.weeklyAverage}</li>
      <li style="margin-bottom: 8px;"><strong>Trend:</strong> ${historicalData.trend}</li>
      ` : ''}
    </ul>
  </div>

  <div style="background-color: #e8f4f8; padding: 15px; border-left: 4px solid #17a2b8; margin: 20px 0;">
    <h3 style="color: #17a2b8; margin-top: 0;">Recommended Actions:</h3>
    <ol style="padding-left: 20px;">
      <li style="margin-bottom: 8px;">Review the API endpoint's recent performance</li>
      <li style="margin-bottom: 8px;">Check for any recent changes or deployments</li>
      <li style="margin-bottom: 8px;">Monitor the endpoint for further anomalies</li>
      <li style="margin-bottom: 8px;">Consider scaling if the trend continues</li>
    </ol>
  </div>

  <p>Please investigate this issue promptly.</p>

  <p>Best regards,<br>
  <strong>Sumo Insight Monitoring System</strong></p>
</div>`.trim();

    return { plain: plainContent, html: htmlContent };
  }

  /**
   * Converts operator symbols to human-readable descriptions
   */
  private static getOperatorDescription(operator: string): string {
    switch (operator) {
      case '>': return 'exceeds';
      case '>=': return 'exceeds or equals';
      case '<': return 'is below';
      case '<=': return 'is below or equals';
      case '==': return 'equals';
      case '!=': return 'does not equal';
      default: return operator;
    }
  }
} 


// const emailContent = await EmailContentGenerator.generateAlertContent(
//   apiPath,
//   metricType,
//   currentValue,
//   threshold,
//   operator,
//   {
//     previousDayValue: yesterdayValue,
//     weeklyAverage: weeklyAvg,
//     trend: 'increasing' // or 'decreasing' or 'stable'
//   }
// );