import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { ArrowLeft, Plus, Edit2, Trash2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  isActive: boolean;
}

const defaultFAQs: Omit<FAQ, 'id'>[] = [
  {
    question: "How accurate is plant identification for native and exotic species?",
    answer: "GreenLens achieves 99.5% accuracy for plants worldwide including native species, ornamentals, and garden plants across all climate zones.",
    category: "Plant Identification",
    isActive: true
  },
  {
    question: "Does GreenLens work for plants in all climate zones?",
    answer: "Yes! GreenLens is optimized for plants across all global climate zones, providing scientific information for diverse growing conditions worldwide.",
    category: "Plant Identification",
    isActive: true
  },
  {
    question: "Can I identify weeds and invasive species in my garden?",
    answer: "Absolutely. GreenLens identifies common weeds, invasive species, and helps with proper removal and management strategies for your region.",
    category: "Plant Identification",
    isActive: true
  },
  {
    question: "Is plant care advice customized for my growing conditions?",
    answer: "Yes, all care recommendations are tailored for various soil types, weather patterns, and seasonal changes specific to your geographic region.",
    category: "Plant Care",
    isActive: true
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period.",
    category: "Subscription",
    isActive: true
  },
  {
    question: "What happens to my plant data if I downgrade?",
    answer: "Your plant identification history and basic care plans remain accessible. Advanced features like unlimited analysis and premium reports are restricted to paid plans.",
    category: "Subscription",
    isActive: true
  },
  {
    question: "Do you offer refunds?",
    answer: "We offer a 30-day money-back guarantee for all paid plans. Contact our support team for assistance with refund requests.",
    category: "Subscription",
    isActive: true
  }
];

export default function FAQ() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editForm, setEditForm] = useState({
    question: "",
    answer: "",
    category: ""
  });

  // For now, use local state since there's no FAQ API endpoint
  const [faqs, setFaqs] = useState<FAQ[]>(
    defaultFAQs.map((faq, index) => ({ ...faq, id: (index + 1).toString() }))
  );

  const categories = Array.from(new Set(faqs.map(faq => faq.category)));

  const handleEdit = (faq: FAQ) => {
    setEditingId(faq.id);
    setEditForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category
    });
  };

  const handleSave = () => {
    if (editingId) {
      setFaqs(prev => prev.map(faq => 
        faq.id === editingId 
          ? { ...faq, ...editForm }
          : faq
      ));
      toast({
        title: "FAQ Updated",
        description: "FAQ has been successfully updated.",
      });
    } else {
      // Adding new FAQ
      const newFaq: FAQ = {
        id: (faqs.length + 1).toString(),
        ...editForm,
        isActive: true
      };
      setFaqs(prev => [...prev, newFaq]);
      toast({
        title: "FAQ Added",
        description: "New FAQ has been successfully added.",
      });
    }
    
    setEditingId(null);
    setIsAdding(false);
    setEditForm({ question: "", answer: "", category: "" });
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setEditForm({ question: "", answer: "", category: "" });
  };

  const handleDelete = (id: string) => {
    setFaqs(prev => prev.filter(faq => faq.id !== id));
    toast({
      title: "FAQ Deleted",
      description: "FAQ has been successfully deleted.",
    });
  };

  const handleAddNew = () => {
    setIsAdding(true);
    setEditForm({ question: "", answer: "", category: "General" });
  };

  return (
    <Layout>
      {/* Back Button */}
      <div className="px-4 sm:px-6 lg:px-8 pt-2">
        <Link href="/">
          <Button variant="outline" size="sm" className="flex items-center space-x-1 bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-300 text-green-700">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Button>
        </Link>
      </div>

      <div className="py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Find answers to common questions about plant identification, care advice, and GreenLens features.
            </p>
          </div>

          {/* Admin Controls */}
          {user?.isAdmin && (
            <div className="mb-6 flex justify-end">
              <Button onClick={handleAddNew} className="flex items-center gap-2" data-testid="button-add-faq">
                <Plus className="w-4 h-4" />
                Add New FAQ
              </Button>
            </div>
          )}

          {/* Categories */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <Badge key={category} variant="outline" className="text-sm">
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          {/* Add New FAQ Form */}
          {isAdding && (
            <Card className="mb-6 border-green-200">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-white">
                  Add New FAQ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <Input
                    value={editForm.category}
                    onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="Enter category"
                    data-testid="input-category"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Question
                  </label>
                  <Input
                    value={editForm.question}
                    onChange={(e) => setEditForm(prev => ({ ...prev, question: e.target.value }))}
                    placeholder="Enter the question"
                    data-testid="input-question"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Answer
                  </label>
                  <Textarea
                    value={editForm.answer}
                    onChange={(e) => setEditForm(prev => ({ ...prev, answer: e.target.value }))}
                    placeholder="Enter the answer"
                    className="min-h-[100px]"
                    data-testid="textarea-answer"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave} className="flex items-center gap-2" data-testid="button-save-new">
                    <Save className="w-4 h-4" />
                    Save FAQ
                  </Button>
                  <Button variant="outline" onClick={handleCancel} className="flex items-center gap-2" data-testid="button-cancel-new">
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* FAQ List */}
          <div className="space-y-6">
            {categories.map((category) => (
              <div key={category}>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {category}
                </h2>
                <div className="space-y-4">
                  {faqs
                    .filter(faq => faq.category === category && faq.isActive)
                    .map((faq) => (
                      <Card key={faq.id} className="relative">
                        {user?.isAdmin && (
                          <div className="absolute top-4 right-4 flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(faq)}
                              className="flex items-center gap-1"
                              data-testid={`button-edit-${faq.id}`}
                            >
                              <Edit2 className="w-3 h-3" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(faq.id)}
                              className="flex items-center gap-1 text-red-600 hover:text-red-700"
                              data-testid={`button-delete-${faq.id}`}
                            >
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </Button>
                          </div>
                        )}
                        
                        {editingId === faq.id ? (
                          <CardContent className="p-6 space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Category
                              </label>
                              <Input
                                value={editForm.category}
                                onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                                data-testid={`input-edit-category-${faq.id}`}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Question
                              </label>
                              <Input
                                value={editForm.question}
                                onChange={(e) => setEditForm(prev => ({ ...prev, question: e.target.value }))}
                                data-testid={`input-edit-question-${faq.id}`}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Answer
                              </label>
                              <Textarea
                                value={editForm.answer}
                                onChange={(e) => setEditForm(prev => ({ ...prev, answer: e.target.value }))}
                                className="min-h-[100px]"
                                data-testid={`textarea-edit-answer-${faq.id}`}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={handleSave} className="flex items-center gap-2" data-testid={`button-save-${faq.id}`}>
                                <Save className="w-4 h-4" />
                                Save
                              </Button>
                              <Button variant="outline" onClick={handleCancel} className="flex items-center gap-2" data-testid={`button-cancel-${faq.id}`}>
                                <X className="w-4 h-4" />
                                Cancel
                              </Button>
                            </div>
                          </CardContent>
                        ) : (
                          <>
                            <CardHeader className={user?.isAdmin ? "pr-32" : ""}>
                              <CardTitle className="text-lg text-gray-900 dark:text-white">
                                {faq.question}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {faq.answer}
                              </p>
                            </CardContent>
                          </>
                        )}
                      </Card>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* Contact Support */}
          <div className="mt-12 text-center">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Still have questions?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Can't find what you're looking for? Our support team is here to help.
              </p>
              <Link href="/contact">
                <Button className="bg-green-600 hover:bg-green-700" data-testid="button-contact-support">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}