import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Leaf, BookOpen, Shield, Settings, Users, Search, Heart, ArrowLeft } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSection {
  title: string;
  icon: any;
  items: FAQItem[];
}

export default function FAQ() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  const faqSections: FAQSection[] = [
    {
      title: "Getting Started",
      icon: HelpCircle,
      items: [
        {
          question: "What is GreenLens and how does it work?",
          answer: "GreenLens represents the next evolution in botanical technology - a comprehensive plant intelligence platform that transforms photographs into detailed horticultural insights. Our proprietary AI algorithms examine your plant images and deliver species identification along with customized cultivation guidance, optimal growing conditions, and health monitoring recommendations tailored to your specific environment."
        },
        {
          question: "Do I need to create an account to use GreenLens?",
          answer: "While you can browse our educational content and blog posts without an account, plant identification and personalized care features require registration. Creating a free account allows you to save your identified plants, track your garden collection, receive care reminders, and access your plant history. Premium accounts unlock unlimited identifications and advanced features."
        },
        {
          question: "Is GreenLens free to use?",
          answer: "GreenLens offers a free tier that includes 5 plant identifications per month, basic care information, and access to our educational blog content. Our Pro plan ($9/month) provides unlimited identifications, detailed care plans, disease diagnosis, and priority support. The Premium plan ($19/month) adds expert consultations, advanced analytics, and exclusive e-book content."
        },
        {
          question: "What devices and browsers does GreenLens support?",
          answer: "GreenLens works on all modern devices including smartphones, tablets, and desktop computers. We support the latest versions of Chrome, Firefox, Safari, and Edge browsers. Our responsive design ensures optimal performance across all screen sizes. For the best mobile experience, we recommend using the latest iOS or Android browsers."
        }
      ]
    },
    {
      title: "Plant Identification",
      icon: Search,
      items: [
        {
          question: "How accurate is the plant identification?",
          answer: "Our botanical intelligence system demonstrates exceptional precision with accuracy rates exceeding 94% for widely cultivated species and 88-92% for uncommon varieties. Performance depends on image clarity, illumination quality, and the presence of diagnostic plant characteristics. We employ multiple neural network architectures and proprietary algorithms that work in concert to ensure the highest possible identification confidence."
        },
        {
          question: "What makes a good photo for plant identification?",
          answer: "Optimal identification requires high-quality imagery showcasing diagnostic botanical features: leaf morphology (upper and lower surfaces), reproductive structures, fruit development, bark texture, and overall growth architecture. Natural daylight produces superior results compared to artificial lighting. Focus on filling the frame with your subject while avoiding harsh shadows. Detailed leaf photography highlighting venation patterns, margins, and surface textures significantly enhances our system's analytical capabilities."
        },
        {
          question: "Can GreenLens identify plants from any part of the world?",
          answer: "Yes! Our database includes over 50,000 plant species from around the globe, covering native and cultivated plants from all continents. We have extensive coverage of North American, European, Asian, and tropical species. However, extremely rare or recently discovered species may not be in our database yet. We continuously update our database with new species and regional variations."
        },
        {
          question: "What if the identification seems wrong?",
          answer: "If you believe an identification is incorrect, you can provide feedback through the 'Report Issue' button on the results page. Our team reviews all feedback and uses it to improve our AI models. You can also try uploading additional photos from different angles or consult with our expert botanists through the Premium consultation service for definitive identification."
        },
        {
          question: "Can I identify multiple plants in one photo?",
          answer: "Currently, our AI works best with photos containing a single plant specimen. If your photo contains multiple plants, try to crop it to focus on one plant at a time, or take separate photos of each plant you want to identify. We're working on multi-plant identification features for future updates."
        }
      ]
    },
    {
      title: "Plant Care & Recommendations",
      icon: Heart,
      items: [
        {
          question: "How personalized are the care recommendations?",
          answer: "Our care recommendations are highly personalized based on your location, climate zone, indoor/outdoor growing conditions, and plant placement (light exposure, humidity levels). We factor in seasonal changes, local weather patterns, and your gardening experience level. Premium users can set detailed environment parameters for even more precise recommendations."
        },
        {
          question: "How does the watering schedule work?",
          answer: "Our intelligent hydration system generates adaptive scheduling algorithms that factor in species requirements, container dimensions, substrate composition, seasonal variations, and regional climate data. The platform analyzes drainage characteristics, atmospheric moisture, and developmental phases to deliver timely irrigation alerts while automatically calibrating for environmental fluctuations."
        },
        {
          question: "Can GreenLens help with plant diseases and pests?",
          answer: "Absolutely! Our botanical diagnostic intelligence recognizes widespread plant pathologies, insect invasions, and nutrient imbalances through photographic analysis of compromised plant tissues. We deliver comprehensive therapeutic protocols encompassing natural and synthetic interventions, preventative measures, and professional consultation guidance. Our pathology repository encompasses more than 200 prevalent plant wellness challenges."
        },
        {
          question: "Do you provide care advice for indoor and outdoor plants?",
          answer: "Absolutely! We provide specialized care recommendations for both indoor houseplants and outdoor garden plants. Our advice covers container gardening, landscape plants, vegetables, herbs, flowers, trees, and shrubs. We adjust recommendations based on whether plants are grown indoors, in greenhouses, or in outdoor garden settings."
        },
        {
          question: "How do you account for different climate zones?",
          answer: "Our geographic intelligence automatically pinpoints your coordinates and cross-references agricultural hardiness mappings, global climate categorizations, and hyper-local meteorological data to deliver territory-specific cultivation guidance. We integrate freeze occurrence patterns, cultivation periods, temperature averages, precipitation trends, and seasonal transitions to guarantee our suggestions align with your unique environmental conditions."
        }
      ]
    },
    {
      title: "Account & Subscription Management",
      icon: Settings,
      items: [
        {
          question: "How do I upgrade or downgrade my subscription?",
          answer: "You can change your subscription at any time from your account settings. Go to 'Subscription' in your profile menu, select your desired plan, and confirm the change. Upgrades take effect immediately, while downgrades will apply at the end of your current billing cycle. You'll retain access to premium features until your current subscription expires."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit cards (Visa, MasterCard, American Express, Discover), PayPal, and various regional payment methods including Razorpay for Indian users. All payments are processed securely through encrypted connections, and we don't store your payment information on our servers."
        },
        {
          question: "Can I cancel my subscription anytime?",
          answer: "Yes, you can cancel your subscription at any time without penalties. Simply go to your account settings and select 'Cancel Subscription.' You'll continue to have access to premium features until the end of your current billing period, after which your account will revert to the free tier with its limitations."
        },
        {
          question: "Do you offer refunds?",
          answer: "We offer a 30-day money-back guarantee for all paid subscriptions. If you're not satisfied with our service, contact our support team within 30 days of your initial purchase for a full refund. Refunds for subsequent billing periods are evaluated on a case-by-case basis."
        },
        {
          question: "How do I delete my account and data?",
          answer: "You can request account deletion from your account settings under 'Privacy & Data.' This will permanently delete all your personal information, plant collections, and identification history. Please note that this action is irreversible. Account deletion typically takes 7-10 business days to complete."
        }
      ]
    },
    {
      title: "Plant Biology & Science",
      icon: Leaf,
      items: [
        {
          question: "How do plants photosynthesize and why is light important?",
          answer: "Photosynthesis is the process where plants convert light energy, carbon dioxide, and water into glucose (food) and oxygen. Chlorophyll in plant leaves captures light energy, primarily from the red and blue spectrums. Light intensity, duration, and quality affect growth rates, flowering, and overall plant health. Different plants have evolved different light requirements - full sun, partial shade, or deep shade - based on their natural habitats."
        },
        {
          question: "What nutrients do plants need and what are deficiency symptoms?",
          answer: "Plants require macronutrients (nitrogen, phosphorus, potassium) and micronutrients (iron, magnesium, calcium, etc.). Nitrogen deficiency causes yellowing leaves starting from the bottom, phosphorus deficiency leads to purple leaf tinges and poor flowering, while potassium deficiency causes brown leaf edges and weak stems. Micronutrient deficiencies show as interveinal chlorosis, stunted growth, or poor fruit development."
        },
        {
          question: "Why do plant leaves turn yellow, and what does it mean?",
          answer: "Yellow leaves (chlorosis) can indicate several conditions: natural aging and senescence, overwatering or underwatering, nutrient deficiencies (especially nitrogen or iron), disease, pest damage, or environmental stress. The pattern of yellowing helps diagnosis - bottom leaves first suggests nitrogen deficiency, while random yellowing might indicate watering issues or root problems."
        },
        {
          question: "How do plants reproduce and what's the difference between sexual and asexual reproduction?",
          answer: "Plants reproduce sexually through seeds (involving pollen, fertilization, and genetic recombination) or asexually through vegetative methods like runners, bulbs, or fragmentation. Sexual reproduction creates genetic diversity but requires more energy, while asexual reproduction produces identical clones quickly. Many plants use both methods - strawberries spread via runners but also produce seeds."
        },
        {
          question: "What is plant dormancy and why do plants go dormant?",
          answer: "Dormancy is a state of reduced metabolic activity that helps plants survive unfavorable conditions like winter cold, summer drought, or seasonal changes. During dormancy, growth slows or stops, leaves may drop, and the plant conserves energy. This adaptation allows plants to survive extreme temperatures, water scarcity, or reduced daylight hours."
        },
        {
          question: "How do different soil types affect plant growth?",
          answer: "Soil type affects drainage, nutrient availability, pH, and root development. Sandy soils drain quickly but may lack nutrients, clay soils retain water but can become waterlogged, and loamy soils provide the best balance. Soil pH affects nutrient availability - acidic soils favor plants like blueberries and azaleas, while alkaline soils suit lavender and clematis."
        },
        {
          question: "What role do mycorrhizal fungi play in plant health?",
          answer: "Mycorrhizal fungi form beneficial partnerships with plant roots, extending the root system's reach and helping plants absorb water and nutrients, especially phosphorus. In return, plants provide carbohydrates to the fungi. This symbiotic relationship improves plant stress tolerance, disease resistance, and overall health. Most plants naturally form these relationships in healthy soils."
        }
      ]
    },
    {
      title: "Expert Consultations",
      icon: Users,
      items: [
        {
          question: "How do expert consultations work?",
          answer: "Our expert consultations connect you with certified botanists, horticulturists, and master gardeners for personalized advice. Submit your question with photos and details about your specific situation. Experts typically respond within 24-48 hours with detailed, professional advice. This service is included with Premium subscriptions or available as pay-per-consultation for other users."
        },
        {
          question: "What qualifications do your experts have?",
          answer: "Our expert panel includes certified botanists with advanced degrees, licensed horticulturists, master gardeners with extensive training, and specialists in areas like plant pathology, entomology, and soil science. All experts are verified professionals with years of experience in plant science, gardening, or related fields."
        },
        {
          question: "What types of questions can I ask experts?",
          answer: "You can ask about plant identification, disease diagnosis, pest management, garden planning, plant selection for specific conditions, troubleshooting plant problems, soil issues, pruning techniques, propagation methods, and specialized growing advice. Our experts can help with both common garden questions and complex botanical challenges."
        },
        {
          question: "How much do expert consultations cost?",
          answer: "Expert consultations are included with Premium subscriptions (unlimited). Pro users receive 2 consultations per month, and free users can purchase individual consultations for $15 each. Complex questions requiring extensive research may require additional consultation credits."
        }
      ]
    },
    {
      title: "E-books & Learning Resources",
      icon: BookOpen,
      items: [
        {
          question: "What e-books are available on GreenLens?",
          answer: "Our e-book library includes comprehensive guides on plant identification, organic gardening, indoor plant care, pest and disease management, permaculture principles, native plant gardening, vegetable growing, herb cultivation, and seasonal gardening. New titles are added monthly, covering both beginner and advanced topics."
        },
        {
          question: "Are the e-books written by experts?",
          answer: "Yes, all our e-books are authored by certified horticulturists, botanists, master gardeners, and other qualified plant professionals. Content is peer-reviewed for accuracy and updated regularly to reflect current best practices in plant care and gardening techniques."
        },
        {
          question: "Can I download e-books for offline reading?",
          answer: "Premium subscribers can download e-books in PDF format for offline reading on any device. Downloaded books remain accessible as long as your subscription is active. Free and Pro users can read e-books online through our web platform but cannot download them for offline use."
        },
        {
          question: "Do you offer regional or climate-specific gardening guides?",
          answer: "Yes! We offer specialized guides for different climate zones, including tropical gardening, desert gardening, cold-climate growing, Mediterranean gardening, and temperate zone cultivation. We also have region-specific guides for North America, Europe, Australia, and other major gardening regions."
        }
      ]
    },
    {
      title: "Privacy & Security",
      icon: Shield,
      items: [
        {
          question: "How do you protect my personal information?",
          answer: "We use industry-standard encryption (SSL/TLS) for all data transmission, secure servers for data storage, and strict access controls for our staff. We never sell personal information to third parties and only use your data to provide and improve our services. All photo uploads are processed securely and can be deleted from your account at any time."
        },
        {
          question: "What happens to the photos I upload?",
          answer: "Photos are processed by our AI systems for plant identification and then stored securely in your account. You can delete photos at any time from your plant collection. We may use anonymized photos to improve our AI models, but only with explicit consent and never with identifying information attached."
        },
        {
          question: "Do you share data with third parties?",
          answer: "We only share data with essential service providers (payment processors, cloud hosting) under strict privacy agreements. We never sell personal information or plant identification data to third parties. Any data sharing for research purposes is completely anonymized and requires explicit user consent."
        },
        {
          question: "How can I control my privacy settings?",
          answer: "Your account privacy settings allow you to control data sharing preferences, email communications, photo privacy, and research participation. You can opt out of data collection for AI improvement, delete your identification history, and control what information is visible in community features."
        }
      ]
    },
    {
      title: "Technical Support",
      icon: Settings,
      items: [
        {
          question: "The app is running slowly or not loading properly. What should I do?",
          answer: "First, try refreshing your browser or clearing your browser cache. Ensure you have a stable internet connection and try using a different browser. If problems persist, check our status page for any ongoing issues. For mobile users, ensure you have the latest browser version and sufficient device storage."
        },
        {
          question: "I'm having trouble uploading photos. What could be wrong?",
          answer: "Ensure your photos are in supported formats (JPEG, PNG, WebP) and under 10MB in size. Check your internet connection and try uploading smaller or compressed images. Some browser extensions may interfere with uploads - try disabling them or using an incognito/private browsing window."
        },
        {
          question: "Why am I not receiving email notifications?",
          answer: "Check your spam/junk folder first, as our emails might be filtered there. Ensure the email address in your account is correct and verify your notification preferences in account settings. Add our domain to your email whitelist or safe senders list to ensure delivery."
        },
        {
          question: "How do I reset my password?",
          answer: "Click 'Forgot Password' on the login page and enter your registered email address. You'll receive a password reset link within a few minutes. If you don't receive the email, check your spam folder and ensure you're using the correct email address associated with your account."
        },
        {
          question: "Can I use GreenLens offline?",
          answer: "While some basic features work offline (viewing previously identified plants in your collection), plant identification requires an internet connection to access our AI services and databases. We're working on limited offline capabilities for future updates."
        }
      ]
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 dark:from-green-950 dark:via-gray-900 dark:to-green-950">
        {/* Back Button */}
        <div className="px-4 sm:px-6 lg:px-8 pt-2">
          <Link href="/">
            <Button variant="outline" size="sm" className="flex items-center space-x-1 bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-300 text-green-700">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Frequently Asked Questions
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Find answers to common questions about GreenLens, plant identification, care recommendations, and plant biology
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          {faqSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-8">
              {/* Section Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <section.icon className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {section.title}
                </h2>
              </div>

              {/* FAQ Items */}
              <div className="space-y-4">
                {section.items.map((item, itemIndex) => {
                  const itemId = `${sectionIndex}-${itemIndex}`;
                  const isOpen = openItems.has(itemId);

                  return (
                    <div
                      key={itemIndex}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                      <button
                        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                        onClick={() => toggleItem(itemId)}
                        data-testid={`faq-question-${itemId}`}
                      >
                        <h3 className="font-semibold text-gray-900 dark:text-white pr-4">
                          {item.question}
                        </h3>
                        {isOpen ? (
                          <ChevronUp className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                        )}
                      </button>
                      
                      {isOpen && (
                        <div className="px-6 pb-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {item.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Contact Support */}
          <div className="mt-12 bg-green-50 dark:bg-green-900/20 rounded-xl p-8 text-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Still have questions?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                data-testid="button-contact-support"
              >
                Contact Support
              </Button>
              <Button
                variant="outline"
                className="px-6 py-3 border border-green-600 text-green-600 dark:text-green-400 rounded-lg font-medium hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors"
                data-testid="button-expert-consultation"
              >
                Get Expert Consultation
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}