import express from "express";
import { addResult, getResult, updateResult, listTxHashes } from "../controllers/resultController.js";

const router = express.Router();

router.post("/add", addResult);
router.get("/get", getResult);
router.put("/update", updateResult);
router.get("/txhashes", listTxHashes);

export default router;
