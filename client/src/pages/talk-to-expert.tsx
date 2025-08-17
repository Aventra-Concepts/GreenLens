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
  address: z.string().min(10, "Please provide a complete address"),
  problemDescription: z.string()
    .min(10, "Please provide more details about your problem")
    .max(300, "Description must be 60 words or less (approximately 300 characters)"),
  preferredDate: z.date({
    required_error: "Please select a preferred date",
  }),
  preferredTimeSlot: z.string({
    required_error: "Please select a preferred time slot",
  }),
  phoneNumber: z.string().optional(),
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
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const form = useForm<ConsultationRequestForm>({
    resolver: zodResolver(consultationRequestSchema),
    defaultValues: {
      name: user ? `${user.firstName} ${user.lastName}` : "",
      email: user?.email || "",
      address: "",
      problemDescription: "",
      phoneNumber: "",
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
      window.location.href = `/payment/consultation/${data.id}`;
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
    window.location.href = '/auth';
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
          <CardHeader>
            <CardTitle>Book Your Consultation</CardTitle>
            <CardDescription>
              Fill out the form below to schedule your expert consultation session.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Name Field */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Full Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your full name"
                            {...field}
                            data-testid="input-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email Field */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email ID
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter your email address"
                            {...field}
                            data-testid="input-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Address Field */}
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Address
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter your complete address"
                          className="min-h-[80px]"
                          {...field}
                          data-testid="input-address"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone Number (Optional) */}
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your phone number"
                          {...field}
                          data-testid="input-phone"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Problem Description */}
                <FormField
                  control={form.control}
                  name="problemDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Brief Description of the Problem (Max 60 words)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your plant-related problem or question..."
                          className="min-h-[100px]"
                          maxLength={300}
                          {...field}
                          data-testid="input-problem"
                        />
                      </FormControl>
                      <div className="text-sm text-gray-500 text-right">
                        {field.value?.length || 0}/300 characters
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Date and Time Selection */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Preferred Date */}
                  <FormField
                    control={form.control}
                    name="preferredDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4" />
                          Preferred Date
                        </FormLabel>
                        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                                data-testid="button-date-picker"
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
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
                              disabled={(date) =>
                                date < new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Time Slot */}
                  <FormField
                    control={form.control}
                    name="preferredTimeSlot"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Preferred Time Slot
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-time-slot">
                              <SelectValue placeholder="Select a time slot" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {timeSlots.map((slot) => (
                              <SelectItem key={slot} value={slot}>
                                {slot}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={createConsultationMutation.isPending}
                    data-testid="button-submit-consultation"
                  >
                    {createConsultationMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        Processing...
                      </div>
                    ) : (
                      "Book Consultation & Proceed to Payment"
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