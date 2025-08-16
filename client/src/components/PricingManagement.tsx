import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { DollarSign, Plus, Edit, Trash2, Save } from "lucide-react";

interface PricingSetting {
  id: string;
  featureName: string;
  price: string;
  currency: string;
  description: string;
  isActive: boolean;
}

export default function PricingManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPricing, setNewPricing] = useState({
    featureName: "",
    price: "",
    currency: "USD",
    description: "",
    isActive: true,
  });

  // Fetch pricing settings
  const { data: pricingSettings = [], isLoading } = useQuery<PricingSetting[]>({
    queryKey: ["/api/admin/pricing"],
  });

  // Create pricing setting mutation
  const createPricingMutation = useMutation({
    mutationFn: async (data: typeof newPricing) => {
      const response = await apiRequest("POST", "/api/admin/pricing", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Pricing Created",
        description: "New pricing setting has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pricing"] });
      setNewPricing({
        featureName: "",
        price: "",
        currency: "USD",
        description: "",
        isActive: true,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create pricing setting",
        variant: "destructive",
      });
    },
  });

  // Update pricing setting mutation
  const updatePricingMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PricingSetting> }) => {
      const response = await apiRequest("PUT", `/api/admin/pricing/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Pricing Updated",
        description: "Pricing setting has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pricing"] });
      setEditingId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update pricing setting",
        variant: "destructive",
      });
    },
  });

  // Delete pricing setting mutation
  const deletePricingMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/admin/pricing/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Pricing Deleted",
        description: "Pricing setting has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pricing"] });
    },
    onError: (error: any) => {
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete pricing setting",
        variant: "destructive",
      });
    },
  });

  const handleCreatePricing = () => {
    if (!newPricing.featureName || !newPricing.price) {
      toast({
        title: "Missing Fields",
        description: "Please fill in feature name and price",
        variant: "destructive",
      });
      return;
    }
    createPricingMutation.mutate(newPricing);
  };

  const handleUpdatePricing = (id: string, data: Partial<PricingSetting>) => {
    updatePricingMutation.mutate({ id, data });
  };

  const handleDeletePricing = (id: string) => {
    if (confirm("Are you sure you want to delete this pricing setting?")) {
      deletePricingMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Pricing Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Pricing Management
        </CardTitle>
        <CardDescription>
          Configure pricing for plant analysis features and PDF reports
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Create New Pricing */}
        <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Pricing
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="new-feature-name">Feature Name</Label>
              <Input
                id="new-feature-name"
                value={newPricing.featureName}
                onChange={(e) => setNewPricing(prev => ({ ...prev, featureName: e.target.value }))}
                placeholder="e.g., plant_analysis, pdf_report"
                data-testid="input-new-feature-name"
              />
            </div>
            <div>
              <Label htmlFor="new-price">Price</Label>
              <div className="flex gap-2">
                <Input
                  id="new-price"
                  type="number"
                  step="0.01"
                  value={newPricing.price}
                  onChange={(e) => setNewPricing(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="9.99"
                  data-testid="input-new-price"
                />
                <Input
                  value={newPricing.currency}
                  onChange={(e) => setNewPricing(prev => ({ ...prev, currency: e.target.value }))}
                  placeholder="USD"
                  className="w-20"
                  data-testid="input-new-currency"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="new-description">Description</Label>
              <Textarea
                id="new-description"
                value={newPricing.description}
                onChange={(e) => setNewPricing(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Feature description"
                data-testid="textarea-new-description"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="new-active"
                checked={newPricing.isActive}
                onCheckedChange={(checked) => setNewPricing(prev => ({ ...prev, isActive: checked }))}
                data-testid="switch-new-active"
              />
              <Label htmlFor="new-active">Active</Label>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleCreatePricing}
                disabled={createPricingMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
                data-testid="button-create-pricing"
              >
                <Plus className="w-4 h-4 mr-2" />
                {createPricingMutation.isPending ? "Creating..." : "Create Pricing"}
              </Button>
            </div>
          </div>
        </div>

        {/* Existing Pricing Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Current Pricing Settings</h3>
          {pricingSettings.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No pricing settings configured yet. Add one above to get started.
            </p>
          ) : (
            pricingSettings.map((pricing) => (
              <div
                key={pricing.id}
                className="border rounded-lg p-4 bg-white dark:bg-gray-800"
                data-testid={`pricing-card-${pricing.id}`}
              >
                {editingId === pricing.id ? (
                  <EditPricingForm
                    pricing={pricing}
                    onSave={(data) => handleUpdatePricing(pricing.id, data)}
                    onCancel={() => setEditingId(null)}
                    isLoading={updatePricingMutation.isPending}
                  />
                ) : (
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-lg">{pricing.featureName}</h4>
                      <p className="text-2xl font-bold text-green-600">
                        {pricing.price} {pricing.currency}
                      </p>
                      {pricing.description && (
                        <p className="text-gray-600 dark:text-gray-400">{pricing.description}</p>
                      )}
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-sm ${
                          pricing.isActive 
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        }`}>
                          {pricing.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingId(pricing.id)}
                        data-testid={`button-edit-${pricing.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePricing(pricing.id)}
                        disabled={deletePricingMutation.isPending}
                        className="text-red-600 hover:text-red-700"
                        data-testid={`button-delete-${pricing.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface EditPricingFormProps {
  pricing: PricingSetting;
  onSave: (data: Partial<PricingSetting>) => void;
  onCancel: () => void;
  isLoading: boolean;
}

function EditPricingForm({ pricing, onSave, onCancel, isLoading }: EditPricingFormProps) {
  const [formData, setFormData] = useState({
    featureName: pricing.featureName,
    price: pricing.price,
    currency: pricing.currency,
    description: pricing.description || "",
    isActive: pricing.isActive,
  });

  const handleSave = () => {
    if (!formData.featureName || !formData.price) {
      return;
    }
    onSave(formData);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`edit-feature-name-${pricing.id}`}>Feature Name</Label>
          <Input
            id={`edit-feature-name-${pricing.id}`}
            value={formData.featureName}
            onChange={(e) => setFormData(prev => ({ ...prev, featureName: e.target.value }))}
            data-testid={`input-edit-feature-name-${pricing.id}`}
          />
        </div>
        <div>
          <Label htmlFor={`edit-price-${pricing.id}`}>Price</Label>
          <div className="flex gap-2">
            <Input
              id={`edit-price-${pricing.id}`}
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              data-testid={`input-edit-price-${pricing.id}`}
            />
            <Input
              value={formData.currency}
              onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
              className="w-20"
              data-testid={`input-edit-currency-${pricing.id}`}
            />
          </div>
        </div>
        <div className="md:col-span-2">
          <Label htmlFor={`edit-description-${pricing.id}`}>Description</Label>
          <Textarea
            id={`edit-description-${pricing.id}`}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            data-testid={`textarea-edit-description-${pricing.id}`}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id={`edit-active-${pricing.id}`}
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
            data-testid={`switch-edit-active-${pricing.id}`}
          />
          <Label htmlFor={`edit-active-${pricing.id}`}>Active</Label>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          data-testid={`button-cancel-edit-${pricing.id}`}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700"
          data-testid={`button-save-edit-${pricing.id}`}
        >
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}