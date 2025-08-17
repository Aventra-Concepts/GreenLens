import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Users, Award, Clock, Leaf, Mail, Phone, MapPin, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const expertApplicationSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
  location: z.string().min(5, "Please provide your location"),
  expertise: z.string().min(1, "Please select your area of expertise"),
  experience: z.string().min(1, "Please select your experience level"),
  qualifications: z.string().min(20, "Please provide details about your qualifications"),
  availability: z.string().min(1, "Please select your availability"),
  motivation: z.string().min(50, "Please provide more details about your motivation"),
});

type ExpertApplicationForm = z.infer<typeof expertApplicationSchema>;

const expertiseAreas = [
  "Indoor Plants & Houseplants",
  "Garden Design & Landscaping", 
  "Vegetable & Herb Gardening",
  "Tree Care & Arboriculture",
  "Plant Disease & Pest Control",
  "Soil & Composting",
  "Sustainable Gardening",
  "Hydroponics & Indoor Growing",
  "Native Plants & Ecology",
  "Orchids & Exotic Plants"
];

const experienceLevels = [
  "1-3 years professional experience",
  "4-7 years professional experience", 
  "8-15 years professional experience",
  "15+ years professional experience",
  "Certified horticulturist",
  "PhD/Advanced degree in plant sciences"
];

const availabilityOptions = [
  "Part-time (10-20 hours/week)",
  "Full-time (30-40 hours/week)",
  "Weekends only",
  "Flexible scheduling",
  "As needed basis"
];

export default function ExpertsRegister() {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ExpertApplicationForm>({
    resolver: zodResolver(expertApplicationSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      location: "",
      expertise: "",
      experience: "",
      qualifications: "",
      availability: "",
      motivation: "",
    },
  });

  const submitApplicationMutation = useMutation({
    mutationFn: async (data: ExpertApplicationForm) => {
      const response = await apiRequest("POST", "/api/expert-applications", data);
      return response.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Application Submitted!",
        description: "Thank you for your interest in joining our expert team. We'll review your application and contact you within 5-7 business days.",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ExpertApplicationForm) => {
    submitApplicationMutation.mutate(data);
  };

  if (isSubmitted) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Application Submitted Successfully!
            </h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Thank you for your interest in joining our expert team. We'll carefully review your application 
              and contact you within 5-7 business days if your qualifications match our current needs.
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <Button 
                onClick={() => window.location.href = '/'}
                variant="outline"
              >
                Return Home
              </Button>
              <Button 
                onClick={() => {
                  setIsSubmitted(false);
                  form.reset();
                }}
              >
                Submit Another Application
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Leaf className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Join Our Expert Team
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Share your plant expertise with plant enthusiasts worldwide. Help users identify their plants, 
            diagnose problems, and provide personalized care advice through our consultation platform.
          </p>
        </div>

        {/* Benefits Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Help Plant Lovers</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Share your knowledge and help plant enthusiasts solve their gardening challenges
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Award className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Earn Recognition</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Build your reputation as a certified plant expert and grow your professional network
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Flexible Schedule</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Work on your own schedule and choose consultation times that fit your lifestyle
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Application Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-green-600" />
              Expert Application Form
            </CardTitle>
            <CardDescription>
              Please fill out this form completely. All fields are required for application review.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Personal Information
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your full name" 
                              {...field} 
                              data-testid="input-fullName"
                            />
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
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="your.email@example.com" 
                              {...field} 
                              data-testid="input-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="+1 (555) 123-4567" 
                              {...field} 
                              data-testid="input-phoneNumber"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="City, State/Country" 
                              {...field} 
                              data-testid="input-location"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Professional Background */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Professional Background
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="expertise"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Area of Expertise</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-expertise">
                                <SelectValue placeholder="Select your specialty" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {expertiseAreas.map((area) => (
                                <SelectItem key={area} value={area}>
                                  {area}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Experience Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-experience">
                                <SelectValue placeholder="Select your experience" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {experienceLevels.map((level) => (
                                <SelectItem key={level} value={level}>
                                  {level}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="qualifications"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Qualifications & Certifications</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your relevant education, certifications, work experience, and any special training in horticulture, botany, or plant care..."
                            className="min-h-[100px]"
                            {...field} 
                            data-testid="textarea-qualifications"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Availability & Motivation */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Availability & Motivation
                  </h3>
                  
                  <FormField
                    control={form.control}
                    name="availability"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Availability</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-availability">
                              <SelectValue placeholder="Select your availability" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availabilityOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="motivation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Why do you want to become a GreenLens expert?</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us about your passion for plants and why you'd like to help our community of plant enthusiasts..."
                            className="min-h-[100px]"
                            {...field} 
                            data-testid="textarea-motivation"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <Button type="button" variant="outline" onClick={() => form.reset()}>
                    Clear Form
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-green-600 hover:bg-green-700"
                    disabled={submitApplicationMutation.isPending}
                    data-testid="button-submit-application"
                  >
                    {submitApplicationMutation.isPending ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Application"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}