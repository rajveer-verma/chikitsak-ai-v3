import express from "express";
import { checkSymptoms } from "../controllers/symptomsController.js";

const router = express.Router();

// POST /api/symptoms
router.post("/symptoms", checkSymptoms);

export default router;
