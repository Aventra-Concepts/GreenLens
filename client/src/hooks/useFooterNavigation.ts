import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface NavigationMessage {
  title: string;
  description: string;
}

const navigationMessages: Record<string, NavigationMessage> = {
  "/": {
    title: "Welcome Home",
    description: "Identify plants and explore AI-powered gardening features"
  },
  "/disease-diagnosis": {
    title: "Disease Diagnosis",
    description: "Get AI-powered diagnosis for your plant health concerns"
  },
  "/api-access": {
    title: "API Access",
    description: "Integrate GreenLens AI into your applications"
  },
  "/author-registration": {
    title: "Author Registration",
    description: "Join our platform and start publishing gardening expertise"
  },
  "/blog": {
    title: "GreenLens Blog",
    description: "Latest gardening tips, plant care guides, and expert advice"
  },
  "/reviews": {
    title: "User Reviews",
    description: "See what our community says about GreenLens"
  },
  "/plant-database": {
    title: "Plant Database",
    description: "Comprehensive database of plant species and care information"
  },
  "/faq": {
    title: "Frequently Asked Questions",
    description: "Find answers to common questions about GreenLens"
  },
  "/help-center": {
    title: "Help Center",
    description: "Find answers and support for all GreenLens features"
  },
  "/community": {
    title: "GreenLens Community",
    description: "Connect with fellow plant enthusiasts and experts"
  },
  "/about": {
    title: "About GreenLens",
    description: "Learn about our mission to help plant enthusiasts worldwide"
  },
  "/contact": {
    title: "Contact Us",
    description: "Get in touch with our team for support and inquiries"
  },
  "/privacy": {
    title: "Privacy Policy",
    description: "Your privacy and data security are important to us"
  },
  "/terms": {
    title: "Terms of Service",
    description: "Terms and conditions for using GreenLens platform"
  },
  "/ebook-marketplace": {
    title: "E-Book Marketplace",
    description: "Discover expert gardening guides and plant care books"
  },
  "/tools": {
    title: "Gardening Tools",
    description: "Find the best gardening tools recommended by experts"
  },
  "/affiliate-disclosure": {
    title: "Affiliate Disclosure",
    description: "Learn about our affiliate partnerships and earnings"
  },
  "/amazon-affiliate-register": {
    title: "Amazon Affiliate",
    description: "Register for Amazon affiliate program benefits"
  },
  "/disclosure": {
    title: "Disclosure",
    description: "Important disclosure information about our platform"
  }
};

export function useFooterNavigation() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const navigateWithMessage = (href: string) => {
    // Get the message for this route
    const message = navigationMessages[href] || {
      title: "Navigation",
      description: "Taking you to the requested page"
    };

    // Show success message
    toast({
      title: message.title,
      description: message.description,
      duration: 3000,
    });

    // Navigate to the new route
    setLocation(href);

    // Scroll to top after a brief delay to ensure the route has changed
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    }, 100);
  };

  return { navigateWithMessage };
}