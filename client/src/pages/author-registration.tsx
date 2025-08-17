import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { 
  Upload, 
  FileText, 
  Shield, 
  DollarSign, 
  Globe, 
  CheckCircle, 
  AlertCircle,
  BookOpen,
  Award,
  Users
} from "lucide-react";

const authorRegistrationSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
  bio: z.string().min(100, "Bio must be at least 100 characters").max(1000, "Bio must be under 1000 characters"),
  expertise: z.array(z.string()).min(1, "Please select at least one area of expertise"),
  yearsOfExperience: z.number().min(1, "Must have at least 1 year of experience"),
  education: z.string().min(10, "Please provide your educational background"),
  previousPublications: z.string().optional(),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  socialMediaLinks: z.string().optional(),
  preferredLanguages: z.array(z.string()).min(1, "Please select at least one language"),
  targetAudience: z.string().min(50, "Please describe your target audience"),
  sampleWork: z.string().min(200, "Please provide a sample of your work (min 200 characters)"),
  termsAccepted: z.boolean().refine(val => val === true, "You must accept the terms and conditions"),
  publishingStandardsAccepted: z.boolean().refine(val => val === true, "You must accept the publishing standards"),
  copyrightDeclaration: z.boolean().refine(val => val === true, "You must declare that your work is original"),
});

type AuthorRegistrationForm = z.infer<typeof authorRegistrationSchema>;

const expertiseAreas = [
  "Organic Gardening",
  "Hydroponics",
  "Permaculture",
  "Plant Pathology",
  "Soil Science",
  "Crop Management",
  "Pest Control",
  "Greenhouse Management",
  "Urban Farming",
  "Sustainable Agriculture",
  "Plant Breeding",
  "Irrigation Systems",
  "Composting",
  "Landscaping",
  "Fruit Production",
  "Vegetable Growing",
  "Herb Cultivation",
  "Tree Care",
  "Garden Design",
  "Agricultural Technology"
];

const languages = [
  "English",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Chinese (Mandarin)",
  "Japanese",
  "Korean",
  "Arabic",
  "Hindi",
  "Russian"
];

export default function AuthorRegistration() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AuthorRegistrationForm>({
    resolver: zodResolver(authorRegistrationSchema),
    defaultValues: {
      fullName: user?.name || "",
      email: user?.email || "",
      phoneNumber: "",
      bio: "",
      expertise: [],
      yearsOfExperience: 1,
      education: "",
      previousPublications: "",
      websiteUrl: "",
      socialMediaLinks: "",
      preferredLanguages: [],
      targetAudience: "",
      sampleWork: "",
      termsAccepted: false,
      publishingStandardsAccepted: false,
      copyrightDeclaration: false,
    },
  });

  const registrationMutation = useMutation({
    mutationFn: async (data: AuthorRegistrationForm) => {
      const response = await fetch('/api/author-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Registration failed');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted",
        description: "Your author application has been submitted successfully. We'll review it within 5-7 business days.",
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Registration Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AuthorRegistrationForm) => {
    setIsSubmitting(true);
    const formData = {
      ...data,
      expertise: selectedExpertise,
      preferredLanguages: selectedLanguages,
    };
    registrationMutation.mutate(formData);
    setIsSubmitting(false);
  };

  const toggleExpertise = (area: string) => {
    setSelectedExpertise(prev => 
      prev.includes(area) 
        ? prev.filter(item => item !== area)
        : [...prev, area]
    );
    form.setValue('expertise', selectedExpertise.includes(area) 
      ? selectedExpertise.filter(item => item !== area)
      : [...selectedExpertise, area]
    );
  };

  const toggleLanguage = (language: string) => {
    setSelectedLanguages(prev => 
      prev.includes(language) 
        ? prev.filter(item => item !== language)
        : [...prev, language]
    );
    form.setValue('preferredLanguages', selectedLanguages.includes(language) 
      ? selectedLanguages.filter(item => item !== language)
      : [...selectedLanguages, language]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Become a Published Author</h1>
          <p className="text-lg text-gray-600 mb-6">
            Join our global community of expert authors and share your knowledge with gardening enthusiasts worldwide.
          </p>
          
          {/* Benefits Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="text-left">
                  <h3 className="font-semibold">Earn Revenue</h3>
                  <p className="text-sm text-gray-600">Up to 70% royalties on sales</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Globe className="h-8 w-8 text-blue-600" />
                <div className="text-left">
                  <h3 className="font-semibold">Global Reach</h3>
                  <p className="text-sm text-gray-600">Readers in 50+ countries</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Award className="h-8 w-8 text-purple-600" />
                <div className="text-left">
                  <h3 className="font-semibold">Expert Status</h3>
                  <p className="text-sm text-gray-600">Build your reputation</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Author Application Form
            </CardTitle>
            <CardDescription>
              Please fill out all required fields. Your application will be reviewed by our editorial team.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Personal Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Your full name" {...field} data-testid="input-fullname" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="your.email@example.com" {...field} data-testid="input-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" {...field} data-testid="input-phone" />
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
                        <FormLabel>Professional Bio *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us about your background, experience, and what makes you an expert in your field..." 
                            className="min-h-[120px]"
                            {...field}
                            data-testid="textarea-bio"
                          />
                        </FormControl>
                        <FormDescription>
                          100-1000 characters. This will be displayed on your author profile.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Expertise & Experience */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Expertise & Experience</h3>
                  
                  <div>
                    <FormLabel>Areas of Expertise *</FormLabel>
                    <FormDescription className="mb-3">
                      Select all areas where you have significant knowledge and experience.
                    </FormDescription>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {expertiseAreas.map((area) => (
                        <div key={area} className="flex items-center space-x-2">
                          <Checkbox
                            id={area}
                            checked={selectedExpertise.includes(area)}
                            onCheckedChange={() => toggleExpertise(area)}
                            data-testid={`checkbox-expertise-${area}`}
                          />
                          <label htmlFor={area} className="text-sm cursor-pointer">
                            {area}
                          </label>
                        </div>
                      ))}
                    </div>
                    {selectedExpertise.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {selectedExpertise.map((area) => (
                          <Badge key={area} variant="secondary">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name="yearsOfExperience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years of Experience *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            placeholder="5" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            data-testid="input-experience"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="education"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Educational Background *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your relevant education, certifications, and qualifications..."
                            {...field}
                            data-testid="textarea-education"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="previousPublications"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Previous Publications (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="List any books, articles, papers, or other publications you've authored..."
                            {...field}
                            data-testid="textarea-publications"
                          />
                        </FormControl>
                        <FormDescription>
                          Include titles, publishers, publication dates, and any relevant details.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Online Presence */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Online Presence</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="websiteUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website URL (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://your-website.com" {...field} data-testid="input-website" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="socialMediaLinks"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Social Media Links (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="LinkedIn, Twitter, Instagram, YouTube, etc..."
                              {...field}
                              data-testid="textarea-social"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Publishing Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Publishing Details</h3>
                  
                  <div>
                    <FormLabel>Preferred Languages *</FormLabel>
                    <FormDescription className="mb-3">
                      Select the languages you can write in effectively.
                    </FormDescription>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {languages.map((language) => (
                        <div key={language} className="flex items-center space-x-2">
                          <Checkbox
                            id={language}
                            checked={selectedLanguages.includes(language)}
                            onCheckedChange={() => toggleLanguage(language)}
                            data-testid={`checkbox-language-${language}`}
                          />
                          <label htmlFor={language} className="text-sm cursor-pointer">
                            {language}
                          </label>
                        </div>
                      ))}
                    </div>
                    {selectedLanguages.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {selectedLanguages.map((language) => (
                          <Badge key={language} variant="secondary">
                            {language}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name="targetAudience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Audience *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe who your books are intended for: beginners, experienced gardeners, commercial farmers, etc..."
                            {...field}
                            data-testid="textarea-audience"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sampleWork"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sample Work *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Provide a sample of your writing (200+ characters). This could be an excerpt from a previous work or a short piece written specifically for this application..."
                            className="min-h-[120px]"
                            {...field}
                            data-testid="textarea-sample"
                          />
                        </FormControl>
                        <FormDescription>
                          This helps us evaluate your writing style and expertise.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Terms and Conditions */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Terms & Conditions</h3>
                  
                  <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                    <FormField
                      control={form.control}
                      name="termsAccepted"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-terms"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              I accept the Terms and Conditions *
                            </FormLabel>
                            <FormDescription>
                              I agree to the platform's terms of service, author agreement, and revenue sharing model.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="publishingStandardsAccepted"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-standards"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              I accept the Publishing Standards *
                            </FormLabel>
                            <FormDescription>
                              I understand and will comply with the platform's quality standards, formatting requirements, and content guidelines.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="copyrightDeclaration"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-copyright"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Original Work Declaration *
                            </FormLabel>
                            <FormDescription>
                              I declare that all work submitted will be original, properly attributed, and does not infringe on any copyrights.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <Button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700" 
                    size="lg"
                    disabled={isSubmitting || registrationMutation.isPending}
                    data-testid="button-submit"
                  >
                    {isSubmitting || registrationMutation.isPending ? (
                      <>
                        <Upload className="mr-2 h-4 w-4 animate-spin" />
                        Submitting Application...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Submit Author Application
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                What Happens Next?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 rounded-full p-1 mt-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                </div>
                <div>
                  <p className="font-medium">Application Review</p>
                  <p className="text-sm text-gray-600">Our editorial team reviews your application within 5-7 business days.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 rounded-full p-1 mt-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                </div>
                <div>
                  <p className="font-medium">Author Approval</p>
                  <p className="text-sm text-gray-600">Once approved, you'll receive author access and publishing tools.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-green-100 rounded-full p-1 mt-1">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                </div>
                <div>
                  <p className="font-medium">Start Publishing</p>
                  <p className="text-sm text-gray-600">Upload your first e-book and start earning from your expertise!</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Quality Standards
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Original, high-quality content</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Proper formatting and structure</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Accurate and well-researched information</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Clear, engaging writing style</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Professional cover design</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Compliance with copyright laws</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}