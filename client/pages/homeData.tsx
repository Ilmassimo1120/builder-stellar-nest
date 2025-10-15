import React from "react";
import {
  Zap,
  Calculator,
  Package,
  Users,
  Share2,
  Settings,
  CheckCircle2,
  DollarSign,
} from "lucide-react";

export const features = [
  {
    icon: <Zap className="w-8 h-8 text-primary" />,
    title: "Project Planning Wizard",
    description:
      "Site assessment inputs, auto-selection of suitable chargers, grid capacity checks & compliance checklists (AS/NZS 3000).",
    items: [
      "Site Assessment Tools",
      "Auto Charger Selection",
      "Grid Capacity Analysis",
      "Compliance Checklists",
    ],
  },
  {
    icon: <Calculator className="w-8 h-8 text-secondary" />,
    title: "Smart Quoting Engine (CPQ)",
    description:
      "Dynamic quoting with selectable components, auto-calculated costs, templates for recurring projects.",
    items: [
      "Dynamic Component Selection",
      "Auto Cost Calculation",
      "Project Templates",
      "PDF Quote Generation",
    ],
  },
  {
    icon: <Package className="w-8 h-8 text-accent" />,
    title: "Procurement & Supplier Integration",
    description:
      "Product catalogue access, real-time inventory & pricing, one-click quote-to-order conversion.",
    items: [
      "Real-time Inventory",
      "Supplier API Integration",
      "Order Tracking",
      "Payment Gateway",
    ],
  },
  {
    icon: <Users className="w-8 h-8 text-primary" />,
    title: "Account & Project Management",
    description:
      "Multi-client dashboard, document uploads, permissions & collaboration tools for teams.",
    items: [
      "Client Dashboard",
      "Document Management",
      "Team Collaboration",
      "Project Tracking",
    ],
  },
  {
    icon: <Share2 className="w-8 h-8 text-secondary" />,
    title: "Marketing & Growth",
    description:
      "Referral programs, affiliate marketing tools to grow your electrical contracting business.",
    items: [
      "Referral System",
      "Affiliate Marketing",
      "Lead Generation",
      "Customer Retention",
    ],
  },
  {
    icon: <Settings className="w-8 h-8 text-accent" />,
    title: "Integration-Ready Modules",
    description:
      "MYOB/Xero/QuickBooks integration, CRM integration, training portal, rebate assistant.",
    items: [
      "Accounting Integration",
      "CRM Connectivity",
      "Training Portal",
      "Rebate Assistant",
    ],
  },
];

export const stats = [
  {
    value: "500+",
    label: "Active Contractors",
    icon: <Users className="w-5 h-5" />,
  },
  {
    value: "15,000+",
    label: "Projects Completed",
    icon: <CheckCircle2 className="w-5 h-5" />,
  },
  {
    value: "$50M+",
    label: "Revenue Generated",
    icon: <DollarSign className="w-5 h-5" />,
  },
];
