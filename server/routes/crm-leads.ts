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

// This would integrate with your actual CRM system
// Examples: HubSpot, Salesforce, Pipedrive, etc.
const submitToCRM = async (leadData: DemoRequestData) => {
  // Example HubSpot integration
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
        lead_source: leadData.source,
        demo_requested: "true",
        business_size: leadData.businessSize,
        additional_notes: leadData.message || "",
        newsletter_subscription: leadData.subscribeNewsletter.toString(),
      }
    };

    // In a real implementation, you would use the HubSpot API
    // const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.HUBSPOT_API_KEY}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify(hubspotData)
    // });

    // For demo purposes, we'll simulate a successful response
    console.log('Demo lead submitted to CRM:', hubspotData);
    
    return {
      success: true,
      contactId: `demo_${Date.now()}`,
      message: "Lead successfully created in CRM"
    };

  } catch (error) {
    console.error('CRM integration error:', error);
    throw new Error('Failed to submit lead to CRM');
  }
};

export const handleCRMLeadSubmission: RequestHandler = async (req, res) => {
  try {
    const leadData: DemoRequestData = req.body;

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'businessName', 'businessSize'];
    const missingFields = requiredFields.filter(field => !leadData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(leadData.email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Submit to CRM
    const crmResult = await submitToCRM(leadData);

    // Log for analytics
    console.log(`Demo request received from ${leadData.firstName} ${leadData.lastName} at ${leadData.businessName}`);

    res.json({
      success: true,
      message: 'Demo request submitted successfully',
      data: {
        contactId: crmResult.contactId,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Demo request submission error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
