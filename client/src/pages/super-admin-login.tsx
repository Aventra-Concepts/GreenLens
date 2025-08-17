import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  KeyRound, 
  AlertTriangle,
  Loader2,
  ArrowLeft,
  Smartphone
} from "lucide-react";

interface LoginForm {
  email: string;
  password: string;
  totpCode: string;
  backupCode: string;
}

interface LoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isAdmin: boolean;
    isSuperAdmin: boolean;
    twoFactorEnabled: boolean;
  };
  requiresTwoFactor?: boolean;
  error?: string;
}

export default function SuperAdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: '',
    totpCode: '',
    backupCode: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loginStep, setLoginStep] = useState<'credentials' | 'twoFactor'>('credentials');
  const [useBackupCode, setUseBackupCode] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const token = sessionStorage.getItem("adminToken");
    const user = sessionStorage.getItem("adminUser");
    
    if (token && user) {
      setLocation("/super-admin-dashboard");
    }
  }, [setLocation]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: Partial<LoginForm>) => {
      const response = await apiRequest('POST', '/api/admin/auth/login', credentials);
      return await response.json() as LoginResponse;
    },
    onSuccess: (data) => {
      if (data.success && data.token && data.user) {
        // Store authentication data
        sessionStorage.setItem("adminToken", data.token);
        sessionStorage.setItem("adminUser", JSON.stringify(data.user));
        
        toast({
          title: "Login Successful",
          description: `Welcome back, ${data.user.firstName}!`,
        });
        
        setLocation("/super-admin-dashboard");
      } else if (data.requiresTwoFactor) {
        setLoginStep('twoFactor');
        toast({
          title: "Two-Factor Authentication Required",
          description: "Please enter your authenticator code to continue",
        });
      } else {
        toast({
          title: "Login Failed",
          description: data.error || "Invalid credentials",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Login Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  });

  const handleInputChange = (field: keyof LoginForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }
    
    loginMutation.mutate({
      email: formData.email,
      password: formData.password
    });
  };

  const handleTwoFactorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!useBackupCode && !formData.totpCode) {
      toast({
        title: "Missing Code",
        description: "Please enter your authenticator code",
        variant: "destructive",
      });
      return;
    }
    
    if (useBackupCode && !formData.backupCode) {
      toast({
        title: "Missing Backup Code",
        description: "Please enter your backup code",
        variant: "destructive",
      });
      return;
    }
    
    loginMutation.mutate({
      email: formData.email,
      password: formData.password,
      totpCode: useBackupCode ? undefined : formData.totpCode,
      backupCode: useBackupCode ? formData.backupCode : undefined
    });
  };

  const goBackToCredentials = () => {
    setLoginStep('credentials');
    setFormData(prev => ({ ...prev, totpCode: '', backupCode: '' }));
    setUseBackupCode(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">GreenLens Admin</h1>
          <p className="text-gray-400">Secure administrative access</p>
        </div>

        <Card className="shadow-2xl border-gray-700 bg-gray-800">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-white flex items-center justify-center gap-2">
              {loginStep === 'credentials' ? (
                <>
                  <Lock className="w-5 h-5" />
                  Administrator Login
                </>
              ) : (
                <>
                  <KeyRound className="w-5 h-5" />
                  Two-Factor Authentication
                </>
              )}
            </CardTitle>
            <CardDescription className="text-center text-gray-400">
              {loginStep === 'credentials' 
                ? "Enter your administrator credentials"
                : "Enter your authenticator code to complete login"
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Security Warning */}
            <Alert className="border-yellow-600 bg-yellow-900/20">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-yellow-200">
                This is a restricted area. All access attempts are logged and monitored.
              </AlertDescription>
            </Alert>

            {/* Credentials Form */}
            {loginStep === 'credentials' && (
              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-200">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@greenlens.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      disabled={loginMutation.isPending}
                      data-testid="input-admin-email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-200">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="pl-10 pr-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      disabled={loginMutation.isPending}
                      data-testid="input-admin-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-8 w-8 p-0 text-gray-400 hover:text-white"
                      onClick={() => setShowPassword(!showPassword)}
                      data-testid="toggle-password-visibility"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                  disabled={loginMutation.isPending}
                  data-testid="submit-credentials"
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Continue
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* Two-Factor Authentication Form */}
            {loginStep === 'twoFactor' && (
              <form onSubmit={handleTwoFactorSubmit} className="space-y-4">
                <div className="text-center mb-4">
                  <div className="mx-auto w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-2">
                    <Smartphone className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm text-gray-400">
                    {useBackupCode 
                      ? "Enter one of your backup codes"
                      : "Open your authenticator app and enter the 6-digit code"
                    }
                  </p>
                </div>

                {!useBackupCode ? (
                  <div className="space-y-2">
                    <Label htmlFor="totpCode" className="text-gray-200">Authenticator Code</Label>
                    <Input
                      id="totpCode"
                      type="text"
                      placeholder="000000"
                      value={formData.totpCode}
                      onChange={(e) => handleInputChange('totpCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="text-center text-2xl font-mono bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      maxLength={6}
                      disabled={loginMutation.isPending}
                      data-testid="input-totp-code"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="backupCode" className="text-gray-200">Backup Code</Label>
                    <Input
                      id="backupCode"
                      type="text"
                      placeholder="Enter backup code"
                      value={formData.backupCode}
                      onChange={(e) => handleInputChange('backupCode', e.target.value)}
                      className="text-center font-mono bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      disabled={loginMutation.isPending}
                      data-testid="input-backup-code"
                    />
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <Button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    disabled={loginMutation.isPending}
                    data-testid="submit-two-factor"
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Complete Login
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-gray-400 hover:text-white"
                    onClick={() => setUseBackupCode(!useBackupCode)}
                    disabled={loginMutation.isPending}
                    data-testid="toggle-backup-code"
                  >
                    {useBackupCode ? "Use authenticator app instead" : "Use backup code instead"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-gray-600 text-gray-400 hover:text-white"
                    onClick={goBackToCredentials}
                    disabled={loginMutation.isPending}
                    data-testid="back-to-credentials"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Button>
                </div>
              </form>
            )}

            {/* Return to Main Site */}
            <div className="pt-4 border-t border-gray-700">
              <Button
                variant="ghost"
                className="w-full text-gray-400 hover:text-white"
                onClick={() => setLocation("/")}
                data-testid="back-to-main-site"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to Main Site
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>© 2025 GreenLens. All rights reserved.</p>
          <p className="mt-1">Secure administrative portal v2.0</p>
        </div>
      </div>
    </div>
  );
}