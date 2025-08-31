import { Router } from "express";
import { financialService } from "../services/financialService";
import { 
  insertTransactionCategorySchema,
  insertFinancialTransactionSchema,
  insertInvoiceSchema,
  insertInvoiceItemSchema,
  insertReceiptSchema,
  insertTaxRecordSchema
} from "@shared/schema";
import { z } from "zod";

const router = Router();

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Simple auth middleware - in production, use proper authentication
const requireAuth = (req: any, res: any, next: any) => {
  // For now, skip auth for development - add proper auth later
  next();
};

// ============================================================================
// TRANSACTION CATEGORIES
// ============================================================================

router.post("/categories", requireAuth, async (req, res) => {
  try {
    const data = insertTransactionCategorySchema.parse(req.body);
    const category = await financialService.createCategory(data);
    res.json(category);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/categories", requireAuth, async (req, res) => {
  try {
    const { type } = req.query;
    const categories = await financialService.getCategories(type as any);
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/categories/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const data = insertTransactionCategorySchema.partial().parse(req.body);
    const category = await financialService.updateCategory(id, data);
    res.json(category);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/categories/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await financialService.deleteCategory(id);
    res.json({ message: "Category deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// FINANCIAL TRANSACTIONS
// ============================================================================

router.post("/transactions", requireAuth, async (req, res) => {
  try {
    const data = insertFinancialTransactionSchema.parse(req.body);
    const transaction = await financialService.createTransaction(data);
    res.json(transaction);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/transactions", requireAuth, async (req, res) => {
  try {
    const { type, categoryId, startDate, endDate, limit, offset } = req.query;
    
    const filters = {
      type: type as any,
      categoryId: categoryId as string,
      startDate: startDate as string,
      endDate: endDate as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined
    };

    const result = await financialService.getTransactions(filters);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/transactions/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await financialService.getTransactionById(id);
    
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    
    res.json(transaction);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/transactions/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const data = insertFinancialTransactionSchema.partial().parse(req.body);
    const transaction = await financialService.updateTransaction(id, data);
    res.json(transaction);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/transactions/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await financialService.deleteTransaction(id);
    res.json({ message: "Transaction deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// ANALYTICS & DASHBOARD
// ============================================================================

router.get("/dashboard/summary", requireAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const summary = await financialService.getDashboardSummary(
      startDate as string,
      endDate as string
    );
    res.json(summary);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/analytics/period", requireAuth, async (req, res) => {
  try {
    const { period, startDate, endDate } = req.query;
    
    if (!period || !startDate || !endDate) {
      return res.status(400).json({ error: "Period, startDate, and endDate are required" });
    }

    const analytics = await financialService.getTransactionsByPeriod(
      period as any,
      startDate as string,
      endDate as string
    );
    res.json(analytics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/analytics/categories", requireAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const analytics = await financialService.getCategoryWiseAnalytics(
      startDate as string,
      endDate as string
    );
    res.json(analytics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// INVOICES
// ============================================================================

const createInvoiceSchema = z.object({
  invoice: insertInvoiceSchema,
  items: z.array(insertInvoiceItemSchema)
});

router.post("/invoices", requireAuth, async (req, res) => {
  try {
    const { invoice: invoiceData, items } = createInvoiceSchema.parse(req.body);
    const invoice = await financialService.createInvoice(invoiceData, items);
    res.json(invoice);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/invoices", requireAuth, async (req, res) => {
  try {
    const { status, limit, offset } = req.query;
    
    const filters = {
      status: status as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined
    };

    const invoices = await financialService.getInvoices(filters);
    res.json(invoices);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/invoices/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const invoiceData = await financialService.getInvoiceById(id);
    
    if (!invoiceData) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    
    res.json(invoiceData);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/invoices/:id/status", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paidAmount } = req.body;
    
    const invoice = await financialService.updateInvoiceStatus(id, status, paidAmount);
    res.json(invoice);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================================================
// RECEIPTS
// ============================================================================

router.post("/receipts", requireAuth, async (req, res) => {
  try {
    const data = insertReceiptSchema.parse(req.body);
    const receipt = await financialService.createReceipt(data);
    res.json(receipt);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/receipts", requireAuth, async (req, res) => {
  try {
    const { limit, offset } = req.query;
    
    const filters = {
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined
    };

    const receipts = await financialService.getReceipts(filters);
    res.json(receipts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/receipts/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const receipt = await financialService.getReceiptById(id);
    
    if (!receipt) {
      return res.status(404).json({ error: "Receipt not found" });
    }
    
    res.json(receipt);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// TAX CALCULATIONS
// ============================================================================

router.post("/tax/income-tax/calculate", requireAuth, async (req, res) => {
  try {
    const { taxableIncome, assessmentYear } = req.body;
    
    if (!taxableIncome || !assessmentYear) {
      return res.status(400).json({ error: "Taxable income and assessment year are required" });
    }

    const calculation = await financialService.calculateIncomeTax(
      parseFloat(taxableIncome),
      assessmentYear
    );
    res.json(calculation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/tax/gst/calculate", requireAuth, async (req, res) => {
  try {
    const { amount, gstRate, isInterState } = req.body;
    
    if (!amount || !gstRate) {
      return res.status(400).json({ error: "Amount and GST rate are required" });
    }

    const calculation = await financialService.calculateGST(
      parseFloat(amount),
      parseFloat(gstRate),
      isInterState === true
    );
    res.json(calculation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// TAX RECORDS
// ============================================================================

router.post("/tax-records", requireAuth, async (req, res) => {
  try {
    const data = insertTaxRecordSchema.parse(req.body);
    const taxRecord = await financialService.createTaxRecord(data);
    res.json(taxRecord);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/tax-records", requireAuth, async (req, res) => {
  try {
    const { taxType, taxPeriod, assessmentYear, limit } = req.query;
    
    const filters = {
      taxType: taxType as string,
      taxPeriod: taxPeriod as string,
      assessmentYear: assessmentYear as string,
      limit: limit ? parseInt(limit as string) : undefined
    };

    const taxRecords = await financialService.getTaxRecords(filters);
    res.json(taxRecords);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// PDF GENERATION ROUTES
// ============================================================================

router.get("/invoices/:id/pdf", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const pdfBuffer = await financialService.generateInvoicePDF(id);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${id}.pdf"`);
    res.send(pdfBuffer);
  } catch (error: any) {
    console.error("PDF generation error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/receipts/:id/pdf", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const pdfBuffer = await financialService.generateReceiptPDF(id);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="receipt-${id}.pdf"`);
    res.send(pdfBuffer);
  } catch (error: any) {
    console.error("PDF generation error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// ENHANCED TAX CALCULATIONS
// ============================================================================

router.post("/tax/income-tax-calculation", requireAuth, async (req, res) => {
  try {
    const { grossIncome, assessmentYear } = req.body;
    
    if (!grossIncome || grossIncome < 0) {
      return res.status(400).json({ error: "Valid gross income is required" });
    }
    
    const calculation = await financialService.calculateIncomeTax(
      parseFloat(grossIncome), 
      assessmentYear
    );
    res.json(calculation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/tax/enhanced-gst-calculation", requireAuth, async (req, res) => {
  try {
    const { baseAmount, gstRate } = req.body;
    
    if (!baseAmount || baseAmount < 0) {
      return res.status(400).json({ error: "Valid base amount is required" });
    }
    
    const calculation = await financialService.calculateGST(
      parseFloat(baseAmount), 
      gstRate ? parseFloat(gstRate) : 18
    );
    res.json(calculation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/tax/gst-record", requireAuth, async (req, res) => {
  try {
    const data = req.body;
    const gstRecord = await financialService.createGSTRecord(data);
    res.json(gstRecord);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/tax/gst-summary", requireAuth, async (req, res) => {
  try {
    const { startDate, endDate, gstNumber, quarterYear } = req.query;
    
    const filters = {
      startDate: startDate as string,
      endDate: endDate as string,
      gstNumber: gstNumber as string,
      quarterYear: quarterYear as string
    };
    
    const summary = await financialService.getGSTSummary(
      startDate as string,
      endDate as string
    );
    res.json(summary);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// ANALYTICS AND REPORTING ROUTES
// ============================================================================

router.get("/dashboard/summary", requireAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const summary = await financialService.getFinancialSummary(
      startDate as string, 
      endDate as string
    );
    res.json(summary);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/analytics/period", requireAuth, async (req, res) => {
  try {
    const { period, startDate, endDate } = req.query;
    
    if (!period || !['day', 'month', 'year'].includes(period as string)) {
      return res.status(400).json({ error: "Valid period (day/month/year) is required" });
    }
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Start date and end date are required" });
    }
    
    const analytics = await financialService.getPeriodAnalytics(
      startDate as string,
      endDate as string,
      period as 'day' | 'month' | 'year'
    );
    res.json(analytics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/analytics/categories", requireAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const analytics = await financialService.getCategoryWiseAnalytics(
      startDate as string,
      endDate as string
    );
    res.json(analytics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/analytics/monthly-trends", requireAuth, async (req, res) => {
  try {
    const { year } = req.query;
    const startDate = year ? `${year}-01-01` : '2024-01-01';
    const endDate = year ? `${year}-12-31` : '2024-12-31';
    const trends = await financialService.getMonthlyTrends(startDate, endDate);
    res.json(trends);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/analytics/top-expense-categories", requireAuth, async (req, res) => {
  try {
    const { limit = 10, startDate, endDate } = req.query;
    const topCategories = await financialService.getTopExpenseCategories(
      parseInt(limit as string),
      startDate as string,
      endDate as string
    );
    res.json(topCategories);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// INTERNATIONAL TRANSACTIONS
// ============================================================================

router.get("/international-transactions", requireAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const transactions = await financialService.getInternationalTransactions();
    res.json(transactions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// GATEWAY CHARGES
// ============================================================================

router.get("/gateway-charges/summary", requireAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const summary = await financialService.getGatewayChargesSummary(
      startDate as string,
      endDate as string
    );
    res.json(summary);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/international-transactions/summary", requireAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const summary = await financialService.getInternationalTransactionSummary(
      startDate as string,
      endDate as string
    );
    res.json(summary);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/gateway-charges/comparison", requireAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const comparison = await financialService.getPaymentGatewayComparison(
      startDate as string,
      endDate as string
    );
    res.json(comparison);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export { router as financialRoutes };