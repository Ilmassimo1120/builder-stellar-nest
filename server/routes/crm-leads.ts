import { RequestHandler } from "express";

interface DemoRequestData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  businessName: string;
  businessSize: string;
  jobTitle?: string;
  message?: string;
  agreeToTerms: boolean;
  subscribeNewsletter: boolean;
  source: string;
  leadType: string;
  timestamp: string;
}

// HubSpot integration
const submitToHubSpot = async (leadData: DemoRequestData) => {
  const hubspotApiKey = process.env.HUBSPOT_API_KEY;

  if (!hubspotApiKey) {
    console.warn("⚠️ HUBSPOT_API_KEY not configured. Falling back to demo mode.");
    return null;
  }

  try {
    const hubspotData = {
      properties: {
        firstname: leadData.firstName,
        lastname: leadData.lastName,
        email: leadData.email,
        phone: leadData.phone,
        company: leadData.businessName,
        jobtitle: leadData.jobTitle || "",
        hs_lead_status: "NEW",
        lifecyclestage: "lead",
        source: leadData.source,
        demo_requested: "true",
        business_size: leadData.businessSize,
        notes: leadData.message || "",
        newsletter_subscription: leadData.subscribeNewsletter.toString(),
      },
    };

    const response = await fetch(
      "https://api.hubapi.com/crm/v3/objects/contacts",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hubspotApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(hubspotData),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("HubSpot API error:", errorData);
      throw new Error(
        `HubSpot API returned ${response.status}: ${response.statusText}`,
      );
    }

    const result = await response.json();
    console.log("✅ Lead submitted to HubSpot:", result.id);

    return {
      contactId: result.id,
      provider: "hubspot",
    };
  } catch (error) {
    console.error(
      "HubSpot integration error:",
      error instanceof Error ? error.message : String(error),
    );
    return null;
  }
};

// Pipedrive integration
const submitToPipedrive = async (leadData: DemoRequestData) => {
  const pipedriveApiKey = process.env.PIPEDRIVE_API_KEY;
  const pipedriveCompanyDomain = process.env.PIPEDRIVE_COMPANY_DOMAIN;

  if (!pipedriveApiKey || !pipedriveCompanyDomain) {
    console.warn(
      "⚠️ PIPEDRIVE_API_KEY or PIPEDRIVE_COMPANY_DOMAIN not configured.",
    );
    return null;
  }

  try {
    // First, create or find the person
    const personData = {
      name: `${leadData.firstName} ${leadData.lastName}`,
      email: [{ value: leadData.email, primary: true }],
      phone: [{ value: leadData.phone, primary: true }],
      org_id: null,
    };

    const personResponse = await fetch(
      `https://${pipedriveCompanyDomain}.pipedrive.com/v1/persons?api_token=${pipedriveApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(personData),
      },
    );

    if (!personResponse.ok) {
      const errorData = await personResponse.json().catch(() => ({}));
      console.error("Pipedrive API error:", errorData);
      throw new Error(
        `Pipedrive API returned ${personResponse.status}: ${personResponse.statusText}`,
      );
    }

    const personResult = await personResponse.json();
    const personId = personResult.data.id;

    // Create a deal for the demo request
    const dealData = {
      title: `Demo Request - ${leadData.businessName}`,
      person_id: personId,
    };

    const dealResponse = await fetch(
      `https://${pipedriveCompanyDomain}.pipedrive.com/v1/deals?api_token=${pipedriveApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dealData),
      },
    );

    if (!dealResponse.ok) {
      const errorData = await dealResponse.json().catch(() => ({}));
      console.error("Pipedrive deal creation error:", errorData);
      throw new Error(`Pipedrive deal API returned ${dealResponse.status}`);
    }

    const dealResult = await dealResponse.json();
    console.log("✅ Lead submitted to Pipedrive:", personId);

    return {
      contactId: personId,
      dealId: dealResult.data.id,
      provider: "pipedrive",
    };
  } catch (error) {
    console.error(
      "Pipedrive integration error:",
      error instanceof Error ? error.message : String(error),
    );
    return null;
  }
};

// CRM submission handler - tries configured providers
const submitToCRM = async (leadData: DemoRequestData) => {
  const crmProvider = process.env.CRM_PROVIDER || "hubspot";

  try {
    let result = null;

    if (crmProvider === "pipedrive") {
      result = await submitToPipedrive(leadData);
      if (!result) {
        console.log("Pipedrive failed, trying HubSpot...");
        result = await submitToHubSpot(leadData);
      }
    } else {
      result = await submitToHubSpot(leadData);
      if (!result) {
        console.log("HubSpot failed, trying Pipedrive...");
        result = await submitToPipedrive(leadData);
      }
    }

    // If both providers fail, fall back to demo mode
    if (!result) {
      console.log(
        "[DEMO MODE] No CRM provider configured. Would submit:",
        leadData,
      );
      return {
        success: true,
        contactId: `demo_${Date.now()}`,
        message: "Lead logged in demo mode (no CRM configured)",
        isDemoMode: true,
      };
    }

    return {
      success: true,
      ...result,
      message: "Lead successfully created in CRM",
    };
  } catch (error) {
    console.error(
      "CRM integration error:",
      error instanceof Error ? error.message : String(error),
    );
    throw new Error("Failed to submit lead to CRM");
  }
};

export const handleCRMLeadSubmission: RequestHandler = async (req, res) => {
  try {
    const leadData: DemoRequestData = req.body;

    // Validate required fields
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "businessName",
      "businessSize",
    ];
    const missingFields = requiredFields.filter((field) => !leadData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(leadData.email)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email format",
      });
    }

    // Submit to CRM
    const crmResult = await submitToCRM(leadData);

    // Log for analytics
    console.log(
      `Demo request received from ${leadData.firstName} ${leadData.lastName} at ${leadData.businessName}`,
    );

    res.json({
      success: true,
      message: "Demo request submitted successfully",
      data: {
        contactId: crmResult.contactId,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Demo request submission error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
