import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { Edit, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Import the generated images
import handToolsImg from '@assets/generated_images/hand_gardening_tools_ac5ccedc.png';
import wateringImg from '@assets/generated_images/watering_garden_equipment_9eed22a6.png';
import soilCareImg from '@assets/generated_images/soil_care_tools_4f8bcc4b.png';
import protectiveGearImg from '@assets/generated_images/garden_protective_gear_4c15a7e3.png';

interface ToolCategory {
  id: string;
  name: string;
  defaultImage: string;
  customImage?: string;
  description: string;
}

const DEFAULT_CATEGORIES: ToolCategory[] = [
  {
    id: 'hand-tools',
    name: 'Hand Tools',
    defaultImage: handToolsImg,
    description: 'Essential hand tools for precision gardening'
  },
  {
    id: 'watering',
    name: 'Watering',
    defaultImage: wateringImg,
    description: 'Keep your plants perfectly hydrated'
  },
  {
    id: 'soil-care',
    name: 'Soil Care',
    defaultImage: soilCareImg,
    description: 'Nurture healthy soil for thriving plants'
  },
  {
    id: 'protective',
    name: 'Protective Gear',
    defaultImage: protectiveGearImg,
    description: 'Stay safe while tending your garden'
  }
];

export function GardeningToolsPreview() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');

  // Fetch admin tool images settings
  const { data: adminSettings } = useQuery({
    queryKey: ['/api/admin/tool-images'],
    retry: false,
    enabled: !!(user?.isAdmin),
  });

  const updateImageMutation = useMutation({
    mutationFn: async ({ categoryId, imageUrl }: { categoryId: string; imageUrl: string }) => {
      await apiRequest('PUT', '/api/admin/tool-images', { categoryId, imageUrl });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tool-images'] });
      setEditingCategory(null);
      setImageUrl('');
      toast({
        title: 'Success',
        description: 'Tool category image updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update image',
        variant: 'destructive',
      });
    },
  });

  const categories = DEFAULT_CATEGORIES.map(cat => ({
    ...cat,
    customImage: (adminSettings as any)?.images?.[cat.id] || null
  }));

  const handleEditImage = (categoryId: string, currentUrl: string) => {
    setEditingCategory(categoryId);
    setImageUrl(currentUrl);
  };

  const handleSaveImage = (categoryId: string) => {
    updateImageMutation.mutate({ categoryId, imageUrl });
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setImageUrl('');
  };

  return (
    <div className="bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Buy Gardening Tools
          </h3>
          <p className="text-gray-600">
            Hand-picked essentials for every gardener
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Card
              key={category.id}
              className="overflow-hidden hover:shadow-lg transition-all duration-300 group relative"
            >
              <div className="relative">
                <img
                  src={category.customImage || category.defaultImage}
                  alt={category.name}
                  className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = category.defaultImage;
                  }}
                />
                
                {/* Admin edit overlay */}
                {user?.isAdmin && (
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white text-gray-900 hover:bg-gray-100"
                          onClick={() => handleEditImage(category.id, category.customImage || '')}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit {category.name} Image</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="image-url">Image URL</Label>
                            <Input
                              id="image-url"
                              value={imageUrl}
                              onChange={(e) => setImageUrl(e.target.value)}
                              placeholder="Enter image URL or leave empty for default"
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              onClick={handleCancelEdit}
                            >
                              <X className="w-4 h-4 mr-2" />
                              Cancel
                            </Button>
                            <Button
                              onClick={() => handleSaveImage(category.id)}
                              disabled={updateImageMutation.isPending}
                            >
                              <Save className="w-4 h-4 mr-2" />
                              Save
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </div>
              
              <CardContent 
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors" 
                onClick={() => window.open(`/tools?category=${category.id}`, '_blank')}
              >
                <h4 className="font-semibold text-gray-900 mb-1 text-center">
                  {category.name}
                </h4>
                <p className="text-xs text-gray-600 text-center">
                  {category.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-6">
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => window.open('/tools', '_blank')}
          >
            Shop All Gardening Tools
          </Button>
        </div>
      </div>
    </div>
  );
}