import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Eye, EyeOff, Mail, Lock, User, MapPin, AlertCircle, Calendar, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { SocialLoginButtons } from "@/components/SocialLoginButtons";

// COPPA age verification helper
const calculateAge = (dateOfBirth: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }
  return age;
};

// Registration form schema with COPPA compliance
const registerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  location: z.string().min(3, "Location must be at least 3 characters"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  password: z.string().min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain uppercase, lowercase, and number"),
  confirmPassword: z.string(),
  privacyPolicyAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the Privacy Policy to continue"
  }),
  ageVerification: z.boolean().refine(val => val === true, {
    message: "You must confirm you are 13 or older to use this service"
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => {
  const birthDate = new Date(data.dateOfBirth);
  const age = calculateAge(birthDate);
  return age >= 13;
}, {
  message: "You must be at least 13 years old to use GreenLens. This is required by COPPA (Children's Online Privacy Protection Act).",
  path: ["dateOfBirth"],
});

// Login form schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

// Password reset schema
const resetPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type RegisterForm = z.infer<typeof registerSchema>;
type LoginForm = z.infer<typeof loginSchema>;
type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, isLoading, loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && user) {
      setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      location: "",
      dateOfBirth: "",
      password: "",
      confirmPassword: "",
      privacyPolicyAccepted: false,
      ageVerification: false,
    },
  });

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const resetForm = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onRegister = async (data: RegisterForm) => {
    try {
      // Verify age compliance before registration
      const birthDate = new Date(data.dateOfBirth);
      const age = calculateAge(birthDate);
      
      if (age < 13) {
        toast({
          title: "Age Verification Failed",
          description: "You must be at least 13 years old to create an account. This requirement is mandated by COPPA for your privacy protection.",
          variant: "destructive",
        });
        return;
      }

      await registerMutation.mutateAsync({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        location: data.location,
        dateOfBirth: data.dateOfBirth,
        password: data.password,
        ageVerified: true,
      });
      toast({
        title: "Registration Successful",
        description: "Welcome to GreenLens! You can now identify plants and get care recommendations.",
      });
      setLocation("/");
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  const onLogin = async (data: LoginForm) => {
    const result = await loginMutation.mutateAsync({
      email: data.email,
      password: data.password,
    });
    
    if (result) {
      toast({
        title: "Login Successful",
        description: "Welcome back to GreenLens!",
      });
      setLocation("/");
    }
  };

  const onResetPassword = async (data: ResetPasswordForm) => {
    try {
      // TODO: Implement password reset functionality
      setResetSent(true);
      toast({
        title: "Reset Email Sent",
        description: "Check your email for password reset instructions.",
      });
    } catch (error) {
      console.error("Reset password error:", error);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Hero/Marketing content */}
          <div className="hidden lg:block space-y-8">
            <div className="text-center space-y-6">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white" data-testid="hero-title">
                Welcome to GreenLens
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300" data-testid="hero-subtitle">
                AI-Powered Plant Identification & Care Platform
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Instant Plant Identification</h3>
                  <p className="text-gray-600 dark:text-gray-300">Upload a photo and get accurate plant species identification powered by AI</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Personalized Care Plans</h3>
                  <p className="text-gray-600 dark:text-gray-300">Get customized care recommendations based on your location and plant needs</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Health Monitoring</h3>
                  <p className="text-gray-600 dark:text-gray-300">Detect plant diseases and get treatment recommendations from experts</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Authentication forms */}
          <div className="w-full max-w-md mx-auto">
            <Card className="shadow-2xl" data-testid="auth-card">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  {activeTab === "login" ? "Welcome Back" : 
                   activeTab === "register" ? "Create Account" : "Reset Password"}
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  {activeTab === "login" ? "Sign in to your GreenLens account" : 
                   activeTab === "register" ? "Join thousands of plant enthusiasts" : "Enter your email to reset your password"}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login" data-testid="login-tab">Login</TabsTrigger>
                    <TabsTrigger value="register" data-testid="register-tab">Register</TabsTrigger>
                  </TabsList>

                  {/* Login Form */}
                  <TabsContent value="login" className="space-y-4">
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4" data-testid="login-form">
                        <FormField
                          control={loginForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                  <Input
                                    {...field}
                                    type="email"
                                    placeholder="your.email@example.com"
                                    className="pl-10"
                                    data-testid="login-email"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                  <Input
                                    {...field}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    className="pl-10 pr-10"
                                    data-testid="login-password"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3"
                                    onClick={() => setShowPassword(!showPassword)}
                                    data-testid="toggle-password-visibility"
                                  >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </Button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end">
                          <Button
                            type="button"
                            variant="link"
                            className="px-0 text-sm"
                            onClick={() => setActiveTab("reset")}
                            data-testid="forgot-password-link"
                          >
                            Forgot password?
                          </Button>
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-green-600 hover:bg-green-700"
                          disabled={loginMutation.isPending}
                          data-testid="login-submit"
                        >
                          {loginMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Signing In...
                            </>
                          ) : (
                            "Sign In"
                          )}
                        </Button>
                      </form>
                    </Form>
                    
                    {/* Social Login Options */}
                    <SocialLoginButtons mode="login" />
                  </TabsContent>

                  {/* Registration Form */}
                  <TabsContent value="register" className="space-y-4">
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4" data-testid="register-form">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={registerForm.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="John"
                                    data-testid="register-firstname"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={registerForm.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="Doe"
                                    data-testid="register-lastname"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                  <Input
                                    {...field}
                                    type="email"
                                    placeholder="your.email@example.com"
                                    className="pl-10"
                                    data-testid="register-email"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                  <Input
                                    {...field}
                                    placeholder="City, Country"
                                    className="pl-10"
                                    data-testid="register-location"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* COPPA Age Verification Field */}
                        <FormField
                          control={registerForm.control}
                          name="dateOfBirth"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                Date of Birth
                                <span className="text-xs text-red-600">(COPPA Compliance - Must be 13+)</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="date"
                                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}
                                  data-testid="register-date-of-birth"
                                />
                              </FormControl>
                              <FormMessage />
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                We require this to comply with COPPA (Children's Online Privacy Protection Act). Users must be 13 or older.
                              </p>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                  <Input
                                    {...field}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Create a strong password"
                                    className="pl-10 pr-10"
                                    data-testid="register-password"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3"
                                    onClick={() => setShowPassword(!showPassword)}
                                    data-testid="toggle-register-password"
                                  >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </Button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                  <Input
                                    {...field}
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm your password"
                                    className="pl-10 pr-10"
                                    data-testid="register-confirm-password"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    data-testid="toggle-confirm-password"
                                  >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </Button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Privacy Policy Agreement */}
                        <FormField
                          control={registerForm.control}
                          name="privacyPolicyAccepted"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="register-privacy-policy"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm font-normal cursor-pointer">
                                  I agree to the{" "}
                                  <button
                                    type="button"
                                    className="text-green-600 hover:text-green-700 underline"
                                    onClick={() => window.open('/privacy', '_blank')}
                                    data-testid="privacy-policy-link"
                                  >
                                    Privacy Policy
                                  </button>
                                  {" "}and understand how my personal information will be used.
                                </FormLabel>
                                <FormMessage />
                              </div>
                            </FormItem>
                          )}
                        />

                        {/* COPPA Age Verification Checkbox */}
                        <FormField
                          control={registerForm.control}
                          name="ageVerification"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="register-age-verification"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm font-normal cursor-pointer flex items-center gap-2">
                                  <ShieldCheck className="h-4 w-4 text-green-600" />
                                  I confirm that I am 13 years of age or older
                                </FormLabel>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  This confirmation is required by COPPA (Children's Online Privacy Protection Act) to protect minors' privacy online.
                                </p>
                                <FormMessage />
                              </div>
                            </FormItem>
                          )}
                        />

                        <Button
                          type="submit"
                          className="w-full bg-green-600 hover:bg-green-700"
                          disabled={registerMutation.isPending}
                          data-testid="register-submit"
                        >
                          {registerMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating Account...
                            </>
                          ) : (
                            "Create Account"
                          )}
                        </Button>
                      </form>
                    </Form>
                    
                    {/* Social Login Options */}
                    <SocialLoginButtons mode="signup" />
                  </TabsContent>
                </Tabs>

                {/* Password Reset Tab */}
                {activeTab === "reset" && (
                  <div className="space-y-4">
                    {resetSent ? (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          If an account with that email exists, you'll receive password reset instructions.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Form {...resetForm}>
                        <form onSubmit={resetForm.handleSubmit(onResetPassword)} className="space-y-4" data-testid="reset-form">
                          <FormField
                            control={resetForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                      {...field}
                                      type="email"
                                      placeholder="your.email@example.com"
                                      className="pl-10"
                                      data-testid="reset-email"
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button
                            type="submit"
                            className="w-full bg-green-600 hover:bg-green-700"
                            data-testid="reset-submit"
                          >
                            Send Reset Instructions
                          </Button>
                        </form>
                      </Form>
                    )}

                    <div className="text-center">
                      <Button
                        type="button"
                        variant="link"
                        onClick={() => setActiveTab("login")}
                        data-testid="back-to-login"
                      >
                        Back to Login
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}