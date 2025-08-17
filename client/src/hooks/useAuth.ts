import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useAuth() {
  const { toast } = useToast();
  
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/logout');
      return response;
    },
    onSuccess: () => {
      // Clear the user data from the cache
      queryClient.setQueryData(["/api/auth/user"], null);
      // Force refetch to ensure clean state
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      // Redirect to home page
      window.location.href = '/';
    },
    onError: (error: any) => {
      toast({
        title: "Logout Failed",
        description: error.message || "Failed to logout. Please try again.",
        variant: "destructive",
      });
    },
  });

  const logout = () => {
    logoutMutation.mutate();
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
    isLoggingOut: logoutMutation.isPending,
  };
}
