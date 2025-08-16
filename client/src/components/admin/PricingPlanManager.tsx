import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Star, GripVertical } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface PricingFeature {
  name: string;
  included: boolean;
  description?: string;
}

interface PricingPlan {
  id: string;
  planId: string;
  name: string;
  price: string;
  currency: string;
  billingInterval: string;
  description: string;
  features: PricingFeature[];
  isPopular: boolean;
  isActive: boolean;
  displayOrder: number;
}

interface PlanFormData {
  planId: string;
  name: string;
  price: string;
  currency: string;
  billingInterval: string;
  description: string;
  features: PricingFeature[];
  isPopular: boolean;
  isActive: boolean;
  displayOrder: number;
}

const initialFormData: PlanFormData = {
  planId: '',
  name: '',
  price: '0',
  currency: 'USD',
  billingInterval: 'monthly',
  description: '',
  features: [],
  isPopular: false,
  isActive: true,
  displayOrder: 0,
};

export default function PricingPlanManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [formData, setFormData] = useState<PlanFormData>(initialFormData);
  const [newFeature, setNewFeature] = useState({ name: '', included: true, description: '' });

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['/api/pricing-plans'],
    queryFn: () => apiRequest('GET', '/api/pricing-plans').then(res => res.json()),
  });

  const createMutation = useMutation({
    mutationFn: (data: PlanFormData) => apiRequest('/api/admin/pricing-plans', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pricing-plans'] });
      setDialogOpen(false);
      setFormData(initialFormData);
      setEditingPlan(null);
      toast({
        title: "Success",
        description: "Pricing plan created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PlanFormData> }) =>
      apiRequest(`/api/admin/pricing-plans/${id}`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pricing-plans'] });
      setDialogOpen(false);
      setFormData(initialFormData);
      setEditingPlan(null);
      toast({
        title: "Success",
        description: "Pricing plan updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/admin/pricing-plans/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pricing-plans'] });
      toast({
        title: "Success",
        description: "Pricing plan deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingPlan) {
      updateMutation.mutate({ id: editingPlan.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (plan: PricingPlan) => {
    setEditingPlan(plan);
    setFormData({
      planId: plan.planId,
      name: plan.name,
      price: plan.price,
      currency: plan.currency,
      billingInterval: plan.billingInterval,
      description: plan.description,
      features: plan.features,
      isPopular: plan.isPopular,
      isActive: plan.isActive,
      displayOrder: plan.displayOrder,
    });
    setDialogOpen(true);
  };

  const handleDelete = (plan: PricingPlan) => {
    if (confirm(`Are you sure you want to delete the ${plan.name} plan?`)) {
      deleteMutation.mutate(plan.id);
    }
  };

  const addFeature = () => {
    if (newFeature.name.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, { ...newFeature }]
      }));
      setNewFeature({ name: '', included: true, description: '' });
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const updateFeature = (index: number, updates: Partial<PricingFeature>) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => 
        i === index ? { ...feature, ...updates } : feature
      )
    }));
  };

  if (isLoading) {
    return <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Pricing Plans Management
        </h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setEditingPlan(null);
                setFormData(initialFormData);
              }}
              data-testid="add-pricing-plan"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPlan ? 'Edit Pricing Plan' : 'Create New Pricing Plan'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="planId">Plan ID</Label>
                  <Input
                    id="planId"
                    value={formData.planId}
                    onChange={(e) => setFormData(prev => ({ ...prev, planId: e.target.value }))}
                    placeholder="e.g., pro, premium"
                    required
                    data-testid="plan-id-input"
                  />
                </div>
                <div>
                  <Label htmlFor="name">Plan Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Pro Plan"
                    required
                    data-testid="plan-name-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    required
                    data-testid="plan-price-input"
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={formData.currency} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, currency: value }))
                  }>
                    <SelectTrigger data-testid="plan-currency-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="INR">INR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="billingInterval">Billing</Label>
                  <Select value={formData.billingInterval} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, billingInterval: value }))
                  }>
                    <SelectTrigger data-testid="plan-billing-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the plan"
                  data-testid="plan-description-input"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPopular"
                    checked={formData.isPopular}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPopular: checked }))}
                    data-testid="plan-popular-switch"
                  />
                  <Label htmlFor="isPopular">Popular Plan</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                    data-testid="plan-active-switch"
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
                <div>
                  <Label htmlFor="displayOrder">Display Order</Label>
                  <Input
                    id="displayOrder"
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
                    data-testid="plan-order-input"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Features</Label>
                
                {/* Add new feature */}
                <div className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    <Input
                      placeholder="Feature name"
                      value={newFeature.name}
                      onChange={(e) => setNewFeature(prev => ({ ...prev, name: e.target.value }))}
                      data-testid="new-feature-name"
                    />
                  </div>
                  <div className="col-span-4">
                    <Input
                      placeholder="Description (optional)"
                      value={newFeature.description}
                      onChange={(e) => setNewFeature(prev => ({ ...prev, description: e.target.value }))}
                      data-testid="new-feature-description"
                    />
                  </div>
                  <div className="col-span-2 flex items-center space-x-2">
                    <Switch
                      checked={newFeature.included}
                      onCheckedChange={(checked) => setNewFeature(prev => ({ ...prev, included: checked }))}
                      data-testid="new-feature-included"
                    />
                    <span className="text-xs">Included</span>
                  </div>
                  <div className="col-span-1">
                    <Button type="button" onClick={addFeature} size="sm" data-testid="add-feature">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Existing features */}
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center p-2 border rounded">
                      <div className="col-span-5">
                        <Input
                          value={feature.name}
                          onChange={(e) => updateFeature(index, { name: e.target.value })}
                          data-testid={`feature-name-${index}`}
                        />
                      </div>
                      <div className="col-span-4">
                        <Input
                          value={feature.description || ''}
                          onChange={(e) => updateFeature(index, { description: e.target.value })}
                          placeholder="Description"
                          data-testid={`feature-description-${index}`}
                        />
                      </div>
                      <div className="col-span-2 flex items-center space-x-2">
                        <Switch
                          checked={feature.included}
                          onCheckedChange={(checked) => updateFeature(index, { included: checked })}
                          data-testid={`feature-included-${index}`}
                        />
                        <span className="text-xs">Included</span>
                      </div>
                      <div className="col-span-1">
                        <Button 
                          type="button" 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => removeFeature(index)}
                          data-testid={`remove-feature-${index}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="save-plan"
                >
                  {editingPlan ? 'Update Plan' : 'Create Plan'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {plans.map((plan: PricingPlan) => (
          <Card key={plan.id} className="relative">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="flex items-center gap-3">
                <GripVertical className="w-4 h-4 text-gray-400" />
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {plan.name}
                    {plan.isPopular && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Popular
                      </Badge>
                    )}
                    {!plan.isActive && (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    {plan.currency} {plan.price} / {plan.billingInterval}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleEdit(plan)}
                  data-testid={`edit-plan-${plan.planId}`}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => handleDelete(plan)}
                  data-testid={`delete-plan-${plan.planId}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">{plan.description}</p>
              <div className="space-y-1">
                <p className="text-sm font-medium">Features ({plan.features.length}):</p>
                <div className="text-xs text-gray-500 max-h-20 overflow-y-auto">
                  {plan.features.map((feature, index) => (
                    <div key={index} className={feature.included ? '' : 'line-through opacity-60'}>
                      • {feature.name}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}