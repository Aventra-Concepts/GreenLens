import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="text-2xl">🌱</div>
              <span className="text-xl font-bold text-gray-900">GreenLens</span>
            </div>
            <p className="text-gray-600 max-w-md">
              Your AI-powered plant identification and gardening assistant. 
              Discover, learn, and grow with confidence.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Features</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-600 hover:text-green-600 transition-colors">
                  Plant Identification
                </Link>
              </li>
              <li>
                <Link href="/soil-analysis" className="text-gray-600 hover:text-green-600 transition-colors">
                  Soil Analysis
                </Link>
              </li>
              <li>
                <Link href="/talk-to-expert" className="text-gray-600 hover:text-green-600 transition-colors">
                  Expert Consultation
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-600 hover:text-green-600 transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/blog" className="text-gray-600 hover:text-green-600 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-green-600 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-green-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-green-600 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-gray-600">
            © {new Date().getFullYear()} GreenLens. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}