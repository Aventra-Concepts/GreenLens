import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock, User, Mail, MapPin, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const consultationRequestSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phoneNumber: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[+]?[0-9\s\-\(\)]+$/, "Please enter a valid phone number"),
  // Detailed address fields
  houseNumber: z.string().optional(),
  buildingName: z.string().optional(),
  roadNumber: z.string().optional(),
  colony: z.string().optional(),
  area: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  country: z.string().min(2, "Country is required"),
  pinZip: z.string().min(3, "PIN/ZIP code is required"),
  problemDescription: z.string()
    .min(10, "Please provide more details about your problem")
    .max(300, "Description must be 60 words or less (approximately 300 characters)"),
  preferredDate: z.date({
    required_error: "Please select a preferred date",
  }),
  preferredTimeSlot: z.string({
    required_error: "Please select a preferred time slot",
  }),
});

type ConsultationRequestForm = z.infer<typeof consultationRequestSchema>;

const timeSlots = [
  "09:00-10:00",
  "10:00-11:00", 
  "11:00-12:00",
  "12:00-13:00",
  "13:00-14:00",
  "14:00-15:00",
  "15:00-16:00",
  "16:00-17:00",
  "17:00-18:00",
];

export default function TalkToExpert() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const form = useForm<ConsultationRequestForm>({
    resolver: zodResolver(consultationRequestSchema),
    defaultValues: {
      name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : "",
      email: user?.email || "",
      phoneNumber: "",
      houseNumber: "",
      buildingName: "",
      roadNumber: "",
      colony: "",
      area: "",
      city: "",
      state: "",
      country: "",
      pinZip: "",
      problemDescription: "",
    },
  });

  const createConsultationMutation = useMutation({
    mutationFn: async (data: ConsultationRequestForm) => {
      const response = await apiRequest("POST", "/api/consultation-requests", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Consultation Request Submitted",
        description: "Redirecting to payment...",
      });
      // Redirect to payment page with consultation ID
      setLocation(`/payment/consultation/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ConsultationRequestForm) => {
    createConsultationMutation.mutate(data);
  };

  // Redirect to auth if not logged in
  if (!isLoading && !user) {
    setLocation('/auth');
    return null;
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Talk to Our Expert
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Get personalized advice from certified plant experts. Book a consultation session today!
          </p>
        </div>

        {/* Service Overview Card */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-700">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <Clock className="h-8 w-8 text-green-600 mx-auto" />
                <h3 className="font-semibold text-gray-900 dark:text-white">30-Minute Session</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">One-on-one consultation</p>
              </div>
              <div className="space-y-2">
                <User className="h-8 w-8 text-blue-600 mx-auto" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Certified Experts</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Qualified plant specialists</p>
              </div>
              <div className="space-y-2">
                <MessageSquare className="h-8 w-8 text-purple-600 mx-auto" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Phone Consultation</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Direct telephonic advice</p>
              </div>
            </div>
            <div className="mt-4 text-center">
              <span className="text-2xl font-bold text-green-600">$29.99</span>
              <span className="text-gray-600 dark:text-gray-300 ml-2">per consultation</span>
            </div>
          </CardContent>
        </Card>

        {/* Consultation Request Form */}
        <Card>
          <CardHeader className="pb-3 md:pb-4">
            <CardTitle className="text-lg md:text-xl">Book Your Consultation</CardTitle>
            <CardDescription className="text-sm">Complete the form to schedule your expert consultation session.</CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 md:space-y-4">
                {/* Personal Information - Mobile: Stack, Desktop: 3 columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs md:text-sm">Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} data-testid="input-name" className="h-8 md:h-9 text-sm" />
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
                        <FormLabel className="text-xs md:text-sm">Email ID *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="your@email.com" {...field} data-testid="input-email" className="h-8 md:h-9 text-sm" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2 lg:col-span-1">
                        <FormLabel className="text-xs md:text-sm">Phone Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="+1234567890" {...field} data-testid="input-phone" className="h-8 md:h-9 text-sm" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Address Details */}
                <div className="border-t pt-3 md:pt-4">
                  <h3 className="text-xs md:text-sm font-medium mb-2 md:mb-3 flex items-center gap-2">
                    <MapPin className="h-3 w-3 md:h-4 md:w-4" />Address Details
                  </h3>
                  
                  {/* First row - Mobile: 2 cols, Desktop: 4 cols */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 mb-2 md:mb-3">
                    <FormField
                      control={form.control}
                      name="houseNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-gray-600">House/Flat No.</FormLabel>
                          <FormControl>
                            <Input placeholder="123, A-45" {...field} data-testid="input-house-number" className="h-8 md:h-9 text-xs md:text-sm" />
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
                          <FormLabel className="text-xs text-gray-600">Building Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Green Apartments" {...field} data-testid="input-building-name" className="h-8 md:h-9 text-xs md:text-sm" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="roadNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-gray-600">Road/Street</FormLabel>
                          <FormControl>
                            <Input placeholder="Road 15" {...field} data-testid="input-road-number" className="h-8 md:h-9 text-xs md:text-sm" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="colony"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-gray-600">Colony/Locality</FormLabel>
                          <FormControl>
                            <Input placeholder="Model Town" {...field} data-testid="input-colony" className="h-8 md:h-9 text-xs md:text-sm" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Second row - Mobile: 2 cols, Tablet: 3 cols, Desktop: 5 cols */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3">
                    <FormField
                      control={form.control}
                      name="area"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-gray-600">Area/Sector</FormLabel>
                          <FormControl>
                            <Input placeholder="Sector 21" {...field} data-testid="input-area" className="h-8 md:h-9 text-xs md:text-sm" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-gray-600">City *</FormLabel>
                          <FormControl>
                            <Input placeholder="New Delhi" {...field} data-testid="input-city" className="h-8 md:h-9 text-xs md:text-sm" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-gray-600">State *</FormLabel>
                          <FormControl>
                            <Input placeholder="Delhi" {...field} data-testid="input-state" className="h-8 md:h-9 text-xs md:text-sm" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-gray-600">Country *</FormLabel>
                          <FormControl>
                            <Input placeholder="India" {...field} data-testid="input-country" className="h-8 md:h-9 text-xs md:text-sm" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="pinZip"
                      render={({ field }) => (
                        <FormItem className="col-span-2 md:col-span-1">
                          <FormLabel className="text-xs text-gray-600">PIN/ZIP *</FormLabel>
                          <FormControl>
                            <Input placeholder="110001" {...field} data-testid="input-pin-zip" className="h-8 md:h-9 text-xs md:text-sm" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Problem Description & Scheduling */}
                <div className="border-t pt-3 md:pt-4 space-y-2 md:space-y-3">
                  <FormField
                    control={form.control}
                    name="problemDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs md:text-sm flex items-center gap-2">
                          <MessageSquare className="h-3 w-3 md:h-4 md:w-4" />Problem Description (Max 60 words)
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your plant-related problem or question..."
                            className="min-h-[60px] md:min-h-[80px] text-xs md:text-sm"
                            maxLength={300}
                            {...field}
                            data-testid="input-problem"
                          />
                        </FormControl>
                        <div className="text-xs text-gray-500 text-right">{field.value?.length || 0}/300 characters</div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                    <FormField
                      control={form.control}
                      name="preferredDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-xs md:text-sm flex items-center gap-2">
                            <CalendarIcon className="h-3 w-3 md:h-4 md:w-4" />Preferred Date
                          </FormLabel>
                          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "h-8 md:h-9 pl-3 text-left font-normal text-xs md:text-sm",
                                    !field.value && "text-muted-foreground"
                                  )}
                                  data-testid="button-date-picker"
                                >
                                  {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                  <CalendarIcon className="ml-auto h-3 w-3 md:h-4 md:w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(date) => {
                                  field.onChange(date);
                                  setIsCalendarOpen(false);
                                }}
                                disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="preferredTimeSlot"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs md:text-sm flex items-center gap-2">
                            <Clock className="h-3 w-3 md:h-4 md:w-4" />Time Slot
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-time-slot" className="h-8 md:h-9 text-xs md:text-sm">
                                <SelectValue placeholder="Select time slot" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {timeSlots.map((slot) => (
                                <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-3 md:pt-4 border-t">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10 md:h-11 text-sm md:text-base"
                    disabled={createConsultationMutation.isPending}
                    data-testid="button-submit-consultation"
                  >
                    {createConsultationMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        <span className="text-xs md:text-sm">Processing...</span>
                      </div>
                    ) : (
                      <span className="text-xs md:text-base">Book Consultation ($29.99) - Proceed to Payment</span>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Information Section */}
        <Card className="bg-gray-50 dark:bg-gray-800">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              What to Expect
            </h3>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <p>After payment confirmation, you'll receive an email with consultation details</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <p>A certified plant expert will be assigned to your case within 24 hours</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <p>You'll receive a call at your preferred date and time</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <p>Get personalized advice and follow-up recommendations via email</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}