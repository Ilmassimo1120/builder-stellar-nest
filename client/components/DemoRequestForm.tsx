import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
  User,
  Building,
  Mail,
  Phone,
  Users,
  Calendar,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface DemoRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  businessName: string;
  businessSize: string;
  jobTitle: string;
  message: string;
  agreeToTerms: boolean;
  subscribeNewsletter: boolean;
}

const businessSizeOptions = [
  { value: "1-5", label: "1-5 employees (Small)" },
  { value: "6-20", label: "6-20 employees (Medium)" },
  { value: "21-50", label: "21-50 employees (Large)" },
  { value: "51-100", label: "51-100 employees (Enterprise)" },
  { value: "100+", label: "100+ employees (Corporate)" },
];

export default function DemoRequestForm({
  isOpen,
  onClose,
}: DemoRequestFormProps) {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    businessName: "",
    businessSize: "",
    jobTitle: "",
    message: "",
    agreeToTerms: false,
    subscribeNewsletter: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (error) setError("");
  };

  const validateForm = (): boolean => {
    if (!formData.firstName.trim()) {
      setError("First name is required");
      return false;
    }
    if (!formData.lastName.trim()) {
      setError("Last name is required");
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setError("Valid email address is required");
      return false;
    }
    if (!formData.phone.trim()) {
      setError("Phone number is required");
      return false;
    }
    if (!formData.businessName.trim()) {
      setError("Business name is required");
      return false;
    }
    if (!formData.businessSize) {
      setError("Business size is required");
      return false;
    }
    if (!formData.agreeToTerms) {
      setError("You must agree to the terms and conditions");
      return false;
    }
    return true;
  };

  const submitToCRM = async (data: FormData) => {
    // This would integrate with your CRM system
    // For now, we'll simulate the API call
    try {
      const response = await fetch("/api/crm/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          source: "demo_request",
          leadType: "demo",
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit to CRM");
      }

      return await response.json();
    } catch (error) {
      console.error("CRM submission error:", error);
      throw error;
    }
  };

  const sendConfirmationEmail = async (data: FormData) => {
    // This would send a confirmation email to the user
    try {
      const response = await fetch("/api/email/demo-confirmation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: data.email,
          firstName: data.firstName,
          businessName: data.businessName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send confirmation email");
      }

      return await response.json();
    } catch (error) {
      console.error("Email sending error:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Submit to CRM
      await submitToCRM(formData);

      // Send confirmation email
      await sendConfirmationEmail(formData);

      setIsSuccess(true);

      // Auto-close after 3 seconds
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          businessName: "",
          businessSize: "",
          jobTitle: "",
          message: "",
          agreeToTerms: false,
          subscribeNewsletter: true,
        });
      }, 3000);
    } catch (error) {
      setError(
        "Something went wrong. Please try again or contact us directly.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center text-center space-y-4 py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-green-900">
                Demo Request Submitted!
              </h3>
              <p className="text-sm text-green-700">
                Thank you {formData.firstName}! We've received your demo request
                for {formData.businessName}.
              </p>
              <p className="text-xs text-muted-foreground">
                Our team will contact you within 24 hours to schedule your
                personalized demonstration. A confirmation email has been sent
                to {formData.email}.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Request a Demo
          </DialogTitle>
          <DialogDescription>
            Tell us about your business and we'll schedule a personalized
            demonstration of ChargeSource
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Personal Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-primary" />
              <h4 className="font-medium">Personal Information</h4>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  placeholder="John"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  placeholder="Smith"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="john@electricalservices.com.au"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="phone">Phone Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+61 4XX XXX XXX"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                value={formData.jobTitle}
                onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                placeholder="Electrical Contractor, Project Manager, etc."
              />
            </div>
          </div>

          {/* Business Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Building className="w-4 h-4 text-primary" />
              <h4 className="font-medium">Business Information</h4>
            </div>

            <div className="space-y-1">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) =>
                  handleInputChange("businessName", e.target.value)
                }
                placeholder="ABC Electrical Services Pty Ltd"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="businessSize">Business Size *</Label>
              <Select
                value={formData.businessSize}
                onValueChange={(value) =>
                  handleInputChange("businessSize", value)
                }
              >
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <SelectValue placeholder="Select number of employees" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {businessSizeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-1">
            <Label htmlFor="message">Additional Information (Optional)</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
              placeholder="Tell us about your current projects, specific requirements, or any questions you have..."
              rows={3}
            />
          </div>

          {/* Terms and Newsletter */}
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="agreeToTerms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) =>
                  handleInputChange("agreeToTerms", checked as boolean)
                }
                required
              />
              <Label htmlFor="agreeToTerms" className="text-xs leading-relaxed">
                I agree to the{" "}
                <a href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </a>
                , and consent to being contacted about this demo request.
              </Label>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="subscribeNewsletter"
                checked={formData.subscribeNewsletter}
                onCheckedChange={(checked) =>
                  handleInputChange("subscribeNewsletter", checked as boolean)
                }
              />
              <Label htmlFor="subscribeNewsletter" className="text-xs">
                Subscribe to our newsletter for industry insights and product
                updates
              </Label>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Request Demo
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
