// Production-optimized PDF generator with lazy loading
import { dynamicImport } from "./bundleOptimization";

// Lazy load heavy PDF dependencies
const loadJsPDF = dynamicImport(() => import("jspdf"));
const loadHtml2Canvas = dynamicImport(() => import("html2canvas"));

interface PDFGenerationOptions {
  filename?: string;
  format?: "a4" | "letter";
  orientation?: "portrait" | "landscape";
  quality?: number;
}

interface PDFGenerationResult {
  success: boolean;
  error?: string;
  blob?: Blob;
  downloadUrl?: string;
}

export class OptimizedPDFGenerator {
  private static instance: OptimizedPDFGenerator;
  private pdfLib: any = null;
  private canvasLib: any = null;

  static getInstance(): OptimizedPDFGenerator {
    if (!OptimizedPDFGenerator.instance) {
      OptimizedPDFGenerator.instance = new OptimizedPDFGenerator();
    }
    return OptimizedPDFGenerator.instance;
  }

  private async loadDependencies() {
    if (!this.pdfLib || !this.canvasLib) {
      try {
        const [jsPDF, html2canvas] = await Promise.all([
          loadJsPDF(),
          loadHtml2Canvas(),
        ]);

        this.pdfLib = jsPDF.default;
        this.canvasLib = html2canvas.default;
      } catch (error) {
        throw new Error(`Failed to load PDF dependencies: ${error}`);
      }
    }
  }

  async generateFromElement(
    element: HTMLElement,
    options: PDFGenerationOptions = {},
  ): Promise<PDFGenerationResult> {
    try {
      await this.loadDependencies();

      const {
        filename = "document.pdf",
        format = "a4",
        orientation = "portrait",
        quality = 1.0,
      } = options;

      // Convert element to canvas with optimized settings
      const canvas = await this.canvasLib(element, {
        scale: quality,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false, // Disable logging in production
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new this.pdfLib(orientation, "mm", format);

      // Calculate dimensions to fit content
      const imgWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);

      // Generate blob for better memory management
      const blob = pdf.output("blob");
      const downloadUrl = URL.createObjectURL(blob);

      return {
        success: true,
        blob,
        downloadUrl,
      };
    } catch (error) {
      console.error("PDF generation failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async generateFromHTML(
    html: string,
    options: PDFGenerationOptions = {},
  ): Promise<PDFGenerationResult> {
    try {
      // Create temporary element
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;
      tempDiv.style.position = "absolute";
      tempDiv.style.left = "-9999px";
      tempDiv.style.width = "800px";

      document.body.appendChild(tempDiv);

      try {
        const result = await this.generateFromElement(tempDiv, options);
        return result;
      } finally {
        document.body.removeChild(tempDiv);
      }
    } catch (error) {
      console.error("HTML to PDF conversion failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Clean up resources
  cleanup() {
    this.pdfLib = null;
    this.canvasLib = null;
  }
}

// Export singleton instance
export const pdfGenerator = OptimizedPDFGenerator.getInstance();

// Helper function for React components
export const usePDFGenerator = () => {
  const generatePDF = async (
    element: HTMLElement,
    options?: PDFGenerationOptions,
  ) => {
    const result = await pdfGenerator.generateFromElement(element, options);

    if (result.success && result.downloadUrl) {
      // Auto-download
      const link = document.createElement("a");
      link.href = result.downloadUrl;
      link.download = options?.filename || "document.pdf";
      link.click();

      // Clean up URL
      setTimeout(() => URL.revokeObjectURL(result.downloadUrl!), 100);
    }

    return result;
  };

  return { generatePDF };
};

export default pdfGenerator;
