import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { BookOpen, Upload, AlertCircle, CheckCircle } from "lucide-react";

const authorRegistrationSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  bio: z.string().min(50, "Bio must be at least 50 characters").max(1000, "Bio must be less than 1000 characters"),
  website: z.string().url("Please enter a valid website URL").optional().or(z.literal("")),
  socialMedia: z.object({
    twitter: z.string().optional(),
    linkedin: z.string().optional(),
    instagram: z.string().optional()
  }),
  expertise: z.array(z.string()).min(1, "Please select at least one area of expertise"),
  previousWorks: z.string().optional(),
  education: z.string().min(10, "Please provide your educational background"),
  experience: z.string().min(20, "Please describe your relevant experience"),
  agreeToTerms: z.boolean().refine(val => val === true, "You must agree to the terms and conditions")
});

type AuthorRegistrationForm = z.infer<typeof authorRegistrationSchema>;

const expertiseAreas = [
  "Gardening & Horticulture",
  "Plant Biology & Botany",
  "Sustainable Agriculture",
  "Indoor Plants & Houseplants",
  "Landscape Design",
  "Organic Farming",
  "Permaculture",
  "Plant Pathology",
  "Soil Science",
  "Greenhouse Management",
  "Hydroponics & Aeroponics",
  "Native Plants & Wild Gardening",
  "Food Production & Vegetable Gardening",
  "Ornamental Plants & Flower Gardening",
  "Tree Care & Arboriculture"
];

interface AuthorRegistrationProps {
  onSuccess?: () => void;
}

export default function AuthorRegistration({ onSuccess }: AuthorRegistrationProps) {
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AuthorRegistrationForm>({
    resolver: zodResolver(authorRegistrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      bio: "",
      website: "",
      socialMedia: {
        twitter: "",
        linkedin: "",
        instagram: ""
      },
      expertise: [],
      previousWorks: "",
      education: "",
      experience: "",
      agreeToTerms: false
    }
  });

  const registerAuthorMutation = useMutation({
    mutationFn: async (data: AuthorRegistrationForm) => {
      const response = await apiRequest("POST", "/api/authors/register", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Application Submitted Successfully",
        description: "Your author application has been submitted for review. You'll receive an email confirmation shortly.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      form.reset();
      setSelectedExpertise([]);
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to submit author application. Please try again.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: AuthorRegistrationForm) => {
    registerAuthorMutation.mutate({
      ...data,
      expertise: selectedExpertise
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 text-white rounded-full mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Become an Author
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join our platform and share your expertise in gardening, plant care, and agriculture with readers worldwide.
          </p>
        </div>

        <Card className="border-t-4 border-t-yellow-400">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Upload className="w-6 h-6 text-yellow-600" />
              Author Application
            </CardTitle>
            <CardDescription>
              Fill out the form below to apply as an author. All applications are reviewed by our editorial team.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Personal Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      {...form.register("firstName")}
                      placeholder="Enter your first name"
                      data-testid="input-firstName"
                    />
                    {form.formState.errors.firstName && (
                      <p className="text-sm text-red-600">{form.formState.errors.firstName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      {...form.register("lastName")}
                      placeholder="Enter your last name"
                      data-testid="input-lastName"
                    />
                    {form.formState.errors.lastName && (
                      <p className="text-sm text-red-600">{form.formState.errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register("email")}
                      placeholder="Enter your email address"
                      data-testid="input-email"
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      {...form.register("phone")}
                      placeholder="Enter your phone number"
                      data-testid="input-phone"
                    />
                    {form.formState.errors.phone && (
                      <p className="text-sm text-red-600">{form.formState.errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website (Optional)</Label>
                  <Input
                    id="website"
                    {...form.register("website")}
                    placeholder="https://your-website.com"
                    data-testid="input-website"
                  />
                  {form.formState.errors.website && (
                    <p className="text-sm text-red-600">{form.formState.errors.website.message}</p>
                  )}
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Professional Information
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Professional Bio *</Label>
                  <Textarea
                    id="bio"
                    {...form.register("bio")}
                    placeholder="Tell us about yourself, your background, and your expertise in gardening/plant care..."
                    className="min-h-[120px]"
                    data-testid="textarea-bio"
                  />
                  <p className="text-sm text-gray-500">
                    {form.watch("bio")?.length || 0}/1000 characters (minimum 50)
                  </p>
                  {form.formState.errors.bio && (
                    <p className="text-sm text-red-600">{form.formState.errors.bio.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Areas of Expertise *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4 border rounded-lg">
                    {expertiseAreas.map((area) => (
                      <div key={area} className="flex items-center space-x-2">
                        <Checkbox
                          id={area}
                          checked={selectedExpertise.includes(area)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedExpertise([...selectedExpertise, area]);
                            } else {
                              setSelectedExpertise(selectedExpertise.filter(item => item !== area));
                            }
                          }}
                          data-testid={`checkbox-${area}`}
                        />
                        <Label htmlFor={area} className="text-sm font-normal">
                          {area}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {selectedExpertise.length === 0 && form.formState.errors.expertise && (
                    <p className="text-sm text-red-600">{form.formState.errors.expertise.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="education">Educational Background *</Label>
                  <Textarea
                    id="education"
                    {...form.register("education")}
                    placeholder="Describe your relevant education, certifications, and qualifications..."
                    data-testid="textarea-education"
                  />
                  {form.formState.errors.education && (
                    <p className="text-sm text-red-600">{form.formState.errors.education.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Relevant Experience *</Label>
                  <Textarea
                    id="experience"
                    {...form.register("experience")}
                    placeholder="Describe your experience in gardening, plant care, writing, or related fields..."
                    data-testid="textarea-experience"
                  />
                  {form.formState.errors.experience && (
                    <p className="text-sm text-red-600">{form.formState.errors.experience.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="previousWorks">Previous Works/Publications (Optional)</Label>
                  <Textarea
                    id="previousWorks"
                    {...form.register("previousWorks")}
                    placeholder="List any books, articles, blogs, or other publications you've authored..."
                    data-testid="textarea-previousWorks"
                  />
                </div>
              </div>

              {/* Social Media */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Social Media (Optional)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input
                      id="twitter"
                      {...form.register("socialMedia.twitter")}
                      placeholder="@yourusername"
                      data-testid="input-twitter"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      {...form.register("socialMedia.linkedin")}
                      placeholder="linkedin.com/in/yourusername"
                      data-testid="input-linkedin"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      {...form.register("socialMedia.instagram")}
                      placeholder="@yourusername"
                      data-testid="input-instagram"
                    />
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="agreeToTerms"
                    {...form.register("agreeToTerms")}
                    data-testid="checkbox-terms"
                  />
                  <div className="space-y-1">
                    <Label htmlFor="agreeToTerms" className="text-sm font-normal">
                      I agree to the Terms and Conditions for Authors *
                    </Label>
                    <p className="text-xs text-gray-500">
                      By checking this box, you agree to our publishing guidelines, content standards, and revenue sharing terms.
                    </p>
                  </div>
                </div>
                {form.formState.errors.agreeToTerms && (
                  <p className="text-sm text-red-600">{form.formState.errors.agreeToTerms.message}</p>
                )}
              </div>

              {/* Submission Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="space-y-2">
                    <h4 className="font-semibold text-blue-900">Review Process</h4>
                    <div className="text-sm text-blue-800 space-y-1">
                      <p>• Your application will be reviewed within 5-7 business days</p>
                      <p>• You'll receive an email notification about the status of your application</p>
                      <p>• Approved authors can start uploading e-books immediately</p>
                      <p>• All e-books go through content moderation before publication</p>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={registerAuthorMutation.isPending}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 text-lg font-semibold"
                data-testid="button-submit-application"
              >
                {registerAuthorMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Submitting Application...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Submit Author Application
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}