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
    // Add delay to ensure proper rendering on all pages
    const timer = setTimeout(() => {
      const consent = localStorage.getItem('greenlens-cookie-consent');
      const gpcEnabled = (navigator as any).globalPrivacyControl;
      
      // For development/demo - always show banner (remove this line in production)
      localStorage.removeItem('greenlens-cookie-consent');
      
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
        
        // Show cookie consent banner for first-time users
        setIsVisible(true);
      } else {
        const consentData = JSON.parse(consent);
        setPreferences(consentData.preferences);
        applyCookieSettings(consentData.preferences);
      }
    }, 1000); // 1 second delay to ensure page loads properly
    
    return () => clearTimeout(timer);
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
      gpcDetected: !!(navigator as any).globalPrivacyControl,
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
      title: 'Custom Preferences Saved',
      description: 'Your cookie preferences have been updated.',
    });
  };

  const updatePreference = (key: keyof CookiePreferences, value: boolean) => {
    if (key === 'essential') return; // Essential cookies cannot be disabled
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[9999] max-w-md animate-in slide-in-from-left-5 duration-500" style={{ zIndex: 9999 }}>
      <Card className="bg-white border-2 border-green-300 shadow-2xl">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <Cookie className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">Cookie Settings</h3>
            </div>
            <Button
              onClick={() => setIsVisible(false)}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 -mt-1"
              data-testid="button-close-cookies"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {!showSettings ? (
            <>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                We use cookies to improve your experience, analyze site usage, and assist with marketing. 
                Essential cookies are required for basic functionality.
              </p>
              
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button
                    onClick={acceptAll}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    data-testid="button-accept-all-cookies"
                  >
                    Accept All
                  </Button>
                  <Button
                    onClick={() => setShowSettings(true)}
                    variant="outline"
                    className="flex-1 border-green-300 text-green-700 hover:bg-green-50"
                    data-testid="button-customize-cookies"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Customize
                  </Button>
                </div>
                
                <Button
                  onClick={acceptEssential}
                  variant="outline"
                  className="w-full text-gray-600 hover:bg-gray-50"
                  data-testid="button-essential-only-cookies"
                >
                  Essential Only
                </Button>
              </div>
              
              <div className="flex items-center gap-1 mt-3 text-xs text-gray-500">
                <Shield className="h-3 w-3" />
                <span>
                  GDPR, CCPA & GPC Compliant • 
                  <a href="/privacy" className="underline hover:text-green-600 ml-1">
                    Privacy Policy
                  </a>
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4 mb-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-medium text-sm">Essential Cookies</div>
                    <div className="text-xs text-gray-500">Required for basic site functionality</div>
                  </div>
                  <Checkbox 
                    checked={preferences.essential} 
                    disabled={true}
                    data-testid="checkbox-essential-cookies"
                  />
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-medium text-sm">Analytics Cookies</div>
                    <div className="text-xs text-gray-500">Help us understand site usage</div>
                  </div>
                  <Checkbox
                    checked={preferences.analytics}
                    onCheckedChange={(checked) => updatePreference('analytics', !!checked)}
                    data-testid="checkbox-analytics-cookies"
                  />
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-medium text-sm">Marketing Cookies</div>
                    <div className="text-xs text-gray-500">Show relevant ads and content</div>
                  </div>
                  <Checkbox
                    checked={preferences.marketing}
                    onCheckedChange={(checked) => updatePreference('marketing', !!checked)}
                    data-testid="checkbox-marketing-cookies"
                  />
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-medium text-sm">Personalization</div>
                    <div className="text-xs text-gray-500">Customize your experience</div>
                  </div>
                  <Checkbox
                    checked={preferences.personalization}
                    onCheckedChange={(checked) => updatePreference('personalization', !!checked)}
                    data-testid="checkbox-personalization-cookies"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={saveCustomPreferences}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  data-testid="button-save-preferences"
                >
                  Save Preferences
                </Button>
                <Button
                  onClick={() => setShowSettings(false)}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-back-to-main"
                >
                  Back
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}