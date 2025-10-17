import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Bot,
  Send,
  Sparkles,
  FileText,
  Search,
  Database,
  BookOpen,
  Calculator,
  Settings,
  Download,
  Eye,
  Clock,
  Users,
  Shield,
  Zap,
  HelpCircle,
  Minimize2,
  Maximize2,
  Filter,
  Tags,
  Video,
  Image,
  File,
  Archive,
} from "lucide-react";
import { stableKey } from "@/lib/stableKey";
import { useAIContext } from "@/hooks/useAIContext";
import { findAIResponse } from "@/lib/aiKnowledge";
import {
  enhancedFileStorageService,
  FileAsset,
  SearchFilters,
  BucketName,
} from "@/lib/services/enhancedFileStorageService";
import { useNavigate } from "react-router-dom";

interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  context?: string;
  suggestions?: string[];
  fileResults?: FileAsset[];
  actions?: Array<{
    label: string;
    action: string;
    icon?: React.ReactNode;
    data?: any;
  }>;
}

interface FileSearchResult {
  files: FileAsset[];
  totalFound: number;
  searchTerms: string[];
  buckets: BucketName[];
}

export function EnhancedAIAssistant() {
  const aiContext = useAIContext();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Enhanced welcome message with file search capabilities
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: "welcome",
        type: "assistant",
        content: `👋 Hi! I'm your enhanced EV charging assistant with **advanced file search capabilities**. I see you're on the **${aiContext.pageTitle}** page.

🔍 **I can now search across your entire knowledge base:**
• **User Files**: Personal documents and general files
• **Documents**: Official manuals, reports, and specifications
• **Videos**: Training content and demonstrations
• **Knowledge Base**: Expert guidance and best practices

💡 **Try asking me:**
• "Find installation videos for 22kW chargers"
• "Search for AS/NZS compliance documents"  
• "Show me training materials about load management"
• "Find troubleshooting guides for circuit breakers"

I combine file search with specialized EV charging expertise. What would you like to know or find?`,
        timestamp: new Date(),
        suggestions: [
          "Search files about installation",
          "Find compliance documents",
          "Show training videos",
          "Help with troubleshooting",
          ...aiContext.suggestions,
        ],
      };
      setMessages([welcomeMessage]);
    }
  }, [aiContext, messages.length]);

  // Enhanced file search functionality
  const searchFiles = async (
    query: string,
    filters?: Partial<SearchFilters>,
  ): Promise<FileSearchResult> => {
    try {
      setIsSearching(true);

      // Extract search terms and bucket hints from query
      const searchTerms = extractSearchTerms(query);
      const bucketHints = extractBucketHints(query);

      const searchFilters: SearchFilters = {
        searchQuery: searchTerms.join(" "),
        ...filters,
      };

      // Add bucket filter if detected
      if (bucketHints.length === 1) {
        searchFilters.bucket = bucketHints[0];
      }

      const results =
        await enhancedFileStorageService.searchFiles(searchFilters);

      return {
        files: results.slice(0, 10), // Limit to top 10 results
        totalFound: results.length,
        searchTerms,
        buckets: bucketHints,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === "string"
            ? error
            : error && typeof error === "object"
              ? JSON.stringify(error)
              : "Unknown file search error";
      console.error("File search error:", errorMessage, error);
      return {
        files: [],
        totalFound: 0,
        searchTerms: [],
        buckets: [],
      };
    } finally {
      setIsSearching(false);
    }
  };

  // Extract meaningful search terms from user query
  const extractSearchTerms = (query: string): string[] => {
    const stopWords = [
      "find",
      "search",
      "show",
      "me",
      "get",
      "looking",
      "for",
      "about",
      "the",
      "a",
      "an",
      "and",
      "or",
    ];
    const words = query.toLowerCase().split(/\s+/);
    return words.filter(
      (word) =>
        word.length > 2 &&
        !stopWords.includes(word) &&
        !/^(file|document|video|manual|guide)s?$/.test(word),
    );
  };

  // Extract bucket hints from user query
  const extractBucketHints = (query: string): BucketName[] => {
    const buckets: BucketName[] = [];
    const lowerQuery = query.toLowerCase();

    if (
      lowerQuery.includes("video") ||
      lowerQuery.includes("training") ||
      lowerQuery.includes("demonstration")
    ) {
      buckets.push("charge-source-videos");
    }
    if (
      lowerQuery.includes("document") ||
      lowerQuery.includes("manual") ||
      lowerQuery.includes("report") ||
      lowerQuery.includes("specification")
    ) {
      buckets.push("charge-source-documents");
    }
    if (
      lowerQuery.includes("personal") ||
      lowerQuery.includes("user") ||
      lowerQuery.includes("my")
    ) {
      buckets.push("charge-source-user-files");
    }

    return buckets;
  };

  // Enhanced AI response system with file search integration
  const getAIResponse = async (userMessage: string): Promise<ChatMessage> => {
    const message = userMessage.toLowerCase();

    let response = "";
    let suggestions: string[] = [];
    let fileResults: FileAsset[] = [];
    let actions: Array<{
      label: string;
      action: string;
      icon?: React.ReactNode;
      data?: any;
    }> = [];

    // Check if this is a file search request
    const isFileSearchQuery =
      message.includes("find") ||
      message.includes("search") ||
      message.includes("show") ||
      message.includes("locate") ||
      message.includes("documents") ||
      message.includes("files") ||
      message.includes("videos") ||
      message.includes("manuals");

    if (isFileSearchQuery) {
      // Perform file search
      const searchResult = await searchFiles(userMessage);
      fileResults = searchResult.files;

      if (searchResult.totalFound > 0) {
        response = `🔍 **File Search Results**

Found **${searchResult.totalFound}** files matching your query for: **${searchResult.searchTerms.join(", ")}**

${searchResult.buckets.length > 0 ? `**Search focused on**: ${searchResult.buckets.map((b) => getBucketDisplayName(b)).join(", ")}` : ""}

**Top Results:**`;

        // Add file results to response
        fileResults.slice(0, 5).forEach((file, index) => {
          const bucketName = getBucketDisplayName(file.bucketName);
          response += `\n\n**${index + 1}. ${file.title || file.fileName}**\n• Type: ${bucketName} | Size: ${formatFileSize(file.fileSize)}\n• Status: ${file.status.replace("_", " ")}\n• Description: ${file.description || "No description available"}`;
        });

        if (searchResult.totalFound > 5) {
          response += `\n\n*... and ${searchResult.totalFound - 5} more files. Use the actions below to view all results or refine your search.*`;
        }

        suggestions = [
          "Refine search with filters",
          "Search in specific bucket",
          "Find related documents",
          "Show file details",
        ];

        actions = [
          {
            label: `View All ${searchResult.totalFound} Results`,
            action: "view-all-results",
            icon: <Search className="w-4 h-4" />,
            data: {
              searchQuery: userMessage,
              totalFound: searchResult.totalFound,
            },
          },
          {
            label: "Open File Manager",
            action: "open-file-manager",
            icon: <FileText className="w-4 h-4" />,
          },
        ];

        // Add quick access actions for top files
        if (fileResults.length > 0) {
          actions.push({
            label: `Preview "${fileResults[0].title || fileResults[0].fileName}"`,
            action: "preview-file",
            icon: <Eye className="w-4 h-4" />,
            data: { fileId: fileResults[0].id },
          });
        }
      } else {
        response = `🔍 **No Files Found**

I couldn't find any files matching your search for: **${searchResult.searchTerms.join(", ")}**

**Suggestions to improve your search:**
• Try different keywords or terms
• Check spelling and use more specific terms
• Search in a specific bucket (User Files, Documents, Videos)
• Use tags or categories if you know them

**Alternative options:**
• Browse files by category in the File Manager
• Ask me for technical guidance on your topic
• Upload relevant documents if they don't exist yet`;

        suggestions = [
          "Browse files by category",
          "Upload new documents",
          "Search with different terms",
          "Get technical guidance instead",
        ];

        actions = [
          {
            label: "Open File Manager",
            action: "open-file-manager",
            icon: <FileText className="w-4 h-4" />,
          },
          {
            label: "Upload Files",
            action: "upload-files",
            icon: <Database className="w-4 h-4" />,
          },
        ];
      }
    } else {
      // Use existing AI knowledge system for non-search queries
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
              <Zap className="w-4 h-4" />
            ),
          })) || [];

        // Add file search suggestions related to the topic
        const topicKeywords = knowledgeResponse.keywords.slice(0, 2);
        suggestions.push(`Find files about ${topicKeywords.join(" and ")}`);

        actions.push({
          label: `Search Files: "${topicKeywords[0]}"`,
          action: "search-files-topic",
          icon: <Search className="w-4 h-4" />,
          data: { keywords: topicKeywords },
        });
      } else {
        // Default response with file search integration
        response = `I'd be happy to help! 🤖 I can assist with:

**📚 Knowledge & File Search:**
• Search across all your uploaded documents and videos
• Find specific installation guides and manuals
• Locate compliance documents and standards
• Access training materials and troubleshooting guides

**⚡ Technical Expertise:**
• Installation guidance and procedures
• Standards compliance and regulations  
• Troubleshooting and diagnostics
• Safety requirements and best practices

**🛠️ Platform Features:**
• Project creation and management
��� Quote generation and customization
• File organization and sharing

Could you be more specific about what you need help with? I can search your files or provide expert guidance.`;

        suggestions = [
          "Search for installation guides",
          "Find compliance documents",
          "Technical troubleshooting help",
          "Platform feature guidance",
        ];

        actions = [
          {
            label: "Browse All Files",
            action: "open-file-manager",
            icon: <FileText className="w-4 h-4" />,
          },
        ];
      }
    }

    return {
      id: `ai-${Date.now()}`,
      type: "assistant",
      content: response,
      timestamp: new Date(),
      suggestions,
      fileResults,
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

    // Process AI response with file search
    setTimeout(async () => {
      const aiResponse = await getAIResponse(inputMessage);
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const handleActionClick = async (action: string, data?: any) => {
    switch (action) {
      case "view-all-results":
        setIsOpen(false);
        navigate("/files");
        break;
      case "open-file-manager":
        setIsOpen(false);
        navigate("/files");
        break;
      case "upload-files":
        setIsOpen(false);
        navigate("/files");
        break;
      case "preview-file":
        if (data?.fileId) {
          try {
            const signedUrl = await enhancedFileStorageService.getSignedUrl(
              data.fileId,
            );
            window.open(signedUrl, "_blank");
          } catch (error) {
            console.error("Preview error:", error);
          }
        }
        break;
      case "search-files-topic":
        if (data?.keywords) {
          setInputMessage(`Find files about ${data.keywords.join(" ")}`);
        }
        break;
      case "new-project":
        setIsOpen(false);
        navigate("/projects/new");
        break;
      case "new-quote":
        setIsOpen(false);
        navigate("/quotes/new");
        break;
      default:
        console.log(`Action: ${action}`, data);
    }
  };

  // Utility functions
  const getBucketDisplayName = (bucketName: BucketName): string => {
    const bucketNames = {
      "charge-source-user-files": "👤 User Files",
      "charge-source-documents": "📄 Documents",
      "charge-source-videos": "🎥 Videos",
    };
    return bucketNames[bucketName] || bucketName;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <Image className="w-4 h-4" />;
    if (mimeType.startsWith("video/")) return <Video className="w-4 h-4" />;
    if (mimeType.includes("pdf")) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const formatMessage = (content: string) => {
    return content.split("\n").map((line, index) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return (
          <div key={stableKey(line, index)} className="font-semibold text-foreground mt-2 mb-1">
            {line.slice(2, -2)}
          </div>
        );
      }
      if (line.startsWith("• ")) {
        return (
          <div key={stableKey(line, index)} className="ml-4 text-sm">
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
                      Enhanced AI Assistant
                      <Badge
                        variant="secondary"
                        className="text-xs bg-green-100 text-green-800"
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        File Search
                      </Badge>
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                      Expert AI + Knowledge Base Search
                    </DialogDescription>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {isSearching && (
                    <Badge variant="outline" className="text-xs">
                      <Search className="w-3 h-3 mr-1 animate-pulse" />
                      Searching...
                    </Badge>
                  )}
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

                          {/* File Results */}
                          {message.fileResults &&
                            message.fileResults.length > 0 && (
                              <div className="mt-3 space-y-2">
                                <div className="text-xs font-medium text-muted-foreground">
                                  Quick Actions:
                                </div>
                                {message.fileResults.slice(0, 3).map((file) => (
                                  <div
                                    key={file.id}
                                    className="flex items-center justify-between p-2 bg-background rounded border text-xs"
                                  >
                                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                                      {getFileIcon(file.mimeType)}
                                      <span className="truncate font-medium">
                                        {file.title || file.fileName}
                                      </span>
                                    </div>
                                    <div className="flex space-x-1">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 w-6 p-0"
                                        onClick={() =>
                                          handleActionClick("preview-file", {
                                            fileId: file.id,
                                          })
                                        }
                                      >
                                        <Eye className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

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
                                    handleActionClick(
                                      action.action,
                                      action.data,
                                    )
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
                    {(isTyping || isSearching) && (
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-lg p-3 max-w-[85%]">
                          <div className="flex items-center space-x-2">
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
                            {isSearching && (
                              <span className="text-xs text-muted-foreground">
                                Searching files...
                              </span>
                            )}
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
                      placeholder="Ask me or search files..."
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
                      disabled={!inputMessage.trim() || isTyping || isSearching}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="text-center mt-2">
                    <div className="text-xs text-muted-foreground">
                      Enhanced with file search across your knowledge base
                    </div>
                    <div className="flex items-center justify-center gap-4 mt-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Expert Knowledge
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        File Search
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        Smart Suggestions
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
            Enhanced AI + Files
          </Badge>
        </div>
      )}
    </>
  );
}
