import mongoose from 'mongoose';
import moment from 'moment-timezone';
import fetch from 'node-fetch';
import yargs from 'yargs';
import dotenv from 'dotenv';

// Import the existing model and utilities
import ApiAnalysis from '../models/apiAnalysis.model';
import { apiAnalysisTableColumns } from '../utils/utils';
import { connectMongoDb } from "../config/mongodb";
import getConfigurationAsJson from '../ops/configuration';
import ApiAnalysisEndpointClassification from '../models/ApiEndpointClassification';
import { apiAnalysisEndpointClassificationTableColumns } from '../utils/utils';
import Configuration from '../models/configuration.model';
import {AlertCondition, AlertConfiguration } from "../types";
import { sendMail } from '../config/smtp';
import { InferenceClient } from "@huggingface/inference";
import OpenAI from 'openai';

dotenv.config();

const client = new InferenceClient(process.env.HUGGINGFACE_API_KEY);

interface HuggingFaceResponse {
    generated_text?: string;
    error?: string;
    text?: string;
    summary_text?: string;
}

async function main() {
    try {
        // Initialize database connection
        await connectMongoDb();
        
        console.log('Test script started');
        
        const testFunction = async () => {
            console.log('Starting email test...');
            const input = `Write a short and crisp API performance alert email body (no subject or footer, no greetings or sign-offs) for the following situation:
API Endpoint: api/message/send  
Metric Type: Request Count  
Current Value: 117483  
Threshold: 8  
Condition: exceeds  
            
Format:
Return a JSON object with two keys:
1. "plain": Plaintext version using concise bullet points
2. "html": HTML and CSS version styled for readability using bullet points

Do not include subject line, greeting, sign-off, or footer. Keep it brief, direct, and professional.
Ensure the value of 'content' is valid JSON, not just a JSON-like string. Only return the JSON object and the object should have only two keys 1. plain and 2. html. the value of plain key should be a text string and the value of the html key should be a html formatted string.`;
            
            // const chatCompletion = await client.chatCompletion({
            //     model: "mistralai/Mistral-7B-Instruct-v0.2",
            //     messages: [
            //         {
            //             role: "user",
            //             content: input,
            //         },
            //     ],
            // });

            // console.log(chatCompletion.choices[0].message);
            // const content = chatCompletion.choices[0].message.content;
            // console.log('Raw content:', content);

            // if (!content) throw new Error('No content received from chat completion');
            
            // try {
            //     const cleanedContent = content.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
            //     const parsedContent = JSON.parse(cleanedContent);
            //     console.log(parsedContent.plain);
            //     console.log(parsedContent.html);
            // } catch (error) {
            //     console.error('Failed to parse JSON:', error);
            //     console.error('Content that failed to parse:', content);
            //     throw error;
            // }

            const openai = new OpenAI({
                apiKey: process.env.OPEN_AI_KEY
            });

            const response = await openai.responses.create({
                model: "gpt-4.1",
                input: "Tell me a three sentence bedtime story about a unicorn."
            });

            console.log(response);

            
            // const stream = await openai.responses.create({
            //     model: 'gpt-4o',
            //     input: 'Say "Sheep sleep deep" ten times fast!',
            //     stream: true,
            //   });
              
            //   for await (const event of stream) {
            //     console.log(event);
            //   }
        };

        await testFunction();
    } catch (error) {
        console.error('Error in test script:', error);
    } finally {
        // Close database connection
        await mongoose.connection.close();
        process.exit(0);
    }
}

// Run the main function
main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
});


// npx ts-node src/tools/san-test.ts
// npm run san-test