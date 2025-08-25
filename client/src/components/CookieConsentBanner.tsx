import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Shield, Settings, Cookie } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
}

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always required
    analytics: false,
    marketing: false,
    personalization: false,
  });
  const { toast } = useToast();

  // Check if user has already made a choice
  useEffect(() => {
    const consent = localStorage.getItem('greenlens-cookie-consent');
    const gpcEnabled = navigator.globalPrivacyControl;
    
    if (!consent) {
      // Honor Global Privacy Control (GPC) signals
      if (gpcEnabled) {
        // GPC signal detected - automatically opt-out of non-essential cookies
        const gpcPreferences = {
          essential: true,
          analytics: false,
          marketing: false,
          personalization: false,
        };
        
        localStorage.setItem('greenlens-cookie-consent', JSON.stringify({
          preferences: gpcPreferences,
          timestamp: new Date().toISOString(),
          gpcDetected: true,
        }));
        
        setPreferences(gpcPreferences);
        applyCookieSettings(gpcPreferences);
        
        toast({
          title: 'Privacy Settings Applied',
          description: 'Global Privacy Control detected - automatically opted out of non-essential cookies.',
        });
        
        return;
      }
      
      setIsVisible(true);
    } else {
      const consentData = JSON.parse(consent);
      setPreferences(consentData.preferences);
      applyCookieSettings(consentData.preferences);
    }
  }, [toast]);

  const applyCookieSettings = (prefs: CookiePreferences) => {
    // Apply analytics cookies
    if (prefs.analytics) {
      // Enable Google Analytics or other analytics
      console.log('Analytics cookies enabled');
    } else {
      // Disable analytics tracking
      console.log('Analytics cookies disabled');
    }

    // Apply marketing cookies
    if (prefs.marketing) {
      // Enable marketing/advertising cookies
      console.log('Marketing cookies enabled');
    } else {
      // Disable marketing cookies
      console.log('Marketing cookies disabled');
    }

    // Apply personalization cookies
    if (prefs.personalization) {
      // Enable personalization features
      console.log('Personalization cookies enabled');
    } else {
      // Disable personalization
      console.log('Personalization cookies disabled');
    }

    // Essential cookies are always enabled for basic functionality
    console.log('Essential cookies always enabled');
  };

  const saveConsent = (prefs: CookiePreferences) => {
    const consentData = {
      preferences: prefs,
      timestamp: new Date().toISOString(),
      version: '1.0',
      gpcDetected: !!navigator.globalPrivacyControl,
    };
    
    localStorage.setItem('greenlens-cookie-consent', JSON.stringify(consentData));
    applyCookieSettings(prefs);
    setIsVisible(false);
    setShowSettings(false);
  };

  const acceptAll = () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      marketing: true,
      personalization: true,
    };
    setPreferences(allAccepted);
    saveConsent(allAccepted);
    
    toast({
      title: 'Cookie Preferences Saved',
      description: 'All cookies have been accepted for optimal experience.',
    });
  };

  const acceptEssential = () => {
    const essentialOnly = {
      essential: true,
      analytics: false,
      marketing: false,
      personalization: false,
    };
    setPreferences(essentialOnly);
    saveConsent(essentialOnly);
    
    toast({
      title: 'Cookie Preferences Saved',
      description: 'Only essential cookies have been accepted.',
    });
  };

  const saveCustomPreferences = () => {
    saveConsent(preferences);
    toast({
      title: 'Cookie Preferences Saved',
      description: 'Your custom cookie preferences have been applied.',
    });
  };

  const resetConsent = () => {
    localStorage.removeItem('greenlens-cookie-consent');
    setIsVisible(true);
    setShowSettings(false);
    setPreferences({
      essential: true,
      analytics: false,
      marketing: false,
      personalization: false,
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4" data-testid="cookie-consent-banner">
      <Card className="mx-auto max-w-4xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl">
        <div className="p-6">
          {!showSettings ? (
            // Main consent banner
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
              <div className="flex-shrink-0">
                <Cookie className="w-8 h-8 text-green-600" />
              </div>
              
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Cookie & Privacy Settings
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  We use cookies to enhance your experience, provide personalized content, and analyze site usage. 
                  You can manage your preferences or learn more in our{' '}
                  <button
                    type="button"
                    className="text-green-600 hover:text-green-700 underline"
                    onClick={() => window.open('/privacy', '_blank')}
                    data-testid="privacy-policy-link"
                  >
                    Privacy Policy
                  </button>.
                </p>
                {navigator.globalPrivacyControl && (
                  <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                    <Shield className="w-4 h-4" />
                    <span>Global Privacy Control detected - respecting your privacy preferences</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col lg:flex-row gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                  className="flex items-center gap-2"
                  data-testid="cookie-settings-button"
                >
                  <Settings className="w-4 h-4" />
                  Manage Preferences
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={acceptEssential}
                  data-testid="accept-essential-button"
                >
                  Essential Only
                </Button>
                <Button
                  size="sm"
                  onClick={acceptAll}
                  className="bg-green-600 hover:bg-green-700"
                  data-testid="accept-all-button"
                >
                  Accept All
                </Button>
              </div>
            </div>
          ) : (
            // Detailed settings panel
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Cookie Preferences
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(false)}
                  data-testid="close-settings-button"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Essential Cookies */}
                <div className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Checkbox
                    checked={preferences.essential}
                    disabled={true}
                    className="mt-1"
                    data-testid="essential-cookies-checkbox"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Essential Cookies <span className="text-xs text-gray-500">(Always Active)</span>
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Required for basic site functionality, authentication, and security. Cannot be disabled.
                    </p>
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-start space-x-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <Checkbox
                    checked={preferences.analytics}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ ...prev, analytics: !!checked }))
                    }
                    className="mt-1"
                    data-testid="analytics-cookies-checkbox"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">Analytics Cookies</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Help us understand how visitors interact with our website to improve user experience.
                    </p>
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-start space-x-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <Checkbox
                    checked={preferences.marketing}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ ...prev, marketing: !!checked }))
                    }
                    className="mt-1"
                    data-testid="marketing-cookies-checkbox"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">Marketing Cookies</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Used to deliver personalized advertisements and measure advertising campaign effectiveness.
                    </p>
                  </div>
                </div>

                {/* Personalization Cookies */}
                <div className="flex items-start space-x-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <Checkbox
                    checked={preferences.personalization}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ ...prev, personalization: !!checked }))
                    }
                    className="mt-1"
                    data-testid="personalization-cookies-checkbox"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">Personalization Cookies</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Enable personalized plant recommendations and remember your preferences.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-2 pt-4 border-t border-gray-200 dark:border-gray-600">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={acceptEssential}
                  data-testid="accept-essential-settings-button"
                >
                  Essential Only
                </Button>
                <Button
                  size="sm"
                  onClick={saveCustomPreferences}
                  className="bg-green-600 hover:bg-green-700"
                  data-testid="save-preferences-button"
                >
                  Save Preferences
                </Button>
                <Button
                  size="sm"
                  onClick={acceptAll}
                  variant="outline"
                  data-testid="accept-all-settings-button"
                >
                  Accept All
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

// Hook for other components to access cookie consent status
export function useCookieConsent() {
  const [consent, setConsent] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('greenlens-cookie-consent');
    if (stored) {
      setConsent(JSON.parse(stored));
    }
  }, []);

  const hasConsent = (type: keyof CookiePreferences): boolean => {
    return consent?.preferences?.[type] || false;
  };

  const resetConsent = () => {
    localStorage.removeItem('greenlens-cookie-consent');
    setConsent(null);
    window.location.reload();
  };

  return {
    consent,
    hasConsent,
    resetConsent,
    hasGivenConsent: !!consent,
  };
}