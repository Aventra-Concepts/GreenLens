import { Link } from "wouter";
import { Facebook, Instagram, Twitter, Leaf } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
                <Link href="/" className="text-gray-300 hover:text-white transition-colors text-xs" data-testid="link-identification">
                  Identification
                </Link>
              </li>
              <li>
                <Link href="/care-plans" className="text-gray-300 hover:text-white transition-colors text-xs" data-testid="link-care-plans">
                  Care Plans
                </Link>
              </li>
              <li>
                <Link href="/disease-diagnosis" className="text-gray-300 hover:text-white transition-colors text-xs" data-testid="link-disease-diagnosis">
                  Disease Diagnosis
                </Link>
              </li>
              <li>
                <Link href="/api-access" className="text-gray-300 hover:text-white transition-colors text-xs" data-testid="link-api-access">
                  API Access
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Resources Column */}
          <div>
            <h3 className="font-semibold text-white mb-2 text-sm">Resources</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/blog" className="text-gray-300 hover:text-white transition-colors text-xs" data-testid="link-blog">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="text-gray-300 hover:text-white transition-colors text-xs" data-testid="link-reviews">
                  Reviews
                </Link>
              </li>
              <li>
                <Link href="/plant-database" className="text-gray-300 hover:text-white transition-colors text-xs" data-testid="link-plant-database">
                  Plant Database
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-300 hover:text-white transition-colors text-xs" data-testid="link-faq">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/help-center" className="text-gray-300 hover:text-white transition-colors text-xs" data-testid="link-help-center">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-gray-300 hover:text-white transition-colors text-xs" data-testid="link-community">
                  Community
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Company Column */}
          <div>
            <h3 className="font-semibold text-white mb-2 text-sm">Company</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors text-xs" data-testid="link-about-us">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors text-xs" data-testid="link-contact">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-300 hover:text-white transition-colors text-xs" data-testid="link-privacy-policy">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-white transition-colors text-xs" data-testid="link-terms-of-service">
                  Terms of Service
                </Link>
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
              <Link href="/affiliate-disclosure" className="text-blue-400 hover:text-blue-300 transition-colors text-xs underline" data-testid="link-affiliate-disclosure">
                Affiliate Disclosure
              </Link>
            </div>
            <Link 
              href="/amazon-affiliate-register" 
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white text-xs px-2 py-1 rounded transition-colors font-medium"
              data-testid="button-amazon-affiliate-register"
            >
              🛍️ Amazon Affiliate Register
            </Link>
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