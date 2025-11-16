import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Leaf, Plus, Calendar, MapPin, AlertCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

type PlantStatus = 'healthy' | 'warning' | 'critical' | 'dormant';

interface GardenPlant {
  id: string;
  userId: string;
  name: string;
  species: string | null;
  variety: string | null;
  dateAdded: string;
  location: string | null;
  status: PlantStatus;
  photoUrl: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const addPlantFormSchema = z.object({
  name: z.string().min(1, 'Plant name is required'),
  species: z.string().optional(),
  variety: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  photoUrl: z.string().url().optional().or(z.literal('')),
});

type AddPlantFormValues = z.infer<typeof addPlantFormSchema>;

export function RealDataGardenDashboard() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: plants, isLoading, error } = useQuery<GardenPlant[]>({
    queryKey: ['/api/garden-monitoring/plants'],
  });

  const form = useForm<AddPlantFormValues>({
    resolver: zodResolver(addPlantFormSchema),
    defaultValues: {
      name: '',
      species: '',
      variety: '',
      location: '',
      notes: '',
      photoUrl: '',
    },
  });

  const addPlantMutation = useMutation({
    mutationFn: (data: AddPlantFormValues) => 
      apiRequest('POST', '/api/garden-monitoring/plants', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/garden-monitoring/plants'] });
      setIsAddDialogOpen(false);
      form.reset();
      toast({
        title: 'Plant added successfully!',
        description: 'Your plant has been added to your garden.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error adding plant',
        description: error.message || 'Failed to add plant. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: AddPlantFormValues) => {
    addPlantMutation.mutate(data);
  };

  const getStatusColor = (status: PlantStatus) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'critical':
        return 'bg-red-500';
      case 'dormant':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusBadgeVariant = (status: PlantStatus) => {
    switch (status) {
      case 'healthy':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'critical':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading your garden...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const errorMessage = (error as Error).message;
    let errorData: any = {};
    
    try {
      const jsonMatch = errorMessage.match(/\{.*\}/);
      if (jsonMatch) {
        errorData = JSON.parse(jsonMatch[0]);
      }
    } catch {
      errorData = { message: errorMessage };
    }
    
    const isSubscriptionRequired = errorData?.error === 'SUBSCRIPTION_REQUIRED';
    
    if (isSubscriptionRequired) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
          <Card className="max-w-2xl">
            <CardContent className="pt-8 pb-8">
              <div className="text-center">
                <Leaf className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-3">Garden Monitoring Premium</h3>
                <p className="text-gray-600 mb-6 max-w-lg mx-auto">
                  Track your plants with advanced monitoring features, AI-powered insights, and detailed analytics.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 text-left max-w-md mx-auto">
                  <h4 className="font-semibold text-green-800 mb-3">Premium Features Include:</h4>
                  <ul className="space-y-2 text-green-700">
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      <span>Unlimited plant tracking</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      <span>Growth measurements & analytics</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      <span>Automated care reminders</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      <span>Environmental monitoring</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      <span>AI-powered health predictions</span>
                    </li>
                  </ul>
                </div>
                <Button 
                  onClick={() => window.location.href = '/garden-monitoring/subscribe'} 
                  className="bg-gradient-to-r from-green-600 to-blue-600"
                  data-testid="button-upgrade-subscription"
                >
                  Upgrade to Garden Monitoring Premium
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error loading garden</h3>
              <p className="text-gray-600 mb-4">
                {errorData?.message || 'Failed to load your garden data'}
              </p>
              <Button onClick={() => window.location.reload()} data-testid="button-reload">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activePlants = plants?.filter(plant => plant.isActive) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent" data-testid="text-dashboard-title">
              My Garden
            </h1>
            <p className="text-gray-600 mt-2" data-testid="text-dashboard-subtitle">
              Track and manage your plants with real-time insights
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-green-600 to-blue-600" data-testid="button-add-plant">
                <Plus className="w-4 h-4 mr-2" />
                Add Plant
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]" data-testid="dialog-add-plant">
              <DialogHeader>
                <DialogTitle>Add New Plant</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plant Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., My Tomato Plant" {...field} data-testid="input-plant-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="species"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Species</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Solanum lycopersicum" {...field} data-testid="input-plant-species" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="variety"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Variety</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Cherry Tomato" {...field} data-testid="input-plant-variety" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Indoor, Outdoor, Greenhouse" {...field} data-testid="input-plant-location" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="photoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Photo URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/plant-photo.jpg" {...field} data-testid="input-plant-photo" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Additional notes about your plant..." 
                            {...field} 
                            data-testid="input-plant-notes"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsAddDialogOpen(false)}
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={addPlantMutation.isPending}
                      data-testid="button-submit-plant"
                    >
                      {addPlantMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        'Add Plant'
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {activePlants.length === 0 ? (
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardContent className="pt-12 pb-12">
              <div className="text-center" data-testid="empty-state">
                <Leaf className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No plants yet</h3>
                <p className="text-gray-600 mb-6">
                  Start building your garden by adding your first plant
                </p>
                <Button 
                  onClick={() => setIsAddDialogOpen(true)} 
                  className="bg-gradient-to-r from-green-600 to-blue-600"
                  data-testid="button-add-first-plant"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Plant
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="plants-grid">
            {activePlants.map((plant) => (
              <Card key={plant.id} className="bg-white/70 backdrop-blur-sm hover:shadow-lg transition-shadow" data-testid={`card-plant-${plant.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2" data-testid={`text-plant-name-${plant.id}`}>
                        <Leaf className="w-5 h-5 text-green-600" />
                        {plant.name}
                      </CardTitle>
                      {plant.species && (
                        <p className="text-sm text-gray-600 mt-1 italic" data-testid={`text-plant-species-${plant.id}`}>
                          {plant.species}
                        </p>
                      )}
                    </div>
                    <Badge variant={getStatusBadgeVariant(plant.status)} data-testid={`badge-status-${plant.id}`}>
                      {plant.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {plant.photoUrl && (
                    <div className="mb-4 rounded-lg overflow-hidden">
                      <img 
                        src={plant.photoUrl} 
                        alt={plant.name}
                        className="w-full h-48 object-cover"
                        data-testid={`img-plant-${plant.id}`}
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    {plant.variety && (
                      <div className="text-sm" data-testid={`text-plant-variety-${plant.id}`}>
                        <span className="font-semibold">Variety:</span> {plant.variety}
                      </div>
                    )}
                    {plant.location && (
                      <div className="flex items-center text-sm text-gray-600" data-testid={`text-plant-location-${plant.id}`}>
                        <MapPin className="w-4 h-4 mr-1" />
                        {plant.location}
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-600" data-testid={`text-plant-date-${plant.id}`}>
                      <Calendar className="w-4 h-4 mr-1" />
                      Added {format(new Date(plant.dateAdded), 'MMM dd, yyyy')}
                    </div>
                    {plant.notes && (
                      <div className="text-sm text-gray-600 mt-2 pt-2 border-t" data-testid={`text-plant-notes-${plant.id}`}>
                        <span className="font-semibold">Notes:</span>
                        <p className="mt-1">{plant.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activePlants.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600" data-testid="text-plant-count">
              You have {activePlants.length} {activePlants.length === 1 ? 'plant' : 'plants'} in your garden
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
