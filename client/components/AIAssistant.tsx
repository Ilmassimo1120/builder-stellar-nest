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

  // AI Response System
  const getAIResponse = async (userMessage: string): Promise<ChatMessage> => {
    const message = userMessage.toLowerCase();
    
    // Context-aware responses based on current page
    const pageContext = currentPage || "dashboard";
    
    let response = "";
    let suggestions: string[] = [];
    let actions: Array<{ label: string; action: string; icon?: React.ReactNode }> = [];

    // Installation and Technical Queries
    if (message.includes("install") || message.includes("installation")) {
      if (message.includes("ac") || message.includes("22kw") || message.includes("7kw")) {
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
          "Commissioning checklist"
        ];
        actions = [
          { label: "View Installation Guide", action: "open-knowledge", icon: <BookOpen className="w-4 h-4" /> },
          { label: "Create Installation Project", action: "new-project", icon: <Zap className="w-4 h-4" /> }
        ];
      } else if (message.includes("dc") || message.includes("fast")) {
        response = `⚡ **DC Fast Charging Installation**

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
          "Safety requirements"
        ];
      }
    }
    
    // Standards and Compliance
    else if (message.includes("standard") || message.includes("compliance") || message.includes("regulation")) {
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
        "Permit requirements"
      ];
      actions = [
        { label: "Compliance Checklist", action: "compliance-guide", icon: <Shield className="w-4 h-4" /> },
        { label: "Standards Database", action: "standards-db", icon: <FileText className="w-4 h-4" /> }
      ];
    }
    
    // Troubleshooting
    else if (message.includes("trouble") || message.includes("problem") || message.includes("issue") || message.includes("fault")) {
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

What specific issue are you experiencing?`;
      suggestions = [
        "Circuit breaker keeps tripping",
        "Charger won't start",
        "Network connectivity issues",
        "Safety system activated"
      ];
      actions = [
        { label: "Diagnostic Tool", action: "diagnostic", icon: <Settings className="w-4 h-4" /> },
        { label: "Contact Support", action: "support", icon: <HelpCircle className="w-4 h-4" /> }
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
          "Pricing guidelines"
        ];
        actions = [
          { label: "New Project Wizard", action: "new-project", icon: <Zap className="w-4 h-4" /> },
          { label: "Quote Builder", action: "new-quote", icon: <Calculator className="w-4 h-4" /> }
        ];
      }
    }
    
    // Platform Navigation Help
    else if (message.includes("how") && (message.includes("use") || message.includes("navigate"))) {
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
        "Data export options"
      ];
    }
    
    // Load Management and Smart Charging
    else if (message.includes("load") || message.includes("smart") || message.includes("management")) {
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
        "Cost-benefit analysis"
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

How can I help you today?`;
      suggestions = [
        "Help with installation",
        "Australian standards guide",
        "Create new project",
        "Platform navigation"
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
        "Platform feature help"
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

Could you please be more specific about what you need help with?`;
      suggestions = [
        "Installation help",
        "Standards and compliance",
        "Platform features",
        "Troubleshooting guide"
      ];
    }

    return {
      id: `ai-${Date.now()}`,
      type: "assistant",
      content: response,
      timestamp: new Date(),
      suggestions,
      actions
    };
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: "user",
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate AI processing time
    setTimeout(async () => {
      const aiResponse = await getAIResponse(inputMessage);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const handleActionClick = (action: string) => {
    switch (action) {
      case "new-project":
        window.location.href = "/projects/new";
        break;
      case "new-quote":
        window.location.href = "/quotes/new";
        break;
      case "open-knowledge":
        // Scroll to knowledge base or open knowledge section
        console.log("Opening knowledge base");
        break;
      case "support":
        console.log("Opening support");
        break;
      default:
        console.log(`Action: ${action}`);
    }
  };

  const formatMessage = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <div key={index} className="font-semibold text-foreground mt-2 mb-1">{line.slice(2, -2)}</div>;
      }
      if (line.startsWith('• ')) {
        return <div key={index} className="ml-4 text-sm">{line}</div>;
      }
      if (line.trim() === '') {
        return <div key={index} className="h-2"></div>;
      }
      return <div key={index} className="text-sm">{line}</div>;
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
                    <DialogTitle className="text-sm">EV Charging Assistant</DialogTitle>
                    <DialogDescription className="text-xs">
                      Specialized AI for electrical contractors
                    </DialogDescription>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMinimized(!isMinimized)}
                  >
                    {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
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
                                  variant="secondary"
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
                          
                          <div className="text-xs opacity-60 mt-2">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                            <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
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
                  <div className="text-xs text-muted-foreground mt-2 text-center">
                    Specialized for Australian EV charging standards
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
          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
            Online
          </Badge>
        </div>
      )}
    </>
  );
}
