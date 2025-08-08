import { enhancedFileStorageService, FileAsset, SearchFilters, BucketName } from './enhancedFileStorageService';
import { findAIResponse, aiKnowledgeBase, AIKnowledgeItem } from '../aiKnowledge';

export interface EnhancedSearchResult {
  aiResponse?: AIKnowledgeItem;
  fileResults: FileAsset[];
  combinedResponse: string;
  suggestions: string[];
  actions: Array<{
    label: string;
    action: string;
    icon?: string;
    data?: any;
  }>;
  searchMetadata: {
    totalFiles: number;
    searchTerms: string[];
    buckets: BucketName[];
    categories: string[];
    hasAIKnowledge: boolean;
  };
}

interface SearchContext {
  userRole?: string;
  currentPage?: string;
  recentQueries?: string[];
}

class AIKnowledgeSearchService {
  private readonly queryPatterns = {
    fileSearch: [
      /find|search|show|locate|get|display/i,
      /files?|documents?|videos?|manuals?|guides?/i,
      /about|on|regarding|related to/i
    ],
    installation: /install|installation|setup|mount|wiring|electrical/i,
    standards: /standard|compliance|regulation|as\/nzs|australian|requirement/i,
    troubleshooting: /trouble|problem|issue|fault|error|fix|repair/i,
    pricing: /price|cost|quote|estimate|budget|margin/i,
    technical: /specification|technical|voltage|current|power|load/i
  };

  /**
   * Performs enhanced search combining AI knowledge with file search
   */
  async enhancedSearch(
    query: string, 
    context?: SearchContext
  ): Promise<EnhancedSearchResult> {
    const normalizedQuery = query.toLowerCase().trim();
    
    // 1. Check for AI knowledge match
    const aiResponse = findAIResponse(query);
    
    // 2. Perform file search if relevant
    const isFileSearchQuery = this.isFileSearchQuery(normalizedQuery);
    let fileResults: FileAsset[] = [];
    let totalFiles = 0;
    
    if (isFileSearchQuery || aiResponse) {
      const searchFilters = this.buildSearchFilters(normalizedQuery);
      const searchResults = await enhancedFileStorageService.searchFiles(searchFilters);
      fileResults = searchResults.slice(0, 8); // Limit results
      totalFiles = searchResults.length;
    }

    // 3. Extract metadata for intelligent responses
    const searchMetadata = {
      totalFiles,
      searchTerms: this.extractSearchTerms(normalizedQuery),
      buckets: this.extractBucketHints(normalizedQuery),
      categories: this.extractCategories(normalizedQuery),
      hasAIKnowledge: !!aiResponse
    };

    // 4. Generate combined response
    const combinedResponse = this.generateCombinedResponse(
      query, 
      aiResponse, 
      fileResults, 
      searchMetadata
    );

    // 5. Generate intelligent suggestions
    const suggestions = this.generateSmartSuggestions(
      normalizedQuery, 
      aiResponse, 
      fileResults, 
      context
    );

    // 6. Generate contextual actions
    const actions = this.generateContextualActions(
      aiResponse, 
      fileResults, 
      searchMetadata
    );

    return {
      aiResponse,
      fileResults,
      combinedResponse,
      suggestions,
      actions,
      searchMetadata
    };
  }

  /**
   * Determines if query is asking for file search
   */
  private isFileSearchQuery(query: string): boolean {
    return this.queryPatterns.fileSearch.some(pattern => pattern.test(query));
  }

  /**
   * Builds search filters based on query analysis
   */
  private buildSearchFilters(query: string): SearchFilters {
    const filters: SearchFilters = {
      searchQuery: this.extractSearchTerms(query).join(' ')
    };

    // Add bucket filtering
    const buckets = this.extractBucketHints(query);
    if (buckets.length === 1) {
      filters.bucket = buckets[0];
    }

    // Add category filtering
    const categories = this.extractCategories(query);
    if (categories.length > 0) {
      filters.category = categories[0];
    }

    // Add status filtering for approved content
    if (query.includes('approved') || query.includes('official')) {
      filters.status = 'approved';
    }

    return filters;
  }

  /**
   * Extracts meaningful search terms from query
   */
  private extractSearchTerms(query: string): string[] {
    const stopWords = [
      'find', 'search', 'show', 'me', 'get', 'looking', 'for', 'about', 
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'of'
    ];
    
    const words = query.toLowerCase().split(/\s+/);
    return words.filter(word => 
      word.length > 2 && 
      !stopWords.includes(word) &&
      !/^(file|document|video|manual|guide)s?$/.test(word)
    );
  }

  /**
   * Extracts bucket hints from query
   */
  private extractBucketHints(query: string): BucketName[] {
    const buckets: BucketName[] = [];
    
    if (/videos?|training|demonstration|tutorial/i.test(query)) {
      buckets.push('charge-source-videos');
    }
    if (/documents?|manuals?|reports?|specifications?|official/i.test(query)) {
      buckets.push('charge-source-documents');
    }
    if (/personal|user|my|private/i.test(query)) {
      buckets.push('charge-source-user-files');
    }
    
    return buckets;
  }

  /**
   * Extracts categories from query
   */
  private extractCategories(query: string): string[] {
    const categories: string[] = [];
    
    if (this.queryPatterns.installation.test(query)) categories.push('Installation Guide');
    if (this.queryPatterns.standards.test(query)) categories.push('Compliance');
    if (this.queryPatterns.troubleshooting.test(query)) categories.push('Troubleshooting');
    if (/training|education|learning/i.test(query)) categories.push('Training');
    if (/safety|hazard|protection/i.test(query)) categories.push('Safety');
    if (/maintenance|service|repair/i.test(query)) categories.push('Maintenance');
    
    return categories;
  }

  /**
   * Generates combined response from AI knowledge and file results
   */
  private generateCombinedResponse(
    originalQuery: string,
    aiResponse: AIKnowledgeItem | null,
    fileResults: FileAsset[],
    metadata: any
  ): string {
    let response = "";

    // Start with AI knowledge if available
    if (aiResponse) {
      response = `🤖 **Expert Knowledge**\n\n${aiResponse.response}\n\n`;
    }

    // Add file search results
    if (fileResults.length > 0) {
      response += `📚 **Related Documents (${metadata.totalFiles} found)**\n\n`;
      
      fileResults.slice(0, 5).forEach((file, index) => {
        const bucketName = this.getBucketDisplayName(file.bucketName);
        const status = file.status === 'approved' ? '✅' : file.status === 'pending_approval' ? '⏳' : '📝';
        
        response += `**${index + 1}. ${file.title || file.fileName}** ${status}\n`;
        response += `• Type: ${bucketName} | Size: ${this.formatFileSize(file.fileSize)}\n`;
        if (file.description) {
          response += `• ${file.description}\n`;
        }
        if (file.tags.length > 0) {
          response += `• Tags: ${file.tags.slice(0, 3).join(', ')}\n`;
        }
        response += '\n';
      });

      if (metadata.totalFiles > 5) {
        response += `*... and ${metadata.totalFiles - 5} more files.*\n\n`;
      }
    } else if (this.isFileSearchQuery(originalQuery.toLowerCase())) {
      response += `🔍 **No Files Found**\n\nI couldn't find documents matching "${metadata.searchTerms.join(' ')}".\n\n`;
      response += `**Try:**\n• Using different keywords\n• Browsing by category\n• Checking file upload status\n\n`;
    }

    // Add expert guidance if no AI response was found
    if (!aiResponse && fileResults.length === 0) {
      response = this.generateFallbackResponse(originalQuery, metadata);
    }

    return response.trim();
  }

  /**
   * Generates smart suggestions based on context
   */
  private generateSmartSuggestions(
    query: string,
    aiResponse: AIKnowledgeItem | null,
    fileResults: FileAsset[],
    context?: SearchContext
  ): string[] {
    const suggestions: string[] = [];

    // AI knowledge suggestions
    if (aiResponse?.suggestions) {
      suggestions.push(...aiResponse.suggestions.slice(0, 2));
    }

    // File-based suggestions
    if (fileResults.length > 0) {
      const categories = [...new Set(fileResults.map(f => f.category).filter(Boolean))];
      if (categories.length > 1) {
        suggestions.push(`Find more ${categories[1]} documents`);
      }
      
      const tags = [...new Set(fileResults.flatMap(f => f.tags).slice(0, 3))];
      if (tags.length > 0) {
        suggestions.push(`Search files tagged "${tags[0]}"`);
      }
    }

    // Context-based suggestions
    if (this.queryPatterns.installation.test(query)) {
      suggestions.push("Find installation videos", "AS/NZS compliance checklist");
    }
    if (this.queryPatterns.troubleshooting.test(query)) {
      suggestions.push("Common fault solutions", "Diagnostic procedures");
    }

    // General suggestions
    suggestions.push("Browse all files", "Upload new document");

    return [...new Set(suggestions)].slice(0, 6);
  }

  /**
   * Generates contextual actions
   */
  private generateContextualActions(
    aiResponse: AIKnowledgeItem | null,
    fileResults: FileAsset[],
    metadata: any
  ): Array<{ label: string; action: string; icon?: string; data?: any }> {
    const actions: Array<{ label: string; action: string; icon?: string; data?: any }> = [];

    // File-specific actions
    if (fileResults.length > 0) {
      actions.push({
        label: `View All ${metadata.totalFiles} Results`,
        action: "view-all-files",
        icon: "search",
        data: { totalFiles: metadata.totalFiles }
      });

      actions.push({
        label: `Preview "${fileResults[0].title || fileResults[0].fileName}"`,
        action: "preview-file",
        icon: "eye",
        data: { fileId: fileResults[0].id }
      });
    }

    // AI knowledge actions
    if (aiResponse?.actions) {
      actions.push(...aiResponse.actions.slice(0, 2));
    }

    // General actions
    actions.push({
      label: "Open File Manager",
      action: "open-file-manager",
      icon: "folder"
    });

    return actions.slice(0, 4);
  }

  /**
   * Generates fallback response for unmatched queries
   */
  private generateFallbackResponse(query: string, metadata: any): string {
    return `🤖 **How can I help?**

I specialize in EV charging knowledge and can search your file library. 

**What I can do:**
• **Technical Guidance**: Installation, standards, troubleshooting
• **File Search**: Find documents, videos, and manuals
• **Project Help**: Planning, quoting, and best practices
• **Platform Navigation**: Feature guidance and workflows

**Try asking:**
• "Find installation guides for 22kW chargers"
• "Help with AS/NZS compliance requirements"  
• "Show troubleshooting videos"
• "Search for load management documents"

What specific information are you looking for?`;
  }

  /**
   * Utility functions
   */
  private getBucketDisplayName(bucketName: BucketName): string {
    const names = {
      'charge-source-user-files': 'User Files',
      'charge-source-documents': 'Documents',
      'charge-source-videos': 'Videos'
    };
    return names[bucketName] || bucketName;
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const aiKnowledgeSearchService = new AIKnowledgeSearchService();
export default aiKnowledgeSearchService;
