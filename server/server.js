import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import ComplianceReport from "./models/ComplianceReport.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDirectory = path.join(__dirname, "uploads");

const app = express();
const port = process.env.PORT || 5000;
const allowedExtensions = new Set([
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".csv",
  ".xml",
  ".png",
  ".jpg",
  ".jpeg"
]);

const storage = multer.diskStorage({
  destination: (_request, _file, callback) => {
    callback(null, uploadsDirectory);
  },
  filename: (_request, file, callback) => {
    const suffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    callback(null, `${suffix}-${file.originalname.replace(/\s+/g, "-")}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024
  },
  fileFilter: (_request, file, callback) => {
    const extension = path.extname(file.originalname || "").toLowerCase();

    if (!allowedExtensions.has(extension)) {
      return callback(
        new Error(
          "Unsupported file type. Allowed: PDF, DOC, DOCX, XLS, XLSX, CSV, XML, PNG, JPG, JPEG."
        )
      );
    }

    return callback(null, true);
  }
});

const simulatedFlags = {
  gdpr: [
    "Missing Data Encryption Clause",
    "Retention schedule not defined",
    "No DPA reference found"
  ],
  hipaa: [
    "Business Associate Agreement missing",
    "PHI access logging not documented",
    "Incident response workflow incomplete"
  ],
  soc2: [
    "Vendor risk review absent",
    "Logical access review not evidenced",
    "No backup restoration test record"
  ]
};

async function connectDatabase() {
  const mongoUriTemplate =
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/orbit-compliance";
  const mongoUri = mongoUriTemplate.includes("<db_password>")
    ? mongoUriTemplate.replace(
        "<db_password>",
        encodeURIComponent(process.env.DB_PASSWORD || "")
      )
    : mongoUriTemplate;

  try {
    if (mongoUriTemplate.includes("<db_password>") && !process.env.DB_PASSWORD) {
      throw new Error("DB_PASSWORD is required when MONGODB_URI contains <db_password>.");
    }

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
  }
}

app.use(cors());
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({ ok: true, service: "orbit-compliance-api" });
});

app.post("/api/audit", upload.single("file"), async (request, response) => {
  try {
    const regulation = String(request.body.regulation || "").toLowerCase();

    if (!request.file) {
      return response.status(400).json({ error: "File upload is required." });
    }

    if (!["gdpr", "hipaa", "soc2"].includes(regulation)) {
      return response.status(400).json({ error: "Unsupported regulation window." });
    }

    await new Promise((resolve) => setTimeout(resolve, 1800));

    const reportPayload = {
      regulation,
      fileName: request.file.originalname,
      fileSize: request.file.size,
      mimeType: request.file.mimetype,
      storagePath: request.file.path,
      auditScore: Math.floor(Math.random() * 26) + 70,
      flags: simulatedFlags[regulation].slice(0, 2 + Math.floor(Math.random() * 2))
    };

    let savedReport = null;

    if (mongoose.connection.readyState === 1) {
      savedReport = await ComplianceReport.create(reportPayload);
    }

    return response.json({
      message: "Audit simulation completed.",
      report: {
        id: savedReport?._id ?? null,
        ...reportPayload
      }
    });
  } catch (error) {
    return response.status(500).json({
      error: "Audit simulation failed.",
      details: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Orbit Compliance API running on port ${port}`);
  connectDatabase();
});
