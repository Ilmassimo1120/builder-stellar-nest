import { useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";

export interface AIContext {
  currentPage: string;
  pageTitle: string;
  userRole?: string;
  suggestions: string[];
  availableActions: string[];
}

export function useAIContext(): AIContext {
  const location = useLocation();
  const { user } = useAuth();

  const getPageContext = (): AIContext => {
    const path = location.pathname;

    // Dashboard
    if (path === "/dashboard") {
      return {
        currentPage: "dashboard",
        pageTitle: "Dashboard",
        userRole: user?.role || "contractor",
        suggestions: [
          "How do I create a new project?",
          "Show me recent project analytics",
          "Help with quick actions",
          "Explain the knowledge base",
        ],
        availableActions: [
          "create-project",
          "create-quote",
          "view-analytics",
          "access-knowledge-base",
        ],
      };
    }

    // Projects
    if (path === "/projects" || path.startsWith("/projects")) {
      if (path === "/projects/new") {
        return {
          currentPage: "project-wizard",
          pageTitle: "Project Wizard",
          userRole: user?.role || "contractor",
          suggestions: [
            "Help me with site assessment",
            "What charger should I select?",
            "Grid capacity requirements",
            "Compliance checklist guidance",
          ],
          availableActions: [
            "site-assessment-help",
            "charger-selection-guide",
            "grid-capacity-calculator",
            "compliance-checker",
          ],
        };
      }
      return {
        currentPage: "projects",
        pageTitle: "Project Management",
        userRole: user?.role || "contractor",
        suggestions: [
          "How to manage project status",
          "Create quotes from projects",
          "Project collaboration tips",
          "Export project data",
        ],
        availableActions: [
          "project-status-help",
          "create-quote-from-project",
          "collaboration-guide",
          "export-data",
        ],
      };
    }

    // Quotes
    if (path.startsWith("/quotes")) {
      if (
        path === "/quotes/new" ||
        (path.includes("/quotes/") && !path.includes("new"))
      ) {
        return {
          currentPage: "quote-builder",
          pageTitle: "Quote Builder",
          userRole: user?.role || "contractor",
          suggestions: [
            "How to add line items?",
            "Pricing and margin setup",
            "Generate professional PDF",
            "Send quote to client",
          ],
          availableActions: [
            "line-item-help",
            "pricing-guide",
            "pdf-generation",
            "client-portal-setup",
          ],
        };
      }
      return {
        currentPage: "quotes",
        pageTitle: "Quote Management",
        userRole: user?.role || "contractor",
        suggestions: [
          "Create new quote",
          "Quote approval process",
          "Client portal features",
          "Quote analytics",
        ],
        availableActions: [
          "new-quote",
          "approval-process",
          "client-portal",
          "quote-analytics",
        ],
      };
    }

    // Client Portal
    if (path.startsWith("/client/quote/")) {
      return {
        currentPage: "client-portal",
        pageTitle: "Client Portal",
        userRole: "client",
        suggestions: [
          "How to review the quote?",
          "Accept or decline quote",
          "Download quote PDF",
          "Contact the contractor",
        ],
        availableActions: [
          "quote-review-help",
          "quote-decision",
          "download-pdf",
          "contact-contractor",
        ],
      };
    }

    // Knowledge Base or Help
    if (path.includes("/help") || path.includes("/knowledge")) {
      return {
        currentPage: "knowledge-base",
        pageTitle: "Knowledge Base",
        userRole: user?.role || "contractor",
        suggestions: [
          "Find installation guides",
          "Australian standards lookup",
          "Troubleshooting help",
          "Best practices",
        ],
        availableActions: [
          "installation-guides",
          "standards-lookup",
          "troubleshooting",
          "best-practices",
        ],
      };
    }

    // Login/Register
    if (path === "/login" || path === "/register") {
      return {
        currentPage: "authentication",
        pageTitle: "Authentication",
        suggestions: [
          "Help with account setup",
          "Forgot password assistance",
          "Platform features overview",
          "Getting started guide",
        ],
        availableActions: [
          "account-help",
          "password-reset",
          "features-overview",
          "getting-started",
        ],
      };
    }

    // Default/Unknown page
    return {
      currentPage: "unknown",
      pageTitle: "ChargeSource Platform",
      userRole: user?.role || "contractor",
      suggestions: [
        "Platform navigation help",
        "Feature overview",
        "Getting started guide",
        "Contact support",
      ],
      availableActions: [
        "navigation-help",
        "feature-overview",
        "getting-started",
        "contact-support",
      ],
    };
  };

  return getPageContext();
}
