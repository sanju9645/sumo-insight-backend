import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !twilioPhoneNumber) {
    throw new Error('Missing required Twilio environment variables');
}

const client = twilio(accountSid, authToken);

export async function makeVoiceCall(targetPhoneNumbers: string | string[], message: string): Promise<string[]> {
  try {
    const numbers = Array.isArray(targetPhoneNumbers) ? targetPhoneNumbers : [targetPhoneNumbers];
    const calls = await Promise.all(
      numbers.map(number => 
        client.calls.create({
          to: number,
          from: twilioPhoneNumber as string,
          twiml: `<Response><Say voice="Polly.Raveena">${message}</Say><Hangup/></Response>`
        })
      )
    );

    return calls.map(call => call.sid);
  } catch (error) {
    console.error('Error making voice call:', error);
    throw error;
  }
}