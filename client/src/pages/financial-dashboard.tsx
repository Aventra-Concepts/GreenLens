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
  BarChart3,
  Upload
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
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [showGenerateReceipt, setShowGenerateReceipt] = useState(false);
  const [showTaxCalculator, setShowTaxCalculator] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [taxCalculatorType, setTaxCalculatorType] = useState<'individual' | 'company'>('individual');
  const [taxData, setTaxData] = useState({
    // Income Sources
    salary: '',
    houseProperty: '',
    capitalGains: '',
    businessIncome: '',
    otherIncome: '',
    
    // Deductions under 80C
    pf: '',
    elss: '',
    lifeInsurance: '',
    nsc: '',
    taxSaver: '',
    
    // Other Deductions
    section80D: '',
    section80E: '',
    section80G: '',
    section80TTA: '',
    standardDeduction: '50000',
    
    // Personal Details
    age: '',
    assessmentYear: '2024-25'
  });

  const [companyTaxData, setCompanyTaxData] = useState({
    // Revenue Sources
    businessIncome: '',
    interestIncome: '',
    dividendIncome: '',
    shortTermCapitalGains: '',
    longTermCapitalGains: '',
    otherIncome: '',
    
    // Business Expenses
    costOfGoodsSold: '',
    officeExpenses: '',
    salaryWages: '',
    rent: '',
    utilities: '',
    professionalFees: '',
    travelExpenses: '',
    depreciation: '',
    interestOnLoans: '',
    otherExpenses: '',
    
    // Company Details
    companyType: 'domestic', // domestic, foreign
    turnover: '',
    previousYearTax: '',
    advanceTaxPaid: '',
    tdsDeducted: '',
    
    // Assessment Year
    assessmentYear: '2024-25'
  });
  const [showGSTRecords, setShowGSTRecords] = useState(false);
  const [showGSTCalculator, setShowGSTCalculator] = useState(false);
  const [showBankStatementUpload, setShowBankStatementUpload] = useState(false);
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
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions" data-testid="tab-transactions">Transactions</TabsTrigger>
          <TabsTrigger value="invoices" data-testid="tab-invoices">Invoices</TabsTrigger>
          <TabsTrigger value="receipts" data-testid="tab-receipts">Receipts</TabsTrigger>
          <TabsTrigger value="taxes" data-testid="tab-taxes">Taxes</TabsTrigger>
          <TabsTrigger value="bank-import" data-testid="tab-bank-import">Bank Import</TabsTrigger>
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
                <Dialog open={showAddTransaction} onOpenChange={setShowAddTransaction}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Transaction
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add New Transaction</DialogTitle>
                      <DialogDescription>
                        Create a new income or expense transaction
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="transaction-type">Transaction Type</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="income">Income</SelectItem>
                            <SelectItem value="expense">Expense</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="amount">Amount</Label>
                        <Input id="amount" type="number" placeholder="Enter amount" />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Input id="description" placeholder="Transaction description" />
                      </div>
                      <div>
                        <Label htmlFor="payment-method">Payment Method</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                            <SelectItem value="credit_card">Credit Card</SelectItem>
                            <SelectItem value="upi">UPI</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          onClick={() => setShowAddTransaction(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={() => {
                            toast({
                              title: "Transaction Added",
                              description: "Your transaction has been successfully recorded.",
                            });
                            setShowAddTransaction(false);
                          }}
                          className="flex-1"
                        >
                          Add Transaction
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
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
              <Dialog open={showCreateInvoice} onOpenChange={setShowCreateInvoice}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Invoice
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Create New Invoice</DialogTitle>
                    <DialogDescription>
                      Generate a professional invoice for your client
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="client-name">Client Name</Label>
                        <Input id="client-name" placeholder="Enter client name" />
                      </div>
                      <div>
                        <Label htmlFor="invoice-date">Invoice Date</Label>
                        <Input id="invoice-date" type="date" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="client-email">Client Email</Label>
                      <Input id="client-email" type="email" placeholder="client@example.com" />
                    </div>
                    <div>
                      <Label htmlFor="invoice-amount">Amount</Label>
                      <Input id="invoice-amount" type="number" placeholder="Enter invoice amount" />
                    </div>
                    <div>
                      <Label htmlFor="invoice-description">Description</Label>
                      <Textarea id="invoice-description" placeholder="Invoice description or items" />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowCreateInvoice(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={() => {
                          toast({
                            title: "Invoice Created",
                            description: "Your invoice has been successfully generated.",
                          });
                          setShowCreateInvoice(false);
                        }}
                        className="flex-1"
                      >
                        Create Invoice
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
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
              <Dialog open={showGenerateReceipt} onOpenChange={setShowGenerateReceipt}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Generate Receipt
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Generate Receipt</DialogTitle>
                    <DialogDescription>
                      Create a receipt for payment received
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="receipt-from">Received From</Label>
                      <Input id="receipt-from" placeholder="Enter payer name" />
                    </div>
                    <div>
                      <Label htmlFor="receipt-amount">Amount Received</Label>
                      <Input id="receipt-amount" type="number" placeholder="Enter amount" />
                    </div>
                    <div>
                      <Label htmlFor="receipt-date">Receipt Date</Label>
                      <Input id="receipt-date" type="date" />
                    </div>
                    <div>
                      <Label htmlFor="receipt-purpose">Purpose</Label>
                      <Input id="receipt-purpose" placeholder="Payment for..." />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowGenerateReceipt(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={() => {
                          toast({
                            title: "Receipt Generated",
                            description: "Your receipt has been successfully created.",
                          });
                          setShowGenerateReceipt(false);
                        }}
                        className="flex-1"
                      >
                        Generate
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
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
                  <Dialog open={showTaxCalculator} onOpenChange={setShowTaxCalculator}>
                    <DialogTrigger asChild>
                      <Button className="mt-4">Calculate Tax</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {taxCalculatorType === 'individual' ? 'Employee Income Tax Calculator' : 'Company Income Tax Calculator'} (FY 2024-25)
                        </DialogTitle>
                        <DialogDescription>
                          {taxCalculatorType === 'individual' 
                            ? 'Calculate individual income tax with all income sources and deductions'
                            : 'Calculate comprehensive company income tax, corporate tax, and advance tax'
                          }
                        </DialogDescription>
                      </DialogHeader>

                      {/* Calculator Type Selector */}
                      <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
                        <Label className="font-semibold">Calculator Type:</Label>
                        <div className="flex space-x-4">
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="calculatorType"
                              value="individual"
                              checked={taxCalculatorType === 'individual'}
                              onChange={(e) => setTaxCalculatorType('individual')}
                              className="text-blue-600"
                            />
                            <span>Employee IT Calculator</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="calculatorType"
                              value="company"
                              checked={taxCalculatorType === 'company'}
                              onChange={(e) => setTaxCalculatorType('company')}
                              className="text-blue-600"
                            />
                            <span>Company IT Calculator</span>
                          </label>
                        </div>
                      </div>
                      <div className="space-y-6">
                        
                        {/* Individual Tax Calculator */}
                        {taxCalculatorType === 'individual' && (
                          <>

                        {/* Personal Details */}
                        <div className="border rounded-lg p-4">
                          <h3 className="font-semibold mb-3">Personal Details</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="age">Age</Label>
                              <Select value={taxData.age} onValueChange={(value) => setTaxData({...taxData, age: value})}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select age group" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="below-60">Below 60 years</SelectItem>
                                  <SelectItem value="60-80">60-80 years (Senior Citizen)</SelectItem>
                                  <SelectItem value="above-80">Above 80 years (Super Senior)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="assessment-year">Assessment Year</Label>
                              <Select value={taxData.assessmentYear} onValueChange={(value) => setTaxData({...taxData, assessmentYear: value})}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select assessment year" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="2024-25">2024-25</SelectItem>
                                  <SelectItem value="2023-24">2023-24</SelectItem>
                                  <SelectItem value="2022-23">2022-23</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>

                        {/* Income Sources */}
                        <div className="border rounded-lg p-4">
                          <h3 className="font-semibold mb-3">Income Sources</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="salary">Salary Income (₹)</Label>
                              <Input 
                                type="number" 
                                value={taxData.salary}
                                onChange={(e) => setTaxData({...taxData, salary: e.target.value})}
                                placeholder="Enter salary income" 
                              />
                            </div>
                            <div>
                              <Label htmlFor="house-property">House Property Income (₹)</Label>
                              <Input 
                                type="number" 
                                value={taxData.houseProperty}
                                onChange={(e) => setTaxData({...taxData, houseProperty: e.target.value})}
                                placeholder="Enter house property income" 
                              />
                            </div>
                            <div>
                              <Label htmlFor="capital-gains">Capital Gains (₹)</Label>
                              <Input 
                                type="number" 
                                value={taxData.capitalGains}
                                onChange={(e) => setTaxData({...taxData, capitalGains: e.target.value})}
                                placeholder="Enter capital gains" 
                              />
                            </div>
                            <div>
                              <Label htmlFor="business-income">Business Income (₹)</Label>
                              <Input 
                                type="number" 
                                value={taxData.businessIncome}
                                onChange={(e) => setTaxData({...taxData, businessIncome: e.target.value})}
                                placeholder="Enter business income" 
                              />
                            </div>
                            <div>
                              <Label htmlFor="other-income">Other Income (₹)</Label>
                              <Input 
                                type="number" 
                                value={taxData.otherIncome}
                                onChange={(e) => setTaxData({...taxData, otherIncome: e.target.value})}
                                placeholder="Enter other income" 
                              />
                            </div>
                          </div>
                        </div>

                        {/* Deductions under 80C */}
                        <div className="border rounded-lg p-4">
                          <h3 className="font-semibold mb-3">Deductions under Section 80C (Max ₹1.5 Lakh)</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="pf">Provident Fund (₹)</Label>
                              <Input 
                                type="number" 
                                value={taxData.pf}
                                onChange={(e) => setTaxData({...taxData, pf: e.target.value})}
                                placeholder="Enter PF contribution" 
                              />
                            </div>
                            <div>
                              <Label htmlFor="elss">ELSS Mutual Funds (₹)</Label>
                              <Input 
                                type="number" 
                                value={taxData.elss}
                                onChange={(e) => setTaxData({...taxData, elss: e.target.value})}
                                placeholder="Enter ELSS investment" 
                              />
                            </div>
                            <div>
                              <Label htmlFor="life-insurance">Life Insurance Premium (₹)</Label>
                              <Input 
                                type="number" 
                                value={taxData.lifeInsurance}
                                onChange={(e) => setTaxData({...taxData, lifeInsurance: e.target.value})}
                                placeholder="Enter insurance premium" 
                              />
                            </div>
                            <div>
                              <Label htmlFor="nsc">NSC/Tax Saver FD (₹)</Label>
                              <Input 
                                type="number" 
                                value={taxData.nsc}
                                onChange={(e) => setTaxData({...taxData, nsc: e.target.value})}
                                placeholder="Enter NSC/FD amount" 
                              />
                            </div>
                            <div>
                              <Label htmlFor="tax-saver">Other Tax Saver Investments (₹)</Label>
                              <Input 
                                type="number" 
                                value={taxData.taxSaver}
                                onChange={(e) => setTaxData({...taxData, taxSaver: e.target.value})}
                                placeholder="Enter other investments" 
                              />
                            </div>
                          </div>
                        </div>

                        {/* Other Deductions */}
                        <div className="border rounded-lg p-4">
                          <h3 className="font-semibold mb-3">Other Deductions</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="section-80d">Health Insurance - 80D (₹)</Label>
                              <Input 
                                type="number" 
                                value={taxData.section80D}
                                onChange={(e) => setTaxData({...taxData, section80D: e.target.value})}
                                placeholder="Max ₹25,000 (₹50,000 for seniors)" 
                              />
                            </div>
                            <div>
                              <Label htmlFor="section-80e">Education Loan - 80E (₹)</Label>
                              <Input 
                                type="number" 
                                value={taxData.section80E}
                                onChange={(e) => setTaxData({...taxData, section80E: e.target.value})}
                                placeholder="Enter interest paid" 
                              />
                            </div>
                            <div>
                              <Label htmlFor="section-80g">Donations - 80G (₹)</Label>
                              <Input 
                                type="number" 
                                value={taxData.section80G}
                                onChange={(e) => setTaxData({...taxData, section80G: e.target.value})}
                                placeholder="Enter donation amount" 
                              />
                            </div>
                            <div>
                              <Label htmlFor="section-80tta">Savings Account Interest - 80TTA (₹)</Label>
                              <Input 
                                type="number" 
                                value={taxData.section80TTA}
                                onChange={(e) => setTaxData({...taxData, section80TTA: e.target.value})}
                                placeholder="Max ₹10,000" 
                              />
                            </div>
                            <div>
                              <Label htmlFor="standard-deduction">Standard Deduction (₹)</Label>
                              <Input 
                                type="number" 
                                value={taxData.standardDeduction}
                                onChange={(e) => setTaxData({...taxData, standardDeduction: e.target.value})}
                                placeholder="Standard ₹50,000" 
                              />
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            onClick={() => setShowTaxCalculator(false)}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => {
                              // Calculate comprehensive tax
                              const grossIncome = 
                                Number(taxData.salary || 0) + 
                                Number(taxData.houseProperty || 0) + 
                                Number(taxData.capitalGains || 0) + 
                                Number(taxData.businessIncome || 0) + 
                                Number(taxData.otherIncome || 0);
                              
                              const total80C = Math.min(150000, 
                                Number(taxData.pf || 0) + 
                                Number(taxData.elss || 0) + 
                                Number(taxData.lifeInsurance || 0) + 
                                Number(taxData.nsc || 0) + 
                                Number(taxData.taxSaver || 0)
                              );
                              
                              const otherDeductions = 
                                Number(taxData.section80D || 0) + 
                                Number(taxData.section80E || 0) + 
                                Number(taxData.section80G || 0) + 
                                Number(taxData.section80TTA || 0) + 
                                Number(taxData.standardDeduction || 0);
                              
                              const taxableIncome = Math.max(0, grossIncome - total80C - otherDeductions);
                              
                              // Calculate tax based on age and slabs
                              let basicExemption = 250000; // Below 60
                              if (taxData.age === '60-80') basicExemption = 300000;
                              if (taxData.age === 'above-80') basicExemption = 500000;
                              
                              let tax = 0;
                              const taxableAfterExemption = Math.max(0, taxableIncome - basicExemption);
                              
                              if (taxableAfterExemption > 0) {
                                if (taxableAfterExemption <= 250000) {
                                  tax += taxableAfterExemption * 0.05;
                                } else if (taxableAfterExemption <= 500000) {
                                  tax += 250000 * 0.05 + (taxableAfterExemption - 250000) * 0.10;
                                } else if (taxableAfterExemption <= 1000000) {
                                  tax += 250000 * 0.05 + 250000 * 0.10 + (taxableAfterExemption - 500000) * 0.20;
                                } else {
                                  tax += 250000 * 0.05 + 250000 * 0.10 + 500000 * 0.20 + (taxableAfterExemption - 1000000) * 0.30;
                                }
                              }
                              
                              const cess = tax * 0.04; // 4% Health and Education Cess
                              const totalTax = tax + cess;
                              
                              toast({
                                title: "Tax Calculation Complete",
                                description: `Taxable Income: ₹${taxableIncome.toLocaleString()}, Total Tax: ₹${totalTax.toLocaleString()}`,
                              });
                            }}
                            className="flex-1"
                          >
                            <Calculator className="h-4 w-4 mr-2" />
                            Calculate Tax
                          </Button>
                          <Button 
                            onClick={() => {
                              toast({
                                title: "PDF Report Generated",
                                description: "Your tax calculation report has been generated for download.",
                              });
                            }}
                            className="flex-1"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => {
                              toast({
                                title: "Excel Report Generated",
                                description: "Your tax calculation Excel file has been generated for download.",
                              });
                            }}
                            className="flex-1"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Export Excel
                          </Button>
                        </div>
                          </>
                        )}

                        {/* Company Tax Calculator */}
                        {taxCalculatorType === 'company' && (
                          <>
                            {/* Company Details */}
                            <div className="border rounded-lg p-4">
                              <h3 className="font-semibold mb-3">Company Details</h3>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="company-type">Company Type</Label>
                                  <Select value={companyTaxData.companyType} onValueChange={(value) => setCompanyTaxData({...companyTaxData, companyType: value})}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select company type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="domestic">Domestic Company</SelectItem>
                                      <SelectItem value="foreign">Foreign Company</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="turnover">Annual Turnover (₹)</Label>
                                  <Input 
                                    type="number" 
                                    value={companyTaxData.turnover}
                                    onChange={(e) => setCompanyTaxData({...companyTaxData, turnover: e.target.value})}
                                    placeholder="Enter annual turnover" 
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="assessment-year">Assessment Year</Label>
                                  <Select value={companyTaxData.assessmentYear} onValueChange={(value) => setCompanyTaxData({...companyTaxData, assessmentYear: value})}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="2024-25">2024-25</SelectItem>
                                      <SelectItem value="2023-24">2023-24</SelectItem>
                                      <SelectItem value="2022-23">2022-23</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>

                            {/* Revenue Sources */}
                            <div className="border rounded-lg p-4">
                              <h3 className="font-semibold mb-3">Revenue Sources</h3>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="business-income">Business/Trading Income (₹)</Label>
                                  <Input 
                                    type="number" 
                                    value={companyTaxData.businessIncome}
                                    onChange={(e) => setCompanyTaxData({...companyTaxData, businessIncome: e.target.value})}
                                    placeholder="Enter business income" 
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="interest-income">Interest Income (₹)</Label>
                                  <Input 
                                    type="number" 
                                    value={companyTaxData.interestIncome}
                                    onChange={(e) => setCompanyTaxData({...companyTaxData, interestIncome: e.target.value})}
                                    placeholder="Enter interest income" 
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="dividend-income">Dividend Income (₹)</Label>
                                  <Input 
                                    type="number" 
                                    value={companyTaxData.dividendIncome}
                                    onChange={(e) => setCompanyTaxData({...companyTaxData, dividendIncome: e.target.value})}
                                    placeholder="Enter dividend income" 
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="short-term-gains">Short-term Capital Gains (₹)</Label>
                                  <Input 
                                    type="number" 
                                    value={companyTaxData.shortTermCapitalGains}
                                    onChange={(e) => setCompanyTaxData({...companyTaxData, shortTermCapitalGains: e.target.value})}
                                    placeholder="Enter STCG" 
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="long-term-gains">Long-term Capital Gains (₹)</Label>
                                  <Input 
                                    type="number" 
                                    value={companyTaxData.longTermCapitalGains}
                                    onChange={(e) => setCompanyTaxData({...companyTaxData, longTermCapitalGains: e.target.value})}
                                    placeholder="Enter LTCG" 
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="other-income">Other Income (₹)</Label>
                                  <Input 
                                    type="number" 
                                    value={companyTaxData.otherIncome}
                                    onChange={(e) => setCompanyTaxData({...companyTaxData, otherIncome: e.target.value})}
                                    placeholder="Enter other income" 
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Business Expenses */}
                            <div className="border rounded-lg p-4">
                              <h3 className="font-semibold mb-3">Business Expenses</h3>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="cost-of-goods">Cost of Goods Sold (₹)</Label>
                                  <Input 
                                    type="number" 
                                    value={companyTaxData.costOfGoodsSold}
                                    onChange={(e) => setCompanyTaxData({...companyTaxData, costOfGoodsSold: e.target.value})}
                                    placeholder="Enter COGS" 
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="office-expenses">Office/Administrative Expenses (₹)</Label>
                                  <Input 
                                    type="number" 
                                    value={companyTaxData.officeExpenses}
                                    onChange={(e) => setCompanyTaxData({...companyTaxData, officeExpenses: e.target.value})}
                                    placeholder="Enter office expenses" 
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="salary-wages">Salary & Wages (₹)</Label>
                                  <Input 
                                    type="number" 
                                    value={companyTaxData.salaryWages}
                                    onChange={(e) => setCompanyTaxData({...companyTaxData, salaryWages: e.target.value})}
                                    placeholder="Enter salary expenses" 
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="rent">Rent (₹)</Label>
                                  <Input 
                                    type="number" 
                                    value={companyTaxData.rent}
                                    onChange={(e) => setCompanyTaxData({...companyTaxData, rent: e.target.value})}
                                    placeholder="Enter rent expenses" 
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="utilities">Utilities (₹)</Label>
                                  <Input 
                                    type="number" 
                                    value={companyTaxData.utilities}
                                    onChange={(e) => setCompanyTaxData({...companyTaxData, utilities: e.target.value})}
                                    placeholder="Enter utilities cost" 
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="professional-fees">Professional Fees (₹)</Label>
                                  <Input 
                                    type="number" 
                                    value={companyTaxData.professionalFees}
                                    onChange={(e) => setCompanyTaxData({...companyTaxData, professionalFees: e.target.value})}
                                    placeholder="Enter professional fees" 
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="travel-expenses">Travel & Conveyance (₹)</Label>
                                  <Input 
                                    type="number" 
                                    value={companyTaxData.travelExpenses}
                                    onChange={(e) => setCompanyTaxData({...companyTaxData, travelExpenses: e.target.value})}
                                    placeholder="Enter travel expenses" 
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="depreciation">Depreciation (₹)</Label>
                                  <Input 
                                    type="number" 
                                    value={companyTaxData.depreciation}
                                    onChange={(e) => setCompanyTaxData({...companyTaxData, depreciation: e.target.value})}
                                    placeholder="Enter depreciation" 
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="interest-loans">Interest on Business Loans (₹)</Label>
                                  <Input 
                                    type="number" 
                                    value={companyTaxData.interestOnLoans}
                                    onChange={(e) => setCompanyTaxData({...companyTaxData, interestOnLoans: e.target.value})}
                                    placeholder="Enter interest expenses" 
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="other-expenses">Other Business Expenses (₹)</Label>
                                  <Input 
                                    type="number" 
                                    value={companyTaxData.otherExpenses}
                                    onChange={(e) => setCompanyTaxData({...companyTaxData, otherExpenses: e.target.value})}
                                    placeholder="Enter other expenses" 
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Tax Payments */}
                            <div className="border rounded-lg p-4">
                              <h3 className="font-semibold mb-3">Tax Payments & Credits</h3>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="previous-year-tax">Previous Year Tax Liability (₹)</Label>
                                  <Input 
                                    type="number" 
                                    value={companyTaxData.previousYearTax}
                                    onChange={(e) => setCompanyTaxData({...companyTaxData, previousYearTax: e.target.value})}
                                    placeholder="Enter previous year tax" 
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="advance-tax-paid">Advance Tax Paid (₹)</Label>
                                  <Input 
                                    type="number" 
                                    value={companyTaxData.advanceTaxPaid}
                                    onChange={(e) => setCompanyTaxData({...companyTaxData, advanceTaxPaid: e.target.value})}
                                    placeholder="Enter advance tax paid" 
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="tds-deducted">TDS Deducted (₹)</Label>
                                  <Input 
                                    type="number" 
                                    value={companyTaxData.tdsDeducted}
                                    onChange={(e) => setCompanyTaxData({...companyTaxData, tdsDeducted: e.target.value})}
                                    placeholder="Enter TDS deducted" 
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                onClick={() => setShowTaxCalculator(false)}
                                className="flex-1"
                              >
                                Cancel
                              </Button>
                              <Button 
                                variant="outline"
                                onClick={() => {
                                  // Calculate comprehensive company tax
                                  const grossIncome = 
                                    Number(companyTaxData.businessIncome || 0) + 
                                    Number(companyTaxData.interestIncome || 0) + 
                                    Number(companyTaxData.dividendIncome || 0) + 
                                    Number(companyTaxData.shortTermCapitalGains || 0) + 
                                    Number(companyTaxData.longTermCapitalGains || 0) + 
                                    Number(companyTaxData.otherIncome || 0);
                                  
                                  const totalExpenses = 
                                    Number(companyTaxData.costOfGoodsSold || 0) + 
                                    Number(companyTaxData.officeExpenses || 0) + 
                                    Number(companyTaxData.salaryWages || 0) + 
                                    Number(companyTaxData.rent || 0) + 
                                    Number(companyTaxData.utilities || 0) + 
                                    Number(companyTaxData.professionalFees || 0) + 
                                    Number(companyTaxData.travelExpenses || 0) + 
                                    Number(companyTaxData.depreciation || 0) + 
                                    Number(companyTaxData.interestOnLoans || 0) + 
                                    Number(companyTaxData.otherExpenses || 0);
                                  
                                  const taxableIncome = Math.max(0, grossIncome - totalExpenses);
                                  const turnover = Number(companyTaxData.turnover || 0);
                                  
                                  // Determine corporate tax rate based on turnover
                                  let corporateRate = 0.30; // 30% for large companies
                                  if (turnover <= 40000000) { // ₹4 Crore turnover
                                    corporateRate = 0.25; // 25% for companies with turnover ≤ ₹400 Crore
                                  }
                                  
                                  // Calculate basic corporate tax
                                  const basicTax = taxableIncome * corporateRate;
                                  
                                  // Calculate MAT (Minimum Alternate Tax) - 15% of book profit
                                  const matRate = 0.15;
                                  const bookProfit = taxableIncome; // Simplified calculation
                                  const matTax = bookProfit * matRate;
                                  
                                  // Tax payable is higher of corporate tax and MAT
                                  const taxPayable = Math.max(basicTax, matTax);
                                  
                                  // Add surcharge if applicable
                                  let surcharge = 0;
                                  if (taxableIncome > 10000000) { // ₹1 Crore
                                    surcharge = taxPayable * 0.07; // 7% surcharge
                                  } else if (taxableIncome > 100000000) { // ₹10 Crore  
                                    surcharge = taxPayable * 0.12; // 12% surcharge
                                  }
                                  
                                  // Add Health & Education Cess - 4%
                                  const cess = (taxPayable + surcharge) * 0.04;
                                  
                                  const totalTax = taxPayable + surcharge + cess;
                                  
                                  // Calculate remaining tax after advance tax and TDS
                                  const advanceTaxPaid = Number(companyTaxData.advanceTaxPaid || 0);
                                  const tdsDeducted = Number(companyTaxData.tdsDeducted || 0);
                                  const remainingTax = Math.max(0, totalTax - advanceTaxPaid - tdsDeducted);
                                  
                                  toast({
                                    title: "Company Tax Calculation Complete",
                                    description: `Taxable Income: ₹${taxableIncome.toLocaleString()}, Total Tax: ₹${totalTax.toLocaleString()}, Remaining: ₹${remainingTax.toLocaleString()}`,
                                  });
                                }}
                                className="flex-1"
                              >
                                <Calculator className="h-4 w-4 mr-2" />
                                Calculate Corporate Tax
                              </Button>
                              <Button 
                                onClick={() => {
                                  toast({
                                    title: "Company Tax Report Generated",
                                    description: "Your company tax calculation report has been generated for download.",
                                  });
                                }}
                                className="flex-1"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download PDF
                              </Button>
                              <Button 
                                variant="outline"
                                onClick={() => {
                                  toast({
                                    title: "Company Tax Excel Generated",
                                    description: "Your company tax calculation Excel file has been generated for download.",
                                  });
                                }}
                                className="flex-1"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Export Excel
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
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
                  <p className="text-muted-foreground mb-4">
                    Manage GST calculations and compliance records
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Dialog open={showGSTCalculator} onOpenChange={setShowGSTCalculator}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Calculator className="h-4 w-4 mr-2" />
                          GST Calculator
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>GST Calculator</DialogTitle>
                          <DialogDescription>
                            Calculate GST amount and total with GST
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="base-amount">Base Amount (₹)</Label>
                            <Input 
                              id="base-amount" 
                              type="number" 
                              placeholder="Enter base amount" 
                            />
                          </div>
                          <div>
                            <Label htmlFor="gst-rate">GST Rate (%)</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select GST rate" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">0% (Exempt)</SelectItem>
                                <SelectItem value="5">5%</SelectItem>
                                <SelectItem value="12">12%</SelectItem>
                                <SelectItem value="18">18%</SelectItem>
                                <SelectItem value="28">28%</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="calculated-gst">GST Amount (₹)</Label>
                            <Input type="text" readOnly placeholder="Will be calculated" className="bg-gray-50" />
                          </div>
                          <div>
                            <Label htmlFor="total-amount">Total Amount (₹)</Label>
                            <Input type="text" readOnly placeholder="Will be calculated" className="bg-gray-50 font-semibold" />
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              onClick={() => setShowGSTCalculator(false)}
                              className="flex-1"
                            >
                              Close
                            </Button>
                            <Button 
                              onClick={() => {
                                toast({
                                  title: "GST Calculated",
                                  description: "GST calculation completed successfully.",
                                });
                              }}
                              className="flex-1"
                            >
                              Calculate
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Dialog open={showGSTRecords} onOpenChange={setShowGSTRecords}>
                      <DialogTrigger asChild>
                        <Button>View GST Records</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>GST Records</DialogTitle>
                        <DialogDescription>
                          View and manage your GST transactions and filings
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="gst-period">Period</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select period" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="2024-q4">Q4 2024</SelectItem>
                                <SelectItem value="2024-q3">Q3 2024</SelectItem>
                                <SelectItem value="2024-q2">Q2 2024</SelectItem>
                                <SelectItem value="2024-q1">Q1 2024</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="gst-status">Status</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="All statuses" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="filed">Filed</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="border rounded-lg p-4">
                          <div className="text-center py-8">
                            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-muted-foreground">No GST records found for the selected period</p>
                            <p className="text-sm text-gray-500 mt-2">GST records will appear here once you have transactions with GST</p>
                          </div>
                        </div>
                        <Button 
                          onClick={() => {
                            toast({
                              title: "GST Records",
                              description: "GST records view updated.",
                            });
                            setShowGSTRecords(false);
                          }}
                          className="w-full"
                        >
                          Close
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Bank Import Tab */}
        <TabsContent value="bank-import" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* File Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Bank Statement</CardTitle>
                <CardDescription>Upload Excel (.xlsx) or CSV files to import transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setUploadedFile(file);
                          toast({
                            title: "File Selected",
                            description: `Selected: ${file.name}`,
                          });
                        }
                      }}
                      className="hidden"
                      id="bank-statement-upload"
                      data-testid="file-upload-input"
                    />
                    <label 
                      htmlFor="bank-statement-upload" 
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-lg font-medium">Click to upload bank statement</p>
                      <p className="text-sm text-muted-foreground">Supports Excel (.xlsx) and CSV files</p>
                    </label>
                  </div>
                  
                  {uploadedFile && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-green-800">File Ready to Process</p>
                          <p className="text-sm text-green-600">{uploadedFile.name}</p>
                        </div>
                        <Button
                          onClick={async () => {
                            setIsProcessingFile(true);
                            try {
                              const formData = new FormData();
                              formData.append('bankStatement', uploadedFile);
                              
                              const response = await apiRequest("POST", "/api/financial/import-bank-statement", formData);
                              const result = await response.json();
                              
                              toast({
                                title: "Import Successful",
                                description: `Imported ${result.transactionsCount} transactions. ${result.categorizedCount} automatically categorized.`,
                              });
                              
                              // Refresh transactions and summary
                              queryClient.invalidateQueries({ queryKey: ["/api/financial/transactions"] });
                              queryClient.invalidateQueries({ queryKey: ["/api/financial/dashboard/summary"] });
                              
                              setUploadedFile(null);
                            } catch (error) {
                              toast({
                                title: "Import Failed",
                                description: "Error processing bank statement. Please check file format.",
                                variant: "destructive"
                              });
                            } finally {
                              setIsProcessingFile(false);
                            }
                          }}
                          disabled={isProcessingFile}
                          data-testid="process-file-button"
                        >
                          {isProcessingFile ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <FileText className="h-4 w-4 mr-2" />
                              Process File
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Auto-Categorization Guide */}
            <Card>
              <CardHeader>
                <CardTitle>Auto-Categorization</CardTitle>
                <CardDescription>How we automatically categorize your transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-green-600 mb-2">Income Sources</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Salary transfers → Salary Income</li>
                      <li>• Freelance payments → Business Income</li>
                      <li>• Interest credits → Interest Income</li>
                      <li>• Rental income → House Property</li>
                    </ul>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-red-600 mb-2">Tax Deductions</h4>
                    <ul className="text-sm space-y-1">
                      <li>• PF contributions → Section 80C</li>
                      <li>• Insurance premiums → Section 80D</li>
                      <li>• Mutual fund SIPs → Section 80C</li>
                      <li>• Education loan EMI → Section 80E</li>
                    </ul>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-blue-600 mb-2">Business Expenses</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Office supplies → Business Expense</li>
                      <li>• Travel expenses → Business Travel</li>
                      <li>• Software subscriptions → Office Expense</li>
                      <li>• Professional fees → Professional Service</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Integration with Tax Calculator */}
          <Card>
            <CardHeader>
              <CardTitle>Tax Integration</CardTitle>
              <CardDescription>Automatically populate tax calculator with imported data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium">Smart Tax Calculation</p>
                  <p className="text-sm text-muted-foreground">
                    Import your bank statements and we'll automatically populate your income tax calculator with categorized income and deductions
                  </p>
                </div>
                <Button 
                  onClick={() => {
                    setActiveTab("taxes");
                    toast({
                      title: "Switched to Tax Calculator",
                      description: "Tax calculator will use your imported transaction data.",
                    });
                  }}
                  variant="outline"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Go to Tax Calculator
                </Button>
              </div>
            </CardContent>
          </Card>
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