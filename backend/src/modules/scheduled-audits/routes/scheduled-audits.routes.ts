import { Router } from "express";
import { enqueueScheduledAuditsController } from "../controllers/scheduled-audits.controller";

const router = Router();
router.get("/", enqueueScheduledAuditsController);

export default router;
