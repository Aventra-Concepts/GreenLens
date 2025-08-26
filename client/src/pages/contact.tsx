import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import Layout from '@/components/Layout';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // For now, we'll just show a toast message
    // In a real implementation, you'd send this to your backend
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you within 24 hours.",
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      toast({
        title: "Error sending message",
        description: "Please try again later or contact us directly via email.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Contact Us
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Have questions about plant identification or care? We're here to help! 
                Reach out to our team of gardening experts.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Contact Information */}
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="text-2xl text-green-600 dark:text-green-400">
                    Get in Touch
                  </CardTitle>
                  <CardDescription>
                    We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-gray-600 dark:text-gray-300">support@greenlens.ai</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        (This email can be edited later by admins)
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="font-medium">Response Time</p>
                      <p className="text-gray-600 dark:text-gray-300">Within 24 hours</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="font-medium">Support Coverage</p>
                      <p className="text-gray-600 dark:text-gray-300">Global - All time zones</p>
                    </div>
                  </div>

                  {/* FAQ Quick Links */}
                  <div className="pt-4 border-t">
                    <p className="font-medium mb-3">Quick Help</p>
                    <div className="space-y-2">
                      <a 
                        href="/faq" 
                        className="block text-sm text-green-600 dark:text-green-400 hover:underline"
                      >
                        → Frequently Asked Questions
                      </a>
                      <a 
                        href="/features" 
                        className="block text-sm text-green-600 dark:text-green-400 hover:underline"
                      >
                        → Platform Features & Capabilities
                      </a>
                      <a 
                        href="/pricing" 
                        className="block text-sm text-green-600 dark:text-green-400 hover:underline"
                      >
                        → Pricing & Plans
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Send us a Message</CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you soon.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" data-testid="label-name">Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Your full name"
                          data-testid="input-name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" data-testid="label-email">Email *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="your.email@example.com"
                          data-testid="input-email"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="subject" data-testid="label-subject">Subject *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        required
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="What's this about?"
                        data-testid="input-subject"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="message" data-testid="label-message">Message *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Tell us more about your question or how we can help..."
                        rows={6}
                        data-testid="textarea-message"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                      data-testid="button-send-message"
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Additional Help Section */}
            <Card className="mt-8">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Need Immediate Help?</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    For urgent plant health issues or technical support, check out our comprehensive resources:
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Button variant="outline" asChild data-testid="button-plant-database">
                      <a href="/plant-database">Plant Database</a>
                    </Button>
                    <Button variant="outline" asChild data-testid="button-care-plans">
                      <a href="/care-plans">Care Plans</a>
                    </Button>
                    <Button variant="outline" asChild data-testid="button-talk-to-expert">
                      <a href="/talk-to-expert">Talk to Expert</a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}