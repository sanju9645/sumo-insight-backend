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
