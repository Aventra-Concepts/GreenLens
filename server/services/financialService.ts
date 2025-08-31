import { db } from "../db";
import { 
  financialTransactions, 
  transactionCategories,
  invoices,
  invoiceItems,
  receipts,
  taxRecords,
  type FinancialTransaction,
  type TransactionCategory,
  type Invoice,
  type InvoiceItem,
  type Receipt,
  type TaxRecord,
  type InsertFinancialTransaction,
  type InsertTransactionCategory,
  type InsertInvoice,
  type InsertInvoiceItem,
  type InsertReceipt,
  type InsertTaxRecord
} from "@shared/schema";
import { eq, and, between, sql, desc, sum, count } from "drizzle-orm";

export class FinancialService {
  // ============================================================================
  // TRANSACTION CATEGORIES
  // ============================================================================
  
  async createCategory(data: InsertTransactionCategory): Promise<TransactionCategory> {
    const [category] = await db
      .insert(transactionCategories)
      .values(data)
      .returning();
    return category;
  }

  async getCategories(type?: 'income' | 'expense'): Promise<TransactionCategory[]> {
    let whereConditions = [eq(transactionCategories.isActive, true)];
    
    if (type) {
      whereConditions.push(eq(transactionCategories.type, type));
    }
    
    return await db
      .select()
      .from(transactionCategories)
      .where(and(...whereConditions))
      .orderBy(transactionCategories.name);
  }

  async updateCategory(id: string, data: Partial<InsertTransactionCategory>): Promise<TransactionCategory> {
    const [category] = await db
      .update(transactionCategories)
      .set(data)
      .where(eq(transactionCategories.id, id))
      .returning();
    return category;
  }

  async deleteCategory(id: string): Promise<void> {
    await db
      .update(transactionCategories)
      .set({ isActive: false })
      .where(eq(transactionCategories.id, id));
  }

  // ============================================================================
  // FINANCIAL TRANSACTIONS
  // ============================================================================

  async createTransaction(data: InsertFinancialTransaction): Promise<FinancialTransaction> {
    // Calculate GST amounts if applicable
    if (data.isGstApplicable && data.gstRate) {
      const baseAmount = Number(data.amount);
      const gstRate = Number(data.gstRate);
      const gstAmount = (baseAmount * gstRate) / 100;
      
      // For intra-state transactions (same state), split into CGST + SGST
      // For inter-state transactions (different state), use IGST
      if (data.isInternational === false) {
        data.cgstAmount = (gstAmount / 2).toString();
        data.sgstAmount = (gstAmount / 2).toString();
        data.igstAmount = '0';
      } else {
        data.igstAmount = gstAmount.toString();
        data.cgstAmount = '0';
        data.sgstAmount = '0';
      }
      
      data.gstAmount = gstAmount.toString();
    }

    const [transaction] = await db
      .insert(financialTransactions)
      .values(data)
      .returning();
    return transaction;
  }

  async getTransactions(filters?: {
    type?: 'income' | 'expense';
    categoryId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ transactions: FinancialTransaction[]; total: number }> {
    let whereConditions = [];
    
    if (filters?.type) {
      whereConditions.push(eq(financialTransactions.type, filters.type));
    }
    
    if (filters?.categoryId) {
      whereConditions.push(eq(financialTransactions.categoryId, filters.categoryId));
    }
    
    if (filters?.startDate && filters?.endDate) {
      whereConditions.push(
        between(financialTransactions.transactionDate, filters.startDate, filters.endDate)
      );
    }
    
    whereConditions.push(eq(financialTransactions.status, 'active'));

    // Get total count
    const [totalResult] = await db
      .select({ total: count() })
      .from(financialTransactions)
      .where(and(...whereConditions));

    // Get transactions with pagination
    let query = db
      .select()
      .from(financialTransactions)
      .where(and(...whereConditions))
      .orderBy(desc(financialTransactions.transactionDate));

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    const transactions = await query;

    return {
      transactions,
      total: totalResult.total
    };
  }

  async getTransactionById(id: string): Promise<FinancialTransaction | null> {
    const [transaction] = await db
      .select()
      .from(financialTransactions)
      .where(eq(financialTransactions.id, id));
    return transaction || null;
  }

  async updateTransaction(id: string, data: Partial<InsertFinancialTransaction>): Promise<FinancialTransaction> {
    const updateData = {
      ...data,
      updatedAt: new Date()
    };
    
    const [transaction] = await db
      .update(financialTransactions)
      .set(updateData)
      .where(eq(financialTransactions.id, id))
      .returning();
    return transaction;
  }

  async deleteTransaction(id: string): Promise<void> {
    await db
      .update(financialTransactions)
      .set({ status: 'deleted', updatedAt: new Date() })
      .where(eq(financialTransactions.id, id));
  }

  // ============================================================================
  // FINANCIAL ANALYTICS
  // ============================================================================

  async getDashboardSummary(startDate?: string, endDate?: string) {
    let whereConditions = [eq(financialTransactions.status, 'active')];
    
    if (startDate && endDate) {
      whereConditions.push(
        between(financialTransactions.transactionDate, startDate, endDate)
      );
    }

    const [result] = await db
      .select({
        totalIncome: sql<number>`COALESCE(SUM(CASE WHEN ${financialTransactions.type} = 'income' THEN ${financialTransactions.amount} ELSE 0 END), 0)`,
        totalExpenses: sql<number>`COALESCE(SUM(CASE WHEN ${financialTransactions.type} = 'expense' THEN ${financialTransactions.amount} ELSE 0 END), 0)`,
        totalGst: sql<number>`COALESCE(SUM(${financialTransactions.gstAmount}), 0)`,
        totalGatewayCharges: sql<number>`COALESCE(SUM(${financialTransactions.gatewayCharges}), 0)`,
        transactionCount: count()
      })
      .from(financialTransactions)
      .where(and(...whereConditions));

    const netProfit = Number(result.totalIncome) - Number(result.totalExpenses);
    const profitMargin = result.totalIncome > 0 ? (netProfit / Number(result.totalIncome)) * 100 : 0;
    const averageTransactionValue = result.transactionCount > 0 ? Number(result.totalIncome) / result.transactionCount : 0;

    return {
      totalIncome: Number(result.totalIncome),
      totalExpenses: Number(result.totalExpenses),
      netProfit,
      totalGst: Number(result.totalGst),
      totalGatewayCharges: Number(result.totalGatewayCharges),
      profitMargin,
      transactionCount: result.transactionCount,
      averageTransactionValue
    };
  }

  async getPeriodAnalytics(startDate: string, endDate: string, period: 'day' | 'month' | 'year') {
    // Simple approach to avoid GROUP BY issues
    const result = await db
      .select({
        transactionDate: financialTransactions.transactionDate,
        type: financialTransactions.type,
        amount: financialTransactions.amount,
        gstAmount: financialTransactions.gstAmount
      })
      .from(financialTransactions)
      .where(
        and(
          between(financialTransactions.transactionDate, startDate, endDate),
          eq(financialTransactions.status, 'active')
        )
      )
      .orderBy(financialTransactions.transactionDate);

    // Group the results in JavaScript to avoid SQL GROUP BY issues
    const grouped = result.reduce((acc: any, row) => {
      let periodKey = row.transactionDate;
      
      if (period === 'month') {
        periodKey = row.transactionDate.substring(0, 7); // YYYY-MM
      } else if (period === 'year') {
        periodKey = row.transactionDate.substring(0, 4); // YYYY
      }
      
      const key = `${periodKey}-${row.type}`;
      
      if (!acc[key]) {
        acc[key] = {
          period: periodKey,
          type: row.type,
          totalAmount: 0,
          transactionCount: 0,
          totalGst: 0
        };
      }
      
      acc[key].totalAmount += Number(row.amount || 0);
      acc[key].transactionCount += 1;
      acc[key].totalGst += Number(row.gstAmount || 0);
      
      return acc;
    }, {});

    return Object.values(grouped);
  }

  async getCategoryWiseAnalytics(startDate?: string, endDate?: string) {
    let whereConditions = [eq(financialTransactions.status, 'active')];
    
    if (startDate && endDate) {
      whereConditions.push(
        between(financialTransactions.transactionDate, startDate, endDate)
      );
    }

    const result = await db
      .select({
        categoryId: financialTransactions.categoryId,
        categoryName: transactionCategories.name,
        categoryType: transactionCategories.type,
        totalAmount: sum(financialTransactions.amount),
        transactionCount: count(),
        avgAmount: sql`AVG(${financialTransactions.amount})`
      })
      .from(financialTransactions)
      .innerJoin(transactionCategories, eq(financialTransactions.categoryId, transactionCategories.id))
      .where(and(...whereConditions))
      .groupBy(
        financialTransactions.categoryId,
        transactionCategories.name,
        transactionCategories.type
      )
      .orderBy(desc(sum(financialTransactions.amount)));

    return result;
  }

  // ============================================================================
  // INVOICES
  // ============================================================================

  async createInvoice(invoiceData: InsertInvoice, items: InsertInvoiceItem[]): Promise<Invoice> {
    return await db.transaction(async (tx) => {
      // Create invoice
      const [invoice] = await tx
        .insert(invoices)
        .values({
          ...invoiceData,
          balanceAmount: invoiceData.totalAmount
        })
        .returning();

      // Create invoice items
      const itemsWithInvoiceId = items.map(item => ({
        ...item,
        invoiceId: invoice.id,
        amount: (Number(item.quantity) * Number(item.unitPrice)).toString()
      }));

      await tx.insert(invoiceItems).values(itemsWithInvoiceId);

      return invoice;
    });
  }

  async getInvoices(filters?: { status?: string; limit?: number; offset?: number }) {
    let whereConditions = [];
    
    if (filters?.status) {
      whereConditions.push(eq(invoices.status, filters.status));
    }
    
    let query = db.select().from(invoices);
    
    if (whereConditions.length > 0) {
      query = query.where(and(...whereConditions));
    }
    
    query = query.orderBy(desc(invoices.createdAt));
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    return await query;
  }

  async getInvoiceById(id: string): Promise<Invoice | null> {
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, id));
    return invoice || null;
  }

  async updateInvoice(id: string, data: Partial<InsertInvoice>): Promise<Invoice> {
    const [invoice] = await db
      .update(invoices)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(invoices.id, id))
      .returning();
    return invoice;
  }

  async updateInvoiceStatus(id: string, status: string, paidAmount?: number): Promise<Invoice> {
    const updateData: any = {
      status,
      updatedAt: new Date()
    };
    
    if (paidAmount !== undefined) {
      updateData.paidAmount = paidAmount.toString();
      
      // Calculate balance amount
      const invoice = await this.getInvoiceById(id);
      if (invoice) {
        const totalAmount = Number(invoice.totalAmount);
        updateData.balanceAmount = (totalAmount - paidAmount).toString();
      }
    }

    const [invoice] = await db
      .update(invoices)
      .set(updateData)
      .where(eq(invoices.id, id))
      .returning();
    return invoice;
  }

  // ============================================================================
  // RECEIPTS
  // ============================================================================

  async createReceipt(data: InsertReceipt): Promise<Receipt> {
    const [receipt] = await db
      .insert(receipts)
      .values(data)
      .returning();
    return receipt;
  }

  async getReceipts(filters?: { limit?: number; offset?: number }) {
    let query = db.select().from(receipts).orderBy(desc(receipts.createdAt));
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    return await query;
  }

  async getReceiptById(id: string): Promise<Receipt | null> {
    const [receipt] = await db
      .select()
      .from(receipts)
      .where(eq(receipts.id, id));
    return receipt || null;
  }

  // ============================================================================
  // TAX CALCULATIONS
  // ============================================================================

  async calculateIncomeTax(taxableIncome: number, assessmentYear: string): Promise<{
    taxableIncome: number;
    assessmentYear: string;
    taxSlabs: Array<{
      slabFrom: number;
      slabTo: number;
      rate: number;
      taxAmount: number;
    }>;
    totalTax: number;
    effectiveRate: number;
    marginalRate: number;
  }> {
    // Indian tax slabs for 2023-24 (new regime)
    const taxSlabs = [
      { slabFrom: 0, slabTo: 300000, rate: 0 },
      { slabFrom: 300000, slabTo: 600000, rate: 5 },
      { slabFrom: 600000, slabTo: 900000, rate: 10 },
      { slabFrom: 900000, slabTo: 1200000, rate: 15 },
      { slabFrom: 1200000, slabTo: 1500000, rate: 20 },
      { slabFrom: 1500000, slabTo: Infinity, rate: 30 }
    ];

    let totalTax = 0;
    let remainingIncome = taxableIncome;
    let marginalRate = 0;

    const taxSlabsWithTax = taxSlabs.map(slab => {
      let taxableAtThisSlab = 0;
      let taxAtThisSlab = 0;

      if (remainingIncome > 0) {
        const slabWidth = slab.slabTo - slab.slabFrom;
        taxableAtThisSlab = Math.min(remainingIncome, slabWidth);
        taxAtThisSlab = (taxableAtThisSlab * slab.rate) / 100;
        totalTax += taxAtThisSlab;
        remainingIncome -= taxableAtThisSlab;

        if (taxableAtThisSlab > 0) {
          marginalRate = slab.rate;
        }
      }

      return {
        slabFrom: slab.slabFrom,
        slabTo: slab.slabTo === Infinity ? 999999999 : slab.slabTo,
        rate: slab.rate,
        taxAmount: taxAtThisSlab
      };
    });

    const effectiveRate = taxableIncome > 0 ? (totalTax / taxableIncome) * 100 : 0;

    return {
      taxableIncome,
      assessmentYear,
      taxSlabs: taxSlabsWithTax,
      totalTax,
      effectiveRate,
      marginalRate
    };
  }

  async calculateGST(amount: number, gstRate: number, isInterState: boolean = false): Promise<{
    baseAmount: number;
    gstRate: number;
    gstAmount: number;
    cgstAmount: number;
    sgstAmount: number;
    igstAmount: number;
    totalAmount: number;
    isInterState: boolean;
  }> {
    const gstAmount = (amount * gstRate) / 100;
    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    if (isInterState) {
      igstAmount = gstAmount;
    } else {
      cgstAmount = gstAmount / 2;
      sgstAmount = gstAmount / 2;
    }

    return {
      baseAmount: amount,
      gstRate,
      gstAmount,
      cgstAmount,
      sgstAmount,
      igstAmount,
      totalAmount: amount + gstAmount,
      isInterState
    };
  }

  // Alias method for route compatibility
  async getTransactionsByPeriod(period: 'day' | 'month' | 'year', startDate: string, endDate: string) {
    return this.getPeriodAnalytics(startDate, endDate, period);
  }

  // Additional methods called by routes
  async getTopExpenseCategories(limit: number = 10, startDate?: string, endDate?: string) {
    let whereConditions = [
      eq(financialTransactions.status, 'active'),
      eq(financialTransactions.type, 'expense')
    ];
    
    if (startDate && endDate) {
      whereConditions.push(
        between(financialTransactions.transactionDate, startDate, endDate)
      );
    }

    const result = await db
      .select({
        categoryId: financialTransactions.categoryId,
        categoryName: transactionCategories.name,
        totalAmount: sum(financialTransactions.amount),
        transactionCount: count()
      })
      .from(financialTransactions)
      .innerJoin(transactionCategories, eq(financialTransactions.categoryId, transactionCategories.id))
      .where(and(...whereConditions))
      .groupBy(financialTransactions.categoryId, transactionCategories.name)
      .orderBy(desc(sum(financialTransactions.amount)))
      .limit(limit);

    return result;
  }

  async getMonthlyTrends(startDate: string, endDate: string) {
    const result = await db
      .select({
        month: sql`TO_CHAR(${financialTransactions.transactionDate}, 'YYYY-MM')`,
        income: sql<number>`COALESCE(SUM(CASE WHEN ${financialTransactions.type} = 'income' THEN ${financialTransactions.amount} ELSE 0 END), 0)`,
        expenses: sql<number>`COALESCE(SUM(CASE WHEN ${financialTransactions.type} = 'expense' THEN ${financialTransactions.amount} ELSE 0 END), 0)`,
        transactionCount: count()
      })
      .from(financialTransactions)
      .where(
        and(
          between(financialTransactions.transactionDate, startDate, endDate),
          eq(financialTransactions.status, 'active')
        )
      )
      .groupBy(sql`TO_CHAR(${financialTransactions.transactionDate}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${financialTransactions.transactionDate}, 'YYYY-MM')`);

    return result.map(row => ({
      ...row,
      netProfit: Number(row.income) - Number(row.expenses)
    }));
  }

  // ============================================================================
  // TAX RECORDS
  // ============================================================================

  async createTaxRecord(data: InsertTaxRecord): Promise<TaxRecord> {
    const [taxRecord] = await db
      .insert(taxRecords)
      .values(data)
      .returning();
    return taxRecord;
  }

  async getTaxRecords(filters?: { 
    taxType?: string; 
    assessmentYear?: string;
    limit?: number; 
    offset?: number;
  }) {
    let whereConditions = [];
    
    if (filters?.taxType) {
      whereConditions.push(eq(taxRecords.taxType, filters.taxType));
    }
    
    if (filters?.assessmentYear) {
      whereConditions.push(eq(taxRecords.assessmentYear, filters.assessmentYear));
    }

    let query = db.select().from(taxRecords);
    
    if (whereConditions.length > 0) {
      query = query.where(and(...whereConditions));
    }
    
    query = query.orderBy(desc(taxRecords.createdAt));
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    return await query;
  }

  // ============================================================================
  // PDF GENERATION (Stub methods - will need implementation)
  // ============================================================================

  async generateInvoicePDF(invoiceId: string): Promise<Buffer> {
    // Placeholder - would use Puppeteer to generate PDF
    const invoice = await this.getInvoiceById(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    
    // For now, return empty buffer - full PDF implementation would be here
    return Buffer.from('PDF content placeholder');
  }

  async generateReceiptPDF(receiptId: string): Promise<Buffer> {
    // Placeholder - would use Puppeteer to generate PDF
    const receipt = await this.getReceiptById(receiptId);
    if (!receipt) {
      throw new Error('Receipt not found');
    }
    
    // For now, return empty buffer - full PDF implementation would be here
    return Buffer.from('PDF content placeholder');
  }

  // ============================================================================
  // GST RECORDS
  // ============================================================================

  async createGSTRecord(data: any) {
    // Placeholder for GST record creation
    return { id: 'gst-' + Date.now(), ...data };
  }

  async getGSTSummary(startDate?: string, endDate?: string) {
    let whereConditions = [eq(financialTransactions.status, 'active')];
    
    if (startDate && endDate) {
      whereConditions.push(
        between(financialTransactions.transactionDate, startDate, endDate)
      );
    }

    const [result] = await db
      .select({
        totalGST: sql<number>`COALESCE(SUM(${financialTransactions.gstAmount}), 0)`,
        totalCGST: sql<number>`COALESCE(SUM(${financialTransactions.cgstAmount}), 0)`,
        totalSGST: sql<number>`COALESCE(SUM(${financialTransactions.sgstAmount}), 0)`,
        totalIGST: sql<number>`COALESCE(SUM(${financialTransactions.igstAmount}), 0)`,
        transactionCount: count()
      })
      .from(financialTransactions)
      .where(and(...whereConditions));

    return {
      totalGST: Number(result.totalGST),
      totalCGST: Number(result.totalCGST),
      totalSGST: Number(result.totalSGST),
      totalIGST: Number(result.totalIGST),
      transactionCount: result.transactionCount
    };
  }

  // ============================================================================
  // ADDITIONAL METHODS
  // ============================================================================

  async getFinancialSummary(startDate?: string, endDate?: string) {
    return this.getDashboardSummary(startDate, endDate);
  }

  async getInternationalTransactions(filters?: { limit?: number; offset?: number }) {
    let whereConditions = [
      eq(financialTransactions.status, 'active'),
      eq(financialTransactions.isInternational, true)
    ];

    let query = db.select().from(financialTransactions).where(and(...whereConditions));
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    return await query;
  }

  async getGatewayChargesSummary(startDate?: string, endDate?: string) {
    let whereConditions = [eq(financialTransactions.status, 'active')];
    
    if (startDate && endDate) {
      whereConditions.push(
        between(financialTransactions.transactionDate, startDate, endDate)
      );
    }

    const result = await db
      .select({
        gatewayProvider: financialTransactions.gatewayProvider,
        totalCharges: sum(financialTransactions.gatewayCharges),
        transactionCount: count()
      })
      .from(financialTransactions)
      .where(and(...whereConditions))
      .groupBy(financialTransactions.gatewayProvider)
      .orderBy(desc(sum(financialTransactions.gatewayCharges)));

    return result;
  }

  async getInternationalTransactionSummary(startDate?: string, endDate?: string) {
    let whereConditions = [
      eq(financialTransactions.status, 'active'),
      eq(financialTransactions.isInternational, true)
    ];
    
    if (startDate && endDate) {
      whereConditions.push(
        between(financialTransactions.transactionDate, startDate, endDate)
      );
    }

    const [result] = await db
      .select({
        totalTransactions: count(),
        totalAmount: sum(financialTransactions.amount),
        totalForeignAmount: sum(financialTransactions.foreignAmount)
      })
      .from(financialTransactions)
      .where(and(...whereConditions));

    return {
      totalTransactions: result.totalTransactions,
      totalAmount: Number(result.totalAmount || 0),
      totalForeignAmount: Number(result.totalForeignAmount || 0)
    };
  }

  async getPaymentGatewayComparison(startDate?: string, endDate?: string) {
    let whereConditions = [eq(financialTransactions.status, 'active')];
    
    if (startDate && endDate) {
      whereConditions.push(
        between(financialTransactions.transactionDate, startDate, endDate)
      );
    }

    const result = await db
      .select({
        gatewayProvider: financialTransactions.gatewayProvider,
        totalAmount: sum(financialTransactions.amount),
        totalCharges: sum(financialTransactions.gatewayCharges),
        transactionCount: count(),
        avgTransactionAmount: sql`AVG(${financialTransactions.amount})`,
        avgChargesPerTransaction: sql`AVG(${financialTransactions.gatewayCharges})`
      })
      .from(financialTransactions)
      .where(and(...whereConditions))
      .groupBy(financialTransactions.gatewayProvider)
      .orderBy(desc(count()));

    return result;
  }
}

export const financialService = new FinancialService();