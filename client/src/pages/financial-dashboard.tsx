import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Receipt, 
  FileText, 
  Calculator, 
  Globe, 
  CreditCard,
  Plus,
  Eye,
  Download,
  Filter,
  Calendar,
  PieChart,
  BarChart3
} from "lucide-react";
import { format } from "date-fns";

type TransactionType = 'income' | 'expense';

interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  totalGst: number;
  totalGatewayCharges: number;
  profitMargin: number;
}

interface Transaction {
  id: string;
  transactionDate: string;
  amount: string;
  type: TransactionType;
  description: string;
  categoryId: string;
  paymentMethod: string;
  gatewayCharges: string;
  gstAmount: string;
  isInternational: boolean;
  foreignCurrency?: string;
  exchangeRate?: string;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  type: TransactionType;
  description?: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  clientName: string;
  totalAmount: string;
  paidAmount: string;
  balanceAmount: string;
  status: string;
  currency: string;
}

export default function FinancialDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch financial summary
  const { data: summary, isLoading: summaryLoading } = useQuery<FinancialSummary>({
    queryKey: ["/api/financial/dashboard/summary", dateRange.startDate, dateRange.endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append("startDate", dateRange.startDate);
      if (dateRange.endDate) params.append("endDate", dateRange.endDate);
      const response = await apiRequest("GET", `/api/financial/dashboard/summary?${params}`);
      return response.json();
    }
  });

  // Fetch recent transactions
  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/financial/transactions", { limit: 10 }],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/financial/transactions?limit=10");
      return response.json();
    }
  });

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/financial/categories"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/financial/categories");
      return response.json();
    }
  });

  // Fetch recent invoices
  const { data: invoices = [] } = useQuery<Invoice[]>({
    queryKey: ["/api/financial/invoices", { limit: 5 }],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/financial/invoices?limit=5");
      return response.json();
    }
  });

  // Fetch period analytics
  const { data: periodAnalytics } = useQuery({
    queryKey: ["/api/financial/analytics/period", selectedPeriod, dateRange.startDate, dateRange.endDate],
    queryFn: async () => {
      const params = new URLSearchParams({
        period: selectedPeriod,
        startDate: dateRange.startDate || "2024-01-01",
        endDate: dateRange.endDate || new Date().toISOString().split('T')[0]
      });
      const response = await apiRequest("GET", `/api/financial/analytics/period?${params}`);
      return response.json();
    },
    enabled: !!selectedPeriod
  });

  const formatCurrency = (amount: number | string, currency = "INR") => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    const symbol = currency === "USD" ? "$" : "₹";
    return `${symbol}${numAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'overdue': return 'bg-red-500';
      case 'draft': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="financial-dashboard">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="page-title">Financial Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive financial management and analytics
          </p>
        </div>
        
        {/* Date Range Filter */}
        <div className="flex gap-2 items-center">
          <Input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            placeholder="Start Date"
            className="w-40"
            data-testid="date-start-input"
          />
          <Input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            placeholder="End Date"
            className="w-40"
            data-testid="date-end-input"
          />
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card data-testid="total-income-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.totalIncome)}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="total-expenses-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(summary.totalExpenses)}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="net-profit-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(summary.netProfit)}
              </div>
              <p className="text-xs text-muted-foreground">
                {summary.profitMargin.toFixed(1)}% margin
              </p>
            </CardContent>
          </Card>

          <Card data-testid="total-gst-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total GST</CardTitle>
              <Calculator className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(summary.totalGst)}
              </div>
              <p className="text-xs text-muted-foreground">
                Gateway charges: {formatCurrency(summary.totalGatewayCharges)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions" data-testid="tab-transactions">Transactions</TabsTrigger>
          <TabsTrigger value="invoices" data-testid="tab-invoices">Invoices</TabsTrigger>
          <TabsTrigger value="receipts" data-testid="tab-receipts">Receipts</TabsTrigger>
          <TabsTrigger value="taxes" data-testid="tab-taxes">Taxes</TabsTrigger>
          <TabsTrigger value="reports" data-testid="tab-reports">Reports</TabsTrigger>
          <TabsTrigger value="settings" data-testid="tab-settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Recent Transactions */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Recent Transactions</CardTitle>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                    ))}
                  </div>
                ) : transactionsData?.transactions?.length ? (
                  <div className="space-y-3">
                    {transactionsData.transactions.slice(0, 5).map((transaction: Transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(transaction.transactionDate), 'MMM dd, yyyy')} • {transaction.paymentMethod}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </p>
                          {transaction.isInternational && (
                            <Badge variant="secondary" className="text-xs">
                              <Globe className="h-3 w-3 mr-1" />
                              International
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No transactions found</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Invoices */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Recent Invoices</CardTitle>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Invoice
                </Button>
              </CardHeader>
              <CardContent>
                {invoices.length ? (
                  <div className="space-y-3">
                    {invoices.map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">#{invoice.invoiceNumber}</p>
                          <p className="text-sm text-muted-foreground">{invoice.clientName}</p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="font-bold">{formatCurrency(invoice.totalAmount, invoice.currency)}</p>
                          <Badge variant="secondary" className={`${getStatusColor(invoice.status)} text-white text-xs`}>
                            {invoice.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No invoices found</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Analytics Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Financial Analytics</CardTitle>
              <CardDescription>
                Income vs Expenses trend for the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
                <div className="text-center space-y-2">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto" />
                  <p className="text-gray-500">Analytics chart will be displayed here</p>
                  <p className="text-sm text-gray-400">Select period and date range to view trends</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>All Transactions</CardTitle>
                <CardDescription>Manage income and expense transactions</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Transaction
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Transaction Management</h3>
                <p className="text-muted-foreground mb-4">
                  Create, edit, and manage all your financial transactions here.
                </p>
                <Button>Add Your First Transaction</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Invoice Management</CardTitle>
                <CardDescription>Create and manage invoices for your clients</CardDescription>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Invoice Management</h3>
                <p className="text-muted-foreground mb-4">
                  Generate professional invoices with GST calculations and track payments.
                </p>
                <Button>Create Your First Invoice</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Receipts Tab */}
        <TabsContent value="receipts" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Receipt Management</CardTitle>
                <CardDescription>Generate receipts for received payments</CardDescription>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Generate Receipt
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Receipt Generation</h3>
                <p className="text-muted-foreground mb-4">
                  Create professional receipts for payment confirmations.
                </p>
                <Button>Generate Your First Receipt</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Taxes Tab */}
        <TabsContent value="taxes" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Income Tax Calculator</CardTitle>
                <CardDescription>Calculate income tax based on current slabs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Enter your taxable income to calculate tax liability
                  </p>
                  <Button className="mt-4">Calculate Tax</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>GST Management</CardTitle>
                <CardDescription>Track GST collection and filing status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Manage GST calculations and compliance records
                  </p>
                  <Button className="mt-4">View GST Records</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Reports</CardTitle>
              <CardDescription>Generate comprehensive financial reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-24 flex flex-col">
                  <PieChart className="h-6 w-6 mb-2" />
                  Income/Expense Report
                </Button>
                <Button variant="outline" className="h-24 flex flex-col">
                  <Calculator className="h-6 w-6 mb-2" />
                  Tax Summary
                </Button>
                <Button variant="outline" className="h-24 flex flex-col">
                  <Globe className="h-6 w-6 mb-2" />
                  International Transactions
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Settings</CardTitle>
              <CardDescription>Configure your financial management preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="default-currency">Default Currency</Label>
                    <Select defaultValue="INR">
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                        <SelectItem value="USD">US Dollar ($)</SelectItem>
                        <SelectItem value="EUR">Euro (€)</SelectItem>
                        <SelectItem value="GBP">British Pound (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="financial-year">Financial Year</Label>
                    <Select defaultValue="2024-25">
                      <SelectTrigger>
                        <SelectValue placeholder="Select financial year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024-25">2024-25</SelectItem>
                        <SelectItem value="2023-24">2023-24</SelectItem>
                        <SelectItem value="2022-23">2022-23</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Company Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company-name">Company Name</Label>
                      <Input id="company-name" placeholder="Enter company name" />
                    </div>
                    <div>
                      <Label htmlFor="gstin">GSTIN</Label>
                      <Input id="gstin" placeholder="Enter GSTIN number" />
                    </div>
                  </div>
                </div>
                
                <Button>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}