import mongoose from "mongoose";

const resultSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  courseCode: { type: String, required: true },
  grade: { type: String, required: true },
  semester: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the updatedAt field before saving
resultSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model("Result", resultSchema);
