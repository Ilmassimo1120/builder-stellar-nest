import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Bot,
  Send,
  MessageSquare,
  Sparkles,
  HelpCircle,
  Phone,
  Mail,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Bug,
  Settings,
  HeadphonesIcon,
  Minimize2,
  Maximize2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { customerService } from "@/lib/services/customerService";

interface ChatMessage {
  id: string;
  type: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  suggestions?: string[];
  actions?: Array<{
    label: string;
    action: string;
    icon?: React.ReactNode;
    variant?: "default" | "destructive" | "outline" | "secondary";
  }>;
}

interface SupportRequest {
  name: string;
  email: string;
  phone: string;
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  description: string;
}

export function SupportAIAssistant() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentStep, setCurrentStep] = useState<"greeting" | "info" | "category" | "details" | "complete">("greeting");
  const [supportRequest, setSupportRequest] = useState<Partial<SupportRequest>>({});
  const [crmStatus, setCrmStatus] = useState<{ provider: string; enabled: boolean } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const supportCategories = [
    {
      id: "sales",
      label: "Speak with Sales",
      description: "Pricing, products, business inquiries",
      icon: <HeadphonesIcon className="w-4 h-4" />,
      priority: "medium" as const,
      responseTime: "2-4 hours"
    },
    {
      id: "account",
      label: "Account Issue",
      description: "Login, access, profile problems",
      icon: <User className="w-4 h-4" />,
      priority: "high" as const,
      responseTime: "1-2 hours"
    },
    {
      id: "billing",
      label: "Billing Issue",
      description: "Payments, invoices, subscription",
      icon: <CreditCard className="w-4 h-4" />,
      priority: "high" as const,
      responseTime: "1-2 hours"
    },
    {
      id: "application",
      label: "Application Issue",
      description: "Bugs, errors, feature problems",
      icon: <Bug className="w-4 h-4" />,
      priority: "medium" as const,
      responseTime: "4-8 hours"
    },
    {
      id: "technical",
      label: "Technical Support",
      description: "Installation, configuration help",
      icon: <Settings className="w-4 h-4" />,
      priority: "medium" as const,
      responseTime: "2-4 hours"
    },
    {
      id: "urgent",
      label: "Urgent Issue",
      description: "Critical problems affecting operations",
      icon: <AlertTriangle className="w-4 h-4" />,
      priority: "urgent" as const,
      responseTime: "30 minutes"
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize CRM status
  useEffect(() => {
    const initializeCrmStatus = async () => {
      try {
        const config = customerService.getConfig();
        const activeProvider = customerService.getActiveProvider();

        setCrmStatus({
          provider: config.provider === "native" ? "Local Database" :
                   config.provider === "hubspot" ? "HubSpot CRM" :
                   config.provider === "pipedrive" ? "Pipedrive CRM" :
                   config.provider,
          enabled: config.provider !== "native" && activeProvider.isAuthenticated?.() !== false
        });
      } catch (error) {
        console.warn("Could not initialize CRM status:", error);
        setCrmStatus({ provider: "Local Database", enabled: true });
      }
    };

    initializeCrmStatus();
  }, []);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0 && crmStatus) {
      const crmInfo = crmStatus.enabled
        ? `\n\n🔗 **CRM Integration Active:** Your contact information will be automatically added to our ${crmStatus.provider} for better support tracking and follow-up.`
        : `\n\n📝 **Local Support:** Your request will be tracked in our support system.`;

      const welcomeMessage: ChatMessage = {
        id: "welcome",
        type: "assistant",
        content: `👋 Hello! I'm your ChargeSource Support Assistant. I'm here to help you get the support you need quickly and efficiently.\n\nI can help connect you with the right support team based on your specific needs. To get started, I'll need to collect some basic information to ensure you receive the best possible assistance.${crmInfo}\n\nAre you ready to begin?`,
        timestamp: new Date(),
        suggestions: ["Yes, I need support", "What types of support are available?"],
        actions: [
          {
            label: "Start Support Request",
            action: "start-support",
            icon: <HelpCircle className="w-4 h-4" />,
            variant: "default"
          }
        ]
      };
      setMessages([welcomeMessage]);
    }
  }, [messages.length, crmStatus]);

  const handleStartSupport = () => {
    setCurrentStep("info");
    const infoMessage: ChatMessage = {
      id: `step-info-${Date.now()}`,
      type: "assistant",
      content: `Great! I'll help you get connected with the right support team. First, I need to collect some basic information to ensure we can assist you properly.\n\n**Please provide the following information:**`,
      timestamp: new Date(),
      actions: [
        {
          label: "Provide Contact Information",
          action: "collect-info",
          icon: <User className="w-4 h-4" />,
          variant: "default"
        }
      ]
    };
    setMessages(prev => [...prev, infoMessage]);
  };

  const handleCollectInfo = () => {
    // Pre-fill with user data if available
    if (user) {
      setSupportRequest(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || ""
      }));
    }

    const formMessage: ChatMessage = {
      id: `form-${Date.now()}`,
      type: "system",
      content: "CONTACT_FORM",
      timestamp: new Date()
    };
    setMessages(prev => [...prev, formMessage]);
  };

  const handleInfoSubmit = (info: { name: string; email: string; phone: string }) => {
    setSupportRequest(prev => ({ ...prev, ...info }));
    setCurrentStep("category");
    
    const categoryMessage: ChatMessage = {
      id: `category-${Date.now()}`,
      type: "assistant",
      content: `Thank you, ${info.name}! 📧 We have your contact information.\n\nNow, please select the type of support you need. This helps us route your request to the right specialist team:`,
      timestamp: new Date(),
      actions: supportCategories.map(category => ({
        label: category.label,
        action: `select-category-${category.id}`,
        icon: category.icon,
        variant: category.priority === "urgent" ? "destructive" as const : "outline" as const
      }))
    };
    setMessages(prev => [...prev, categoryMessage]);
  };

  const handleCategorySelect = (categoryId: string) => {
    const category = supportCategories.find(c => c.id === categoryId);
    if (!category) return;

    setSupportRequest(prev => ({ 
      ...prev, 
      category: categoryId,
      priority: category.priority 
    }));
    setCurrentStep("details");

    const detailsMessage: ChatMessage = {
      id: `details-${Date.now()}`,
      type: "assistant",
      content: `Perfect! You've selected **${category.label}**.\n\n📋 ${category.description}\n⏱️ **Expected Response Time:** ${category.responseTime}\n\nTo help our ${category.label.toLowerCase()} team assist you effectively, please describe your specific issue or question in detail:`,
      timestamp: new Date(),
      actions: [
        {
          label: "Provide Details",
          action: "collect-details",
          icon: <MessageSquare className="w-4 h-4" />,
          variant: "default"
        }
      ]
    };
    setMessages(prev => [...prev, detailsMessage]);
  };

  const handleDetailsSubmit = async (description: string) => {
    setSupportRequest(prev => ({ ...prev, description }));
    setCurrentStep("complete");

    // Try to push contact to CRM
    await pushContactToCRM(description);

    const category = supportCategories.find(c => c.id === supportRequest.category);
    const crmIntegrationInfo = crmStatus?.enabled
      ? `\n\n💡 **CRM Integration:** Your contact information has been automatically added to our ${crmStatus.provider} for better support tracking and follow-up.${supportRequest.category === "sales" ? " A sales opportunity has also been created for your inquiry." : ""}`
      : `\n\n📝 **Support Tracking:** Your request has been logged in our support system.`;

    const completeMessage: ChatMessage = {
      id: `complete-${Date.now()}`,
      type: "assistant",
      content: `✅ **Support Request Submitted Successfully!**\n\n**Request Summary:**\n• **Name:** ${supportRequest.name}\n• **Email:** ${supportRequest.email}\n• **Phone:** ${supportRequest.phone}\n• **Category:** ${category?.label}\n• **Priority:** ${supportRequest.priority?.toUpperCase()}\n• **Expected Response:** ${category?.responseTime}\n\n**Reference ID:** #CS${Date.now().toString().slice(-6)}\n\n📧 You'll receive a confirmation email shortly with your support ticket details. Our ${category?.label.toLowerCase()} team will contact you within the expected timeframe.${crmIntegrationInfo}\n\nIs there anything else I can help you with today?`,
      timestamp: new Date(),
      suggestions: [
        "Submit another request",
        "Check support status",
        "Contact information",
        "I'm all set, thank you"
      ],
      actions: [
        {
          label: "New Support Request",
          action: "new-request",
          icon: <HelpCircle className="w-4 h-4" />,
          variant: "outline"
        },
        {
          label: "Close Chat",
          action: "close-chat",
          icon: <CheckCircle2 className="w-4 h-4" />,
          variant: "default"
        }
      ]
    };
    setMessages(prev => [...prev, completeMessage]);
  };

  const pushContactToCRM = async (description: string): Promise<{ success: boolean; customerId?: string; dealId?: string }> => {
    // Skip CRM integration if not enabled
    if (!crmStatus?.enabled) {
      return { success: true }; // Consider local storage as successful
    }

    try {
      if (!supportRequest.name || !supportRequest.email || !supportRequest.phone) {
        console.warn("Missing required contact information for CRM push");
        return { success: false };
      }

      // Check if customer already exists
      const existingCustomers = await customerService.searchCustomers(supportRequest.email!);

      let customer;
      let isNewCustomer = false;

      if (existingCustomers.length > 0) {
        // Update existing customer
        customer = existingCustomers[0];
        console.log(`Found existing customer in ${crmStatus.provider}:`, customer.id);

        // Update customer with latest information
        await customerService.updateCustomer(customer.id, {
          name: supportRequest.name!,
          phone: supportRequest.phone!,
          tags: [...(customer.tags || []), "support-contact", `support-${supportRequest.category}`].filter((tag, index, arr) => arr.indexOf(tag) === index), // Remove duplicates
        });
      } else {
        // Create new customer
        isNewCustomer = true;
        const category = supportCategories.find(c => c.id === supportRequest.category);

        // Extract company from email domain if available
        const emailDomain = supportRequest.email!.split('@')[1];
        const company = emailDomain && !['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'].includes(emailDomain.toLowerCase())
          ? emailDomain.split('.')[0]
          : "";

        customer = await customerService.createCustomer({
          name: supportRequest.name!,
          email: supportRequest.email!,
          phone: supportRequest.phone!,
          company: company,
          tags: ["support-contact", `support-${supportRequest.category}`, "lead"],
          notes: `Initial contact via Support AI Assistant - ${category?.label}`,
          customFields: {
            supportCategory: category?.label || "General",
            supportPriority: supportRequest.priority || "medium",
            contactSource: "Support AI Assistant",
            firstContactDate: new Date().toISOString(),
            isNewLead: "true",
          },
        });

        console.log(`Created new customer in ${crmStatus.provider}:`, customer.id);
      }

      // Add contact/interaction record
      const contactRecord = await customerService.addContact({
        customerId: customer.id,
        type: "note",
        subject: `Support Request: ${supportCategories.find(c => c.id === supportRequest.category)?.label}`,
        content: `Support request submitted via AI Assistant:\n\nCategory: ${supportCategories.find(c => c.id === supportRequest.category)?.label}\nPriority: ${supportRequest.priority}\nDescription: ${description}\n\nContact: ${supportRequest.name} (${supportRequest.email}, ${supportRequest.phone})\n\n${isNewCustomer ? "New customer created from support request." : "Existing customer updated."}`,
        date: new Date().toISOString(),
        direction: "inbound",
      });

      let dealId: string | undefined;

      // If it's a sales inquiry, create a deal
      if (supportRequest.category === "sales") {
        try {
          const deal = await customerService.createDeal({
            customerId: customer.id,
            title: `Sales Inquiry - ${supportRequest.name}`,
            value: 0, // Will be updated later when qualified
            stage: "prospect",
            probability: isNewCustomer ? 15 : 25, // Slightly higher probability for existing customers
            source: "Support AI Assistant",
            description: `Sales inquiry submitted via Support AI Assistant:\n\n${description}`,
            expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          });

          dealId = deal.id;
          console.log(`Created sales deal in ${crmStatus.provider}:`, deal.id);
        } catch (dealError) {
          console.warn("Failed to create sales deal, but customer was created:", dealError);
          // Don't fail the whole operation if deal creation fails
        }
      }

      console.log(`Successfully pushed support contact to ${crmStatus.provider}`);
      return {
        success: true,
        customerId: customer.id,
        dealId
      };
    } catch (error) {
      console.error(`Failed to push contact to ${crmStatus?.provider || "CRM"}:`, error);

      // Log detailed error for monitoring
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("CRM Integration Error Details:", {
        provider: crmStatus?.provider,
        error: errorMessage,
        supportRequest: {
          category: supportRequest.category,
          priority: supportRequest.priority,
          hasEmail: !!supportRequest.email,
          hasPhone: !!supportRequest.phone,
          hasName: !!supportRequest.name
        },
        timestamp: new Date().toISOString()
      });

      return { success: false };
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageContent = inputMessage.toLowerCase();
    setInputMessage("");
    setIsTyping(true);

    // Simulate AI processing time
    setTimeout(async () => {
      let response = "";
      let suggestions: string[] = [];
      let actions: ChatMessage["actions"] = [];

      // Handle different types of user input
      if (messageContent.includes("support") || messageContent.includes("help")) {
        response = `I can see you're looking for support! 🎯\n\nLet me help you get connected with the right team. We offer several types of support:\n\n${supportCategories.map(cat => `• **${cat.label}**: ${cat.description}`).join('\n')}\n\nWould you like to start a support request?`;
        suggestions = ["Yes, start support request", "Tell me about response times"];
        actions = [
          {
            label: "Start Support Request",
            action: "start-support",
            icon: <HelpCircle className="w-4 h-4" />,
            variant: "default"
          }
        ];
      } else if (messageContent.includes("response time") || messageContent.includes("how long")) {
        response = `⏱️ **Our Support Response Times:**\n\n${supportCategories.map(cat => `• **${cat.label}**: ${cat.responseTime}`).join('\n')}\n\n*Response times are during business hours (9 AM - 5 PM AEST, Monday-Friday). Urgent issues are monitored 24/7.*\n\nReady to submit a support request?`;
        suggestions = ["Submit support request", "What's considered urgent?"];
      } else if (messageContent.includes("urgent")) {
        response = `🚨 **Urgent Support Issues:**\n\nUrgent issues include:\n• System outages affecting operations\n• Critical security concerns\n• Payment processing failures\n• Data loss or corruption\n\n**Response Time:** 30 minutes during business hours, 2 hours outside business hours.\n\nIf you have an urgent issue, please select "Urgent Issue" when creating your support request.`;
        suggestions = ["I have an urgent issue", "Create regular support request"];
      } else {
        // General response
        response = `I understand you need assistance! 😊\n\nI'm here to help you connect with our support teams. To provide you with the best possible service, I'll need to collect some basic information and understand what type of support you need.\n\nWould you like to start a support request now?`;
        suggestions = ["Start support request", "Tell me about support options"];
        actions = [
          {
            label: "Start Support Request",
            action: "start-support",
            icon: <HelpCircle className="w-4 h-4" />,
            variant: "default"
          }
        ];
      }

      const aiResponse: ChatMessage = {
        id: `ai-${Date.now()}`,
        type: "assistant",
        content: response,
        timestamp: new Date(),
        suggestions,
        actions,
      };

      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const handleActionClick = (action: string) => {
    switch (action) {
      case "start-support":
        handleStartSupport();
        break;
      case "collect-info":
        handleCollectInfo();
        break;
      case "collect-details":
        const detailsFormMessage: ChatMessage = {
          id: `details-form-${Date.now()}`,
          type: "system",
          content: "DETAILS_FORM",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, detailsFormMessage]);
        break;
      case "new-request":
        // Reset the flow
        setCurrentStep("greeting");
        setSupportRequest({});
        handleStartSupport();
        break;
      case "close-chat":
        setIsOpen(false);
        break;
      default:
        if (action.startsWith("select-category-")) {
          const categoryId = action.replace("select-category-", "");
          handleCategorySelect(categoryId);
        }
    }
  };

  const formatMessage = (content: string) => {
    if (content === "CONTACT_FORM") {
      return (
        <div className="space-y-4 p-4 bg-blue-50 rounded-lg border">
          <h4 className="font-semibold text-blue-900">Contact Information</h4>
          <div className="space-y-3">
            <div>
              <Label htmlFor="support-name">Full Name *</Label>
              <Input
                id="support-name"
                defaultValue={supportRequest.name || user?.name || ""}
                placeholder="Enter your full name"
                onBlur={(e) => setSupportRequest(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="support-email">Email Address *</Label>
              <Input
                id="support-email"
                type="email"
                defaultValue={supportRequest.email || user?.email || ""}
                placeholder="Enter your email address"
                onBlur={(e) => setSupportRequest(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="support-phone">Phone Number *</Label>
              <Input
                id="support-phone"
                type="tel"
                defaultValue={supportRequest.phone || user?.phone || ""}
                placeholder="Enter your phone number"
                onBlur={(e) => setSupportRequest(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <Button 
              className="w-full" 
              onClick={() => {
                const name = (document.getElementById("support-name") as HTMLInputElement)?.value;
                const email = (document.getElementById("support-email") as HTMLInputElement)?.value;
                const phone = (document.getElementById("support-phone") as HTMLInputElement)?.value;
                
                if (name && email && phone) {
                  handleInfoSubmit({ name, email, phone });
                }
              }}
            >
              Continue to Support Categories
            </Button>
          </div>
        </div>
      );
    }

    if (content === "DETAILS_FORM") {
      return (
        <div className="space-y-4 p-4 bg-blue-50 rounded-lg border">
          <h4 className="font-semibold text-blue-900">Describe Your Issue</h4>
          <div className="space-y-3">
            <Textarea
              id="support-details"
              placeholder="Please provide a detailed description of your issue or question. Include any error messages, steps you've tried, or specific information that might help our team assist you better."
              rows={4}
              className="resize-none"
            />
            <Button 
              className="w-full" 
              onClick={() => {
                const details = (document.getElementById("support-details") as HTMLTextAreaElement)?.value;
                if (details) {
                  handleDetailsSubmit(details);
                }
              }}
            >
              Submit Support Request
            </Button>
          </div>
        </div>
      );
    }

    return content.split("\n").map((line, index) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return (
          <div key={index} className="font-semibold text-foreground mt-2 mb-1">
            {line.slice(2, -2)}
          </div>
        );
      }
      if (line.startsWith("• ")) {
        return (
          <div key={index} className="ml-4 text-sm">
            {line}
          </div>
        );
      }
      if (line.trim() === "") {
        return <div key={index} className="h-2"></div>;
      }
      return (
        <div key={index} className="text-sm">
          {line}
        </div>
      );
    });
  };

  return (
    <>
      {/* Floating Support Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              <HelpCircle className="w-6 h-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md h-[600px] p-0 gap-0">
            <DialogHeader className="p-4 pb-2 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-600 to-blue-600 flex items-center justify-center">
                    <HelpCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-sm flex items-center gap-2">
                      ChargeSource Support
                      <Badge
                        variant="secondary"
                        className="text-xs bg-green-100 text-green-800"
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI Assistant
                      </Badge>
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                      Get help from our support specialists
                    </DialogDescription>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMinimized(!isMinimized)}
                  >
                    {isMinimized ? (
                      <Maximize2 className="w-4 h-4" />
                    ) : (
                      <Minimize2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </DialogHeader>

            {!isMinimized && (
              <>
                {/* Chat Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-lg p-3 ${
                            message.type === "user"
                              ? "bg-primary text-primary-foreground"
                              : message.type === "system"
                              ? "w-full"
                              : "bg-muted"
                          }`}
                        >
                          <div className="text-sm">
                            {message.type === "system" || message.type === "assistant" ? (
                              <div>{formatMessage(message.content)}</div>
                            ) : (
                              message.content
                            )}
                          </div>

                          {/* Suggestions */}
                          {message.suggestions && message.suggestions.length > 0 && (
                            <div className="mt-3 space-y-1">
                              {message.suggestions.map((suggestion, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="sm"
                                  className="text-xs h-6 px-2 mr-1 mb-1"
                                  onClick={() => handleSuggestionClick(suggestion)}
                                >
                                  {suggestion}
                                </Button>
                              ))}
                            </div>
                          )}

                          {/* Action Buttons */}
                          {message.actions && message.actions.length > 0 && (
                            <div className="mt-3 space-y-1">
                              {message.actions.map((action, index) => (
                                <Button
                                  key={index}
                                  variant={action.variant || "secondary"}
                                  size="sm"
                                  className="text-xs h-7 px-3 mr-1 mb-1"
                                  onClick={() => handleActionClick(action.action)}
                                >
                                  {action.icon}
                                  <span className="ml-1">{action.label}</span>
                                </Button>
                              ))}
                            </div>
                          )}

                          {message.type !== "system" && (
                            <div className="text-xs opacity-60 mt-2">
                              {message.timestamp.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Typing Indicator */}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-lg p-3 max-w-[85%]">
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                            <div
                              className="w-2 h-2 bg-current rounded-full animate-pulse"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-current rounded-full animate-pulse"
                              style={{ animationDelay: "0.4s" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="p-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Type your message..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isTyping}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="text-center mt-2">
                    <div className="text-xs text-muted-foreground">
                      ChargeSource Support • Response times: 30min - 8hrs
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Support Status Indicator */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40">
          <Badge
            variant="secondary"
            className="text-xs bg-green-100 text-green-800 border-green-200"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
            Support Online
          </Badge>
        </div>
      )}
    </>
  );
}
