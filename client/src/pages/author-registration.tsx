import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, CheckCircle, Clock, XCircle, Upload, FileText, User, Briefcase, CreditCard } from "lucide-react";

// Author registration form schema
const authorRegistrationSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters"),
  bio: z.string().optional(),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  expertise: z.string().min(1, "Please specify your areas of expertise"),
  experience: z.string().min(50, "Please provide at least 50 characters describing your experience"),
  hasPublishingExperience: z.boolean(),
  publishingExperienceDetails: z.string().optional(),
  copyrightAgreement: z.boolean().refine(val => val === true, "You must agree to copyright terms"),
  qualityStandardsAgreement: z.boolean().refine(val => val === true, "You must agree to quality standards"),
  exclusivityAgreement: z.boolean().refine(val => val === true, "You must agree to exclusivity terms"),
  
  // Bank Details
  bankAccountHolderName: z.string().min(1, "Account holder name is required"),
  bankAccountNumber: z.string().min(8, "Account number must be at least 8 digits"),
  bankName: z.string().min(1, "Bank name is required"),
  branchName: z.string().min(1, "Branch name is required"),
  ifscCode: z.string().optional(),
  routingNumber: z.string().optional(),
  swiftCode: z.string().optional(),
  
  // Alternative Payment
  paypalEmail: z.string().email().optional().or(z.literal("")),
});

type AuthorRegistrationForm = z.infer<typeof authorRegistrationSchema>;

export default function AuthorRegistration() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Check if user already has an author profile
  const { data: authorProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["/api/author/profile"],
    enabled: !!user,
  });

  const form = useForm<AuthorRegistrationForm>({
    resolver: zodResolver(authorRegistrationSchema),
    defaultValues: {
      displayName: "",
      bio: "",
      websiteUrl: "",
      expertise: "",
      experience: "",
      hasPublishingExperience: false,
      publishingExperienceDetails: "",
      copyrightAgreement: false,
      qualityStandardsAgreement: false,
      exclusivityAgreement: false,
      bankAccountHolderName: "",
      bankAccountNumber: "",
      bankName: "",
      branchName: "",
      ifscCode: "",
      routingNumber: "",
      swiftCode: "",
      paypalEmail: "",
    },
  });

  const submitApplication = useMutation({
    mutationFn: async (data: AuthorRegistrationForm) => {
      // Convert expertise to array
      const formData = {
        ...data,
        expertise: data.expertise.split(",").map(item => item.trim()).filter(Boolean),
        socialLinks: {},
      };
      
      const response = await apiRequest("POST", "/api/author/apply", formData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Application Submitted",
        description: "Your author application has been submitted successfully. We'll review it within 2-3 business days.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/author/profile"] });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AuthorRegistrationForm) => {
    submitApplication.mutate(data);
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // If user not logged in
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Author Registration</CardTitle>
            <CardDescription>
              Please log in to apply as an author
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You need to be logged in to submit an author application.
            </p>
            <Link href="/auth">
              <Button data-testid="button-login">
                Log In to Continue
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If already has author profile, show status
  if (isLoadingProfile) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (authorProfile) {
    const statusConfig = {
      pending: { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50", label: "Under Review" },
      under_review: { icon: Clock, color: "text-blue-600", bg: "bg-blue-50", label: "Under Review" },
      approved: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", label: "Approved" },
      rejected: { icon: XCircle, color: "text-red-600", bg: "bg-red-50", label: "Rejected" },
      suspended: { icon: XCircle, color: "text-red-600", bg: "bg-red-50", label: "Suspended" },
    };

    const status = statusConfig[authorProfile.applicationStatus as keyof typeof statusConfig] || statusConfig.pending;
    const StatusIcon = status.icon;

    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link href="/ebook-marketplace">
            <Button variant="ghost" size="sm" data-testid="button-back-marketplace">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Marketplace
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <StatusIcon className={`h-6 w-6 ${status.color}`} />
              Author Application Status
            </CardTitle>
            <CardDescription>
              Application submitted on {new Date(authorProfile.createdAt).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className={`p-4 rounded-lg ${status.bg}`}>
              <Badge variant="secondary" className={status.color}>
                {status.label}
              </Badge>
              <p className="mt-2 text-sm text-gray-600">
                {authorProfile.applicationStatus === 'pending' && "Your application is being reviewed by our team."}
                {authorProfile.applicationStatus === 'under_review' && "Your application is currently under detailed review."}
                {authorProfile.applicationStatus === 'approved' && "Congratulations! Your author application has been approved."}
                {authorProfile.applicationStatus === 'rejected' && "Your application was not approved at this time."}
                {authorProfile.applicationStatus === 'suspended' && "Your author account has been suspended."}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">Application Details</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Display Name:</span>
                    <span className="ml-2">{authorProfile.displayName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Expertise:</span>
                    <span className="ml-2">{authorProfile.expertise?.join(", ")}</span>
                  </div>
                </div>
              </div>

              {authorProfile.adminNotes && (
                <div>
                  <h3 className="font-medium mb-2">Admin Notes</h3>
                  <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded">
                    {authorProfile.adminNotes}
                  </p>
                </div>
              )}
            </div>

            {authorProfile.applicationStatus === 'approved' && (
              <div className="pt-4 border-t">
                <Link href="/author-dashboard">
                  <Button data-testid="button-author-dashboard">
                    Go to Author Dashboard
                  </Button>
                </Link>
              </div>
            )}

            {authorProfile.applicationStatus === 'rejected' && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-4">
                  You can reapply after addressing the concerns mentioned in the admin notes.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                  data-testid="button-reapply"
                >
                  Submit New Application
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Link href="/ebook-marketplace">
          <Button variant="ghost" size="sm" data-testid="button-back-marketplace">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Marketplace
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Become an Author</CardTitle>
          <CardDescription>
            Join our platform and start publishing your gardening expertise
          </CardDescription>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-between pt-4">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step}
                </div>
                {step < totalSteps && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      step < currentStep ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-semibold">Basic Information</h3>
                  </div>

                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Your author name as it will appear publicly" 
                            {...field} 
                            data-testid="input-display-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Author Bio</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell readers about yourself, your gardening background, and what makes you an expert..."
                            className="min-h-[100px]"
                            {...field}
                            data-testid="textarea-bio"
                          />
                        </FormControl>
                        <FormDescription>
                          This will be displayed on your author profile page
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="websiteUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://your-website.com" 
                            {...field} 
                            data-testid="input-website"
                          />
                        </FormControl>
                        <FormDescription>
                          Optional: Link to your personal website or blog
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 2: Professional Information */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Briefcase className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-semibold">Professional Background</h3>
                  </div>

                  <FormField
                    control={form.control}
                    name="expertise"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Areas of Expertise *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Organic gardening, Plant breeding, Hydroponics, etc. (comma-separated)" 
                            {...field} 
                            data-testid="input-expertise"
                          />
                        </FormControl>
                        <FormDescription>
                          List your main areas of gardening expertise, separated by commas
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Professional Experience *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your professional background in gardening, horticulture, or related fields..."
                            className="min-h-[120px]"
                            {...field}
                            data-testid="textarea-experience"
                          />
                        </FormControl>
                        <FormDescription>
                          Minimum 50 characters. Include your education, work experience, and any relevant credentials
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hasPublishingExperience"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-publishing-experience"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I have previous publishing experience
                          </FormLabel>
                          <FormDescription>
                            Check if you've published books, articles, or other content before
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  {form.watch("hasPublishingExperience") && (
                    <FormField
                      control={form.control}
                      name="publishingExperienceDetails"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Publishing Experience Details</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your previous publishing experience..."
                              className="min-h-[80px]"
                              {...field}
                              data-testid="textarea-publishing-details"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              )}

              {/* Step 3: Agreements and Standards */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-semibold">Publishing Standards & Agreements</h3>
                  </div>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="copyrightAgreement"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-copyright"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Copyright and Originality Agreement *
                            </FormLabel>
                            <FormDescription>
                              I confirm that all content I submit will be original work or properly licensed, 
                              and I hold the necessary rights to publish it.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="qualityStandardsAgreement"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-quality"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Quality Standards Agreement *
                            </FormLabel>
                            <FormDescription>
                              I agree to maintain high-quality content standards, provide accurate information, 
                              and follow the platform's content guidelines.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="exclusivityAgreement"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-exclusivity"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Platform Exclusivity Agreement *
                            </FormLabel>
                            <FormDescription>
                              I agree that e-books published on this platform will be exclusive to GreenLens 
                              and not available on other competing platforms.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Payment Information */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-semibold">Payment Information</h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Bank Account Details</h4>
                      
                      <FormField
                        control={form.control}
                        name="bankAccountHolderName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account Holder Name *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Full name as per bank records" 
                                {...field} 
                                data-testid="input-account-holder"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bankAccountNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account Number *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Bank account number" 
                                {...field} 
                                data-testid="input-account-number"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bankName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bank Name *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Name of your bank" 
                                {...field} 
                                data-testid="input-bank-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="branchName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Branch Name *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Bank branch name" 
                                {...field} 
                                data-testid="input-branch-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Additional Details</h4>

                      <FormField
                        control={form.control}
                        name="ifscCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>IFSC Code (India)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="IFSC code for Indian banks" 
                                {...field} 
                                data-testid="input-ifsc"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="routingNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Routing Number (US)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Routing number for US banks" 
                                {...field} 
                                data-testid="input-routing"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="swiftCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SWIFT Code (International)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="SWIFT code for international transfers" 
                                {...field} 
                                data-testid="input-swift"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Separator />

                      <FormField
                        control={form.control}
                        name="paypalEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>PayPal Email (Alternative)</FormLabel>
                            <FormControl>
                              <Input 
                                type="email"
                                placeholder="your-paypal@email.com" 
                                {...field} 
                                data-testid="input-paypal"
                              />
                            </FormControl>
                            <FormDescription>
                              Optional: PayPal email for alternative payment method
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  data-testid="button-previous"
                >
                  Previous
                </Button>

                <div className="flex gap-2">
                  {currentStep < totalSteps ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="bg-green-600 hover:bg-green-700"
                      data-testid="button-next"
                    >
                      Next Step
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={submitApplication.isPending}
                      className="bg-green-600 hover:bg-green-700"
                      data-testid="button-submit"
                    >
                      {submitApplication.isPending ? "Submitting..." : "Submit Application"}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}