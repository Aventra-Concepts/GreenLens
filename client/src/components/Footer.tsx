import { Link } from "wouter";
import { Leaf, Facebook, Instagram, MessageCircle } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">GreenLens</span>
            </div>
            <p className="text-gray-400">
              AI-powered plant identification and care guidance for plant enthusiasts worldwide.
            </p>
            <div className="flex space-x-3 mt-2">
              <a 
                href="https://facebook.com/greenlens" 
                target="_blank"
                rel="noopener noreferrer"
                className="group"
                data-testid="facebook-link"
                title="Follow us on Facebook"
              >
                <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg">
                  <Facebook className="w-3.5 h-3.5 text-white" />
                </div>
              </a>
              <a 
                href="https://wa.me/1234567890" 
                target="_blank"
                rel="noopener noreferrer"
                className="group"
                data-testid="whatsapp-link"
                title="Chat with us on WhatsApp"
              >
                <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg">
                  <MessageCircle className="w-3.5 h-3.5 text-white" />
                </div>
              </a>
              <a 
                href="https://instagram.com/greenlens" 
                target="_blank"
                rel="noopener noreferrer"
                className="group"
                data-testid="instagram-link"
                title="Follow us on Instagram"
              >
                <div className="w-7 h-7 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg">
                  <Instagram className="w-3.5 h-3.5 text-white" />
                </div>
              </a>
              <a 
                href="https://twitter.com/greenlens" 
                target="_blank"
                rel="noopener noreferrer"
                className="group"
                data-testid="twitter-link"
                title="Follow us on Twitter"
              >
                <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg border border-gray-300">
                  <FaXTwitter className="w-3.5 h-3.5 text-black" />
                </div>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div>
              <h3 className="font-semibold text-sm mb-1.5">Product</h3>
              <ul className="space-y-0.5 text-gray-400 text-xs">
                <li>
                  <Link href="/identify" className="hover:text-white transition-colors">
                    Plant Identification
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">Care Plans</a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">Disease Diagnosis</a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">API Access</a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-1.5">Resources</h3>
              <ul className="space-y-0.5 text-gray-400 text-xs">
                <li>
                  <Link href="/blog" className="hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/reviews" className="hover:text-white transition-colors">
                    Reviews
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">Plant Database</a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">Help Center</a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">Community</a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-1.5">Company</h3>
              <ul className="space-y-0.5 text-gray-400 text-xs">
                <li>
                  <a href="#" className="hover:text-white transition-colors">About Us</a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">Contact</a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-1.5">Amazon Affiliate</h3>
              <ul className="space-y-1 text-gray-400 text-xs">
                <li className="text-gray-400">
                  As an Amazon Associate, we earn from qualifying purchases. No extra cost to you.
                </li>
                <li>
                  <Link 
                    href="/student-registration" 
                    className="text-blue-400 hover:text-blue-300 font-bold transition-colors block"
                    style={{ fontFamily: '"Arial Narrow", sans-serif', fontWeight: 'bold' }}
                    data-testid="footer-student-registration"
                  >
                    🎓 Students Register
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/author-registration" 
                    className="text-yellow-400 hover:text-yellow-300 font-bold transition-colors block"
                    style={{ fontFamily: '"Arial Narrow", sans-serif', fontWeight: 'bold' }}
                    data-testid="footer-author-registration"
                  >
                    ✍️ Authors Register
                  </Link>
                </li>
              </ul>
            </div>
          </div>


        </div>

        <div className="border-t border-gray-800 mt-6 pt-4 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">&copy; 2024 GreenLens. All rights reserved.</p>
          <p className="text-gray-400 text-sm mt-2 md:mt-0">Made with 🌱 for plant lovers everywhere</p>
        </div>
      </div>
    </footer>
  );
}
