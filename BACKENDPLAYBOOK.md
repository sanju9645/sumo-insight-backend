
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
npm i @huggingface/inference @types/nodemailer @types/twilio cors csv-parser dotenv express express-oauth2-jwt-bearer express-validator fs jsonwebtoken moment-timezone mongoose node-fetch nodemailer openai twilio yargs
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


---
**Complete code and step-by-step guide** to Dockerize your `sumo-insight-backend` project for both **development** and **production** environments.

---

## ✅ Project: `sumo-insight-backend`

### 📁 Final Directory Structure:

```
sumo-insight-backend/
├── src/                       # Your TypeScript source code
├── dist/                      # Compiled JS (output from `tsc`)
├── .env                       # Environment variables
├── .dockerignore
├── Dockerfile                 # For Production
├── Dockerfile.dev             # For Development
├── docker-compose.yml         # For Production
├── docker-compose.dev.yml     # For Development
├── package.json
├── tsconfig.json
└── README.md
```

---

## ⚙️ 1. Create `.env` file

Place this at the root of your backend repo (`sumo-insight-backend/.env`):

```env
PORT=3000
NODE_ENV=development

MONGODB_CONNECTION_STRING=<your-mongodb-uri>

AUTH0_AUDIENCE=<your-auth0-audience>
AUTH0_ISSUER_BASE_URL=<your-auth0-issuer>

API_ANALYSIS_TABLE_NAME_DEV=<value>
API_ANALYSIS_TABLE_NAME_PROD=<value>
API_ANALYSIS_ENDPOINT_CLASSIFICATION_TABLE_NAME_DEV=<value>
API_ANALYSIS_ENDPOINT_CLASSIFICATION_TABLE_NAME_PROD=<value>

ADMIN_EMAILS=<emails>

SUMO_BASE_URL=<url>
SUMO_ACCESS_ID=<id>
SUMO_ACCESS_KEY=<key>

SMTP_USER=<email>
SMTP_PASS=<pass>

HUGGINGFACE_API_KEY=<key>
HUGGINGFACE_MODEL=<model>

TWILIO_ACCOUNT_SID=<sid>
TWILIO_AUTH_TOKEN=<token>
TWILIO_PHONE_NUMBER=<phone>

API_REWRITE_MAP=<json-string>

DEEP_SEEK_API_KEY=<key>
DEEP_SEEK_URL=<url>

OPEN_AI_KEY=<openai-key>
```

---

## 🐳 2. `.dockerignore`

```dockerignore
node_modules
dist
.env
```

---

## 📦 3. `Dockerfile` (Production)

```Dockerfile
# Production Dockerfile

FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

RUN npm run build

CMD ["node", "dist/server.js"]
```

---

## 🛠️ 4. `Dockerfile.dev` (Development)

```Dockerfile
# Development Dockerfile

FROM node:20

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

# For live-reloading
RUN npm install -g nodemon

COPY . .

CMD ["npm", "run", "dev"]
```

---

## 🐳 5. `docker-compose.yml` (Production)

```yaml
version: '3.8'

services:
  backend:
    container_name: sumo-backend-prod
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    env_file:
      - .env
    restart: always
```

---

## 🐳 6. `docker-compose.dev.yml` (Development)

```yaml
version: '3.8'

services:
  backend:
    container_name: sumo-backend-dev
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - .:/usr/src/app
      - /usr/src/app/node_modules
    env_file:
      - .env
    command: npm run dev
```

---

## 🏁 7. How to Use It

### ➤ Development (with hot reload):

```bash
docker-compose -f docker-compose.dev.yml up --build
```

### ➤ Production (build and run):

```bash
docker-compose up --build
```

---

## 🚢 8. Build & Push Production Image to Docker Hub

### Step 1: Build image

```bash
docker build -t your-dockerhub-username/sumo-insight-backend .
```

### Step 2: Push to Docker Hub

```bash
docker push your-dockerhub-username/sumo-insight-backend
```

---

## 📥 9. Deploy on Any Server (or Render)

```bash
# Pull image from Docker Hub
docker pull your-dockerhub-username/sumo-insight-backend

# Run the container
docker run -d -p 3000:3000 --env-file .env your-dockerhub-username/sumo-insight-backend
```

Or you can deploy on **Render**:

* Set up a new **Web Service**
* Use your DockerHub repo URL
* Add your `.env` variables in Render UI
* Set port to `3000`
* Set start command: `node dist/server.js`

---

## 👥 Volumes in Cross-Platform Dev

In `docker-compose.dev.yml`, this line handles platform-neutral volumes:

```yaml
volumes:
  - .:/usr/src/app
  - /usr/src/app/node_modules
```

---


---

## Example README Overview for Your Docker Hub Repo

---

# Sumo Insight Backend Docker Image

This Docker image contains the backend service for **Sumo Insight**.
Use this image to run the backend in **development** or **production** environments easily.

---

### 🚀 How to Pull the Image

```bash
docker pull your-dockerhub-username/sumo-insight-backend:latest
```

---

### ⚙️ Environment Variables (.env file)

Create a `.env` file on your host machine with the following required variables:

```env
PORT=3000

MONGODB_CONNECTION_STRING=<your-mongodb-connection-string>

AUTH0_AUDIENCE=<your-auth0-audience>
AUTH0_ISSUER_BASE_URL=<your-auth0-issuer-base-url>

API_ANALYSIS_TABLE_NAME_DEV=<your-dev-api-analysis-table-name>
API_ANALYSIS_TABLE_NAME_PROD=<your-prod-api-analysis-table-name>

ADMIN_EMAILS=<comma-separated-admin-emails>

SUMO_BASE_URL=<your-sumo-base-url>
SUMO_ACCESS_ID=<your-sumo-access-id>
SUMO_ACCESS_KEY=<your-sumo-access-key>

SMTP_USER=<your-smtp-user>
SMTP_PASS=<your-smtp-pass>

HUGGINGFACE_API_KEY=<your-huggingface-api-key>
HUGGINGFACE_MODEL=<your-huggingface-model>

TWILIO_ACCOUNT_SID=<your-twilio-account-sid>
TWILIO_AUTH_TOKEN=<your-twilio-auth-token>
TWILIO_PHONE_NUMBER=<your-twilio-phone-number>

API_REWRITE_MAP=<your-api-rewrite-map-json-string>

DEEP_SEEK_API_KEY=<your-deepseek-api-key>
DEEP_SEEK_URL=<your-deepseek-url>

OPEN_AI_KEY=<your-openai-api-key>
```

> Replace `<...>` placeholders with your actual credentials.

---

### 🛠️ Running the Backend

#### Development mode (with live reload):

```bash
docker run -it --rm -p 3000:3000 --env-file .env -v ${PWD}:/app -v /app/node_modules your-dockerhub-username/sumo-insight-backend:latest npm run dev
```

---

#### Production mode:

```bash
docker run -d -p 3000:3000 --env-file .env your-dockerhub-username/sumo-insight-backend:latest npm start
```

---

### 🐳 Using Docker Compose (recommended)

Save this as `docker-compose.yml`:

```yaml
version: "3.8"
services:
  backend:
    image: your-dockerhub-username/sumo-insight-backend:latest
    ports:
      - "3000:3000"
    env_file:
      - .env
    volumes:
      - .:/app
      - /app/node_modules
    command: npm run dev  # Change to 'npm start' for production
```

Run with:

```bash
docker-compose up
```

---

### 📌 Notes

* Make sure to keep your `.env` file secure — it contains sensitive credentials.
* When running in production, you may want to build your image with production optimizations and run with `npm start`.
* Volume mounting (`-v`) is helpful for local development, but should be avoided in production.

---

