# sumo-insight-backend
Turning raw API data into actionable intelligence. Processing, refining, and serving insight — the engine behind the intelligence


---

## 🚀 Deployment

### 1. Update `tsconfig.json`

Ensure your `tsconfig.json` contains the following configuration:

```json
{
  "compilerOptions": {
    "outDir": "./dist",
    ...
  }
}
```

---

### 2. Update `package.json` Scripts

Make sure your `package.json` includes the following scripts:

```json
"scripts": {
  "dev": "nodemon",
  "build": "npm install && npx tsc",
  "start": "node dist/server.js",
  ...
}
```

---

### 3. Build the Project

```bash
npm run build
```

This will compile the TypeScript files and create a `dist` folder.

---

### 4. Start the Server

```bash
npm start
```

Your server should now be running on **port 3000**.

---

### 5. Deploy on [Render](https://render.com)

1. Go to [render.com](https://render.com)
2. Click on **"New Web Service"**
3. Connect your GitHub repository
4. Fill in the details:

   * **Name:** `sumo-insight-backend`
   * **Project:** `Sumo Insight`
   * **Language:** `Node`
   * **Branch:** `Production`
   * **Region:** `Oregon (US West)`
   * **Root Directory (Optional):** leave blank
   * **Build Command:** `npm run build`
   * **Start Command:** `npm start`
5. **Add Environment Variables** as required

---


## 🛠️ Environment Configuration

> Create a `.env` file in the root of your project and add the following variables:

```env
# 🌐 Server
PORT=3000
NODE_ENV=development


# 🍃 MongoDB Configuration
MONGODB_CONNECTION_STRING=<mongodb-connection-string>

# 🔐 Auth0
AUTH0_AUDIENCE=<auth0-audience>
AUTH0_ISSUER_BASE_URL=<auth0-issuer-base-url>

# 📊 API Analysis Tables
API_ANALYSIS_TABLE_NAME_DEV=<api-analysis-table-name-dev>
API_ANALYSIS_TABLE_NAME_PROD=<api-analysis-table-name-prod>
API_ANALYSIS_ENDPOINT_CLASSIFICATION_TABLE_NAME_DEV=<api-analysis-endpoint-classification-table-name-dev>
API_ANALYSIS_ENDPOINT_CLASSIFICATION_TABLE_NAME_PROD=<api-analysis-endpoint-classification-table-name-prod>

# 👥 Admin Access
ADMIN_EMAILS=<admin-emails>

# 📈 Sumo Logic
SUMO_BASE_URL=<sumo-base-url>
SUMO_ACCESS_ID=<sumo-access-id>
SUMO_ACCESS_KEY=<sumo-access-key>

# 📬 Google Mailer
SMTP_USER=<smtp-user>
SMTP_PASS=<smtp-pass>

# 🤗 Hugging Face
HUGGINGFACE_API_KEY=<huggingface-api-key>
HUGGINGFACE_MODEL=<huggingface-model>

# 📞 Twilio
TWILIO_ACCOUNT_SID=<twilio-account-sid>
TWILIO_AUTH_TOKEN=<twilio-auth-token>
TWILIO_PHONE_NUMBER=<twilio-phone-number>

# 🛡️ API Masking
API_REWRITE_MAP=<json-api-rewrite-map>

# 🔍 DeepSeek
DEEP_SEEK_API_KEY=<deepseek-api-key>
DEEP_SEEK_URL=<deepseek-url>

# 🧠 OpenAI
OPEN_AI_KEY=<openai-key>
```
