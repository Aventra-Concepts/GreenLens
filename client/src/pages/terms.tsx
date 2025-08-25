import { Link } from "wouter";
import { Layout } from "@/components/Layout";
import { ArrowLeft, Scale, Shield, Globe, BookOpen, Leaf, Users, CreditCard, AlertTriangle, FileText, UserCheck, Eye, Calendar } from "lucide-react";

export default function Terms() {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="mb-8">
            <Link href="/">
              <button className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-6 font-medium transition-colors" data-testid="back-to-home">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </button>
            </Link>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <Scale className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  Terms of Service
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  Legal agreement governing the use of GreenLens services
                </p>
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-8">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-semibold mb-1">Important Legal Notice</p>
                  <p>
                    These terms constitute a legally binding agreement between you and GreenLens. 
                    By using our services, you agree to be bound by these terms. Please read them carefully.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-400 text-sm">
              <span className="font-medium">Last Updated:</span> {currentDate}
            </p>
          </div>

          {/* Table of Contents */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              Table of Contents
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                "1. Acceptance of Terms",
                "2. Service Description", 
                "3. User Accounts and Registration",
                "4. AI Plant Identification Services",
                "5. E-book Marketplace",
                "6. Expert Consultation Services",
                "7. Garden Monitoring",
                "8. User Content and Conduct",
                "9. Privacy and Data Protection",
                "10. Payment Terms",
                "11. Intellectual Property Rights",
                "12. Service Availability",
                "13. Disclaimers and Limitations",
                "14. International Compliance",
                "15. Termination",
                "16. Dispute Resolution",
                "17. Changes to Terms",
                "18. Contact Information"
              ].map((item, index) => (
                <div key={index} className="text-sm">
                  <a 
                    href={`#section-${index + 1}`}
                    className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 hover:underline transition-colors"
                  >
                    {item}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Terms Content */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 space-y-12">
            
            {/* Section 1: Acceptance of Terms */}
            <section id="section-1" className="scroll-mt-8">
              <div className="flex items-start gap-3 mb-4">
                <UserCheck className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  1. Acceptance of Terms
                </h2>
              </div>
              <div className="text-gray-700 dark:text-gray-300 space-y-4 ml-9">
                <p>
                  By accessing or using GreenLens ("the Service"), you agree to be bound by these Terms of Service ("Terms"). 
                  If you disagree with any part of these terms, you may not access the Service.
                </p>
                <p>
                  These Terms apply to all visitors, users, and others who access or use the Service, including but not limited to:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Plant identification service users</li>
                  <li>E-book purchasers and authors</li>
                  <li>Expert consultation clients</li>
                  <li>Garden monitoring subscribers</li>
                  <li>Community forum participants</li>
                </ul>
                <p>
                  You must be at least 13 years old to use this Service in compliance with the Children's Online Privacy Protection Act (COPPA).
                </p>
              </div>
            </section>

            {/* Section 2: Service Description */}
            <section id="section-2" className="scroll-mt-8">
              <div className="flex items-start gap-3 mb-4">
                <Leaf className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  2. Service Description
                </h2>
              </div>
              <div className="text-gray-700 dark:text-gray-300 space-y-4 ml-9">
                <p>
                  GreenLens is an AI-powered platform that provides:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">Core Services</h4>
                    <ul className="text-sm space-y-1">
                      <li>• AI plant identification</li>
                      <li>• Plant disease diagnosis</li>
                      <li>• Personalized care recommendations</li>
                      <li>• Plant health monitoring</li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Additional Services</h4>
                    <ul className="text-sm space-y-1">
                      <li>• E-book marketplace</li>
                      <li>• Expert consultations</li>
                      <li>• Garden monitoring tools</li>
                      <li>• My Garden</li>
                      <li>• Community forums</li>
                    </ul>
                  </div>
                </div>
                <p>
                  We reserve the right to modify, suspend, or discontinue any part of the Service at any time with reasonable notice.
                </p>
              </div>
            </section>

            {/* Section 3: User Accounts */}
            <section id="section-3" className="scroll-mt-8">
              <div className="flex items-start gap-3 mb-4">
                <Users className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  3. User Accounts and Registration
                </h2>
              </div>
              <div className="text-gray-700 dark:text-gray-300 space-y-4 ml-9">
                <p>
                  To access certain features, you must register for an account. When creating an account, you agree to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and promptly update your account information</li>
                  <li>Maintain the security of your password and accept responsibility for all activities under your account</li>
                  <li>Immediately notify us of any unauthorized use of your account</li>
                  <li>Comply with COPPA requirements if you are under 18</li>
                </ul>
                <p>
                  We reserve the right to suspend or terminate accounts that violate these Terms or engage in fraudulent activity.
                </p>
              </div>
            </section>

            {/* Section 4: AI Plant Identification */}
            <section id="section-4" className="scroll-mt-8">
              <div className="flex items-start gap-3 mb-4">
                <Eye className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  4. AI Plant Identification Services
                </h2>
              </div>
              <div className="text-gray-700 dark:text-gray-300 space-y-4 ml-9">
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 p-4 rounded-lg">
                  <p className="text-amber-800 dark:text-amber-200">
                    <strong>Important:</strong> Our AI identification service is provided for educational and informational purposes only. 
                    It should not be used as the sole basis for decisions regarding plant consumption, medical use, or safety.
                  </p>
                </div>
                <p>By using our AI identification service, you acknowledge that:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>AI identification results are probabilistic and may contain errors</li>
                  <li>You should verify plant identification through multiple reliable sources</li>
                  <li>We are not responsible for consequences of misidentification</li>
                  <li>The service is not suitable for identifying plants for consumption or medical purposes</li>
                  <li>Professional botanical expertise should be consulted for critical identifications</li>
                </ul>
                <p>
                  Images uploaded for identification are processed according to our Privacy Policy and may be used to improve our AI models 
                  unless you opt out of data usage for AI training.
                </p>
              </div>
            </section>

            {/* Section 5: E-book Marketplace */}
            <section id="section-5" className="scroll-mt-8">
              <div className="flex items-start gap-3 mb-4">
                <BookOpen className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  5. E-book Marketplace
                </h2>
              </div>
              <div className="text-gray-700 dark:text-gray-300 space-y-4 ml-9">
                <p>Our e-book marketplace operates under the following terms:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">For Purchasers:</h4>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>Digital licenses are non-transferable</li>
                      <li>No refunds except as required by law</li>
                      <li>Personal use only, no commercial redistribution</li>
                      <li>Access may be revoked for Terms violations</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">For Authors:</h4>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>Must own or have rights to published content</li>
                      <li>Content subject to review and approval</li>
                      <li>Standard royalty rates apply as specified</li>
                      <li>Compliance with content guidelines required</li>
                    </ul>
                  </div>
                </div>
                
                <p>
                  All e-book transactions are subject to applicable taxes and our refund policy. 
                  Content must comply with international copyright laws and our community guidelines.
                </p>
              </div>
            </section>

            {/* Section 6: Expert Consultation */}
            <section id="section-6" className="scroll-mt-8">
              <div className="flex items-start gap-3 mb-4">
                <Shield className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  6. Expert Consultation Services
                </h2>
              </div>
              <div className="text-gray-700 dark:text-gray-300 space-y-4 ml-9">
                <p>Expert consultation services are provided by third-party professionals. By using these services:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You acknowledge that experts are independent contractors, not GreenLens employees</li>
                  <li>Consultations are for educational and advisory purposes only</li>
                  <li>We do not guarantee the accuracy or effectiveness of expert advice</li>
                  <li>Payment is required upfront for scheduled consultations</li>
                  <li>Cancellations must be made according to the stated cancellation policy</li>
                  <li>You assume full responsibility for implementing any recommendations</li>
                </ul>
                <p>
                  All experts undergo a verification process, but their advice does not constitute professional agricultural, 
                  horticultural, or botanical consulting services unless explicitly stated.
                </p>
              </div>
            </section>

            {/* Section 7: Garden Monitoring */}
            <section id="section-7" className="scroll-mt-8">
              <div className="flex items-start gap-3 mb-4">
                <Calendar className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  7. Garden Monitoring
                </h2>
              </div>
              <div className="text-gray-700 dark:text-gray-300 space-y-4 ml-9">
                <p>Our garden monitoring service includes:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Plant care tracking and reminders</li>
                  <li>Environmental condition monitoring</li>
                  <li>Growth progress documentation</li>
                  <li>Automated care recommendations</li>
                </ul>
                <p>
                  This service requires a subscription and is subject to the following limitations:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Recommendations are automated and may not be suitable for all situations</li>
                  <li>We are not responsible for plant health outcomes</li>
                  <li>Service availability depends on technical infrastructure</li>
                  <li>Data accuracy depends on user input quality</li>
                </ul>
              </div>
            </section>

            {/* Section 8: User Content and Conduct */}
            <section id="section-8" className="scroll-mt-8">
              <div className="flex items-start gap-3 mb-4">
                <Users className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  8. User Content and Conduct
                </h2>
              </div>
              <div className="text-gray-700 dark:text-gray-300 space-y-4 ml-9">
                <p>When using our Service, you agree not to:</p>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 p-4 rounded-lg">
                  <ul className="list-disc pl-6 space-y-1 text-red-800 dark:text-red-200">
                    <li>Upload harmful, illegal, or inappropriate content</li>
                    <li>Violate intellectual property rights</li>
                    <li>Engage in spam, harassment, or abuse</li>
                    <li>Attempt to reverse engineer or hack our systems</li>
                    <li>Use the service for commercial purposes without authorization</li>
                    <li>Provide false or misleading information</li>
                  </ul>
                </div>
                <p>
                  We reserve the right to remove content and suspend accounts that violate these guidelines. 
                  Users retain ownership of their content but grant us a license to use it for service operation.
                </p>
              </div>
            </section>

            {/* Section 9: Privacy and Data Protection */}
            <section id="section-9" className="scroll-mt-8">
              <div className="flex items-start gap-3 mb-4">
                <Shield className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  9. Privacy and Data Protection
                </h2>
              </div>
              <div className="text-gray-700 dark:text-gray-300 space-y-4 ml-9">
                <p>
                  Your privacy is important to us. Our data collection and use practices are described in detail in our{' '}
                  <Link href="/privacy">
                    <span className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 underline">
                      Privacy Policy
                    </span>
                  </Link>, which is incorporated by reference into these Terms.
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-blue-800 dark:text-blue-200">
                    <strong>Key Privacy Points:</strong> We comply with CCPA, COPPA, and international privacy regulations. 
                    You have rights to access, delete, and control how your data is used, including opting out of AI training data usage.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 10: Payment Terms */}
            <section id="section-10" className="scroll-mt-8">
              <div className="flex items-start gap-3 mb-4">
                <CreditCard className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  10. Payment Terms
                </h2>
              </div>
              <div className="text-gray-700 dark:text-gray-300 space-y-4 ml-9">
                <p>Payment terms for our services:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Accepted Payment Methods:</h4>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>Credit and debit cards (Stripe)</li>
                      <li>PayPal</li>
                      <li>Regional payment methods (Razorpay for India)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Billing Policies:</h4>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>Charges are processed immediately</li>
                      <li>Subscriptions auto-renew unless cancelled</li>
                      <li>Applicable taxes are added at checkout</li>
                      <li>Currency conversion rates may apply</li>
                    </ul>
                  </div>
                </div>
                <p>
                  Refunds are generally not provided for digital services, except where required by applicable law. 
                  All prices are subject to change with reasonable notice.
                </p>
              </div>
            </section>

            {/* Section 11: Intellectual Property */}
            <section id="section-11" className="scroll-mt-8">
              <div className="flex items-start gap-3 mb-4">
                <FileText className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  11. Intellectual Property Rights
                </h2>
              </div>
              <div className="text-gray-700 dark:text-gray-300 space-y-4 ml-9">
                <p>
                  The GreenLens service, including its original content, features, and functionality, is owned by GreenLens and is protected by 
                  international copyright, trademark, patent, trade secret, and other intellectual property laws.
                </p>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Our Rights:</h4>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>AI models and algorithms</li>
                    <li>Software code and architecture</li>
                    <li>Database compilation and structure</li>
                    <li>Trademarks and branding</li>
                    <li>Original educational content</li>
                  </ul>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Your Rights:</h4>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>Use the service according to these Terms</li>
                    <li>Retain ownership of content you upload</li>
                    <li>Access and download purchased content</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 12: Service Availability */}
            <section id="section-12" className="scroll-mt-8">
              <div className="flex items-start gap-3 mb-4">
                <Globe className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  12. Service Availability
                </h2>
              </div>
              <div className="text-gray-700 dark:text-gray-300 space-y-4 ml-9">
                <p>
                  We strive to maintain high service availability, but cannot guarantee uninterrupted access. 
                  The service may be temporarily unavailable due to:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Scheduled maintenance</li>
                  <li>Technical difficulties</li>
                  <li>Third-party service disruptions</li>
                  <li>Force majeure events</li>
                </ul>
                <p>
                  We will provide reasonable notice for scheduled maintenance when possible. 
                  No compensation is provided for service interruptions unless required by applicable law.
                </p>
              </div>
            </section>

            {/* Section 13: Disclaimers and Limitations */}
            <section id="section-13" className="scroll-mt-8">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-amber-600 mt-1 flex-shrink-0" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  13. Disclaimers and Limitations of Liability
                </h2>
              </div>
              <div className="text-gray-700 dark:text-gray-300 space-y-4 ml-9">
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 p-4 rounded-lg">
                  <p className="text-amber-800 dark:text-amber-200 font-semibold mb-2">
                    IMPORTANT DISCLAIMER
                  </p>
                  <p className="text-sm">
                    THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, 
                    WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, 
                    FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                  </p>
                </div>
                <p>
                  TO THE FULLEST EXTENT PERMITTED BY LAW, GREENLENS SHALL NOT BE LIABLE FOR ANY INDIRECT, 
                  INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, 
                  WHETHER INCURRED DIRECTLY OR INDIRECTLY.
                </p>
                <p>
                  Our total liability for any claims shall not exceed the amount you paid to us for the service 
                  in the 12 months preceding the claim.
                </p>
              </div>
            </section>

            {/* Section 14: International Compliance */}
            <section id="section-14" className="scroll-mt-8">
              <div className="flex items-start gap-3 mb-4">
                <Globe className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  14. International Compliance
                </h2>
              </div>
              <div className="text-gray-700 dark:text-gray-300 space-y-4 ml-9">
                <p>
                  GreenLens operates internationally and complies with applicable laws in jurisdictions where we provide services:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">United States</h4>
                    <ul className="text-sm space-y-1">
                      <li>• COPPA (Children's Privacy)</li>
                      <li>• CCPA (California Privacy Rights)</li>
                      <li>• CAN-SPAM Act</li>
                      <li>• FTC Guidelines</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">International</h4>
                    <ul className="text-sm space-y-1">
                      <li>• GDPR (European Union)</li>
                      <li>• PIPEDA (Canada)</li>
                      <li>• LGPD (Brazil)</li>
                      <li>• Regional data protection laws</li>
                    </ul>
                  </div>
                </div>
                <p>
                  Users are responsible for ensuring their use of the service complies with local laws and regulations 
                  in their jurisdiction.
                </p>
              </div>
            </section>

            {/* Section 15: Termination */}
            <section id="section-15" className="scroll-mt-8">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  15. Termination
                </h2>
              </div>
              <div className="text-gray-700 dark:text-gray-300 space-y-4 ml-9">
                <p>
                  You may terminate your account at any time by contacting us or using account deletion features. 
                  We may terminate or suspend your account for:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Violation of these Terms</li>
                  <li>Fraudulent or illegal activity</li>
                  <li>Extended inactivity</li>
                  <li>Non-payment of fees</li>
                </ul>
                <p>
                  Upon termination, your right to use the service ceases immediately. 
                  We may retain certain information as required by law or for legitimate business purposes.
                </p>
              </div>
            </section>

            {/* Section 16: Dispute Resolution */}
            <section id="section-16" className="scroll-mt-8">
              <div className="flex items-start gap-3 mb-4">
                <Scale className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  16. Dispute Resolution
                </h2>
              </div>
              <div className="text-gray-700 dark:text-gray-300 space-y-4 ml-9">
                <p>
                  We encourage resolving disputes through direct communication. If you have concerns, 
                  please contact us at{' '}
                  <a href="mailto:support@greenlens.com" className="text-green-600 hover:text-green-700 underline">
                    support@greenlens.com
                  </a>.
                </p>
                <p>
                  For disputes that cannot be resolved informally:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Disputes shall be governed by the laws of [Your Jurisdiction]</li>
                  <li>Exclusive jurisdiction lies with courts in [Your Jurisdiction]</li>
                  <li>Arbitration may be required for certain types of disputes</li>
                  <li>Class action waivers may apply where legally permissible</li>
                </ul>
              </div>
            </section>

            {/* Section 17: Changes to Terms */}
            <section id="section-17" className="scroll-mt-8">
              <div className="flex items-start gap-3 mb-4">
                <FileText className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  17. Changes to Terms
                </h2>
              </div>
              <div className="text-gray-700 dark:text-gray-300 space-y-4 ml-9">
                <p>
                  We reserve the right to modify these Terms at any time. When we make changes, we will:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Update the "Last Updated" date</li>
                  <li>Notify users via email or in-app notification</li>
                  <li>Provide at least 30 days notice for material changes</li>
                  <li>Allow users to review changes before they take effect</li>
                </ul>
                <p>
                  Continued use of the service after changes take effect constitutes acceptance of the new Terms. 
                  If you disagree with changes, you should discontinue use of the service.
                </p>
              </div>
            </section>

            {/* Section 18: Contact Information */}
            <section id="section-18" className="scroll-mt-8">
              <div className="flex items-start gap-3 mb-4">
                <Users className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  18. Contact Information
                </h2>
              </div>
              <div className="text-gray-700 dark:text-gray-300 space-y-4 ml-9">
                <p>
                  For questions about these Terms of Service, please contact us:
                </p>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="space-y-2">
                    <p><strong>Email:</strong> <a href="mailto:legal@greenlens.com" className="text-green-600 hover:text-green-700 underline">legal@greenlens.com</a></p>
                    <p><strong>Support:</strong> <a href="mailto:support@greenlens.com" className="text-green-600 hover:text-green-700 underline">support@greenlens.com</a></p>
                    <p><strong>Privacy Requests:</strong> <a href="mailto:privacy@greenlens.com" className="text-green-600 hover:text-green-700 underline">privacy@greenlens.com</a></p>
                  </div>
                </div>
                <p>
                  We strive to respond to all inquiries within 48 hours during business days.
                </p>
              </div>
            </section>

          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <Link href="/">
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors" data-testid="return-home">
                <Leaf className="w-4 h-4" />
                Return to GreenLens
              </button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}