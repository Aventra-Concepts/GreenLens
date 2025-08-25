import { Link } from "wouter";
import { Facebook, Instagram, Twitter, Leaf } from "lucide-react";
import { useFooterNavigation } from "@/hooks/useFooterNavigation";

export default function Footer() {
  const { navigateWithMessage } = useFooterNavigation();
  
  return (
    <footer className="bg-slate-800 text-white mr-6 ml-6 sm:mr-8 sm:ml-8 lg:mr-52 lg:ml-56 xl:mr-64 xl:ml-72 rounded-2xl mb-6">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-4">
        {/* Top Section - Logo, Description, and Social Media - Left Aligned */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col space-y-2 mb-4 sm:mb-0">
              {/* Logo and Brand Name */}
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-white">GreenLens</span>
              </div>
              
              {/* Tagline - Single Line */}
              <p className="text-gray-300 text-xs">
                AI-powered plant identification and care guidance for plant enthusiasts worldwide.
              </p>
            </div>
            
            {/* Social Media Icons */}
            <div className="flex space-x-2">
              <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
                <Facebook className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="w-7 h-7 bg-green-500 rounded flex items-center justify-center cursor-pointer hover:bg-green-600 transition-colors">
                <span className="text-white text-xs font-bold">Z</span>
              </div>
              <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center cursor-pointer hover:from-purple-600 hover:to-pink-600 transition-colors">
                <Instagram className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="w-7 h-7 bg-black rounded flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors">
                <Twitter className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Menu Columns - Compact */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-4">
          {/* Product Column */}
          <div>
            <h3 className="font-semibold text-white mb-2 text-sm">Product</h3>
            <ul className="space-y-1">
              <li>
                <button 
                  onClick={() => navigateWithMessage("/")}
                  className="text-gray-300 hover:text-white transition-colors text-xs cursor-pointer" 
                  data-testid="link-identification"
                >
                  Identification
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateWithMessage("/disease-diagnosis")}
                  className="text-gray-300 hover:text-white transition-colors text-xs cursor-pointer" 
                  data-testid="link-disease-diagnosis"
                >
                  Disease Diagnosis
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateWithMessage("/api-access")}
                  className="text-gray-300 hover:text-white transition-colors text-xs cursor-pointer" 
                  data-testid="link-api-access"
                >
                  API Access
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateWithMessage("/author-registration")}
                  className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-md transition-colors text-xs font-extrabold text-center shadow-sm hover:shadow-md cursor-pointer" 
                  data-testid="link-author-registration"
                >
                  📝 Author Registration
                </button>
              </li>
            </ul>
          </div>
          
          {/* Resources Column */}
          <div>
            <h3 className="font-semibold text-white mb-2 text-sm">Resources</h3>
            <ul className="space-y-1">
              <li>
                <button 
                  onClick={() => navigateWithMessage("/blog")}
                  className="text-gray-300 hover:text-white transition-colors text-xs cursor-pointer" 
                  data-testid="link-blog"
                >
                  Blog
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateWithMessage("/reviews")}
                  className="text-gray-300 hover:text-white transition-colors text-xs cursor-pointer" 
                  data-testid="link-reviews"
                >
                  Reviews
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateWithMessage("/plant-database")}
                  className="text-gray-300 hover:text-white transition-colors text-xs cursor-pointer" 
                  data-testid="link-plant-database"
                >
                  Plant Database
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateWithMessage("/faq")}
                  className="text-gray-300 hover:text-white transition-colors text-xs cursor-pointer" 
                  data-testid="link-faq"
                >
                  FAQ
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateWithMessage("/help-center")}
                  className="text-gray-300 hover:text-white transition-colors text-xs cursor-pointer" 
                  data-testid="link-help-center"
                >
                  Help Center
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateWithMessage("/community")}
                  className="text-gray-300 hover:text-white transition-colors text-xs cursor-pointer" 
                  data-testid="link-community"
                >
                  Community
                </button>
              </li>
            </ul>
          </div>
          
          {/* Company Column */}
          <div>
            <h3 className="font-semibold text-white mb-2 text-sm">Company</h3>
            <ul className="space-y-1">
              <li>
                <button 
                  onClick={() => navigateWithMessage("/about")}
                  className="text-gray-300 hover:text-white transition-colors text-xs cursor-pointer" 
                  data-testid="link-about-us"
                >
                  About Us
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateWithMessage("/contact")}
                  className="text-gray-300 hover:text-white transition-colors text-xs cursor-pointer" 
                  data-testid="link-contact"
                >
                  Contact
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateWithMessage("/privacy")}
                  className="text-gray-300 hover:text-white transition-colors text-xs cursor-pointer" 
                  data-testid="link-privacy-policy"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateWithMessage("/terms")}
                  className="text-gray-300 hover:text-white transition-colors text-xs cursor-pointer" 
                  data-testid="link-terms-of-service"
                >
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>
          
          {/* Amazon Affiliate Column */}
          <div>
            <h3 className="font-semibold text-white mb-2 text-sm">Amazon Affiliate</h3>
            <p className="text-gray-300 text-xs mb-2 leading-tight">
              As an Amazon Associate, we earn from qualifying purchases. No extra cost to you.
            </p>
            <div className="mb-2">
              <button 
                onClick={() => navigateWithMessage("/affiliate-disclosure")}
                className="text-blue-400 hover:text-blue-300 transition-colors text-xs underline cursor-pointer" 
                data-testid="link-affiliate-disclosure"
              >
                Affiliate Disclosure
              </button>
            </div>
            <button 
              onClick={() => navigateWithMessage("/amazon-affiliate-register")}
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white text-xs px-2 py-1 rounded transition-colors font-medium cursor-pointer"
              data-testid="button-amazon-affiliate-register"
            >
              🛍️ Amazon Affiliate Register
            </button>
          </div>
        </div>
        
        {/* Bottom Section - Compact */}
        <div className="border-t border-gray-600 pt-3 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-gray-400 text-xs" data-testid="text-copyright">
            © {new Date().getFullYear()} GreenLens. All rights reserved.
          </p>
          <p className="text-gray-400 text-xs mt-1 sm:mt-0" data-testid="text-made-with-love">
            Made with ❤️ for plant lovers everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}