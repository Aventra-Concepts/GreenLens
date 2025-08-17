import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Plus, 
  X, 
  Upload, 
  User, 
  MapPin, 
  GraduationCap, 
  CreditCard, 
  FileText, 
  Clock, 
  Loader2,
  Camera,
  UserCheck
} from "lucide-react";

// Country list for dropdown
const countries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia", "Australia",
  "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium",
  "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei",
  "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Central African Republic",
  "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus",
  "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "East Timor", "Ecuador", "Egypt",
  "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau",
  "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland",
  "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "North Korea", "South Korea",
  "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania",
  "Luxembourg", "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands",
  "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco",
  "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger",
  "Nigeria", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines",
  "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia",
  "Saint Vincent and the Grenadines", "Samoa", "San Marino", "São Tomé and Príncipe", "Saudi Arabia", "Senegal",
  "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia",
  "South Africa", "Spain", "Sri Lanka", "Sudan", "Suriname", "Swaziland", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey",
  "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States",
  "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

// Form validation schema
const expertApplicationSchema = z.object({
  // Personal Information
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  middleName: z.string().optional(),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  age: z.number().min(18, "Age must be at least 18").max(80, "Age cannot exceed 80"),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"], {
    required_error: "Please select your gender",
  }),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").optional(),
  
  // Address Information
  houseNumber: z.string().min(1, "House number is required"),
  buildingName: z.string().optional(),
  roadName: z.string().min(1, "Road name/number is required"),
  colonyName: z.string().optional(),
  areaName: z.string().min(1, "Area name is required"),
  cityName: z.string().min(1, "City name is required"),
  stateName: z.string().min(1, "State name is required"),
  countryName: z.string().min(1, "Please select a country"),
  postalCode: z.string().optional(),
  
  // Professional Information
  qualifications: z.array(z.object({
    degree: z.string().min(1, "Degree/certification is required"),
    institution: z.string().min(1, "Institution name is required"),
    year: z.number().min(1950, "Year must be valid").max(new Date().getFullYear(), "Year cannot be in the future"),
    documentPath: z.string().optional(),
  })).min(1, "At least one qualification is required"),
  specialization: z.string().min(1, "Please specify your plant specialization"),
  experience: z.number().min(0, "Experience cannot be negative").max(60, "Experience cannot exceed 60 years"),
  
  // Contact Preferences
  availableHours: z.string().min(1, "Please specify your available hours"),
  consultationRate: z.number().min(1, "Consultation rate must be at least $1/hour"),
  
  // Bank Details (optional but recommended)
  bankAccountHolderName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankName: z.string().optional(),
  branchName: z.string().optional(),
  ifscCode: z.string().optional(),
  swiftCode: z.string().optional(),
  
  // Alternative Payment Details
  paypalEmail: z.string().email().optional().or(z.literal("")),
  skydoDetails: z.string().optional(),
  
  // Terms and Conditions
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

type ExpertApplicationForm = z.infer<typeof expertApplicationSchema>;

export default function ExpertOnboarding() {
  const { toast } = useToast();
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ExpertApplicationForm>({
    resolver: zodResolver(expertApplicationSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      age: 25,
      gender: undefined,
      email: "",
      phone: "",
      houseNumber: "",
      buildingName: "",
      roadName: "",
      colonyName: "",
      areaName: "",
      cityName: "",
      stateName: "",
      countryName: "",
      postalCode: "",
      qualifications: [{ degree: "", institution: "", year: new Date().getFullYear(), documentPath: "" }],
      specialization: "",
      experience: 0,
      availableHours: "",
      consultationRate: 25,
      bankAccountHolderName: "",
      bankAccountNumber: "",
      bankName: "",
      branchName: "",
      ifscCode: "",
      swiftCode: "",
      paypalEmail: "",
      skydoDetails: "",
      termsAccepted: false,
    },
  });

  const { fields: qualificationFields, append: addQualification, remove: removeQualification } = useFieldArray({
    control: form.control,
    name: "qualifications",
  });

  const submitApplicationMutation = useMutation({
    mutationFn: async (data: ExpertApplicationForm) => {
      const formData = new FormData();
      
      // Add profile photo if uploaded
      if (profilePhoto) {
        formData.append('profilePhoto', profilePhoto);
      }
      
      // Add qualification documents
      qualificationFields.forEach((field, index) => {
        const fileInput = document.getElementById(`qualification-doc-${index}`) as HTMLInputElement;
        if (fileInput?.files?.[0]) {
          formData.append(`qualificationDoc_${index}`, fileInput.files[0]);
        }
      });
      
      // Add form data
      formData.append('applicationData', JSON.stringify(data));
      
      const response = await apiRequest('POST', '/api/expert-applications', formData);
      return response.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Application Submitted Successfully!",
        description: "Your expert application has been submitted for review. You will receive an email confirmation shortly.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message || "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleProfilePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (50KB = 51200 bytes)
      if (file.size > 51200) {
        toast({
          title: "File Too Large",
          description: "Profile photo must be smaller than 50KB. Please compress the image and try again.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file type
      if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a JPEG or PNG image only.",
          variant: "destructive",
        });
        return;
      }
      
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleQualificationDocumentChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (50KB = 51200 bytes)
      if (file.size > 51200) {
        toast({
          title: "File Too Large",
          description: "Qualification document must be smaller than 50KB. Please compress the image and try again.",
          variant: "destructive",
        });
        event.target.value = "";
        return;
      }
      
      // Validate file type
      if (!file.type.match(/^image\/(jpeg|jpg|png|pdf)$/)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a JPEG, PNG, or PDF file only.",
          variant: "destructive",
        });
        event.target.value = "";
        return;
      }
    }
  };

  const onSubmit = (data: ExpertApplicationForm) => {
    submitApplicationMutation.mutate(data);
  };

  if (isSubmitted) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-16">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <UserCheck className="w-10 h-10 text-green-600" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Application Submitted Successfully!
                </h1>
                <p className="text-lg text-gray-600 mb-6">
                  Thank you for applying to become a GreenLens plant expert. Your application has been received and is now under review.
                </p>
                <div className="bg-white p-4 rounded-lg border border-green-200 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">What happens next?</h3>
                  <ul className="text-sm text-gray-600 space-y-2 text-left">
                    <li>• Our team will review your application and qualifications</li>
                    <li>• You will receive an email confirmation shortly</li>
                    <li>• Review process typically takes 3-5 business days</li>
                    <li>• You'll be notified via email once your application is approved</li>
                    <li>• Approved experts will receive onboarding instructions</li>
                  </ul>
                </div>
                <Button 
                  onClick={() => window.location.href = '/'}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Return to Home
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Expert Onboarding Application
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join our team of plant specialists and help users around the world with expert plant care advice. 
              Complete the application form below to get started.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Please provide your basic personal details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter first name" {...field} data-testid="input-first-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="middleName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Middle Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter middle name" {...field} data-testid="input-middle-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter last name" {...field} data-testid="input-last-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Enter age" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              data-testid="input-age"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-gender">
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                              <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter phone number" {...field} data-testid="input-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="Enter email address" 
                            {...field} 
                            data-testid="input-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Profile Photo Upload */}
                  <div className="space-y-2">
                    <FormLabel>Profile Photo</FormLabel>
                    <p className="text-sm text-gray-600 mb-2">
                      Upload a clear professional photo (maximum 50KB, JPEG/PNG only)
                    </p>
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                        {profilePhotoPreview ? (
                          <img 
                            src={profilePhotoPreview} 
                            alt="Profile preview" 
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Camera className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <Input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png"
                          onChange={handleProfilePhotoChange}
                          className="hidden"
                          id="profile-photo-upload"
                          data-testid="input-profile-photo"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('profile-photo-upload')?.click()}
                          className="flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          Choose Photo
                        </Button>
                        <p className="text-xs text-gray-500 mt-1">Max 50KB</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Address Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Address Information
                  </CardTitle>
                  <CardDescription>
                    Please provide your complete address details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="houseNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>House Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter house number" {...field} data-testid="input-house-number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="buildingName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Building Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter building name" {...field} data-testid="input-building-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="roadName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Road Name/Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter road name or number" {...field} data-testid="input-road-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="colonyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Colony Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter colony name" {...field} data-testid="input-colony-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="areaName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Area Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter area name" {...field} data-testid="input-area-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cityName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter city name" {...field} data-testid="input-city-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="stateName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter state name" {...field} data-testid="input-state-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="countryName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country Name *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-country">
                                <SelectValue placeholder="Select country" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-60">
                              {countries.map((country) => (
                                <SelectItem key={country} value={country}>
                                  {country}
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
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter postal code" {...field} data-testid="input-postal-code" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Professional Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Professional Qualifications
                  </CardTitle>
                  <CardDescription>
                    Add your educational qualifications and professional certifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {qualificationFields.map((field, index) => (
                    <div key={field.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Qualification {index + 1}</h4>
                        {qualificationFields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeQualification(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                            Remove
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name={`qualifications.${index}.degree`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Degree/Certification *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="e.g., Ph.D. in Botany" 
                                  {...field} 
                                  data-testid={`input-qualification-degree-${index}`}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`qualifications.${index}.institution`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Institution *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="e.g., University of Agriculture" 
                                  {...field} 
                                  data-testid={`input-qualification-institution-${index}`}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`qualifications.${index}.year`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Year of Completion *</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="e.g., 2020" 
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  data-testid={`input-qualification-year-${index}`}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div>
                        <FormLabel>Qualification Document (Optional)</FormLabel>
                        <p className="text-sm text-gray-600 mb-2">
                          Upload a clear photo of your qualification certificate (max 50KB, JPEG/PNG/PDF)
                        </p>
                        <Input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,application/pdf"
                          onChange={(e) => handleQualificationDocumentChange(index, e)}
                          id={`qualification-doc-${index}`}
                          data-testid={`input-qualification-document-${index}`}
                        />
                      </div>
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addQualification({ degree: "", institution: "", year: new Date().getFullYear(), documentPath: "" })}
                    className="flex items-center gap-2"
                    data-testid="button-add-qualification"
                  >
                    <Plus className="w-4 h-4" />
                    Add Another Qualification
                  </Button>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="specialization"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Plant Specialization *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Tropical Plants, Succulents, Indoor Plants" 
                              {...field} 
                              data-testid="input-specialization"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years of Experience *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Enter years of experience" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              data-testid="input-experience"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Consultation Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Consultation Preferences
                  </CardTitle>
                  <CardDescription>
                    Set your availability and consultation rates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="availableHours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Available Hours *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Mon-Fri 9AM-5PM EST" 
                              {...field} 
                              data-testid="input-available-hours"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="consultationRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Consultation Rate (USD/hour) *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="e.g., 25" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              data-testid="input-consultation-rate"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Bank Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Information
                  </CardTitle>
                  <CardDescription>
                    Provide your bank details or alternative payment methods for receiving consultation payments
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <h4 className="font-medium">Bank Account Details</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="bankAccountHolderName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Holder Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter account holder name" {...field} data-testid="input-account-holder-name" />
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
                          <FormLabel>Bank Account Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter account number" {...field} data-testid="input-account-number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="bankName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bank Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter bank name" {...field} data-testid="input-bank-name" />
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
                          <FormLabel>Branch Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter branch name" {...field} data-testid="input-branch-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="ifscCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>IFSC Code</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter IFSC code" {...field} data-testid="input-ifsc-code" />
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
                          <FormLabel>SWIFT Code</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter SWIFT code" {...field} data-testid="input-swift-code" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <h4 className="font-medium">Alternative Payment Methods</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="paypalEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PayPal Email</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="Enter PayPal email" 
                              {...field} 
                              data-testid="input-paypal-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="skydoDetails"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Skydo Details</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter Skydo account details" 
                              {...field} 
                              data-testid="input-skydo-details"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Terms and Conditions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Terms and Conditions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h4 className="font-medium mb-2">Expert Terms and Conditions</h4>
                    <div className="text-sm text-gray-600 space-y-2 max-h-40 overflow-y-auto">
                      <p>1. As a GreenLens expert, you agree to provide accurate and professional plant care advice to users.</p>
                      <p>2. You will maintain confidentiality of all user information shared during consultations.</p>
                      <p>3. You agree to respond to user queries within 24 hours during your specified available hours.</p>
                      <p>4. All consultation fees will be processed through GreenLens, with payments made according to the agreed schedule.</p>
                      <p>5. You retain the right to decline consultations that fall outside your area of expertise.</p>
                      <p>6. GreenLens reserves the right to review and approve all expert applications.</p>
                      <p>7. You agree to maintain professional standards and provide evidence-based advice.</p>
                      <p>8. This agreement can be terminated by either party with 30 days written notice.</p>
                    </div>
                  </div>
                  
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
                          <FormLabel className="text-sm font-normal">
                            I accept the terms and conditions and agree to abide by the expert guidelines *
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-center">
                <Button
                  type="submit"
                  disabled={submitApplicationMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
                  data-testid="button-submit-application"
                >
                  {submitApplicationMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Submitting Application...
                    </>
                  ) : (
                    "Submit Expert Application"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </Layout>
  );
}