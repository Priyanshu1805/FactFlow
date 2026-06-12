import express from "express";
import { getLiveInfo } from "../controllers/liveInfoController";

const router = express.Router();

// POST /api/live-info
// Using POST so we can easily send a JSON body with an array of requested widgets
router.post("/", getLiveInfo);

export default router;
