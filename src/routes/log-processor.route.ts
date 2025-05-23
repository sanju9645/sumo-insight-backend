import express, { Request, Response } from "express";
import { SumoLogicProcessor } from '../tools/sumologic-log-processor';

const router = express.Router();

// /api/log-processor
router.get('/process', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, date } = req.query;

    const processor = new SumoLogicProcessor();
    await processor.initialize();
    await processor.initProcessLogs(
      startDate as string,
      endDate as string,
      date as string
    );

    res.json({ message: 'Log processing completed successfully' });
  } catch (error) {
    console.error('Error processing logs:', error);
    res.status(500).json({ error: 'Failed to process logs' });
  }
});


export default router;