import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { createStorageBuckets } from "./routes/create-storage-buckets";
import { handleCRMLeadSubmission } from "./routes/crm-leads";
import { handleDemoConfirmationEmail } from "./routes/email-confirmation";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // ChargeSource storage bucket creation
  app.post("/api/create-storage-buckets", createStorageBuckets);

  // Demo request and lead capture
  app.post("/api/crm/leads", handleCRMLeadSubmission);
  app.post("/api/email/demo-confirmation", handleDemoConfirmationEmail);

  return app;
}
