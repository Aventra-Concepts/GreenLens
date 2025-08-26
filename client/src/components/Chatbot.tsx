import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Phone, Mail, MapPin, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

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
    keywords: ['identify', 'plant', 'photo', 'upload', 'species', 'recognize']
  },
  {
    id: '2',
    question: 'What are the premium features?',
    answer: 'Premium users get unlimited plant identifications, advanced AI health predictions, disease diagnosis, personalized care plans, expert consultations, achievement system, social features, and priority support. You can upgrade from your account settings.',
    category: 'premium',
    keywords: ['premium', 'upgrade', 'features', 'unlimited', 'advanced', 'subscription']
  },
  {
    id: '3',
    question: 'How accurate is the plant identification?',
    answer: 'Our AI plant identification system has over 95% accuracy for common plants and 85% for rare species. Premium users get access to our most advanced AI models with even higher accuracy rates.',
    category: 'accuracy',
    keywords: ['accuracy', 'correct', 'reliable', 'percentage', 'how good']
  },
  {
    id: '4',
    question: 'Can I get help with plant diseases?',
    answer: 'Yes! Upload photos of affected plant parts and our AI will diagnose common diseases, pests, and nutrient deficiencies. Premium users get detailed treatment plans and access to expert botanist consultations.',
    category: 'health',
    keywords: ['disease', 'sick', 'pest', 'problem', 'dying', 'health', 'diagnosis']
  },
  {
    id: '5',
    question: 'How do I care for my plants?',
    answer: 'After identifying your plant, you will receive personalized care instructions including watering schedules, light requirements, soil needs, and seasonal care tips. Premium users get smart reminders and weather-integrated care plans.',
    category: 'care',
    keywords: ['care', 'watering', 'light', 'soil', 'fertilizer', 'maintenance', 'how to']
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
    keywords: ['cost', 'price', 'subscription', 'monthly', 'yearly', 'family', 'trial']
  },
  {
    id: '8',
    question: 'Can I cancel my subscription?',
    answer: 'Yes, you can cancel your premium subscription anytime from your account settings. There are no cancellation fees, and you will retain premium access until the end of your billing period.',
    category: 'billing',
    keywords: ['cancel', 'subscription', 'billing', 'refund', 'stop', 'end']
  },
  {
    id: '9',
    question: 'What plants can you identify?',
    answer: 'We can identify over 17,000 plant species including houseplants, garden plants, trees, flowers, succulents, herbs, vegetables, and weeds. Our database covers plants from around the world.',
    category: 'database',
    keywords: ['species', 'types', 'database', 'flowers', 'trees', 'houseplants', 'vegetables']
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
    const lowerMessage = userMessage.toLowerCase();
    
    // Find FAQ with matching keywords
    const matchedFAQ = faqs.find(faq => 
      faq.keywords.some(keyword => lowerMessage.includes(keyword))
    );
    
    if (matchedFAQ) {
      return matchedFAQ.answer;
    }
    
    // Fallback responses for common queries
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return 'Hello! I am here to help with all your plant care questions. You can ask me about plant identification, care tips, premium features, or any gardening questions.';
    }
    
    if (lowerMessage.includes('help')) {
      return 'I can help you with: Plant identification, Disease diagnosis, Care recommendations, Premium features, Account questions, and General plant care. What specific topic interests you?';
    }
    
    if (lowerMessage.includes('thank')) {
      return 'You are welcome! I am always here to help with your gardening questions. Is there anything else you would like to know?';
    }
    
    if (lowerMessage.includes('contact') || lowerMessage.includes('support')) {
      setShowContact(true);
      return 'Here are our contact details for additional support. Our team is ready to help you with any questions not covered here.';
    }
    
    // Default response with suggestions
    return 'I am not sure about that specific question, but I can help you with plant identification, care tips, premium features, and general gardening advice. Try asking about: "How to identify plants", "Premium features", "Plant care", or "Contact support".';
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
      <div className="fixed bottom-6 left-6 z-[9998] flex flex-col items-center" style={{ zIndex: 9998 }}>
        {/* Chat with me tooltip */}
        <div className="mb-2 bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200 animate-pulse">
          <p className="text-sm font-medium text-gray-700">Chat with me</p>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white"></div>
          </div>
        </div>
        
        {/* Modern Designer Chatbot Button */}
        <div className="relative group">
          <Button
            onClick={() => setIsOpen(true)}
            className="rounded-2xl w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center relative overflow-hidden border-3 border-white"
            data-testid="button-open-chatbot"
            style={{ 
              zIndex: 9999,
              animation: 'float-bounce 3s ease-in-out infinite'
            }}
          >
            {/* Modern Chat Robot Design */}
            <div className="flex items-center justify-center relative">
              <svg 
                width="42" 
                height="42" 
                viewBox="0 0 48 48" 
                fill="none" 
                className="text-white drop-shadow-lg"
                style={{
                  animation: 'chat-pulse 2.5s ease-in-out infinite'
                }}
              >
                {/* Robot body/head - rounded rectangle */}
                <rect 
                  x="12" 
                  y="16" 
                  width="24" 
                  height="20" 
                  rx="12" 
                  ry="10" 
                  fill="currentColor"
                  stroke="none"
                />
                
                {/* Robot antenna */}
                <circle 
                  cx="24" 
                  cy="8" 
                  r="2" 
                  fill="#fbbf24"
                  className="antenna-glow"
                />
                <line 
                  x1="24" 
                  y1="10" 
                  x2="24" 
                  y2="16" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round"
                />
                
                {/* Robot eyes - animated */}
                <circle 
                  cx="19" 
                  cy="22" 
                  r="2.5" 
                  fill="#fbbf24"
                  className="robot-eye-left"
                />
                <circle 
                  cx="29" 
                  cy="22" 
                  r="2.5" 
                  fill="#fbbf24"
                  className="robot-eye-right"
                />
                
                {/* Eye pupils */}
                <circle 
                  cx="19.5" 
                  cy="22" 
                  r="1" 
                  fill="#1f2937"
                />
                <circle 
                  cx="29.5" 
                  cy="22" 
                  r="1" 
                  fill="#1f2937"
                />
                
                {/* Robot mouth - animated */}
                <rect 
                  x="20" 
                  y="28" 
                  width="8" 
                  height="3" 
                  rx="1.5" 
                  fill="#fbbf24"
                  className="robot-mouth"
                />
                
                {/* Side antennas/ears */}
                <circle 
                  cx="8" 
                  cy="20" 
                  r="1.5" 
                  fill="#fbbf24"
                />
                <circle 
                  cx="40" 
                  cy="20" 
                  r="1.5" 
                  fill="#fbbf24"
                />
                <line 
                  x1="10" 
                  y1="20" 
                  x2="12" 
                  y2="22" 
                  stroke="currentColor" 
                  strokeWidth="1.5"
                />
                <line 
                  x1="38" 
                  y1="20" 
                  x2="36" 
                  y2="22" 
                  stroke="currentColor" 
                  strokeWidth="1.5"
                />
                
                {/* Decorative elements */}
                <rect 
                  x="16" 
                  y="32" 
                  width="2" 
                  height="1" 
                  fill="#fbbf24" 
                  opacity="0.8"
                />
                <rect 
                  x="20" 
                  y="32" 
                  width="2" 
                  height="1" 
                  fill="#fbbf24" 
                  opacity="0.8"
                />
                <rect 
                  x="26" 
                  y="32" 
                  width="2" 
                  height="1" 
                  fill="#fbbf24" 
                  opacity="0.8"
                />
                <rect 
                  x="30" 
                  y="32" 
                  width="2" 
                  height="1" 
                  fill="#fbbf24" 
                  opacity="0.8"
                />
              </svg>
              
              {/* Floating message indicator */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0.5 bg-white rounded-full animate-ping"></div>
                <div className="absolute inset-1 bg-green-400 rounded-full"></div>
              </div>
              
              {/* Hover glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-white opacity-0 group-hover:opacity-20 transition-all duration-300 blur-sm scale-110"></div>
            </div>
          </Button>
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
    <div className="fixed bottom-6 left-6 z-[9998] w-96 h-[500px] bg-white border border-gray-200 rounded-lg shadow-xl flex flex-col" data-testid="chatbot-window" style={{ zIndex: 9998 }}>
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