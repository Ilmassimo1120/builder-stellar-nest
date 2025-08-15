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

  // API index route - lists all available endpoints
  app.get("/api", (_req, res) => {
    const apiRoutes = [
      {
        method: "GET",
        path: "/api/ping",
        description: "Health check endpoint",
        example: `${_req.protocol}://${_req.get('host')}/api/ping`
      },
      {
        method: "GET",
        path: "/api/demo",
        description: "Demo data endpoint",
        example: `${_req.protocol}://${_req.get('host')}/api/demo`
      },
      {
        method: "POST",
        path: "/api/create-storage-buckets",
        description: "Create Supabase storage buckets",
        example: `${_req.protocol}://${_req.get('host')}/api/create-storage-buckets`
      },
      {
        method: "POST",
        path: "/api/crm/leads",
        description: "Submit CRM lead data",
        example: `${_req.protocol}://${_req.get('host')}/api/crm/leads`
      },
      {
        method: "POST",
        path: "/api/email/demo-confirmation",
        description: "Send demo confirmation email",
        example: `${_req.protocol}://${_req.get('host')}/api/email/demo-confirmation`
      }
    ];

    res.json({
      title: "ChargeSource API",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      endpoints: apiRoutes,
      totalEndpoints: apiRoutes.length
    });
  });

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
