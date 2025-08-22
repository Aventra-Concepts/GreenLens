import { Button } from "@/components/ui/button";
import { FaGoogle, FaFacebook, FaGithub, FaTwitter } from "react-icons/fa";

interface SocialLoginButtonsProps {
  mode?: 'login' | 'signup';
  className?: string;
}

export function SocialLoginButtons({ mode = 'login', className = "" }: SocialLoginButtonsProps) {
  const actionText = mode === 'signup' ? 'Sign up' : 'Sign in';

  const handleSocialLogin = (provider: string) => {
    // Navigate to OAuth endpoint
    window.location.href = `/auth/${provider}`;
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

      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => handleSocialLogin('google')}
          className="w-full"
          data-testid="button-google-login"
        >
          <FaGoogle className="w-4 h-4 mr-2 text-red-500" />
          Google
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => handleSocialLogin('facebook')}
          className="w-full"
          data-testid="button-facebook-login"
        >
          <FaFacebook className="w-4 h-4 mr-2 text-blue-600" />
          Facebook
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => handleSocialLogin('github')}
          className="w-full"
          data-testid="button-github-login"
        >
          <FaGithub className="w-4 h-4 mr-2 text-gray-900 dark:text-white" />
          GitHub
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => handleSocialLogin('twitter')}
          className="w-full"
          data-testid="button-twitter-login"
        >
          <FaTwitter className="w-4 h-4 mr-2 text-blue-400" />
          Twitter
        </Button>
      </div>

      <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
        By continuing, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
}