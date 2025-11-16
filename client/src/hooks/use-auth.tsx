import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser, loginUserSchema, LoginUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: SelectUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginUser>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<any, Error, InsertUser>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });



  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginUser) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      return await res.json();
    },
    onSuccess: (data: any) => {
      // Registration no longer auto-logs in users
      // They need to verify email and login manually
      // No need to update queryClient here
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      console.log("🔄 Starting logout...");
      try {
        await apiRequest("POST", "/api/logout");
        console.log("✅ Logout API call completed");
      } catch (error) {
        console.warn("⚠️ Logout API call failed, but proceeding with client cleanup:", error);
        // Even if the API call fails, we still want to clear local state
      }
    },
    onMutate: () => {
      console.log("🔥 Optimistically clearing user data");
      // Optimistically clear user data immediately
      queryClient.setQueryData(["/api/user"], null);
    },
    onSuccess: () => {
      console.log("🧹 Clearing queries after successful logout");
      // Clear all queries to reset application state
      queryClient.clear();
      
      // Clear session storage but preserve cookie consent in localStorage
      sessionStorage.clear();
      
      // Remove only auth-related items from localStorage if needed
      // Preserve cookieConsent and other user preferences
      const cookieConsent = localStorage.getItem('cookieConsent');
      const otherPrefs = localStorage.getItem('theme'); // preserve theme if exists
      
      // Clear localStorage except for specific items
      localStorage.clear();
      
      // Restore preserved items
      if (cookieConsent) {
        localStorage.setItem('cookieConsent', cookieConsent);
      }
      if (otherPrefs) {
        localStorage.setItem('theme', otherPrefs);
      }
      
      // Redirect to home page after logout
      window.location.href = '/';
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isAuthenticated: !!user && !isLoading,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}