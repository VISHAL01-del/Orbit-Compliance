import mongoose from "mongoose";

const complianceReportSchema = new mongoose.Schema(
  {
    regulation: {
      type: String,
      required: true,
      enum: ["gdpr", "hipaa", "soc2"]
    },
    fileName: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    storagePath: {
      type: String,
      required: true
    },
    auditScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    flags: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

const ComplianceReport =
  mongoose.models.ComplianceReport ||
  mongoose.model("ComplianceReport", complianceReportSchema);

export default ComplianceReport;
