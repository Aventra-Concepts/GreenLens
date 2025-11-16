import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  X,
  Calendar as CalendarIcon,
  Image as ImageIcon,
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Camera,
  Tag,
  Clock,
  Star,
  CheckCircle2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertPlantTimelineEntrySchema, insertPlantPhotoSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface PlantDetailViewProps {
  plantId: string;
  onClose: () => void;
}

interface TimelineEntry {
  id: string;
  plantId: string;
  entryType: string;
  title: string;
  content?: string;
  tags?: string[];
  photoUrls?: string[];
  entryDate: string;
  createdAt: string;
}

interface PlantPhoto {
  id: string;
  plantId: string;
  photoUrl: string;
  thumbnailUrl?: string;
  category: string;
  title?: string;
  description?: string;
  tags?: string[];
  captureDate: string;
  isFeatured: boolean;
}

export function PlantDetailView({ plantId, onClose }: PlantDetailViewProps) {
  const { toast } = useToast();
  const [showAddTimeline, setShowAddTimeline] = useState(false);
  const [showAddPhoto, setShowAddPhoto] = useState(false);

  // Fetch timeline entries
  const { data: timeline = [], isLoading: timelineLoading } = useQuery<TimelineEntry[]>({
    queryKey: ['/api/garden/plants', plantId, 'timeline'],
  });

  // Fetch photos
  const { data: photos = [], isLoading: photosLoading } = useQuery<PlantPhoto[]>({
    queryKey: ['/api/garden/plants', plantId, 'photos'],
  });

  // Timeline form
  const timelineForm = useForm<z.infer<typeof insertPlantTimelineEntrySchema>>({
    resolver: zodResolver(insertPlantTimelineEntrySchema),
    defaultValues: {
      entryType: "observation",
      title: "",
      content: "",
      tags: [],
    },
  });

  // Photo form
  const photoForm = useForm<z.infer<typeof insertPlantPhotoSchema>>({
    resolver: zodResolver(insertPlantPhotoSchema),
    defaultValues: {
      photoUrl: "",
      category: "full_plant",
      title: "",
      description: "",
    },
  });

  // Add timeline entry mutation
  const addTimelineMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertPlantTimelineEntrySchema>) => {
      const response = await fetch(`/api/garden/plants/${plantId}/timeline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Timeline entry added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/garden/plants', plantId, 'timeline'] });
      setShowAddTimeline(false);
      timelineForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add timeline entry.",
        variant: "destructive",
      });
    },
  });

  // Add photo mutation
  const addPhotoMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertPlantPhotoSchema>) => {
      const response = await fetch(`/api/garden/plants/${plantId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Photo added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/garden/plants', plantId, 'photos'] });
      setShowAddPhoto(false);
      photoForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add photo.",
        variant: "destructive",
      });
    },
  });

  const onTimelineSubmit = (data: z.infer<typeof insertPlantTimelineEntrySchema>) => {
    addTimelineMutation.mutate(data);
  };

  const onPhotoSubmit = (data: z.infer<typeof insertPlantPhotoSchema>) => {
    addPhotoMutation.mutate(data);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Plant Details
            </span>
            <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-detail">
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            View and manage your plant's timeline, photos, and care schedule
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="timeline" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="timeline" className="flex items-center gap-2" data-testid="tab-timeline">
              <Clock className="h-4 w-4" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex items-center gap-2" data-testid="tab-gallery">
              <ImageIcon className="h-4 w-4" />
              Gallery
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2" data-testid="tab-calendar">
              <CalendarIcon className="h-4 w-4" />
              Calendar
            </TabsTrigger>
          </TabsList>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Plant Journal</h3>
              <Button 
                onClick={() => setShowAddTimeline(true)}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                data-testid="button-add-timeline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            </div>

            {timelineLoading ? (
              <p className="text-center py-8 text-gray-500">Loading timeline...</p>
            ) : timeline.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold mb-2">No timeline entries yet</h4>
                  <p className="text-gray-500 mb-4">Start documenting your plant's journey!</p>
                  <Button onClick={() => setShowAddTimeline(true)} size="sm" data-testid="button-add-first-timeline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Entry
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {timeline.map((entry) => (
                  <Card key={entry.id} className="border-l-4 border-l-green-500" data-testid={`timeline-entry-${entry.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{entry.title}</CardTitle>
                          <p className="text-sm text-gray-500 mt-1">
                            {format(new Date(entry.entryDate), "PPP")}
                          </p>
                        </div>
                        <Badge variant="outline">{entry.entryType}</Badge>
                      </div>
                    </CardHeader>
                    {entry.content && (
                      <CardContent>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{entry.content}</p>
                        {entry.tags && entry.tags.length > 0 && (
                          <div className="flex gap-2 mt-3">
                            {entry.tags.map((tag, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Photo Gallery</h3>
              <Button 
                onClick={() => setShowAddPhoto(true)}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                data-testid="button-add-photo"
              >
                <Camera className="h-4 w-4 mr-2" />
                Add Photo
              </Button>
            </div>

            {photosLoading ? (
              <p className="text-center py-8 text-gray-500">Loading photos...</p>
            ) : photos.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold mb-2">No photos yet</h4>
                  <p className="text-gray-500 mb-4">Capture your plant's growth journey!</p>
                  <Button onClick={() => setShowAddPhoto(true)} size="sm" data-testid="button-add-first-photo">
                    <Camera className="h-4 w-4 mr-2" />
                    Add First Photo
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {photos.map((photo) => (
                  <Card key={photo.id} className="overflow-hidden group" data-testid={`photo-${photo.id}`}>
                    <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative">
                      <img 
                        src={photo.photoUrl} 
                        alt={photo.title || "Plant photo"}
                        className="w-full h-full object-cover"
                      />
                      {photo.isFeatured && (
                        <div className="absolute top-2 right-2 bg-yellow-500 rounded-full p-1">
                          <Star className="h-4 w-4 text-white fill-white" />
                        </div>
                      )}
                    </div>
                    {photo.title && (
                      <CardContent className="p-3">
                        <p className="text-sm font-medium truncate">{photo.title}</p>
                        <p className="text-xs text-gray-500">{photo.category}</p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-y-4 mt-4">
            <Card className="text-center py-12">
              <CardContent>
                <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold mb-2">Calendar View Coming Soon</h4>
                <p className="text-gray-500">View watering schedules and care reminders in a calendar format.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Timeline Entry Dialog */}
        <Dialog open={showAddTimeline} onOpenChange={setShowAddTimeline}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Timeline Entry</DialogTitle>
              <DialogDescription>Document a new event in your plant's journey</DialogDescription>
            </DialogHeader>
            <Form {...timelineForm}>
              <form onSubmit={timelineForm.handleSubmit(onTimelineSubmit)} className="space-y-4">
                <FormField
                  control={timelineForm.control}
                  name="entryType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entry Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-entry-type">
                            <SelectValue placeholder="Select entry type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="observation">Observation</SelectItem>
                          <SelectItem value="watered">Watered</SelectItem>
                          <SelectItem value="fertilized">Fertilized</SelectItem>
                          <SelectItem value="pruned">Pruned</SelectItem>
                          <SelectItem value="transplanted">Transplanted</SelectItem>
                          <SelectItem value="treatment">Treatment</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={timelineForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., First blooms appeared" {...field} data-testid="input-timeline-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={timelineForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Add any additional details..." 
                          {...field} 
                          rows={4}
                          data-testid="textarea-timeline-content"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowAddTimeline(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addTimelineMutation.isPending} data-testid="button-submit-timeline">
                    {addTimelineMutation.isPending ? "Adding..." : "Add Entry"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Add Photo Dialog */}
        <Dialog open={showAddPhoto} onOpenChange={setShowAddPhoto}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Photo</DialogTitle>
              <DialogDescription>Upload a new photo to your plant gallery</DialogDescription>
            </DialogHeader>
            <Form {...photoForm}>
              <form onSubmit={photoForm.handleSubmit(onPhotoSubmit)} className="space-y-4">
                <FormField
                  control={photoForm.control}
                  name="photoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Photo URL</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter photo URL" {...field} data-testid="input-photo-url" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={photoForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-photo-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="full_plant">Full Plant</SelectItem>
                          <SelectItem value="close_up">Close-up</SelectItem>
                          <SelectItem value="flower">Flower</SelectItem>
                          <SelectItem value="fruit">Fruit</SelectItem>
                          <SelectItem value="issue">Issue/Problem</SelectItem>
                          <SelectItem value="before">Before</SelectItem>
                          <SelectItem value="after">After</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={photoForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., First bloom" {...field} data-testid="input-photo-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowAddPhoto(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addPhotoMutation.isPending} data-testid="button-submit-photo">
                    {addPhotoMutation.isPending ? "Adding..." : "Add Photo"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
