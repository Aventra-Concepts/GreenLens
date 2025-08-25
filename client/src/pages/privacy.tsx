import { useState } from 'react';
import { ArrowLeft, Shield, Eye, Trash2, Download, Lock, Globe, Mail, AlertTriangle, Brain } from 'lucide-react';
import { useLocation } from 'wouter';

export default function PrivacyPolicy() {
  const [, setLocation] = useLocation();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-green-900/20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => setLocation('/')}
            className="inline-flex items-center text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors mb-4"
            data-testid="button-back-home"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </button>
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>
              <p className="text-gray-600 dark:text-gray-300">Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Introduction */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-sm">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">Important Privacy Notice</h3>
                <p className="text-green-700 dark:text-green-300 text-sm">
                  GreenLens is committed to protecting your privacy and complying with all applicable US privacy laws, including CCPA, COPPA, and CAN-SPAM Act. This policy explains how we collect, use, and safeguard your personal information.
                </p>
              </div>
            </div>
          </div>

          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Welcome to GreenLens, an AI-powered plant identification and care platform. This Privacy Policy describes how GreenLens ("we," "our," or "us") collects, uses, discloses, and safeguards your personal information when you use our website, mobile application, and services.
          </p>

          <p className="text-gray-700 dark:text-gray-300 mb-6">
            <strong>Effective Date:</strong> This privacy policy is effective as of {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} and complies with the latest US privacy laws including the California Consumer Privacy Act (CCPA) 2025 amendments, Children's Online Privacy Protection Act (COPPA) 2025 updates, and CAN-SPAM Act requirements.
          </p>

          {/* Quick Contact for Privacy */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Privacy Contact Information</h3>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              For privacy questions, data requests, or concerns: <strong>privacy@greenlens.com</strong><br/>
              Response time: Within 45 days as required by CCPA
            </p>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Table of Contents</h2>
          <div className="grid md:grid-cols-2 gap-2 text-sm">
            {[
              '1. Information We Collect',
              '2. How We Use Your Information', 
              '3. AI Processing & Plant Analysis',
              '4. Information Sharing',
              '5. Your Privacy Rights (CCPA)',
              '6. Children\'s Privacy (COPPA)',
              '7. Data Security',
              '8. Data Retention',
              '9. Cookies and Tracking',
              '10. Email Communications',
              '11. International Users',
              '12. Changes to This Policy'
            ].map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  const element = document.getElementById(`section-${index + 1}`);
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-left text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 hover:underline"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Section 1: Information We Collect */}
        <div id="section-1" className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-sm">
          <div className="flex items-center mb-4">
            <Eye className="w-6 h-6 text-green-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">1. Information We Collect</h2>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Personal Information Categories (CCPA Required Disclosure)</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Identifiers</h4>
                  <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Email address</li>
                    <li>• Name</li>
                    <li>• Device identifiers</li>
                    <li>• IP address</li>
                    <li>• Account username</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Commercial Information</h4>
                  <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Purchase history</li>
                    <li>• Subscription records</li>
                    <li>• Payment information</li>
                    <li>• Plant care preferences</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Internet Activity</h4>
                  <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Browsing history on our site</li>
                    <li>• Search history</li>
                    <li>• App usage patterns</li>
                    <li>• Feature interaction data</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Geolocation Data</h4>
                  <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Approximate location (city/state)</li>
                    <li>• Precise GPS coordinates (if permitted)</li>
                    <li>• Climate zone information</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Audio/Visual Information</h4>
                  <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Plant photographs you upload</li>
                    <li>• Profile pictures</li>
                    <li>• Garden photos</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Inferences</h4>
                  <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Plant health assessments</li>
                    <li>• Care recommendations</li>
                    <li>• Gardening skill level</li>
                    <li>• Plant preferences</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
              <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Sensitive Personal Information</h3>
              <p className="text-amber-700 dark:text-amber-300 text-sm mb-2">
                Under CCPA, we may collect these sensitive categories:
              </p>
              <ul className="text-amber-700 dark:text-amber-300 text-sm space-y-1">
                <li>• Precise geolocation data (only with explicit permission)</li>
                <li>• Account login information (password hashed and secured)</li>
                <li>• Payment information (processed securely through third parties)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 2: How We Use Your Information */}
        <div id="section-2" className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">2. How We Use Your Information</h2>
          
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">Primary Purposes</h3>
                <ul className="text-green-700 dark:text-green-300 text-sm space-y-1">
                  <li>• Plant identification and analysis</li>
                  <li>• Personalized care recommendations</li>
                  <li>• Account management and authentication</li>
                  <li>• Customer support services</li>
                  <li>• Service improvement and development</li>
                </ul>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Commercial Purposes</h3>
                <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
                  <li>• Payment processing</li>
                  <li>• Order fulfillment</li>
                  <li>• Marketing communications (with consent)</li>
                  <li>• Affiliate program management</li>
                  <li>• Subscription management</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Legal Basis for Processing</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                We process your personal information based on: (1) Contract performance - to provide our services, (2) Legitimate interests - for business operations and service improvement, (3) Consent - for marketing and optional features, (4) Legal compliance - to meet regulatory requirements.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: AI Processing */}
        <div id="section-3" className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-sm">
          <div className="flex items-center mb-4">
            <Brain className="w-6 h-6 text-green-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">3. AI Processing & Plant Analysis</h2>
          </div>

          <div className="space-y-4">
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
              <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">AI Services Disclosure</h3>
              <p className="text-purple-700 dark:text-purple-300 text-sm mb-3">
                GreenLens uses artificial intelligence to analyze your plant photos and provide identification and care recommendations. Here's how it works:
              </p>
              <ul className="text-purple-700 dark:text-purple-300 text-sm space-y-2">
                <li>• <strong>OpenAI Integration:</strong> We use OpenAI's services for image analysis and content generation</li>
                <li>• <strong>Plant.id API:</strong> Third-party plant identification service for species recognition</li>
                <li>• <strong>Local AI Processing:</strong> Some analysis is performed on our servers using machine learning models</li>
                <li>• <strong>Accuracy Disclaimer:</strong> AI results are not 100% accurate and should not be used for safety-critical decisions</li>
              </ul>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
              <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">Training Data and Model Improvement</h3>
              <p className="text-orange-700 dark:text-orange-300 text-sm mb-3">
                <strong>Your choice regarding AI training:</strong>
              </p>
              <ul className="text-orange-700 dark:text-orange-300 text-sm space-y-2">
                <li>• We may use aggregated, anonymized data to improve our AI models</li>
                <li>• Personal identifiers are removed before any training data use</li>
                <li>• You can opt-out of AI model training in your account settings</li>
                <li>• Third-party AI services have their own privacy policies (links provided below)</li>
              </ul>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">⚠️ Important Safety Disclaimer</h3>
              <p className="text-red-700 dark:text-red-300 text-sm">
                <strong>Never use AI plant identification for safety decisions.</strong> Our AI system is for educational and informational purposes only. Do not use it to determine if plants are safe to eat, touch, or have around pets and children. Always consult professional botanists or horticulturists for safety-critical plant identification.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Third-Party AI Service Privacy Policies</h3>
              <ul className="text-gray-700 dark:text-gray-300 text-sm space-y-1">
                <li>• OpenAI Privacy Policy: <a href="https://openai.com/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">https://openai.com/privacy</a></li>
                <li>• Plant.id Privacy Policy: <a href="https://web.plant.id/privacy-policy/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">https://web.plant.id/privacy-policy/</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 4: Information Sharing */}
        <div id="section-4" className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">4. Information Sharing and Disclosure</h2>
          
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">We Share Information With:</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Service Providers</h4>
                  <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Payment processors (Stripe, PayPal, Cashfree)</li>
                    <li>• AI services (OpenAI, Plant.id)</li>
                    <li>• Cloud storage (Google Cloud)</li>
                    <li>• Email services (SendGrid)</li>
                    <li>• Analytics providers</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Business Partners</h4>
                  <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Amazon Associates (affiliate program)</li>
                    <li>• Garden tool manufacturers</li>
                    <li>• Plant nurseries and retailers</li>
                    <li>• Educational content partners</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">We Do NOT Sell Your Personal Information</h3>
              <p className="text-red-700 dark:text-red-300 text-sm">
                GreenLens does not sell, rent, or trade your personal information to third parties for monetary consideration. We may share information for business purposes as described above, but this does not constitute a "sale" under CCPA definitions.
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Legal Disclosures</h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                We may disclose personal information when required by law, to protect our rights, or to protect the safety of our users or the public. This includes compliance with subpoenas, court orders, or other legal processes.
              </p>
            </div>
          </div>
        </div>

        {/* Section 5: Your Privacy Rights (CCPA) */}
        <div id="section-5" className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">5. Your Privacy Rights (CCPA)</h2>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">California Residents' Rights</h3>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              Under the California Consumer Privacy Act (CCPA) as amended by the CPRA, California residents have the following rights:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Eye className="w-4 h-4 text-green-600 mr-2" />
                  <h4 className="font-semibold text-green-800 dark:text-green-200">Right to Know</h4>
                </div>
                <p className="text-green-700 dark:text-green-300 text-sm">
                  Request information about personal information collected, used, shared, or sold in the past 12 months.
                </p>
              </div>
              
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Trash2 className="w-4 h-4 text-red-600 mr-2" />
                  <h4 className="font-semibold text-red-800 dark:text-red-200">Right to Delete</h4>
                </div>
                <p className="text-red-700 dark:text-red-300 text-sm">
                  Request deletion of personal information we have collected about you, subject to certain exceptions.
                </p>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Lock className="w-4 h-4 text-purple-600 mr-2" />
                  <h4 className="font-semibold text-purple-800 dark:text-purple-200">Right to Correct</h4>
                </div>
                <p className="text-purple-700 dark:text-purple-300 text-sm">
                  Request correction of inaccurate personal information that we maintain about you.
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Globe className="w-4 h-4 text-orange-600 mr-2" />
                  <h4 className="font-semibold text-orange-800 dark:text-orange-200">Right to Opt-Out</h4>
                </div>
                <p className="text-orange-700 dark:text-orange-300 text-sm">
                  Opt-out of the sale or sharing of your personal information (we do not currently sell data).
                </p>
              </div>
              
              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Shield className="w-4 h-4 text-indigo-600 mr-2" />
                  <h4 className="font-semibold text-indigo-800 dark:text-indigo-200">Right to Limit</h4>
                </div>
                <p className="text-indigo-700 dark:text-indigo-300 text-sm">
                  Limit the use and disclosure of your sensitive personal information to what's necessary for services.
                </p>
              </div>
              
              <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Download className="w-4 h-4 text-teal-600 mr-2" />
                  <h4 className="font-semibold text-teal-800 dark:text-teal-200">Right to Portability</h4>
                </div>
                <p className="text-teal-700 dark:text-teal-300 text-sm">
                  Receive a copy of your personal information in a portable and readily usable format.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">How to Exercise Your Rights</h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Email:</strong> privacy@greenlens.com
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Account Settings:</strong> Most rights can be exercised directly in your account settings
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Response Time:</strong> We will respond to your request within 45 days (extendable by 45 additional days if needed)
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Verification:</strong> We may need to verify your identity before processing certain requests
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>No Discrimination:</strong> We will not discriminate against you for exercising your privacy rights
              </p>
            </div>
          </div>
        </div>

        {/* Section 6: Children's Privacy (COPPA) */}
        <div id="section-6" className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">6. Children's Privacy (COPPA Compliance)</h2>
          
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">⚠️ Age Requirement</h3>
            <p className="text-red-700 dark:text-red-300 text-sm">
              <strong>GreenLens is intended for users 13 years and older.</strong> We do not knowingly collect personal information from children under 13 years of age without verifiable parental consent, in compliance with the Children's Online Privacy Protection Act (COPPA).
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">COPPA 2025 Compliance</h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm mb-3">
                We comply with the updated COPPA rules effective June 23, 2025, which include enhanced protections for children's data:
              </p>
              <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
                <li>• Enhanced data security requirements for any children's data</li>
                <li>• Strict data retention limits - only as long as reasonably necessary</li>
                <li>• Expanded definition of personal information including biometric identifiers</li>
                <li>• Comprehensive data security programs for children's information</li>
              </ul>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">If We Discover We've Collected Children's Information</h3>
              <p className="text-green-700 dark:text-green-300 text-sm mb-2">
                If we learn that we have collected personal information from a child under 13 without parental consent, we will:
              </p>
              <ul className="text-green-700 dark:text-green-300 text-sm space-y-1">
                <li>• Delete the information as soon as reasonably practicable</li>
                <li>• Not use the information for any purpose</li>
                <li>• Not disclose the information to third parties</li>
                <li>• Notify parents if contact information is available</li>
              </ul>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Parents' Rights</h3>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm mb-2">
                If your child is under 13 and you believe they have provided information to us, you have the right to:
              </p>
              <ul className="text-yellow-700 dark:text-yellow-300 text-sm space-y-1">
                <li>• Review your child's personal information</li>
                <li>• Request deletion of your child's personal information</li>
                <li>• Refuse to permit further collection of your child's information</li>
                <li>• Contact us at privacy@greenlens.com for assistance</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 7: Data Security */}
        <div id="section-7" className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-sm">
          <div className="flex items-center mb-4">
            <Lock className="w-6 h-6 text-green-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">7. Data Security</h2>
          </div>

          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">Security Measures</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-green-700 dark:text-green-300 mb-2">Technical Safeguards</h4>
                  <ul className="text-green-600 dark:text-green-400 space-y-1">
                    <li>• Encryption in transit (HTTPS/TLS)</li>
                    <li>• Encryption at rest for sensitive data</li>
                    <li>• Secure password hashing (bcrypt)</li>
                    <li>• Input sanitization and validation</li>
                    <li>• XSS and SQL injection protection</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-green-700 dark:text-green-300 mb-2">Administrative Safeguards</h4>
                  <ul className="text-green-600 dark:text-green-400 space-y-1">
                    <li>• Access controls and authentication</li>
                    <li>• Regular security audits</li>
                    <li>• Employee privacy training</li>
                    <li>• Incident response procedures</li>
                    <li>• Third-party security assessments</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
              <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">Data Breach Notification</h3>
              <p className="text-orange-700 dark:text-orange-300 text-sm">
                In the event of a data breach that affects your personal information, we will notify you and relevant authorities as required by law, typically within 72 hours of discovering the breach. We will provide information about what happened, what information was involved, and what steps we are taking to address the situation.
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Payment Security</h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                We use PCI DSS compliant payment processors (Stripe, PayPal, Cashfree) and do not store credit card information on our servers. All payment transactions are processed securely through encrypted connections.
              </p>
            </div>
          </div>
        </div>

        {/* Section 8: Data Retention */}
        <div id="section-8" className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">8. Data Retention</h2>
          
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Retention Periods</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Account Data</h4>
                  <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Active accounts: Retained while account is active</li>
                    <li>• Inactive accounts: Deleted after 3 years of inactivity</li>
                    <li>• Deleted accounts: Removed within 30 days</li>
                    <li>• Legal hold: Retained as required by law</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Plant Data</h4>
                  <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Plant photos: Deleted when you delete them</li>
                    <li>• Analysis results: Retained with account</li>
                    <li>• Care recommendations: Retained with account</li>
                    <li>• Usage analytics: Aggregated after 2 years</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Communication Data</h4>
                  <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Support emails: 3 years</li>
                    <li>• Marketing emails: Until opt-out</li>
                    <li>• Transaction emails: 7 years</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Payment Data</h4>
                  <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Transaction records: 7 years</li>
                    <li>• Payment methods: Until removed</li>
                    <li>• Refund records: 7 years</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Automated Deletion</h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                We have implemented automated systems to delete personal information according to our retention schedules. You can also manually delete your data through your account settings or by contacting us at privacy@greenlens.com.
              </p>
            </div>
          </div>
        </div>

        {/* Section 9: Cookies and Tracking */}
        <div id="section-9" className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">9. Cookies and Tracking Technologies</h2>
          
          <div className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Types of Cookies We Use</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-yellow-700 dark:text-yellow-300 mb-2">Essential Cookies</h4>
                  <ul className="text-yellow-600 dark:text-yellow-400 space-y-1">
                    <li>• Authentication and session management</li>
                    <li>• Security and fraud prevention</li>
                    <li>• Basic site functionality</li>
                    <li>• These cannot be disabled</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-yellow-700 dark:text-yellow-300 mb-2">Optional Cookies</h4>
                  <ul className="text-yellow-600 dark:text-yellow-400 space-y-1">
                    <li>• Analytics and performance tracking</li>
                    <li>• Personalized recommendations</li>
                    <li>• Marketing and advertising</li>
                    <li>• User preference storage</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">Your Cookie Choices</h3>
              <p className="text-green-700 dark:text-green-300 text-sm mb-2">
                You can control cookies through:
              </p>
              <ul className="text-green-700 dark:text-green-300 text-sm space-y-1">
                <li>• Browser settings - disable or delete cookies</li>
                <li>• Our cookie consent banner - manage preferences</li>
                <li>• Account settings - opt-out of tracking</li>
                <li>• Global Privacy Control (GPC) signals - we honor these</li>
              </ul>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">Third-Party Tracking</h3>
              <p className="text-red-700 dark:text-red-300 text-sm">
                Our website may include tracking technologies from third parties including Google Analytics, payment processors, and advertising partners. These services have their own privacy policies and cookie practices. We do not control these third-party cookies.
              </p>
            </div>
          </div>
        </div>

        {/* Section 10: Email Communications */}
        <div id="section-10" className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-sm">
          <div className="flex items-center mb-4">
            <Mail className="w-6 h-6 text-green-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">10. Email Communications (CAN-SPAM Compliance)</h2>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Types of Emails We Send</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Transactional Emails</h4>
                  <ul className="text-blue-600 dark:text-blue-400 space-y-1">
                    <li>• Account verification and password resets</li>
                    <li>• Purchase confirmations and receipts</li>
                    <li>• Plant analysis results</li>
                    <li>• Important account or service updates</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Marketing Emails (Optional)</h4>
                  <ul className="text-blue-600 dark:text-blue-400 space-y-1">
                    <li>• Plant care tips and advice</li>
                    <li>• New feature announcements</li>
                    <li>• Promotional offers and discounts</li>
                    <li>• Gardening seasonal guides</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">CAN-SPAM Compliance</h3>
              <p className="text-green-700 dark:text-green-300 text-sm mb-2">
                All our commercial emails comply with the CAN-SPAM Act requirements:
              </p>
              <ul className="text-green-700 dark:text-green-300 text-sm space-y-1">
                <li>• Truthful "From," "To," and routing information</li>
                <li>• Non-deceptive subject lines that reflect email content</li>
                <li>• Clear identification as advertisements (when applicable)</li>
                <li>• Our valid physical postal address included</li>
                <li>• Clear and conspicuous unsubscribe mechanism</li>
                <li>• Opt-out requests processed within 10 business days</li>
              </ul>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
              <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">Unsubscribe Options</h3>
              <p className="text-orange-700 dark:text-orange-300 text-sm mb-2">
                You can opt-out of marketing emails by:
              </p>
              <ul className="text-orange-700 dark:text-orange-300 text-sm space-y-1">
                <li>• Clicking the unsubscribe link in any marketing email</li>
                <li>• Updating your email preferences in account settings</li>
                <li>• Emailing us at privacy@greenlens.com</li>
                <li>• We'll process your request within 10 business days</li>
              </ul>
              <p className="text-orange-700 dark:text-orange-300 text-sm mt-2">
                <strong>Note:</strong> You cannot opt-out of transactional emails (like password resets) as these are necessary for service operation.
              </p>
            </div>
          </div>
        </div>

        {/* Section 11: International Users */}
        <div id="section-11" className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-sm">
          <div className="flex items-center mb-4">
            <Globe className="w-6 h-6 text-green-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">11. International Users</h2>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Data Transfers</h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                GreenLens is based in the United States. If you are accessing our service from outside the US, please be aware that your information may be transferred to, stored, and processed in the US where our servers are located and our central database is operated. The US may have different data protection laws than your country.
              </p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
              <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">GDPR Rights (European Users)</h3>
              <p className="text-purple-700 dark:text-purple-300 text-sm mb-2">
                If you are in the European Union, you may have additional rights under GDPR:
              </p>
              <ul className="text-purple-700 dark:text-purple-300 text-sm space-y-1">
                <li>• Right to data portability</li>
                <li>• Right to object to processing</li>
                <li>• Right to withdraw consent at any time</li>
                <li>• Right to lodge a complaint with supervisory authorities</li>
                <li>• Enhanced transparency and consent requirements</li>
              </ul>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">Other Jurisdictions</h3>
              <p className="text-green-700 dark:text-green-300 text-sm">
                We strive to comply with applicable privacy laws in all jurisdictions where we operate. If you have questions about how local laws apply to our privacy practices, please contact us at privacy@greenlens.com.
              </p>
            </div>
          </div>
        </div>

        {/* Section 12: Policy Changes */}
        <div id="section-12" className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">12. Changes to This Privacy Policy</h2>
          
          <div className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Policy Updates</h3>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                We may update this privacy policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. We will review and update this policy at least annually, or more frequently if significant changes occur.
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Notification of Changes</h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm mb-2">
                When we make changes to this policy, we will:
              </p>
              <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
                <li>• Update the "Last Updated" date at the top of this policy</li>
                <li>• Notify you via email if you have an account with us</li>
                <li>• Post a notice on our website's homepage</li>
                <li>• For material changes, provide at least 30 days' notice</li>
              </ul>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">Your Options</h3>
              <p className="text-green-700 dark:text-green-300 text-sm">
                If you disagree with changes to our privacy policy, you may close your account and stop using our services. Continued use of GreenLens after policy changes indicates your acceptance of the updated terms.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Contact Information</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">Privacy Questions</h3>
              <div className="text-green-700 dark:text-green-300 text-sm space-y-1">
                <p><strong>Email:</strong> privacy@greenlens.com</p>
                <p><strong>Response Time:</strong> Within 45 days</p>
                <p><strong>Subject Line:</strong> Include "Privacy Request" for faster processing</p>
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">General Contact</h3>
              <div className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
                <p><strong>Company:</strong> GreenLens, Inc.</p>
                <p><strong>Address:</strong> 123 Garden Street, Suite 456, San Francisco, CA 94102</p>
                <p><strong>Email:</strong> support@greenlens.com</p>
                <p><strong>Phone:</strong> (555) 123-PLANT</p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              <strong>Legal Notice:</strong> This privacy policy complies with the California Consumer Privacy Act (CCPA), Children's Online Privacy Protection Act (COPPA), CAN-SPAM Act, and other applicable US privacy laws as of {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}. For the most current version of this policy, please visit this page regularly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}