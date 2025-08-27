import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Phone, Mail, MapPin, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import chatbotIcon from '@assets/chatbot_variant_1_1756279130191.png';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
}

const faqs: FAQ[] = [
  {
    id: '1',
    question: 'How do I identify a plant?',
    answer: 'Upload a clear photo of your plant using our AI identification tool. Make sure the image shows the leaves, flowers, or distinctive features clearly. Our AI will analyze the image and provide species identification with care recommendations.',
    category: 'identification',
    keywords: ['identify', 'plant', 'photo', 'upload', 'species', 'recognize', 'name', 'what', 'this', 'identification']
  },
  {
    id: '2',
    question: 'What are the premium features?',
    answer: 'Premium users get unlimited plant identifications, advanced AI health predictions, disease diagnosis, personalized care plans, expert consultations, achievement system, social features, and priority support. You can upgrade from your account settings.',
    category: 'premium',
    keywords: ['premium', 'upgrade', 'features', 'unlimited', 'advanced', 'subscription', 'paid', 'pro', 'benefits']
  },
  {
    id: '3',
    question: 'How accurate is the plant identification?',
    answer: 'Our AI plant identification system has over 95% accuracy for common plants and 85% for rare species. Premium users get access to our most advanced AI models with even higher accuracy rates.',
    category: 'accuracy',
    keywords: ['accuracy', 'correct', 'reliable', 'percentage', 'how good', 'precise', 'right', 'wrong']
  },
  {
    id: '4',
    question: 'Can I get help with plant diseases?',
    answer: 'Yes! Upload photos of affected plant parts and our AI will diagnose common diseases, pests, and nutrient deficiencies. Premium users get detailed treatment plans and access to expert botanist consultations.',
    category: 'health',
    keywords: ['disease', 'sick', 'pest', 'problem', 'dying', 'health', 'diagnosis', 'bug', 'insect', 'yellow', 'brown', 'spots', 'wilting']
  },
  {
    id: '5',
    question: 'How do I care for my plants?',
    answer: 'After identifying your plant, you will receive personalized care instructions including watering schedules, light requirements, soil needs, and seasonal care tips. Premium users get smart reminders and weather-integrated care plans.',
    category: 'care',
    keywords: ['care', 'watering', 'light', 'soil', 'fertilizer', 'maintenance', 'how to', 'water', 'sun', 'sunlight', 'grow', 'growing']
  },
  {
    id: '6',
    question: 'Is my plant data private and secure?',
    answer: 'Yes, we take privacy seriously. Your plant photos and data are encrypted and stored securely. We never share personal information with third parties. You can delete your data anytime from account settings.',
    category: 'privacy',
    keywords: ['privacy', 'secure', 'data', 'safe', 'delete', 'protection', 'confidential']
  },
  {
    id: '7',
    question: 'How much does premium cost?',
    answer: 'Premium plans start at $9.99/month or $89.99/year (save 25%). Family plans for up to 5 accounts are $149.99/year. All plans include a free trial period.',
    category: 'pricing',
    keywords: ['cost', 'price', 'subscription', 'monthly', 'yearly', 'family', 'trial', 'pricing', 'money', 'fee', 'payment', 'much', 'expensive', 'cheap']
  },
  {
    id: '8',
    question: 'Can I cancel my subscription?',
    answer: 'Yes, you can cancel your premium subscription anytime from your account settings. There are no cancellation fees, and you will retain premium access until the end of your billing period.',
    category: 'billing',
    keywords: ['cancel', 'subscription', 'billing', 'refund', 'stop', 'end', 'unsubscribe', 'quit', 'leave', 'terminate']
  },
  {
    id: '9',
    question: 'What plants can you identify?',
    answer: 'We can identify over 17,000 plant species including houseplants, garden plants, trees, flowers, succulents, herbs, vegetables, and weeds. Our database covers plants from around the world.',
    category: 'database',
    keywords: ['species', 'types', 'database', 'flowers', 'trees', 'houseplants', 'vegetables', 'plants', 'many', 'how many', 'which', 'kinds', 'varieties']
  },
  {
    id: '10',
    question: 'Do you have a mobile app?',
    answer: 'Our website works perfectly on mobile devices with full functionality. Simply visit our website on your phone browser for the complete plant identification experience.',
    category: 'mobile',
    keywords: ['mobile', 'app', 'phone', 'android', 'ios', 'tablet', 'device']
  }
];

const quickActions = [
  { label: 'Identify Plant', action: 'identify' },
  { label: 'Premium Features', action: 'premium' },
  { label: 'Plant Care Tips', action: 'care' },
  { label: 'Contact Support', action: 'contact' }
];

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Show chatbot after cookie consent is handled
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldShow(true);
    }, 3000); // Show after 3 seconds (after cookie banner appears)
    
    return () => clearTimeout(timer);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'bot',
        content: 'Hi! I am your GreenLens assistant. I can help you with plant identification, care tips, premium features, and more. How can I help you today?',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  const findBestAnswer = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase().trim();
    
    // Calculate relevance scores for each FAQ
    const scoredFAQs = faqs.map(faq => {
      let score = 0;
      
      // Check if question directly matches
      if (lowerMessage.includes(faq.question.toLowerCase()) || 
          faq.question.toLowerCase().includes(lowerMessage)) {
        score += 10;
      }
      
      // Count keyword matches with different weights
      const keywordMatches = faq.keywords.filter(keyword => 
        lowerMessage.includes(keyword.toLowerCase())
      );
      score += keywordMatches.length * 2;
      
      // Bonus for exact keyword match at start
      const firstWord = lowerMessage.split(' ')[0];
      if (faq.keywords.some(keyword => keyword.toLowerCase() === firstWord)) {
        score += 3;
      }
      
      // Bonus for multiple word matches
      const messageWords = lowerMessage.split(' ').filter(word => word.length > 2);
      const matchingWords = messageWords.filter(word => 
        faq.keywords.some(keyword => keyword.toLowerCase().includes(word)) ||
        faq.question.toLowerCase().includes(word)
      );
      score += matchingWords.length;
      
      return { faq, score };
    });
    
    // Find the best match
    const bestMatch = scoredFAQs
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)[0];
    
    if (bestMatch && bestMatch.score >= 2) {
      return bestMatch.faq.answer;
    }
    
    // Enhanced fallback responses for common queries
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return 'Hello! I am your GreenLens assistant. I can help you identify plants, provide care advice, explain premium features, diagnose plant problems, and answer gardening questions. What would you like to know?';
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
      return 'I can assist with: 🌱 Plant identification from photos, 🏥 Disease and pest diagnosis, 💡 Personalized care recommendations, ⭐ Premium feature information, 📞 Account and billing questions, 🌿 General gardening advice. What interests you most?';
    }
    
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      return 'You are very welcome! I am here whenever you need plant care guidance. Feel free to ask about any gardening topics or plant concerns you might have.';
    }
    
    if (lowerMessage.includes('contact') || lowerMessage.includes('support') || lowerMessage.includes('email')) {
      setShowContact(true);
      return 'I will show you our contact information. Our support team is ready to help with any questions beyond what I can answer here.';
    }
    
    // Handle specific question patterns
    if (lowerMessage.includes('how') && (lowerMessage.includes('work') || lowerMessage.includes('use'))) {
      return 'GreenLens works by analyzing photos of your plants using advanced AI. Simply upload a clear image, and our system identifies the species and provides tailored care recommendations. Would you like to know about our identification process or premium features?';
    }
    
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('money') || lowerMessage.includes('fee')) {
      return 'Our premium plans start at $9.99/month or $89.99/year (25% savings). Premium includes unlimited identifications, advanced health analysis, disease diagnosis, expert consultations, and priority support. There is also a free tier with basic features.';
    }
    
    if (lowerMessage.includes('free') && !lowerMessage.includes('trial')) {
      return 'Yes! GreenLens offers free plant identification with limited monthly uses. Free users can identify plants, get basic care tips, and access our plant database. Premium users get unlimited access plus advanced features like health predictions and expert consultations.';
    }
    
    // Default response with personalized suggestions
    const suggestedQuestions = [
      'How do I identify a plant?',
      'What premium features are available?',
      'How do I care for my plants?',
      'Can you diagnose plant diseases?',
      'How accurate is plant identification?'
    ];
    const randomSuggestion = suggestedQuestions[Math.floor(Math.random() * suggestedQuestions.length)];
    
    return `I am not quite sure about that specific question. I specialize in plant identification, care guidance, and GreenLens features. You might want to ask: "${randomSuggestion}" or try rephrasing your question with keywords like "identify", "care", "premium", or "help".`;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: findBestAnswer(inputValue),
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleQuickAction = (action: string) => {
    let response = '';
    switch (action) {
      case 'identify':
        response = 'To identify a plant, click the "Identify Plant" button on our homepage and upload a clear photo. Our AI will analyze the image and provide species identification with care recommendations.';
        break;
      case 'premium':
        response = 'Premium features include unlimited identifications, advanced AI health predictions, disease diagnosis, expert consultations, achievement system, and priority support. Plans start at $9.99/month.';
        break;
      case 'care':
        response = 'Plant care depends on the species, but generally includes proper watering, adequate light, good soil, and regular monitoring for pests. After identifying your plant, you will get specific care instructions.';
        break;
      case 'contact':
        setShowContact(true);
        response = 'Here are our contact details for direct support. Our team is available to help with any questions.';
        break;
    }
    
    const botMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'bot',
      content: response,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, botMessage]);
  };

  const ContactDetails = () => (
    <Card className="mt-3 bg-green-50 border-green-200">
      <CardContent className="p-4">
        <h3 className="font-semibold text-green-800 mb-3">Contact GreenLens Support</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-green-600" />
            <span>support@greenlens.ai</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-green-600" />
            <span>1-800-GREENLENS (1-800-473-3653)</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-green-600" />
            <span>Mon-Fri: 9 AM - 6 PM EST</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-green-600" />
            <span>Based in USA, serving worldwide</span>
          </div>
          <div className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4 text-green-600" />
            <a href="/contact" className="text-green-600 hover:underline">
              Visit our Contact Page
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Don't show until timer completes
  if (!shouldShow) return null;

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-[9998] flex flex-col items-center" style={{ zIndex: 9998 }}>
        {/* Custom Chatbot Button with Your Icon */}
        <div className="relative group cursor-pointer" onClick={() => setIsOpen(true)} data-testid="button-open-chatbot">
          {/* Custom Chatbot Icon - No Background */}
          <div className="w-20 h-20 hover:scale-110 transition-all duration-300 ease-in-out" 
               style={{ 
                 animation: 'float-bounce 3s ease-in-out infinite',
                 filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))'
               }}>
            <img 
              src={chatbotIcon} 
              alt="GreenLens Chatbot" 
              className="w-full h-full object-contain"
              style={{
                filter: 'drop-shadow(0 0 10px rgba(64, 224, 208, 0.4))'
              }}
            />
          </div>
          
          {/* Elegant "Chat with me" Text Below Icon */}
          <div className="mt-2 text-center">
            <p className="text-sm font-semibold text-green-700 hover:text-green-800 transition-colors duration-200"
               style={{ 
                 fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                 fontSize: '14px',
                 letterSpacing: '0.025em'
               }}>
              Chat with me
            </p>
          </div>
          
          {/* Floating message indicator */}
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute inset-0.5 bg-white rounded-full animate-ping"></div>
            <div className="absolute inset-1 bg-green-400 rounded-full"></div>
          </div>
        </div>
        
        <style>{`
          @keyframes pulse-scale {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9998] w-96 h-[500px] bg-white border border-gray-200 rounded-lg shadow-xl flex flex-col" data-testid="chatbot-window" style={{ zIndex: 9998 }}>
      {/* Header */}
      <div className="bg-green-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <div>
          <h3 className="font-semibold">GreenLens Assistant</h3>
          <p className="text-sm opacity-90">Here to help with your plants</p>
        </div>
        <Button
          onClick={() => setIsOpen(false)}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-green-700"
          data-testid="button-close-chatbot"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="p-3 border-b bg-gray-50">
        <div className="flex flex-wrap gap-1">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              onClick={() => handleQuickAction(action.action)}
              variant="outline"
              size="sm"
              className="text-xs h-7"
              data-testid={`button-quick-${action.action}`}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] p-3 rounded-lg text-sm ${
                message.type === 'user'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
              data-testid={`message-${message.type}-${message.id}`}
            >
              {message.content}
              {message.type === 'bot' && showContact && message.id === messages[messages.length - 1]?.id && (
                <ContactDetails />
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg text-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask me about plants..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
            data-testid="input-chat-message"
          />
          <Button onClick={handleSendMessage} size="sm" data-testid="button-send-message">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          This chatbot provides general information. For complex issues, please contact our support team.
        </p>
      </div>
    </div>
  );
}