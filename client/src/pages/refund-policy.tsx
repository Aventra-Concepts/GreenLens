import { Link } from "wouter";
import { Layout } from "@/components/Layout";
import { ArrowLeft, CreditCard, AlertTriangle, FileText, Clock, DollarSign, Globe, Shield, BookOpen, Users, Leaf, Calendar } from "lucide-react";

export default function RefundPolicy() {
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
                <CreditCard className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  Refund Policy
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  Comprehensive refund terms for all GreenLens services and products
                </p>
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-8">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-semibold mb-1">Important Notice</p>
                  <p>
                    This refund policy complies with consumer protection laws worldwide, including EU Consumer Rights Directive, 
                    US consumer protection laws, UK Consumer Rights Act, and applicable international standards.
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
                "1. General Refund Policy",
                "2. Digital Services Refunds",
                "3. E-book Marketplace Refunds", 
                "4. Expert Consultation Refunds",
                "5. Subscription Services",
                "6. Physical Products",
                "7. International Consumer Rights",
                "8. Payment Processor Policies",
                "9. Refund Process",
                "10. Dispute Resolution",
                "11. Force Majeure",
                "12. Contact Information"
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

          {/* Refund Policy Content */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 space-y-12">
            
            {/* Section 1: General Refund Policy */}
            <section id="section-1" className="scroll-mt-8">
              <div className="flex items-start gap-3 mb-4">
                <Shield className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  1. General Refund Policy
                </h2>
              </div>
              <div className="text-gray-700 dark:text-gray-300 space-y-4 ml-9">
                <p>
                  GreenLens is committed to providing high-quality services and products. We understand that sometimes 
                  refunds may be necessary, and we strive to handle all refund requests fairly and transparently.
                </p>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">Our Commitment</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Compliance with all applicable consumer protection laws</li>
                    <li>• Fair and transparent refund processes</li>
                    <li>• Reasonable timeframes for processing refunds</li>
                    <li>• Clear communication throughout the process</li>
                  </ul>
                </div>
                <p>
                  <strong>Important:</strong> Refund eligibility and terms vary by service type, purchase location, 
                  and applicable consumer protection laws in your jurisdiction.
                </p>
              </div>
            </section>

            {/* Section 2: Digital Services Refunds */}
            <section id="section-2" className="scroll-mt-8">
              <div className="flex items-start gap-3 mb-4">
                <Leaf className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  2. Digital Services Refunds
                </h2>
              </div>
              <div className="text-gray-700 dark:text-gray-300 space-y-4 ml-9">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Plant Identification Services</h3>
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 p-4 rounded-lg">
                  <p className="text-amber-800 dark:text-amber-200 text-sm">
                    <strong>Free Tier Users:</strong> No refunds available as services are provided free of charge.
                  </p>
                </div>
                <p><strong>Premium AI Services:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>EU Users:</strong> 14-day cooling-off period from date of purchase (Consumer Rights Directive)</li>
                  <li><strong>UK Users:</strong> 14-day statutory cancellation period (Consumer Rights Act 2015)</li>
                  <li><strong>US Users:</strong> Refunds at discretion, typically within 7 days of purchase</li>
                  <li><strong>Other Jurisdictions:</strong> Refunds according to local consumer protection laws</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">My Garden Service</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Data export available before cancellation</li>
                  <li>Pro-rated refunds for annual subscriptions cancelled within first 30 days</li>
                  <li>Monthly subscriptions: Refund for unused portion if cancelled within 7 days</li>
                  <li>No refunds for services used beyond 30-day period</li>
                </ul>
              </div>
            </section>

            {/* Section 3: E-book Marketplace Refunds */}
            <section id="section-3" className="scroll-mt-8">
              <div className="flex items-start gap-3 mb-4">
                <BookOpen className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  3. E-book Marketplace Refunds
                </h2>
              </div>
              <div className="text-gray-700 dark:text-gray-300 space-y-4 ml-9">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Digital Content Refund Rights</h4>
                  <p className="text-blue-800 dark:text-blue-200 text-sm">
                    E-books are considered digital content. Refund rights vary significantly by jurisdiction and 
                    whether content has been accessed or downloaded.
                  </p>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Refund Eligibility</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Technical Issues:</strong> Full refund if e-book is corrupted, unreadable, or contains significant technical errors</li>
                  <li><strong>Incorrect Product:</strong> Full refund if delivered content differs substantially from description</li>
                  <li><strong>Duplicate Purchase:</strong> Full refund for accidental duplicate purchases within 48 hours</li>
                  <li><strong>EU/UK Users:</strong> 14-day refund period if content has not been accessed/downloaded</li>
                  <li><strong>US Users:</strong> Refunds considered case-by-case, typically within 48 hours if not accessed</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Non-Refundable Situations</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>E-books that have been downloaded or accessed (except for technical issues)</li>
                  <li>Change of mind after content consumption</li>
                  <li>Compatibility issues disclosed in product description</li>
                  <li>Purchases made more than 14 days ago (EU/UK) or 48 hours ago (other regions)</li>
                </ul>
              </div>
            </section>

            {/* Section 4: Expert Consultation Refunds */}
            <section id="section-4" className="scroll-mt-8">
              <div className="flex items-start gap-3 mb-4">
                <Users className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  4. Expert Consultation Refunds
                </h2>
              </div>
              <div className="text-gray-700 dark:text-gray-300 space-y-4 ml-9">
                <p>
                  Expert consultations are live services with specific scheduling requirements. 
                  Refund policies are designed to be fair to both customers and experts.
                </p>
                
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Refund Scenarios</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">Full Refund</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Expert cancellation</li>
                      <li>• Technical issues preventing consultation</li>
                      <li>• Service not delivered as described</li>
                      <li>• Cancellation 24+ hours before appointment</li>
                    </ul>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">Partial/No Refund</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Customer no-show</li>
                      <li>• Cancellation less than 24 hours</li>
                      <li>• Service completed as scheduled</li>
                      <li>• Customer satisfaction (case-by-case)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5: Subscription Services */}
            <section id="section-5" className="scroll-mt-8">
              <div className="flex items-start gap-3 mb-4">
                <Calendar className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  5. Subscription Services
                </h2>
              </div>
              <div className="text-gray-700 dark:text-gray-300 space-y-4 ml-9">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Garden Monitoring & Premium Features</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Monthly Subscriptions:</strong> Cancel anytime, no refund for current billing period</li>
                  <li><strong>Annual Subscriptions:</strong> Pro-rated refunds for unused months if cancelled within first 30 days</li>
                  <li><strong>Free Trial:</strong> Cancel before trial ends to avoid charges, full refund if charged in error</li>
                  <li><strong>Auto-renewal:</strong> Can be disabled anytime, refunds for erroneous charges within 5 business days</li>
                </ul>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">EU/UK Subscription Rights</h4>
                  <p className="text-blue-800 dark:text-blue-200 text-sm">
                    Under EU and UK consumer protection laws, customers have the right to cancel 
                    subscriptions within 14 days and receive a pro-rated refund for unused services.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 6: Physical Products */}
            <section id="section-6" className="scroll-mt-8">
              <div className="flex items-start gap-3 mb-4">
                <DollarSign className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  6. Physical Products
                </h2>
              </div>
              <div className="text-gray-700 dark:text-gray-300 space-y-4 ml-9">
                <p>
                  Physical products sold through our platform (gardening tools, books, equipment) 
                  are subject to different refund policies based on the seller and applicable laws.
                </p>
                
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Amazon Affiliate Products</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Refunds handled directly by Amazon according to their return policy</li>
                  <li>30-day return window for most items</li>
                  <li>Condition requirements vary by product category</li>
                  <li>GreenLens facilitates communication but does not process these refunds</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Direct Sales (if applicable)</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>30-day return period for unopened items</li>
                  <li>14-day return period for opened items in resaleable condition</li>
                  <li>Customer responsible for return shipping unless item is defective</li>
                  <li>Refund processed within 5-10 business days of receiving returned item</li>
                </ul>
              </div>
            </section>

            {/* Section 7: International Consumer Rights */}
            <section id="section-7" className="scroll-mt-8">
              <div className="flex items-start gap-3 mb-4">
                <Globe className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  7. International Consumer Rights
                </h2>
              </div>
              <div className="text-gray-700 dark:text-gray-300 space-y-4 ml-9">
                <p>
                  GreenLens operates internationally and complies with consumer protection laws 
                  in various jurisdictions. Your specific rights may be stronger than outlined in this policy.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">European Union</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Consumer Rights Directive 2011/83/EU</li>
                      <li>• 14-day cooling-off period</li>
                      <li>• Right of withdrawal</li>
                      <li>• Protection for digital content</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">United Kingdom</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Consumer Rights Act 2015</li>
                      <li>• 14-day cancellation period</li>
                      <li>• Right to reject faulty goods</li>
                      <li>• Protection for digital content</li>
                    </ul>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">Australia</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Australian Consumer Law</li>
                      <li>• Consumer guarantees</li>
                      <li>• Right to refund for major failures</li>
                      <li>• Protection against unfair terms</li>
                    </ul>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2">Canada</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Provincial consumer protection laws</li>
                      <li>• Cooling-off periods (varies by province)</li>
                      <li>• Right to cancel certain contracts</li>
                      <li>• Protection for online purchases</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 8: Payment Processor Policies */}
            <section id="section-8" className="scroll-mt-8">
              <div className="flex items-start gap-3 mb-4">
                <CreditCard className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  8. Payment Processor Policies
                </h2>
              </div>
              <div className="text-gray-700 dark:text-gray-300 space-y-4 ml-9">
                <p>
                  Refunds are processed through various payment processors depending on your location and payment method.
                </p>
                
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Processing Times</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Stripe (International):</strong> 5-10 business days</li>
                  <li><strong>Razorpay (India):</strong> 3-7 business days</li>
                  <li><strong>PayPal:</strong> 3-5 business days</li>
                  <li><strong>Bank Transfers:</strong> 1-3 business days</li>
                </ul>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 p-4 rounded-lg">
                  <p className="text-amber-800 dark:text-amber-200 text-sm">
                    <strong>Note:</strong> Processing times may vary based on your bank, payment method, and regional banking systems. 
                    Weekends and holidays may extend processing times.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 9: Refund Process */}
            <section id="section-9" className="scroll-mt-8">
              <div className="flex items-start gap-3 mb-4">
                <Clock className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  9. Refund Process
                </h2>
              </div>
              <div className="text-gray-700 dark:text-gray-300 space-y-4 ml-9">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">How to Request a Refund</h3>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Contact our support team at <a href="mailto:support@greenlens.app" className="text-green-600 hover:text-green-700 underline">support@greenlens.app</a></li>
                  <li>Provide your order number, purchase date, and reason for refund</li>
                  <li>Our team will review your request within 2 business days</li>
                  <li>You'll receive confirmation and timeline for processing</li>
                  <li>Refund will be processed to your original payment method</li>
                </ol>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Required Information</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Full name and email associated with the account</li>
                  <li>Order/transaction number</li>
                  <li>Date of purchase</li>
                  <li>Detailed reason for refund request</li>
                  <li>Screenshots or documentation (if applicable)</li>
                </ul>

                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">Expedited Processing</h4>
                  <p className="text-green-800 dark:text-green-200 text-sm">
                    Technical issues, service outages, and billing errors are prioritized and typically 
                    processed within 24 hours of request submission.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 10: Dispute Resolution */}
            <section id="section-10" className="scroll-mt-8">
              <div className="flex items-start gap-3 mb-4">
                <Shield className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  10. Dispute Resolution
                </h2>
              </div>
              <div className="text-gray-700 dark:text-gray-300 space-y-4 ml-9">
                <p>
                  If you're unsatisfied with our refund decision, you have several options for dispute resolution.
                </p>
                
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Internal Appeal Process</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Request escalation to senior customer service manager</li>
                  <li>Provide additional documentation or evidence</li>
                  <li>Appeals reviewed within 5 business days</li>
                  <li>Final internal decision provided in writing</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">External Options</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Chargeback:</strong> Contact your credit card company or bank</li>
                  <li><strong>Consumer Protection Agencies:</strong> File complaints with relevant authorities</li>
                  <li><strong>Small Claims Court:</strong> For disputes within jurisdictional limits</li>
                  <li><strong>Arbitration:</strong> Binding arbitration as outlined in Terms of Service</li>
                </ul>
              </div>
            </section>

            {/* Section 11: Force Majeure */}
            <section id="section-11" className="scroll-mt-8">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  11. Force Majeure
                </h2>
              </div>
              <div className="text-gray-700 dark:text-gray-300 space-y-4 ml-9">
                <p>
                  In cases of force majeure events (natural disasters, pandemics, government actions, etc.) 
                  that prevent service delivery, special refund considerations apply:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Service credits for disrupted subscription services</li>
                  <li>Extended timelines for expert consultations</li>
                  <li>Full refunds for services that cannot be delivered</li>
                  <li>Flexible rescheduling options where possible</li>
                </ul>
              </div>
            </section>

            {/* Section 12: Contact Information */}
            <section id="section-12" className="scroll-mt-8">
              <div className="flex items-start gap-3 mb-4">
                <Users className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  12. Contact Information
                </h2>
              </div>
              <div className="text-gray-700 dark:text-gray-300 space-y-4 ml-9">
                <p>For refund requests, questions, or appeals, please contact us:</p>
                
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Customer Support</h4>
                  <ul className="space-y-2 text-sm">
                    <li><strong>Email:</strong> <a href="mailto:support@greenlens.app" className="text-green-600 hover:text-green-700 underline">support@greenlens.app</a></li>
                    <li><strong>Refund Requests:</strong> <a href="mailto:refunds@greenlens.app" className="text-green-600 hover:text-green-700 underline">refunds@greenlens.app</a></li>
                    <li><strong>Business Hours:</strong> Monday-Friday, 9:00 AM - 6:00 PM (UTC)</li>
                    <li><strong>Response Time:</strong> Within 24 hours for urgent matters, 48 hours for general inquiries</li>
                  </ul>
                </div>

                <p className="text-sm">
                  This refund policy is subject to change. Updates will be posted on this page with the revision date. 
                  Continued use of our services after changes constitutes acceptance of the updated policy.
                </p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </Layout>
  );
}