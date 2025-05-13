
# 🧠 Backend Setup Guide

This guide outlines the steps to set up, configure, and deploy the backend for your project.

---

## ⚙️ Initialization

```bash
npm init -y
```

---

## 📦 Install Dependencies

### ✅ Production Dependencies

```bash
npm i @huggingface/inference @types/nodemailer @types/twilio cors csv-parser dotenv express express-oauth2-jwt-bearer express-validator fs jsonwebtoken moment-timezone mongoose mysql2 node-fetch nodemailer openai twilio yargs
```

### 🧪 Development Dependencies

```bash
npm i ts-node typescript nodemon @types/express @types/cors @types/node @types/jsonwebtoken @types/yargs --save-dev
```

---

## 🛠️ Environment Configuration

> Create a `.env` file in the root of your project and add the following variables:

```env
# 🌐 Server
PORT=3000
NODE_ENV=development

# 💾 Database (Choose your type: MongoDB or MySQL)
DATABASE_TYPE=MongoDB

# 🐬 MySQL Configuration
DB_HOST=localhost
DB_USER=<db-user>
DB_PASSWORD=<db-password>
DB_NAME=<db-name>

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

---

## 🧱 TypeScript Configuration

1. Initialize the TypeScript project:

```bash
npx tsc --init
```

2. Create a `src` folder and add a `server.ts` file.

3. Update your `package.json`:

```json
"main": "./src/server.ts",
"scripts": {
  "dev": "nodemon",
  "build": "npm install && npx tsc",
  "start": "node dist/server.js"
}
```

4. Run the dev server:

```bash
npm run dev
```

5. ✅ **Verify the server is running** by visiting:

```http
http://localhost:3000/health
```

6. Modify `tsconfig.json`:

```json
{
  "compilerOptions": {
    "outDir": "./dist",
    "target": "es2016",
    "module": "commonjs",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true
  }
}
```

---

## 🍃 MongoDB Setup

1. Log in as `burnbitbistro` on [MongoDB](https://www.mongodb.com/).
2. Create a **project** and **database**.
3. Add the connection string to your `.env` file:

```env
MONGODB_CONNECTION_STRING=mongodb+srv://sumo-insight:<db_password>@cluster0.exx36.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

---

## 🐬 MySQL Setup

1. Log in as root.

2. Create database:

```sql
CREATE DATABASE sumo_insight;
```

3. Create user:

```sql
CREATE USER 'insight_user'@'localhost' IDENTIFIED BY '<password>';
```

4. Grant access:

```sql
GRANT ALL PRIVILEGES ON sumo_insight.* TO 'insight_user'@'localhost';
FLUSH PRIVILEGES;
```

5. Add this to your `.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=your_database_name
```

---

## 🔐 Auth0 Setup

1. Log in as `burnbitbistro` on [Auth0 Dashboard](https://manage.auth0.com/dashboard/us/dev-in32qce5nywlled2/applications).

2. Create an app under `Applications > Create Application`:

   * Type: Single Page Web App
   * Name: `sumo-insight`
   * Callback & Logout URLs: `http://localhost:5173`

3. Save and update settings:

   * Allowed Web Origins: `http://localhost:5173`

4. Create an API under `Applications > APIs > Create API`.

5. Install required packages:

```bash
npm i express-oauth2-jwt-bearer jsonwebtoken express-validator
npm i @types/jsonwebtoken --save-dev
```

6. Update `.env`:

```env
AUTH0_AUDIENCE=forkin-good
AUTH0_ISSUER_BASE_URL=https://dev-{domain}.com/
```

---

## 📁 Upload Sample API Logs

1. Install required packages:

```bash
npm i fs csv-parser
```

2. Run the upload command:

```bash
npm run upload-sample-api-logs
```

---


## 🧩 Sumo Logic Processor Setup

This section describes how to process logs via CLI or automate them using crontab.

### 🛠️ Environment Configuration

```bash
Create a .env file in the root of your project and add the following variables:
```

```env
# Sumo Logic Configuration
SUMO_BASE_URL=<sumo-base-url>
SUMO_ACCESS_ID=<sumo-access-id>
SUMO_ACCESS_KEY=<sumo-access-key>
```

### ▶️ Running the Log Processor

#### 🔁 Process logs for **current date**

```bash
npm run process-logs
```

#### 📅 Process logs for a **specific date**

```bash
npm run process-logs -- -d 2025-04-20
```

#### 📆 Process logs for a **date range**

```bash
npm run process-logs -- -s 2024-04-10 -e 2024-04-23
```

### ⏱️ Crontab Setup

To run the log processor daily at midnight, add the following to your crontab:

```bash
0 0 * * * /path/to/node /path/to/project/node_modules/.bin/ts-node /path/to/sumologic-log-processor.ts
```

> 📝 Replace `/path/to/` with the actual path to your Node.js, project directory, and script.

---

## 🧪 Test Script

Use the test script to validate or experiment with features quickly.

#### ▶️ Run test script using `npx`

```bash
npx ts-node src/tools/san-test.ts
```

#### ▶️ Or run with npm

```bash
npm run san-test
```
