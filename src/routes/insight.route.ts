import express, { Request, Response } from 'express';

import { jwtCheck, jwtParse } from "../middleware/auth";
import { validateUserRequest } from "../middleware/validation";
import insightController from "../controllers/insight.controller";
const router = express.Router();

// /api/insight
router.get("/get-logs", jwtCheck, jwtParse, insightController.getSumoApiLogs);

router.post("/configure", jwtCheck, jwtParse, insightController.configureInsights);

router.get("/get-configure", jwtCheck, jwtParse, insightController.getConfigureInsight);

router.get("/get-all-api-endpoints", jwtCheck, jwtParse, insightController.getAllApiEndpoints);

export default router;
