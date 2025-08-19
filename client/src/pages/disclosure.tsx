import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Info } from "lucide-react";
import { useLocation } from "wouter";

export default function Disclosure() {
  const [, setLocation] = useLocation();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      setLocation('/tools');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoBack}
            className="mb-6 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            data-testid="button-go-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Info className="w-6 h-6 text-blue-500" />
                Affiliate Program Disclosure
              </CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <h2>Amazon Associates Affiliate Program</h2>
              
              <p className="text-lg leading-relaxed mb-6">
                <strong>GreenLens is a participant in the Amazon Services LLC Associates Program</strong>, 
                an affiliate advertising program designed to provide a means for sites to earn advertising 
                fees by advertising and linking to Amazon.com and its international variants (Amazon.in, 
                Amazon.co.uk, etc.).
              </p>

              <h3>What This Means for You</h3>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg mb-6">
                <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">
                  No Extra Cost to You
                </h4>
                <p className="text-blue-700 dark:text-blue-300">
                  When you click on our Amazon links and make a purchase, you pay the same price 
                  you would normally pay on Amazon. We may receive a small commission from Amazon, 
                  but this does not affect the price you pay.
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg mb-6">
                <h4 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-3">
                  Supporting Our Mission
                </h4>
                <p className="text-green-700 dark:text-green-300">
                  These commissions help us maintain and improve GreenLens, develop new features, 
                  and provide you with valuable gardening content and plant identification services 
                  at no cost to you.
                </p>
              </div>

              <h3>Our Commitment to You</h3>
              
              <ul className="space-y-3 mb-6">
                <li>
                  <strong>Honest Recommendations:</strong> We only recommend products that we believe 
                  will be genuinely useful for gardeners and plant enthusiasts.
                </li>
                <li>
                  <strong>No Inflated Prices:</strong> We never mark up prices. All pricing information 
                  comes directly from Amazon's API when available.
                </li>
                <li>
                  <strong>Transparent Labeling:</strong> All affiliate links are clearly marked and 
                  follow proper disclosure guidelines.
                </li>
                <li>
                  <strong>Compliance:</strong> We strictly adhere to Amazon Associates Program policies 
                  and FTC guidelines for affiliate marketing.
                </li>
              </ul>

              <h3>International Markets</h3>
              
              <p className="mb-6">
                We participate in Amazon Associates programs across multiple regions to serve our 
                international users:
              </p>
              
              <ul className="mb-6">
                <li><strong>United States:</strong> Amazon.com Associates Program</li>
                <li><strong>India:</strong> Amazon.in Associates Program</li>
                <li><strong>United Kingdom:</strong> Amazon.co.uk Associates Program</li>
              </ul>

              <h3>Product Information</h3>
              
              <p className="mb-6">
                Product prices, availability, ratings, and reviews are provided by Amazon's Product 
                Advertising API when available. This information is updated regularly but may not 
                always reflect real-time data. Please check Amazon directly for the most current 
                information before making a purchase.
              </p>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg mb-6">
                <p className="text-yellow-800 dark:text-yellow-200">
                  <strong>Important Notice:</strong> Prices and availability are subject to change. 
                  The prices shown were accurate at the time of last update but may have changed 
                  since then.
                </p>
              </div>

              <h3>Questions or Concerns?</h3>
              
              <p className="mb-6">
                If you have any questions about our affiliate program or concerns about our 
                recommendations, please don't hesitate to contact us. We value transparency 
                and are committed to maintaining your trust.
              </p>

              <div className="text-center mt-8">
                <Button
                  onClick={() => setLocation('/tools')}
                  className="inline-flex items-center gap-2"
                  data-testid="button-back-to-tools"
                >
                  <ExternalLink className="w-4 h-4" />
                  Return to Gardening Tools
                </Button>
              </div>

              <footer className="text-sm text-gray-500 dark:text-gray-400 mt-8 pt-6 border-t">
                <p>
                  This disclosure was last updated on {new Date().toLocaleDateString()}.
                </p>
              </footer>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}