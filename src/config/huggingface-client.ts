import { InferenceClient } from "@huggingface/inference";

interface HuggingFaceResponse {
  plain: string;
  html: string;
}

/**
 * Calls the Hugging Face API to generate content
 */
export async function callHuggingFaceAPI(prompt: string): Promise<HuggingFaceResponse> {
  if (!process.env.HUGGINGFACE_API_KEY) {
    console.warn('Hugging Face API key not configured, using fallback content');
    throw new Error('Hugging Face API key not configured');
  }

  try {
    const client = new InferenceClient(process.env.HUGGINGFACE_API_KEY);
    
    const response = await client.chatCompletion({
      model: process.env.HUGGINGFACE_MODEL,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });
    const content = response.choices[0].message.content;

    if (!content) {
      console.error(`Hugging Face API error: ${content}`);
      throw new Error(`Hugging Face API error: ${content}`);
    }

    try {
      const cleanedContent = content.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
      return JSON.parse(cleanedContent);
    } catch (error) {
      console.error('Failed to parse JSON:', error);
      console.error('Content that failed to parse:', content);
      throw error;
    }
  } catch (error) {
    console.error('Failed to call Hugging Face API:', error);
    throw error;
  }
} 