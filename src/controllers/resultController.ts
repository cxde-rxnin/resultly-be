import type { Request, Response } from "express";
import Result from "../models/resultModel.js";
import { addResult as suiAddResult, getResult as suiGetResult, updateGrade as suiUpdateGrade } from "../utils/suiClient.js";

export const addResult = async (req: Request, res: Response) => {
  try {
    const { studentId, courseCode, grade, semester } = req.body;

    // Write to SUI blockchain
    const blockchainRes = await suiAddResult({
      studentId,
      courseCode,
      grade,
      semester,
    });

    // Store metadata in Mongo
    await Result.create({ studentId, courseCode, grade, semester });

    res.status(200).json({
      message: "Result added successfully",
      blockchainRes,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const getResult = async (req: Request, res: Response) => {
  try {
    const { studentId, courseCode, semester } = req.query;

    // If only studentId is provided, fetch all results for that student from database
    if (studentId && !courseCode && !semester) {
      const results = await Result.find({ studentId }).sort({ updatedAt: -1 });
      
      if (results.length === 0) {
        return res.status(404).json({ error: "No results found for this student ID" });
      }

      return res.status(200).json({
        message: "Results retrieved successfully",
        data: results,
        count: results.length
      });
    }

    // If specific course and semester are provided, try blockchain first, then database
    if (studentId && courseCode && semester) {
      try {
        const blockchainRes = await suiGetResult(
          studentId as string,
          courseCode as string,
          semester as string
        );

        return res.status(200).json({
          message: "Result retrieved successfully from blockchain",
          data: blockchainRes,
        });
      } catch (blockchainError) {
        // If blockchain fails, try database
        const dbResult = await Result.findOne({ studentId, courseCode, semester });
        
        if (dbResult) {
          return res.status(200).json({
            message: "Result retrieved successfully from database",
            data: dbResult,
          });
        }
      }
    }

    return res.status(404).json({ error: "Result not found" });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const updateResult = async (req: Request, res: Response) => {
  try {
    const { studentId, courseCode, semester, newGrade } = req.body;

    const blockchainRes = await suiUpdateGrade(
      studentId,
      courseCode,
      semester,
      newGrade
    );

    // Update in Mongo as well
    await Result.findOneAndUpdate(
      { studentId, courseCode, semester },
      { grade: newGrade, updatedAt: new Date() }
    );

    res.status(200).json({
      message: "Result updated successfully",
      blockchainRes,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
};
