import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Logo } from "@/components/ui/logo";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Building,
  Phone,
  MapPin,
  Zap,
  CheckCircle2,
  Shield,
  Clock,
} from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    // Personal Details
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",

    // Business Details
    companyName: "",
    businessType: "",
    licenseNumber: "",
    yearsExperience: "",
    servicesOffered: [] as string[],
    businessAddress: "",
    website: "",

    // Agreements
    agreeTerms: false,
    agreeMarketing: false,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
    if (error) setError("");
  };

  const handleServiceToggle = (service: string, checked: boolean) => {
    setFormData({
      ...formData,
      servicesOffered: checked
        ? [...formData.servicesOffered, service]
        : formData.servicesOffered.filter((s) => s !== service),
    });
  };

  const validateStep1 = () => {
    if (!formData.firstName.trim()) return "First name is required";
    if (!formData.lastName.trim()) return "Last name is required";
    if (!formData.email.trim()) return "Email is required";
    if (!formData.email.includes("@"))
      return "Please enter a valid email address";
    if (!formData.password) return "Password is required";
    if (formData.password.length < 8)
      return "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword)
      return "Passwords do not match";
    return null;
  };

  const validateStep2 = () => {
    if (!formData.companyName.trim()) return "Company name is required";
    if (!formData.businessType) return "Business type is required";
    if (!formData.agreeTerms) return "You must agree to the Terms of Service";
    return null;
  };

  const handleNext = () => {
    const error = validateStep1();
    if (error) {
      setError(error);
      return;
    }
    setError("");
    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(1);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validateStep2();
    if (error) {
      setError(error);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Simulate registration - In a real app, this would call an API
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Use the auth hook to register
      const success = await register(formData);

      if (success) {
        // Show success and navigate
        navigate("/dashboard?welcome=true");
      } else {
        throw new Error("Registration failed");
      }
    } catch (error) {
      setError("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const services = [
    "Residential EV Charging Installation",
    "Commercial EV Charging Solutions",
    "DC Fast Charging Networks",
    "Fleet Charging Infrastructure",
    "Solar + EV Charging Integration",
    "Electrical Panel Upgrades",
    "Grid Connection & Utility Coordination",
    "Maintenance & Support Services",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="xl" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Join ChargeSource
          </h1>
          <p className="text-muted-foreground">
            Create your contractor account and start managing EV infrastructure
            projects
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= 1
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStep > 1 ? <CheckCircle2 className="w-4 h-4" /> : "1"}
              </div>
              <span className="ml-2 text-sm font-medium">Personal Details</span>
            </div>
            <div
              className={`h-1 w-16 ${currentStep > 1 ? "bg-primary" : "bg-muted"}`}
            />
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= 2
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                2
              </div>
              <span className="ml-2 text-sm font-medium">
                Business Information
              </span>
            </div>
          </div>
        </div>

        {/* Registration Card */}
        <Card className="shadow-lg border-primary/10">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold text-center">
              {currentStep === 1
                ? "Create Your Account"
                : "Business Information"}
            </CardTitle>
            <CardDescription className="text-center">
              {currentStep === 1
                ? "Let's start with your personal details"
                : "Tell us about your electrical contracting business"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={
                currentStep === 1
                  ? (e) => {
                      e.preventDefault();
                      handleNext();
                    }
                  : handleSubmit
              }
              className="space-y-4"
            >
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {currentStep === 1 ? (
                <>
                  {/* Personal Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="firstName"
                          name="firstName"
                          placeholder="John"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="lastName"
                          name="lastName"
                          placeholder="Smith"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@electricalservices.com.au"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="(02) 1234 5678"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Minimum 8 characters"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-11">
                    Continue to Business Details
                    <Zap className="w-4 h-4 ml-2" />
                  </Button>
                </>
              ) : (
                <>
                  {/* Business Details */}
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name *</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="companyName"
                        name="companyName"
                        placeholder="Smith Electrical Services Pty Ltd"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="businessType">Business Type *</Label>
                      <Select
                        value={formData.businessType}
                        onValueChange={(value) =>
                          handleSelectChange("businessType", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="electrical-contractor">
                            Electrical Contractor
                          </SelectItem>
                          <SelectItem value="solar-installer">
                            Solar Installer
                          </SelectItem>
                          <SelectItem value="ev-specialist">
                            EV Charging Specialist
                          </SelectItem>
                          <SelectItem value="energy-consultant">
                            Energy Consultant
                          </SelectItem>
                          <SelectItem value="general-contractor">
                            General Contractor
                          </SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="yearsExperience">
                        Years of Experience
                      </Label>
                      <Select
                        value={formData.yearsExperience}
                        onValueChange={(value) =>
                          handleSelectChange("yearsExperience", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select experience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0-2">0-2 years</SelectItem>
                          <SelectItem value="3-5">3-5 years</SelectItem>
                          <SelectItem value="6-10">6-10 years</SelectItem>
                          <SelectItem value="11-20">11-20 years</SelectItem>
                          <SelectItem value="20+">20+ years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">
                      Electrical License Number
                    </Label>
                    <Input
                      id="licenseNumber"
                      name="licenseNumber"
                      placeholder="NSW: 123456C, VIC: REC-12345, etc."
                      value={formData.licenseNumber}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessAddress">Business Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Textarea
                        id="businessAddress"
                        name="businessAddress"
                        placeholder="123 Main Street, Sydney NSW 2000"
                        value={formData.businessAddress}
                        onChange={handleInputChange}
                        className="pl-10 min-h-[60px]"
                        rows={2}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Services Offered (select all that apply)</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
                      {services.map((service) => (
                        <div
                          key={service}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={service}
                            checked={formData.servicesOffered.includes(service)}
                            onCheckedChange={(checked) =>
                              handleServiceToggle(service, checked as boolean)
                            }
                          />
                          <Label
                            htmlFor={service}
                            className="text-sm leading-tight"
                          >
                            {service}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="agreeTerms"
                        checked={formData.agreeTerms}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            agreeTerms: checked as boolean,
                          })
                        }
                        className="mt-1"
                      />
                      <Label
                        htmlFor="agreeTerms"
                        className="text-sm leading-relaxed"
                      >
                        I agree to the{" "}
                        <Link
                          to="/terms"
                          className="text-primary hover:underline"
                        >
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                          to="/privacy"
                          className="text-primary hover:underline"
                        >
                          Privacy Policy
                        </Link>{" "}
                        *
                      </Label>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="agreeMarketing"
                        checked={formData.agreeMarketing}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            agreeMarketing: checked as boolean,
                          })
                        }
                        className="mt-1"
                      />
                      <Label
                        htmlFor="agreeMarketing"
                        className="text-sm leading-relaxed"
                      >
                        I would like to receive updates about new features,
                        industry news, and special offers
                      </Label>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 h-11"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Creating Account...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Create Account
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary hover:underline font-medium"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">
              Quick 2-minute setup
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-secondary" />
            </div>
            <p className="text-xs text-muted-foreground">Secure & compliant</p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
              <Zap className="w-5 h-5 text-accent" />
            </div>
            <p className="text-xs text-muted-foreground">Start immediately</p>
          </div>
        </div>
      </div>
    </div>
  );
}
