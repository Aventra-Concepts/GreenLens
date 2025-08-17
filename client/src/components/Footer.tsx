import { Link } from "wouter";
import { Leaf } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">GreenLens</span>
            </div>
            <p className="text-gray-400">
              AI-powered plant identification and care guidance for plant enthusiasts worldwide.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors"
                data-testid="twitter-link"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors"
                data-testid="instagram-link"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors"
                data-testid="linkedin-link"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.23 0H1.77C.8 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.2 0 22.23 0zM7.27 20.1H3.65V9.24h3.62V20.1zM5.47 7.76h-.03c-1.22 0-2-.83-2-1.87 0-1.06.8-1.87 2.05-1.87 1.24 0 2 .8 2.02 1.87 0 1.04-.78 1.87-2.05 1.87zM20.34 20.1h-3.63v-5.8c0-1.45-.52-2.45-1.83-2.45-1 0-1.6.67-1.87 1.32-.1.23-.11.55-.11.88v6.05H9.28s.05-9.82 0-10.84h3.63v1.54a3.6 3.6 0 0 1 3.26-1.8c2.37 0 4.15 1.55 4.15 4.9v6.2h.02z"/>
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Features</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/identify" className="hover:text-white transition-colors">
                  Plant Identification
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-white transition-colors">
                  Care Plans
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Disease Diagnosis</a>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Pricing Plans
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">E-books & Shop</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/ebook-marketplace" className="hover:text-white transition-colors">
                  E-book Marketplace
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-white transition-colors">
                  Garden Shop
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition-colors">
                  Blog & Articles
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="hover:text-white transition-colors">
                  Customer Reviews
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Registration</h3>
            <ul className="space-y-3 text-gray-400">
              <li>
                <Link 
                  href="/student-registration" 
                  className="text-blue-400 hover:text-blue-300 font-bold transition-colors border-b border-blue-400 hover:border-blue-300 block"
                  data-testid="footer-student-registration"
                >
                  🎓 Students Register
                </Link>
              </li>
              <li>
                <Link 
                  href="/author-registration" 
                  className="text-yellow-400 hover:text-yellow-300 font-bold transition-colors border-b border-yellow-400 hover:border-yellow-300 block"
                  data-testid="footer-author-registration"
                >
                  ✍️ Author Registration
                </Link>
              </li>
              <li>
                <Link href="/expert-onboarding" className="hover:text-white transition-colors">
                  Expert Registration
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Support & Legal</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">About Us</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Contact Support</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Help Center</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">&copy; 2024 GreenLens. All rights reserved.</p>
          <p className="text-gray-400 text-sm mt-4 md:mt-0">Made with 🌱 for plant lovers everywhere</p>
        </div>
      </div>
    </footer>
  );
}
