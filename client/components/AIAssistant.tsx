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
  Zap,
  Shield,
  BookOpen,
  Calculator,
  Settings,
  HelpCircle,
  Search,
  FileText,
  Users,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Minimize2,
  Maximize2,
} from "lucide-react";
import { useAIContext } from "@/hooks/useAIContext";
import { findAIResponse } from "@/lib/aiKnowledge";
import { useNavigate } from "react-router-dom";

interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  context?: string;
  suggestions?: string[];
  actions?: Array<{
    label: string;
    action: string;
    icon?: React.ReactNode;
  }>;
}

export function AIAssistant() {
  const aiContext = useAIContext();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Set context-aware welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: "welcome",
        type: "assistant",
        content: `👋 Hi! I'm your specialized EV charging assistant. I see you're on the **${aiContext.pageTitle}** page.\n\nI can help you with:\n\n• Installation guides and Australian standards\n• Project planning and quoting\n• Troubleshooting and technical support\n• Platform navigation and features\n• Best practices for ${aiContext.userRole === "client" ? "understanding quotes" : "electrical contractors"}\n\nWhat would you like to know?`,
        timestamp: new Date(),
        suggestions: aiContext.suggestions,
      };
      setMessages([welcomeMessage]);
    }
  }, [aiContext, messages.length]);

  // AI Response System
  const getAIResponse = async (userMessage: string): Promise<ChatMessage> => {
    const message = userMessage.toLowerCase();

    // Context-aware responses based on current page
    const pageContext = aiContext.currentPage;

    let response = "";
    let suggestions: string[] = [];
    let actions: Array<{
      label: string;
      action: string;
      icon?: React.ReactNode;
    }> = [];

    // First, check the AI knowledge database for expert responses
    const knowledgeResponse = findAIResponse(userMessage);
    if (knowledgeResponse) {
      response = knowledgeResponse.response;
      suggestions = knowledgeResponse.suggestions || [];
      actions =
        knowledgeResponse.actions?.map((action) => ({
          ...action,
          icon: action.icon ? (
            <FileText className="w-4 h-4" />
          ) : (
            <ArrowRight className="w-4 h-4" />
          ),
        })) || [];

      return {
        id: `ai-${Date.now()}`,
        type: "assistant",
        content: response,
        timestamp: new Date(),
        suggestions,
        actions,
      };
    }

    // Installation and Technical Queries
    if (message.includes("install") || message.includes("installation")) {
      if (
        message.includes("ac") ||
        message.includes("22kw") ||
        message.includes("7kw")
      ) {
        response = `🔧 **AC Charging Installation Guide**

For AC charging installations in Australia:

**Key Requirements:**
• AS/NZS 61851 compliance
• Dedicated circuit with appropriate MCB
• RCD protection (Type A or Type B)
• Minimum 4mm² cable for 32A circuits

**Installation Steps:**
1. Site assessment and electrical capacity check
2. Install dedicated circuit breaker
3. Run appropriate cabling
4. Mount charging station (1.2m clearance)
5. Commission and test all safety systems

**Safety First:** Always isolate power and use certified equipment.

Would you like specific guidance for your charger type?`;
        suggestions = [
          "Show me wiring diagrams",
          "What permits do I need?",
          "Load management setup",
          "Commissioning checklist",
        ];
        actions = [
          {
            label: "View Installation Guide",
            action: "open-knowledge",
            icon: <BookOpen className="w-4 h-4" />,
          },
          {
            label: "Create Installation Project",
            action: "new-project",
            icon: <Zap className="w-4 h-4" />,
          },
        ];
      } else if (message.includes("dc") || message.includes("fast")) {
        response = `��� **DC Fast Charging Installation**

DC installations require specialized expertise:

**Critical Requirements:**
• High-voltage electrical work certification
• 3-phase supply (typically 415V)
• Substantial electrical infrastructure
• Grid connection approval

**Key Considerations:**
• Power requirements: 50kW+ units need 80A+ supply
• Cooling systems for thermal management
• Emergency stop systems
• Communication infrastructure

**Important:** DC installations must be completed by licensed high-voltage electricians.`;
        suggestions = [
          "Find certified installers",
          "Grid connection process",
          "DC charger specifications",
          "Safety requirements",
        ];
      }
    }

    // Standards and Compliance
    else if (
      message.includes("standard") ||
      message.includes("compliance") ||
      message.includes("regulation")
    ) {
      response = `📋 **Australian EV Charging Standards**

**Primary Standards:**
• **AS/NZS 61851**: Electric vehicle charging systems
• **AS/NZS 3000**: Electrical installations (Wiring Rules)
• **AS/NZS 3008**: Cable selection standards

**Key Compliance Points:**
• Earth leakage protection (RCD)
• Adequate earthing systems
• Cable sizing for continuous load
• Emergency stop requirements
• Accessibility compliance (DDA)

**Testing Requirements:**
• Installation testing per AS/NZS 3017
• Periodic testing and maintenance
• Safety system verification

Need help with specific compliance requirements?`;
      suggestions = [
        "RCD requirements",
        "Cable sizing calculator",
        "Testing procedures",
        "Permit requirements",
      ];
      actions = [
        {
          label: "Compliance Checklist",
          action: "compliance-guide",
          icon: <Shield className="w-4 h-4" />,
        },
        {
          label: "Standards Database",
          action: "standards-db",
          icon: <FileText className="w-4 h-4" />,
        },
      ];
    }

    // Troubleshooting
    else if (
      message.includes("trouble") ||
      message.includes("problem") ||
      message.includes("issue") ||
      message.includes("fault")
    ) {
      response = `🔍 **Troubleshooting Assistant**

**Common Issues & Solutions:**

**Electrical Problems:**
• Circuit breaker tripping → Check load, connections
• Earth fault → Inspect cable integrity, connections
• Overheating → Verify ventilation, load management

**Communication Issues:**
• Network problems → Check SIM card, signal strength
• Backend errors → Verify internet connectivity
• RFID failures → Clean reader, check card validity

**User Interface Problems:**
• Display blank → Check power supply, connections
• Cable not releasing → Emergency release procedure
• Payment failures → Network and backend verification

If these solutions don't resolve your issue, our support team can provide personalized assistance with your specific problem.

What specific issue are you experiencing?`;
      suggestions = [
        "Circuit breaker keeps tripping",
        "Charger won't start",
        "Network connectivity issues",
        "Get human support help",
      ];
      actions = [
        {
          label: "Diagnostic Tool",
          action: "diagnostic",
          icon: <Settings className="w-4 h-4" />,
        },
        {
          label: "Contact Support Team",
          action: "support",
          icon: <HelpCircle className="w-4 h-4" />,
        },
      ];
    }

    // Project and Quoting Help
    else if (message.includes("project") || message.includes("quote")) {
      if (pageContext.includes("project") || message.includes("create")) {
        response = `📊 **Project & Quoting Assistant**

**Creating a New Project:**
1. Use the Project Wizard for step-by-step guidance
2. Complete site assessment thoroughly
3. Select appropriate charger specifications
4. Review grid capacity requirements
5. Generate compliance checklist

**Smart Quoting Features:**
• Auto-populated pricing from project data
• Multiple quote versions for comparison
• Professional PDF generation
• Client portal for quote approval

**Pro Tips:**
• Take detailed site photos
• Verify electrical capacity early
• Consider future expansion needs
• Include load management for multiple units

Would you like me to guide you through creating a project?`;
        suggestions = [
          "Start new project wizard",
          "Create quote from existing project",
          "Site assessment tips",
          "Pricing guidelines",
        ];
        actions = [
          {
            label: "New Project Wizard",
            action: "new-project",
            icon: <Zap className="w-4 h-4" />,
          },
          {
            label: "Quote Builder",
            action: "new-quote",
            icon: <Calculator className="w-4 h-4" />,
          },
        ];
      }
    }

    // Platform Navigation Help
    else if (
      message.includes("how") &&
      (message.includes("use") || message.includes("navigate"))
    ) {
      response = `🗺️ **Platform Navigation Guide**

**Main Sections:**
• **Dashboard**: Overview of projects and quick actions
• **Projects**: Manage all EV infrastructure projects
• **Quotes**: Create and manage quotes with CPQ engine
• **Knowledge Base**: Technical guides and regulations

**Quick Actions:**
• Create new project from any page
• Generate quotes from existing projects
• Access help and documentation
• Export reports and data

**Pro Features:**
• Auto-save for all forms
• Cloud storage with local backup
• Multi-user collaboration
• Template system for efficiency

**Current Page**: You're on the ${pageContext} page. What would you like to do here?`;
      suggestions = [
        "Show me key features",
        "How to create templates",
        "Team collaboration setup",
        "Data export options",
      ];
    }

    // Load Management and Smart Charging
    else if (
      message.includes("load") ||
      message.includes("smart") ||
      message.includes("management")
    ) {
      response = `🧠 **Load Management & Smart Charging**

**Why Load Management?**
Prevents electrical overloads and optimizes energy usage across multiple charging points.

**Implementation Options:**
• **Static Load Management**: Fixed power allocation
• **Dynamic Load Management**: Real-time adjustment
• **Grid Integration**: Demand response and pricing

**Technology Solutions:**
• Hardwired load controllers
• Cloud-based management systems
• Integrated charger load balancing

**Benefits:**
• Reduced electrical infrastructure costs
• Optimal energy utilization
• Grid stability support
• Future-ready scalability

Need help designing a load management system?`;
      suggestions = [
        "Calculate load requirements",
        "Compare management systems",
        "Grid integration options",
        "Cost-benefit analysis",
      ];
    }

    // Default responses for general queries
    else if (message.includes("hello") || message.includes("hi")) {
      response = `Hello! 👋 I'm your specialized EV charging assistant. I have deep knowledge of:

• Australian electrical standards and regulations
• Commercial and residential charging installations
• Project planning and site assessment
• Troubleshooting and maintenance
• Platform features and navigation

For personalized support from our human experts, I can connect you directly with our support team.

How can I help you today?`;
      suggestions = [
        "Help with installation",
        "Australian standards guide",
        "Create new project",
        "Talk to support team",
      ];
      actions = [
        {
          label: "Contact Support Team",
          action: "support",
          icon: <HelpCircle className="w-4 h-4" />,
        },
      ];
    }

    // Search functionality
    else if (message.includes("search") || message.includes("find")) {
      response = `🔍 **Search & Knowledge Assistant**

I can help you find information about:

**Technical Documentation:**
• Installation procedures and best practices
• Australian standards and compliance requirements
• Troubleshooting guides and solutions
• Product specifications and compatibility

**Platform Features:**
• Project management workflows
• Quote generation and customization
• Knowledge base articles
• User guides and tutorials

What specific information are you looking for?`;
      suggestions = [
        "Find installation guides",
        "Search compliance requirements",
        "Locate troubleshooting info",
        "Platform feature help",
      ];
    }

    // Check for support-related queries
    else if (
      message.includes("support") ||
      message.includes("help me") ||
      message.includes("assistance") ||
      message.includes("human") ||
      message.includes("agent")
    ) {
      response = `🙋‍♂️ **Get Human Support**

I can connect you directly with our specialized support team! Our human experts can provide:

• **Personal assistance** with complex technical issues
• **Live troubleshooting** for urgent problems
• **Custom solutions** for unique installations
• **Account and billing** support
• **Sales consultations** for new projects

Our support team responds within 30 minutes to 8 hours depending on the issue priority.

Would you like me to connect you with a support specialist now?`;
      suggestions = [
        "Yes, connect me with support",
        "What are the response times?",
        "I'll try AI help first",
      ];
      actions = [
        {
          label: "Connect with Support Team",
          action: "support",
          icon: <HelpCircle className="w-4 h-4" />,
        },
      ];
    }

    // Fallback for unrecognized queries
    else {
      response = `I'd be happy to help! 🤖 As your EV charging specialist, I can assist with:

**Technical Support:**
• Installation guidance and procedures
• Standards compliance and regulations
• Troubleshooting and diagnostics
• Safety requirements and best practices

**Platform Help:**
• Project creation and management
• Quote generation and customization
• Feature navigation and tutorials
• Data export and reporting

If you need personalized assistance, I can also connect you with our human support team.

Could you please be more specific about what you need help with?`;
      suggestions = [
        "Installation help",
        "Standards and compliance",
        "Platform features",
        "Connect with support team",
      ];
      actions = [
        {
          label: "Contact Support Team",
          action: "support",
          icon: <HelpCircle className="w-4 h-4" />,
        },
      ];
    }

    return {
      id: `ai-${Date.now()}`,
      type: "assistant",
      content: response,
      timestamp: new Date(),
      suggestions,
      actions,
    };
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
    setInputMessage("");
    setIsTyping(true);

    // Simulate AI processing time
    setTimeout(async () => {
      const aiResponse = await getAIResponse(inputMessage);
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const handleActionClick = (action: string) => {
    switch (action) {
      case "new-project":
        setIsOpen(false);
        navigate("/projects/new");
        break;
      case "new-quote":
        setIsOpen(false);
        navigate("/quotes/new");
        break;
      case "open-knowledge":
        // Scroll to knowledge base or open knowledge section
        console.log("Opening knowledge base");
        setIsOpen(false);
        break;
      case "support":
        // Add a message confirming the handoff
        const handoffMessage: ChatMessage = {
          id: `handoff-${Date.now()}`,
          type: "assistant",
          content: `🔄 **Connecting you with Support**\n\nI'm opening our Support Assistant for you. This will help you get connected with the right specialist for your specific needs.\n\nOur support team will be able to provide personalized assistance and can access your account details if needed.`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, handoffMessage]);

        // Close the AI Assistant after a brief delay
        setTimeout(() => {
          setIsOpen(false);
          // Trigger the Support AI Assistant to open
          const supportButton = document.querySelector('[data-support-trigger]') as HTMLButtonElement;
          if (supportButton) {
            supportButton.click();
          } else {
            // Fallback: dispatch a custom event
            window.dispatchEvent(new CustomEvent('openSupportAssistant'));
          }
        }, 1500);
        break;
      case "pricing-calculator":
        handlePricingCalculator();
        break;
      case "load-calculator":
        handleLoadCalculator();
        break;
      case "cable-calculator":
        handleCableCalculator();
        break;
      case "breaker-guide":
        handleBreakerGuide();
        break;
      case "cable-standards":
        handleCableStandards();
        break;
      case "compliance-guide":
        handleComplianceGuide();
        break;
      case "standards-db":
        handleStandardsDatabase();
        break;
      case "diagnostic":
        handleDiagnosticTool();
        break;
      default:
        console.log(`Action: ${action}`);
    }
  };

  // Calculator and Tool Functions
  const handlePricingCalculator = () => {
    const calculatorMessage: ChatMessage = {
      id: `calc-${Date.now()}`,
      type: "assistant",
      content: `🧮 **Pricing Calculator**\n\n**Project Pricing Components:**\n\n• **Equipment Costs**\n  - 7kW AC Charger: $800-1,500\n  - 22kW AC Charger: $1,200-2,500\n  - Installation Kit: $150-300\n\n• **Installation Costs**\n  - Basic Installation: $500-1,000\n  - Complex Installation: $1,000-2,500\n  - Electrical Upgrades: $500-3,000\n\n• **Additional Costs**\n  - Permits & Approvals: $200-500\n  - Site Assessment: $150-300\n  - Commissioning: $200-400\n\n**Markup Guidelines:**\n• Materials: 25-40% markup\n• Labor: $85-120/hour\n• Travel: Include for >50km\n• Contingency: 10-15%\n\n**Example Quote (7kW Home Installation):**\n• Equipment: $1,200\n• Installation: $800\n• Permits: $300\n• **Total: $2,300 + GST**`,
      timestamp: new Date(),
      suggestions: [
        "Calculate specific project cost",
        "Labor rate guidelines",
        "Material markup standards",
        "Create detailed quote",
      ],
      actions: [
        {
          label: "Create Detailed Quote",
          action: "new-quote",
          icon: <Calculator className="w-4 h-4" />,
        },
        {
          label: "Load Calculator",
          action: "load-calculator",
          icon: <Zap className="w-4 h-4" />,
        },
      ],
    };
    setMessages((prev) => [...prev, calculatorMessage]);
  };

  const handleLoadCalculator = () => {
    const loadMessage: ChatMessage = {
      id: `load-${Date.now()}`,
      type: "assistant",
      content: `⚡ **Load Calculator**\n\n**Electrical Load Calculations:**\n\n• **Single Charger Loads:**\n  - 7kW (32A): Requires 40A MCB\n  - 11kW (48A): Requires 63A MCB\n  - 22kW (96A): Requires 100A MCB\n\n• **Multiple Charger Calculations:**\n  - Diversity Factor: 0.6-0.8 for residential\n  - Simultaneous Use: 0.7-0.9 for commercial\n  - Load Management: Can reduce by 30-50%\n\n**Cable Sizing:**\n• 32A Circuit: 6mm² (short runs) to 10mm² (long runs)\n• 48A Circuit: 10mm² to 16mm²\n• 96A Circuit: 25mm² to 35mm²\n\n**Voltage Drop Limits:**\n• <3% for lighting circuits\n• <5% for power circuits\n• Consider cable length and ambient temperature\n\n**Supply Capacity Check:**\nTotal Load = Existing Load + New EV Load × Diversity Factor`,
      timestamp: new Date(),
      suggestions: [
        "Calculate voltage drop",
        "Diversity factor guidelines",
        "Supply upgrade requirements",
        "Load management options",
      ],
    };
    setMessages((prev) => [...prev, loadMessage]);
  };

  const handleCableCalculator = () => {
    const cableMessage: ChatMessage = {
      id: `cable-${Date.now()}`,
      type: "assistant",
      content: `📏 **Cable Calculator**\n\n**Cable Sizing Requirements (AS/NZS 3008):**\n\n**Current Rating Selection:**\n• Cable must carry 125% of continuous load\n• Apply derating factors for installation method\n• Consider ambient temperature (>30°C)\n\n**Common EV Cable Sizes:**\n• **6mm² TPS:** Up to 32A (short runs <20m)\n• **10mm² TPS:** Up to 40A (medium runs <50m)\n• **16mm² TPS:** Up to 63A (longer runs)\n• **25mm² TPS:** Up to 80A (commercial installations)\n\n**Voltage Drop Calculation:**\nVd = (2 × L × I × ρ) ÷ A\n• L = Length (m)\n• I = Current (A)\n• ρ = Resistivity (copper = 0.0175)\n• A = Cross-sectional area (mm²)\n\n**Installation Methods:**\n• Method 1: Conduit/trunking (highest derating)\n• Method 3: Clipped direct (medium derating)\n• Method 4: Underground (lowest derating)`,
      timestamp: new Date(),
      suggestions: [
        "Calculate specific voltage drop",
        "Derating factor table",
        "Installation method comparison",
        "Cable specification guide",
      ],
    };
    setMessages((prev) => [...prev, cableMessage]);
  };

  const handleBreakerGuide = () => {
    const breakerMessage: ChatMessage = {
      id: `breaker-${Date.now()}`,
      type: "assistant",
      content: `🔌 **Circuit Breaker Selection Guide**\n\n**Breaker Types for EV Charging:**\n\n**Curve Types:**\n• **Type B:** 3-5x In (residential, low inrush)\n• **Type C:** 5-10x In (commercial, motor loads)\n• **Type D:** 10-20x In (high inrush applications)\n\n**EV Charger Requirements:**\n• 7kW Charger: 40A Type B/C MCB\n• 11kW Charger: 63A Type C MCB\n• 22kW Charger: 100A Type C MCB\n\n**Key Specifications:**\n• Breaking capacity: Minimum 6kA (10kA preferred)\n• Earth leakage protection (RCD): Type A minimum\n• Arc fault protection: Recommended for all installations\n\n**Installation Notes:**\n• Dedicated circuit for each charger\n• Upstream RCD protection required\n• Label all circuits clearly\n• Test all protection devices after installation\n\n**Common Issues:**\n• Undersized breakers cause nuisance tripping\n• Wrong curve type affects protection coordination`,
      timestamp: new Date(),
      suggestions: [
        "Breaker sizing calculator",
        "RCD type selection",
        "Arc fault protection",
        "Protection coordination",
      ],
    };
    setMessages((prev) => [...prev, breakerMessage]);
  };

  const handleCableStandards = () => {
    const standardsMessage: ChatMessage = {
      id: `standards-${Date.now()}`,
      type: "assistant",
      content: `📋 **AS/NZS 3008 Cable Standards**\n\n**Key Standard Requirements:**\n\n**Cable Selection Criteria:**\n• Current-carrying capacity (continuous rating)\n�� Voltage drop limitations (<5% for power)\n• Short-circuit withstand capability\n• Environmental conditions\n\n**Installation Classifications:**\n• **Method 1:** Conduit on walls (Reference Method B)\n• **Method 3:** Clipped direct to surfaces\n• **Method 4:** Underground in ducts/direct burial\n• **Method 11:** Ceiling spaces with insulation\n\n**Derating Factors:**\n• Ambient temperature >30°C: Apply temperature derating\n• Grouping: Multiple cables reduce capacity\n• Thermal insulation: Significant derating required\n\n**Cable Types for EV:**\n• **V75 Single Core:** Conduit installations\n• **TPS Cable:** General purpose, not suitable for high current\n• **NYY Cable:** Underground, high current capacity\n• **Automotive Cable:** Flexible sections only\n\n**Compliance Documentation:**\nMaintain records of all cable calculations and selections.`,
      timestamp: new Date(),
      suggestions: [
        "Download derating tables",
        "Installation method guide",
        "Cable specification sheets",
        "Compliance checklist",
      ],
    };
    setMessages((prev) => [...prev, standardsMessage]);
  };

  const handleComplianceGuide = () => {
    const complianceMessage: ChatMessage = {
      id: `compliance-${Date.now()}`,
      type: "assistant",
      content: `🛡️ **Compliance Checklist**\n\n**Pre-Installation Requirements:**\n✅ Site assessment completed\n✅ Electrical design approved by authority\n✅ Permits obtained\n✅ Equipment compliance certificates verified\n\n**Installation Compliance:**\n✅ AS/NZS 3000 wiring rules followed\n✅ Cable sizing per AS/NZS 3008\n✅ RCD protection installed (Type A minimum)\n✅ Circuit protection correctly sized\n✅ Earthing system verified\n\n**Testing Requirements (AS/NZS 3017):**\n✅ Insulation resistance testing (>1MΩ)\n✅ Earth continuity verification\n✅ RCD functionality testing\n✅ Polarity verification\n✅ Voltage measurements\n\n**Documentation:**\n✅ Installation certificate completed\n✅ Test results recorded\n✅ Compliance statement issued\n✅ Client handover documentation\n\n**Ongoing Requirements:**\n✅ Periodic testing schedule established\n✅ Maintenance procedures documented\n✅ Emergency contact information provided`,
      timestamp: new Date(),
      suggestions: [
        "Download test sheets",
        "Compliance documentation",
        "Inspection procedures",
        "Periodic testing guide",
      ],
    };
    setMessages((prev) => [...prev, complianceMessage]);
  };

  const handleStandardsDatabase = () => {
    const dbMessage: ChatMessage = {
      id: `db-${Date.now()}`,
      type: "assistant",
      content: `📚 **Standards Database**\n\n**Primary Australian Standards:**\n\n**AS/NZS 61851 - EV Charging Systems:**\n• Part 1: General requirements\n• Part 21: AC charging stations\n• Part 22: AC charging stations (>32A)\n• Part 23: DC charging stations\n\n**AS/NZS 3000 - Wiring Rules:**\n• Section 8: Special installations\n• Clause 8.3: Electric vehicle supply equipment\n\n**AS/NZS 3008 - Cable Selection:**\n• Current rating tables\n• Voltage drop calculations\n• Installation method classifications\n\n**AS/NZS 3017 - Verification:**\n• Testing procedures\n• Documentation requirements\n• Compliance verification\n\n**Supporting Standards:**\n• AS/NZS 3100: Electrical equipment safety\n• AS/NZS 4755: Demand response\n• AS/NZS 61439: Switchgear assemblies\n\n**Access Information:**\nStandards Australia: www.standards.org.au\nIECA Guidelines: www.ieca.com.au`,
      timestamp: new Date(),
      suggestions: [
        "Latest standard updates",
        "Purchase standards",
        "Industry guidelines",
        "Technical bulletins",
      ],
    };
    setMessages((prev) => [...prev, dbMessage]);
  };

  const handleDiagnosticTool = () => {
    const diagnosticMessage: ChatMessage = {
      id: `diag-${Date.now()}`,
      type: "assistant",
      content: `🔧 **Diagnostic Tool**\n\n**Systematic Fault Finding:**\n\n**Step 1: Safety First**\n• Isolate power supply\n• Lock out/tag out procedures\n• Verify isolation with approved tester\n\n**Step 2: Visual Inspection**\n• Check for obvious damage\n• Verify all connections tight\n• Look for overheating signs\n• Confirm correct cable routing\n\n**Step 3: Electrical Testing**\n• Insulation resistance (>1MΩ)\n• Earth continuity (<0.5Ω)\n• RCD operation (30mA trip)\n• Voltage measurements\n• Load testing under normal conditions\n\n**Step 4: Functional Testing**\n• Charging sequence verification\n• Communication systems check\n• Safety system operation\n• User interface functionality\n\n**Common Fault Patterns:**\n• Intermittent faults: Poor connections\n• Immediate tripping: Earth fault or overload\n• No power: Supply or protection issues\n• Communication errors: Network/backend problems\n\n**Documentation:**\nRecord all test results and remedial actions taken.`,
      timestamp: new Date(),
      suggestions: [
        "Fault finding flowchart",
        "Test equipment guide",
        "Common fault solutions",
        "Escalation procedures",
      ],
    };
    setMessages((prev) => [...prev, diagnosticMessage]);
  };

  const formatMessage = (content: string) => {
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
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Bot className="w-6 h-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md h-[600px] p-0 gap-0">
            <DialogHeader className="p-4 pb-2 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-sm flex items-center gap-2">
                      EV Charging Assistant
                      <Badge
                        variant="secondary"
                        className="text-xs bg-green-100 text-green-800"
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        Expert AI
                      </Badge>
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                      Specialized for Australian electrical contractors
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
                              : "bg-muted"
                          }`}
                        >
                          <div className="text-sm">
                            {message.type === "assistant" ? (
                              <div>{formatMessage(message.content)}</div>
                            ) : (
                              message.content
                            )}
                          </div>

                          {/* Suggestions */}
                          {message.suggestions &&
                            message.suggestions.length > 0 && (
                              <div className="mt-3 space-y-1">
                                {message.suggestions.map(
                                  (suggestion, index) => (
                                    <Button
                                      key={index}
                                      variant="outline"
                                      size="sm"
                                      className="text-xs h-6 px-2 mr-1 mb-1"
                                      onClick={() =>
                                        handleSuggestionClick(suggestion)
                                      }
                                    >
                                      {suggestion}
                                    </Button>
                                  ),
                                )}
                              </div>
                            )}

                          {/* Action Buttons */}
                          {message.actions && message.actions.length > 0 && (
                            <div className="mt-3 space-y-1">
                              {message.actions.map((action, index) => (
                                <Button
                                  key={index}
                                  variant="secondary"
                                  size="sm"
                                  className="text-xs h-7 px-3 mr-1 mb-1"
                                  onClick={() =>
                                    handleActionClick(action.action)
                                  }
                                >
                                  {action.icon}
                                  <span className="ml-1">{action.label}</span>
                                </Button>
                              ))}
                            </div>
                          )}

                          <div className="text-xs opacity-60 mt-2">
                            {message.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
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
                      placeholder="Ask me about EV charging..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleSendMessage()
                      }
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
                      Specialized for Australian EV charging standards
                    </div>
                    <div className="flex items-center justify-center gap-4 mt-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        AS/NZS Expert
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Installation Guide
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        Troubleshooting
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Chat Status Indicator */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40">
          <Badge
            variant="secondary"
            className="text-xs bg-green-100 text-green-800 border-green-200"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
            Online
          </Badge>
        </div>
      )}
    </>
  );
}
