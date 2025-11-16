import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  CreditCard,
  Calendar,
  Bell,
  LogOut,
  ChevronDown,
  Crown,
} from "lucide-react";
import { format } from "date-fns";
import { useLocation } from "wouter";

interface UserSubscription {
  id: string;
  planType: string;
  status: string;
  amount: string;
  currency: string;
  endDate: string | null;
  preferredProvider: string | null;
}

export function UserAccountDropdown() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();

  // Fetch user subscription data
  const { data: subscription, isLoading } = useQuery<UserSubscription | null>({
    queryKey: ["/api/user/subscription"],
    enabled: !!user,
  });

  if (!user) return null;

  // Get user initials for avatar
  const getInitials = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.firstName) {
      return user.firstName.substring(0, 2).toUpperCase();
    }
    return user.email.substring(0, 2).toUpperCase();
  };

  // Get user full name
  const getUserName = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) {
      return user.firstName;
    }
    return user.email.split("@")[0];
  };

  // Format plan name
  const getPlanDisplay = (planType: string) => {
    switch (planType) {
      case "pro":
        return "Pro Plan";
      case "premium":
        return "Premium Plan";
      default:
        return "Free Plan";
    }
  };

  // Check if renewal is coming soon (within 7 days)
  const isRenewalSoon = () => {
    if (!subscription?.endDate) return false;
    const endDate = new Date(subscription.endDate);
    const today = new Date();
    const daysUntilRenewal = Math.ceil(
      (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilRenewal <= 7 && daysUntilRenewal > 0;
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      // Redirect to homepage after successful logout
      setLocation("/");
      // Force reload to clear all state
      window.location.reload();
    } catch (error) {
      console.error("Logout error:", error);
      // Even on error, redirect to home
      setLocation("/");
      window.location.reload();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full px-2 py-1"
          data-testid="user-account-dropdown"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-green-600 text-white font-semibold text-sm">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium hidden md:inline-block">
            {getUserName()}
          </span>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80" data-testid="dropdown-content">
        {/* Account Holder Name */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100" data-testid="account-name">
              {getUserName()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400" data-testid="account-email">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Plan Details */}
        <div className="px-2 py-2 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Crown className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium" data-testid="plan-type">Current Plan</span>
            </div>
            <Badge
              variant={subscription?.status === "active" ? "default" : "secondary"}
              className={
                subscription?.status === "active"
                  ? "bg-green-500 hover:bg-green-600"
                  : ""
              }
              data-testid="plan-status"
            >
              {isLoading
                ? "Loading..."
                : subscription
                ? getPlanDisplay(subscription.planType)
                : "Free Plan"}
            </Badge>
          </div>

          {/* Subscription Status */}
          {subscription && (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <span
                  className={
                    subscription.status === "active"
                      ? "text-green-600 font-medium"
                      : "text-gray-500"
                  }
                  data-testid="subscription-status"
                >
                  {subscription.status.charAt(0).toUpperCase() +
                    subscription.status.slice(1)}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                <span className="font-medium" data-testid="subscription-amount">
                  {subscription.currency} {subscription.amount}/month
                </span>
              </div>

              {/* Renewal Date */}
              {subscription.endDate && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Renewal Date:
                    </span>
                  </div>
                  <span className="font-medium" data-testid="renewal-date">
                    {format(new Date(subscription.endDate), "MMM dd, yyyy")}
                  </span>
                </div>
              )}

              {/* Renewal Reminder */}
              {isRenewalSoon() && (
                <div className="flex items-center space-x-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-2" data-testid="renewal-reminder">
                  <Bell className="h-4 w-4 text-yellow-600" />
                  <span className="text-xs text-yellow-700 dark:text-yellow-400">
                    Your subscription renews in{" "}
                    {Math.ceil(
                      (new Date(subscription.endDate!).getTime() -
                        new Date().getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{" "}
                    days
                  </span>
                </div>
              )}

              {/* Payment Provider */}
              {subscription.preferredProvider && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Provider:
                  </span>
                  <span className="font-medium capitalize" data-testid="payment-provider">
                    {subscription.preferredProvider}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        <DropdownMenuSeparator />

        {/* Profile */}
        <DropdownMenuItem
          onClick={() => setLocation("/account")}
          className="cursor-pointer"
          data-testid="menu-profile"
        >
          <User className="mr-2 h-4 w-4" />
          <span>My Profile</span>
        </DropdownMenuItem>

        {/* Billing */}
        <DropdownMenuItem
          onClick={() => setLocation("/pricing")}
          className="cursor-pointer"
          data-testid="menu-billing"
        >
          <CreditCard className="mr-2 h-4 w-4" />
          <span>Billing & Plans</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
          data-testid="menu-logout"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{logoutMutation.isPending ? "Logging out..." : "Log Out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
