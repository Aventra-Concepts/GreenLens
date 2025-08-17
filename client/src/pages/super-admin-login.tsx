import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Shield, Lock, Eye, EyeOff, Smartphone, Mail, Key } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface LoginCredentials {
  email: string;
  password: string;
  totpCode?: string;
  backupCode?: string;
  rememberDevice?: boolean;
}

export default function SuperAdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    password: "",
    totpCode: "",
    backupCode: "",
    rememberDevice: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [authMethod, setAuthMethod] = useState<'totp' | 'backup'>('totp');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiRequest('POST', '/api/admin/auth/login', credentials);
      const result = await response.json();

      if (result.success) {
        // Store admin session
        sessionStorage.setItem("adminToken", result.token);
        sessionStorage.setItem("adminUser", JSON.stringify(result.user));

        toast({
          title: "Login Successful",
          description: "Welcome to the GreenLens Admin Dashboard",
        });

        setLocation("/super-admin-dashboard");
      } else if (result.requiresTwoFactor) {
        setRequiresTwoFactor(true);
        toast({
          title: "Two-Factor Authentication Required",
          description: "Please enter your authentication code",
          variant: "default",
        });
      } else {
        toast({
          title: "Login Failed",
          description: result.error || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Login Error",
        description: error.message || "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof LoginCredentials, value: string | boolean) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-16 h-16 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            <span className="text-green-600">GreenLens</span> Super Admin
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Maximum security access portal
          </p>
        </div>

        <Card className="shadow-2xl border-2 border-green-200 dark:border-green-800">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-xl">
              <Lock className="w-6 h-6 text-green-600" />
              Secure Authentication
            </CardTitle>
            <CardDescription>
              Multi-factor authentication required for admin access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email and Password */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Administrator Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@greenlens.com"
                    value={credentials.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    className="mt-1"
                    data-testid="admin-email-input"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your secure password"
                      value={credentials.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      required
                      className="mt-1 pr-10"
                      data-testid="admin-password-input"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      data-testid="toggle-password-visibility"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Two-Factor Authentication */}
              {requiresTwoFactor && (
                <div className="space-y-4 border-t pt-4">
                  <Tabs value={authMethod} onValueChange={(value) => setAuthMethod(value as 'totp' | 'backup')}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="totp" className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        Authenticator
                      </TabsTrigger>
                      <TabsTrigger value="backup" className="flex items-center gap-2">
                        <Key className="w-4 h-4" />
                        Backup Code
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="totp" className="space-y-3">
                      <Label htmlFor="totpCode">
                        Enter 6-digit code from your authenticator app
                      </Label>
                      <Input
                        id="totpCode"
                        type="text"
                        placeholder="123456"
                        maxLength={6}
                        value={credentials.totpCode}
                        onChange={(e) => handleInputChange("totpCode", e.target.value.replace(/\D/g, ''))}
                        className="text-center text-lg tracking-widest"
                        data-testid="totp-code-input"
                      />
                    </TabsContent>

                    <TabsContent value="backup" className="space-y-3">
                      <Label htmlFor="backupCode">
                        Enter one of your backup recovery codes
                      </Label>
                      <Input
                        id="backupCode"
                        type="text"
                        placeholder="Enter backup code"
                        value={credentials.backupCode}
                        onChange={(e) => handleInputChange("backupCode", e.target.value.toUpperCase())}
                        className="text-center text-lg tracking-wider"
                        data-testid="backup-code-input"
                      />
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {/* Remember Device Option */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="rememberDevice"
                  checked={credentials.rememberDevice}
                  onChange={(e) => handleInputChange("rememberDevice", e.target.checked)}
                  className="rounded border-gray-300"
                  data-testid="remember-device-checkbox"
                />
                <Label htmlFor="rememberDevice" className="text-sm text-gray-600 dark:text-gray-400">
                  Trust this device for 30 days
                </Label>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                data-testid="admin-login-button"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Authenticating...
                  </div>
                ) : requiresTwoFactor ? (
                  "Verify & Login"
                ) : (
                  "Secure Login"
                )}
              </Button>
            </form>

            {/* Security Notice */}
            <div className="mt-6 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-xs text-green-700 dark:text-green-300 text-center">
                🔒 This is a secure admin portal with enhanced authentication.
                All login attempts are logged and monitored.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Back to Main Site */}
        <div className="text-center mt-6">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-green-600"
            data-testid="back-to-main-site"
          >
            ← Back to GreenLens Main Site
          </Button>
        </div>
      </div>
    </div>
  );
}