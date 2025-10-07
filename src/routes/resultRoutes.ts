import express from "express";
import { addResult, getResult, updateResult } from "../controllers/resultController.js";

const router = express.Router();

router.post("/add", addResult);
router.get("/get", getResult);
router.put("/update", updateResult);

export default router;
