import { Button } from "@/components/ui/button";
import { FaGoogle, FaFacebook, FaGithub, FaTwitter } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

interface SocialLoginButtonsProps {
  mode?: 'login' | 'signup';
  className?: string;
}

interface AvailableProviders {
  google: boolean;
  facebook: boolean;
  github: boolean;
  twitter: boolean;
}

export function SocialLoginButtons({ mode = 'login', className = "" }: SocialLoginButtonsProps) {
  const actionText = mode === 'signup' ? 'Sign up' : 'Sign in';

  const { data: providers, isLoading } = useQuery<AvailableProviders>({
    queryKey: ['/api/auth/providers'],
    retry: false,
  });

  const handleSocialLogin = (provider: string) => {
    // Navigate to OAuth endpoint
    window.location.href = `/auth/${provider}`;
  };

  if (isLoading) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="ml-2 text-sm text-gray-500">Loading login options...</span>
        </div>
      </div>
    );
  }

  if (!providers) {
    return null;
  }

  const availableProviders = Object.entries(providers).filter(([_, enabled]) => enabled);

  if (availableProviders.length === 0) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="text-center py-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Social login is currently unavailable. Please use email/password login.
          </p>
        </div>
      </div>
    );
  }

  const providerButtons = {
    google: {
      icon: <FaGoogle className="w-4 h-4 mr-2 text-red-500" />,
      name: "Google"
    },
    facebook: {
      icon: <FaFacebook className="w-4 h-4 mr-2 text-blue-600" />,
      name: "Facebook"
    },
    github: {
      icon: <FaGithub className="w-4 h-4 mr-2 text-gray-900 dark:text-white" />,
      name: "GitHub"
    },
    twitter: {
      icon: <FaTwitter className="w-4 h-4 mr-2 text-blue-400" />,
      name: "Twitter"
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300 dark:border-gray-600" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">
            Or {actionText} with
          </span>
        </div>
      </div>

      <div className={`grid gap-3 ${availableProviders.length > 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {availableProviders.map(([provider, _]) => {
          const config = providerButtons[provider as keyof typeof providerButtons];
          if (!config) return null;
          
          return (
            <Button
              key={provider}
              type="button"
              variant="outline"
              onClick={() => handleSocialLogin(provider)}
              className="w-full"
              data-testid={`button-${provider}-login`}
            >
              {config.icon}
              {config.name}
            </Button>
          );
        })}
      </div>

      <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
        By continuing, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
}