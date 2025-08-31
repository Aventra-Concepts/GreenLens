import { db } from "../db";
import { 
  financialTransactions, 
  transactionCategories,
  invoices,
  invoiceItems,
  receipts,
  taxRecords,
  financialSettings,
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
import { eq, and, between, sql, desc, asc, sum, count } from "drizzle-orm";

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
    let baseQuery = db
      .select()
      .from(financialTransactions)
      .where(and(...whereConditions))
      .orderBy(desc(financialTransactions.transactionDate));

    if (filters?.limit) {
      baseQuery = baseQuery.limit(filters.limit);
    }
    
    if (filters?.offset) {
      baseQuery = baseQuery.offset(filters.offset);
    }

    const transactions = await baseQuery;

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

    // Get total income
    const [incomeResult] = await db
      .select({ total: sum(financialTransactions.amount) })
      .from(financialTransactions)
      .where(and(...whereConditions, eq(financialTransactions.type, 'income')));

    // Get total expenses
    const [expenseResult] = await db
      .select({ total: sum(financialTransactions.amount) })
      .from(financialTransactions)
      .where(and(...whereConditions, eq(financialTransactions.type, 'expense')));

    // Get total GST collected
    const [gstResult] = await db
      .select({ total: sum(financialTransactions.gstAmount) })
      .from(financialTransactions)
      .where(and(...whereConditions, eq(financialTransactions.isGstApplicable, true)));

    // Get gateway charges
    const [gatewayResult] = await db
      .select({ total: sum(financialTransactions.gatewayCharges) })
      .from(financialTransactions)
      .where(and(...whereConditions));

    const totalIncome = Number(incomeResult.total || 0);
    const totalExpenses = Number(expenseResult.total || 0);
    const totalGst = Number(gstResult.total || 0);
    const totalGatewayCharges = Number(gatewayResult.total || 0);

    return {
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      totalGst,
      totalGatewayCharges,
      profitMargin: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0
    };
  }

  async getTransactionsByPeriod(period: 'day' | 'month' | 'year', startDate: string, endDate: string) {
    let dateFormat: string;
    
    switch (period) {
      case 'day':
        dateFormat = 'YYYY-MM-DD';
        break;
      case 'month':
        dateFormat = 'YYYY-MM';
        break;
      case 'year':
        dateFormat = 'YYYY';
        break;
    }

    const result = await db
      .select({
        period: sql`TO_CHAR(${financialTransactions.transactionDate}, ${dateFormat})`,
        type: financialTransactions.type,
        totalAmount: sum(financialTransactions.amount),
        transactionCount: count(),
        totalGst: sum(financialTransactions.gstAmount)
      })
      .from(financialTransactions)
      .where(
        and(
          between(financialTransactions.transactionDate, startDate, endDate),
          eq(financialTransactions.status, 'active')
        )
      )
      .groupBy(
        sql`TO_CHAR(${financialTransactions.transactionDate}, ${dateFormat})`,
        financialTransactions.type
      )
      .orderBy(sql`TO_CHAR(${financialTransactions.transactionDate}, ${dateFormat})`);

    return result;
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
    
    let baseQuery = db.select().from(invoices);
    
    if (whereConditions.length > 0) {
      baseQuery = baseQuery.where(and(...whereConditions));
    }
    
    baseQuery = baseQuery.orderBy(desc(invoices.createdAt));
    
    if (filters?.limit) {
      baseQuery = baseQuery.limit(filters.limit);
    }
    
    if (filters?.offset) {
      baseQuery = baseQuery.offset(filters.offset);
    }

    return await baseQuery;
  }

  async getInvoiceById(id: string): Promise<{ invoice: Invoice; items: InvoiceItem[] } | null> {
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, id));

    if (!invoice) return null;

    const items = await db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, id));

    return { invoice, items };
  }

  async updateInvoiceStatus(id: string, status: string, paidAmount?: string): Promise<Invoice> {
    let updateData: any = { status, updatedAt: new Date() };
    
    if (paidAmount) {
      updateData.paidAmount = paidAmount;
      updateData.balanceAmount = sql`${invoices.totalAmount} - ${paidAmount}`;
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
    let baseQuery = db.select().from(receipts).orderBy(desc(receipts.createdAt));
    
    if (filters?.limit) {
      baseQuery = baseQuery.limit(filters.limit);
    }
    
    if (filters?.offset) {
      baseQuery = baseQuery.offset(filters.offset);
    }

    return await baseQuery;
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
    taxAmount: number;
    taxRate: number;
    details: any;
  }> {
    // Simplified Indian Income Tax calculation for AY 2024-25
    // This should be made configurable via financial settings
    
    let taxAmount = 0;
    let details: any = { slabs: [] };
    
    const taxSlabs = [
      { from: 0, to: 250000, rate: 0 },
      { from: 250000, to: 500000, rate: 5 },
      { from: 500000, to: 1000000, rate: 20 },
      { from: 1000000, to: Infinity, rate: 30 }
    ];
    
    for (const slab of taxSlabs) {
      if (taxableIncome > slab.from) {
        const taxableAmountInSlab = Math.min(taxableIncome, slab.to) - slab.from;
        const taxInSlab = (taxableAmountInSlab * slab.rate) / 100;
        taxAmount += taxInSlab;
        
        details.slabs.push({
          from: slab.from,
          to: slab.to,
          rate: slab.rate,
          taxableAmount: taxableAmountInSlab,
          tax: taxInSlab
        });
      }
    }
    
    // Add cess (4% on tax amount)
    const cess = taxAmount * 0.04;
    taxAmount += cess;
    
    details.cess = cess;
    details.totalTax = taxAmount;
    
    return {
      taxableIncome,
      taxAmount,
      taxRate: taxableIncome > 0 ? (taxAmount / taxableIncome * 100) : 0,
      details
    };
  }

  async calculateGST(amount: number, gstRate: number, isInterState: boolean = false): Promise<{
    baseAmount: number;
    gstRate: number;
    gstAmount: number;
    cgst: number;
    sgst: number;
    igst: number;
    totalAmount: number;
  }> {
    const gstAmount = (amount * gstRate) / 100;
    
    let cgst = 0, sgst = 0, igst = 0;
    
    if (isInterState) {
      igst = gstAmount;
    } else {
      cgst = gstAmount / 2;
      sgst = gstAmount / 2;
    }
    
    return {
      baseAmount: amount,
      gstRate,
      gstAmount,
      cgst,
      sgst,
      igst,
      totalAmount: amount + gstAmount
    };
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
    taxPeriod?: string; 
    assessmentYear?: string;
    limit?: number;
  }) {
    let whereConditions = [];
    
    if (filters?.taxType) {
      whereConditions.push(eq(taxRecords.taxType, filters.taxType));
    }
    
    if (filters?.taxPeriod) {
      whereConditions.push(eq(taxRecords.taxPeriod, filters.taxPeriod));
    }
    
    if (filters?.assessmentYear) {
      whereConditions.push(eq(taxRecords.assessmentYear, filters.assessmentYear));
    }

    let baseQuery = db.select().from(taxRecords);
    
    if (whereConditions.length > 0) {
      baseQuery = baseQuery.where(and(...whereConditions));
    }
    
    baseQuery = baseQuery.orderBy(desc(taxRecords.createdAt));
    
    if (filters?.limit) {
      baseQuery = baseQuery.limit(filters.limit);
    }

    return await baseQuery;
  }

  // ============================================================================
  // INCOME TAX & GST CALCULATIONS
  // ============================================================================
  
  async calculateIncomeTax(grossIncome: number, assessmentYear: string = "2024-25"): Promise<{
    grossIncome: number;
    taxableIncome: number;
    totalTax: number;
    cessAmount: number;
    netIncome: number;
    taxBreakdown: any[];
    effectiveRate: number;
  }> {
    // Standard deduction
    const standardDeduction = 50000;
    const taxableIncome = Math.max(0, grossIncome - standardDeduction);
    
    // Income tax slabs for 2024-25 (New Tax Regime)
    const taxSlabs = [
      { min: 0, max: 300000, rate: 0 },
      { min: 300000, max: 700000, rate: 5 },
      { min: 700000, max: 1000000, rate: 10 },
      { min: 1000000, max: 1200000, rate: 15 },
      { min: 1200000, max: 1500000, rate: 20 },
      { min: 1500000, max: Infinity, rate: 30 }
    ];
    
    let totalTax = 0;
    let remainingIncome = taxableIncome;
    const taxBreakdown = [];
    
    for (const slab of taxSlabs) {
      if (remainingIncome > 0) {
        const slabMax = slab.max === Infinity ? remainingIncome + slab.min : slab.max;
        const taxableInThisSlab = Math.min(remainingIncome, slabMax - slab.min);
        const taxInThisSlab = (taxableInThisSlab * slab.rate) / 100;
        
        if (taxableInThisSlab > 0) {
          taxBreakdown.push({
            slabRange: `₹${slab.min.toLocaleString()} - ${slab.max === Infinity ? 'Above' : '₹' + slab.max.toLocaleString()}`,
            rate: slab.rate,
            taxableAmount: taxableInThisSlab,
            taxAmount: taxInThisSlab
          });
          
          totalTax += taxInThisSlab;
          remainingIncome -= taxableInThisSlab;
        }
      }
    }
    
    // Health and Education Cess (4% on total tax)
    const cessAmount = totalTax * 0.04;
    const totalWithCess = totalTax + cessAmount;
    const netIncome = grossIncome - totalWithCess;
    const effectiveRate = grossIncome > 0 ? (totalWithCess / grossIncome) * 100 : 0;
    
    return {
      grossIncome,
      taxableIncome,
      totalTax,
      cessAmount,
      netIncome,
      taxBreakdown,
      effectiveRate
    };
  }

  async calculateGST(baseAmount: number, gstRate: number = 18): Promise<{
    baseAmount: number;
    gstRate: number;
    gstAmount: number;
    totalAmount: number;
    cgstAmount: number;
    sgstAmount: number;
    igstAmount: number;
    isInterState: boolean;
  }> {
    const gstAmount = (baseAmount * gstRate) / 100;
    const totalAmount = baseAmount + gstAmount;
    
    // For intra-state: CGST + SGST, for inter-state: IGST
    const isInterState = false; // This should be determined based on client location
    
    return {
      baseAmount,
      gstRate,
      gstAmount,
      totalAmount,
      cgstAmount: isInterState ? 0 : gstAmount / 2,
      sgstAmount: isInterState ? 0 : gstAmount / 2,
      igstAmount: isInterState ? gstAmount : 0,
      isInterState
    };
  }

  async createGSTRecord(data: {
    transactionId: string;
    gstNumber: string;
    baseAmount: number;
    gstRate: number;
    cgstAmount: number;
    sgstAmount: number;
    igstAmount: number;
    totalGstAmount: number;
    isReverseCharge: boolean;
    placeOfSupply: string;
    hsnsacCode?: string;
  }) {
    const gstRecord = await db
      .insert(gstRecords)
      .values({
        id: generateId(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return gstRecord[0];
  }

  async getGSTSummary(filters?: {
    startDate?: string;
    endDate?: string;
    gstNumber?: string;
    quarterYear?: string;
  }) {
    let whereConditions = [];
    
    if (filters?.startDate && filters?.endDate) {
      whereConditions.push(
        between(gstRecords.createdAt, filters.startDate, filters.endDate)
      );
    }
    
    if (filters?.gstNumber) {
      whereConditions.push(eq(gstRecords.gstNumber, filters.gstNumber));
    }

    const records = await db
      .select()
      .from(gstRecords)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(gstRecords.createdAt));

    const summary = records.reduce((acc, record) => {
      acc.totalBaseAmount += parseFloat(record.baseAmount);
      acc.totalCGST += parseFloat(record.cgstAmount);
      acc.totalSGST += parseFloat(record.sgstAmount);
      acc.totalIGST += parseFloat(record.igstAmount);
      acc.totalGST += parseFloat(record.totalGstAmount);
      return acc;
    }, {
      totalBaseAmount: 0,
      totalCGST: 0,
      totalSGST: 0,
      totalIGST: 0,
      totalGST: 0,
      recordCount: records.length
    });

    return { records, summary };
  }

  // ============================================================================
  // INVOICE AND RECEIPT PDF GENERATION
  // ============================================================================
  
  async generateInvoicePDF(invoiceId: string): Promise<Buffer> {
    const invoiceData = await this.getInvoiceById(invoiceId);
    
    if (!invoiceData) {
      throw new Error("Invoice not found");
    }

    const { invoice, items } = invoiceData;
    
    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.quantity) * parseFloat(item.unitPrice)), 0);
    const totalGst = items.reduce((sum, item) => sum + parseFloat(item.gstAmount), 0);
    const total = subtotal + totalGst;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #4a90e2; padding-bottom: 20px; }
          .company-name { font-size: 28px; font-weight: bold; color: #4a90e2; margin-bottom: 5px; }
          .invoice-title { font-size: 24px; color: #666; }
          .invoice-details { display: flex; justify-content: space-between; margin: 30px 0; }
          .invoice-info, .client-info { width: 45%; }
          .invoice-info h3, .client-info h3 { color: #4a90e2; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
          .items-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
          .items-table th { background-color: #4a90e2; color: white; padding: 12px; text-align: left; }
          .items-table td { padding: 10px; border-bottom: 1px solid #ddd; }
          .items-table tbody tr:nth-child(even) { background-color: #f9f9f9; }
          .totals { text-align: right; margin-top: 20px; }
          .totals table { margin-left: auto; border-collapse: collapse; }
          .totals td { padding: 8px 15px; border-bottom: 1px solid #ddd; }
          .grand-total { font-weight: bold; font-size: 18px; background-color: #4a90e2; color: white; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">Your Company Name</div>
          <div class="invoice-title">INVOICE</div>
        </div>
        
        <div class="invoice-details">
          <div class="invoice-info">
            <h3>Invoice Details</h3>
            <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
            <p><strong>Invoice Date:</strong> ${new Date(invoice.invoiceDate).toLocaleDateString()}</p>
            <p><strong>Due Date:</strong> ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'On Receipt'}</p>
            <p><strong>Status:</strong> ${invoice.status.toUpperCase()}</p>
          </div>
          
          <div class="client-info">
            <h3>Bill To</h3>
            <p><strong>${invoice.clientName}</strong></p>
            <p>${invoice.clientEmail || ''}</p>
            <p>${invoice.clientAddress || ''}</p>
            <p>${invoice.clientPhone || ''}</p>
            ${invoice.clientGstin ? `<p><strong>GSTIN:</strong> ${invoice.clientGstin}</p>` : ''}
          </div>
        </div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>HSN/SAC</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Amount</th>
              <th>GST</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr>
                <td>${item.description}</td>
                <td>${item.hsnSacCode || '-'}</td>
                <td>${item.quantity}</td>
                <td>₹${parseFloat(item.unitPrice).toFixed(2)}</td>
                <td>₹${(parseFloat(item.quantity) * parseFloat(item.unitPrice)).toFixed(2)}</td>
                <td>₹${parseFloat(item.gstAmount).toFixed(2)}</td>
                <td>₹${(parseFloat(item.quantity) * parseFloat(item.unitPrice) + parseFloat(item.gstAmount)).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="totals">
          <table>
            <tr><td>Subtotal:</td><td>₹${subtotal.toFixed(2)}</td></tr>
            <tr><td>Total GST:</td><td>₹${totalGst.toFixed(2)}</td></tr>
            <tr class="grand-total"><td>Grand Total:</td><td>₹${total.toFixed(2)}</td></tr>
          </table>
        </div>
        
        <div class="footer">
          <p>Thank you for your business!</p>
          <p>This is a computer generated invoice.</p>
        </div>
      </body>
      </html>
    `;

    const puppeteer = (await import('puppeteer')).default;
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.setContent(htmlContent);
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
    });
    
    await browser.close();
    return pdfBuffer;
  }

  async generateReceiptPDF(receiptId: string): Promise<Buffer> {
    const receipt = await this.getReceiptById(receiptId);
    
    if (!receipt) {
      throw new Error("Receipt not found");
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #28a745; padding-bottom: 20px; }
          .company-name { font-size: 28px; font-weight: bold; color: #28a745; margin-bottom: 5px; }
          .receipt-title { font-size: 24px; color: #666; }
          .receipt-details { margin: 30px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: bold; color: #666; }
          .detail-value { color: #333; }
          .amount-section { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0; }
          .amount-paid { font-size: 32px; font-weight: bold; color: #28a745; text-align: center; }
          .payment-info { margin-top: 30px; padding: 20px; background-color: #e9f7ef; border-radius: 8px; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; }
          .stamp { position: absolute; top: 100px; right: 50px; transform: rotate(-15deg); border: 3px solid #28a745; color: #28a745; padding: 10px 20px; font-weight: bold; font-size: 18px; }
        </style>
      </head>
      <body>
        <div class="stamp">PAID</div>
        
        <div class="header">
          <div class="company-name">Your Company Name</div>
          <div class="receipt-title">PAYMENT RECEIPT</div>
        </div>
        
        <div class="receipt-details">
          <div class="detail-row">
            <span class="detail-label">Receipt Number:</span>
            <span class="detail-value">${receipt.receiptNumber}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Receipt Date:</span>
            <span class="detail-value">${new Date(receipt.receiptDate).toLocaleDateString()}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Client Name:</span>
            <span class="detail-value">${receipt.clientName}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Payment Method:</span>
            <span class="detail-value">${receipt.paymentMethod}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Transaction Reference:</span>
            <span class="detail-value">${receipt.transactionReference || 'N/A'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Description:</span>
            <span class="detail-value">${receipt.description}</span>
          </div>
        </div>
        
        <div class="amount-section">
          <div style="text-align: center; margin-bottom: 10px; color: #666;">Amount Received</div>
          <div class="amount-paid">₹${parseFloat(receipt.amount).toFixed(2)}</div>
          <div style="text-align: center; margin-top: 10px; color: #666;">
            ${receipt.currency || 'INR'}
          </div>
        </div>
        
        <div class="payment-info">
          <h3 style="color: #28a745; margin-top: 0;">Payment Confirmation</h3>
          <p>We acknowledge the receipt of payment as detailed above. This receipt serves as confirmation of your payment.</p>
          ${receipt.notes ? `<p><strong>Notes:</strong> ${receipt.notes}</p>` : ''}
        </div>
        
        <div class="footer">
          <p>Thank you for your payment!</p>
          <p>This is a computer generated receipt.</p>
          <p style="margin-top: 20px; font-size: 12px;">Generated on: ${new Date().toLocaleDateString()}</p>
        </div>
      </body>
      </html>
    `;

    const puppeteer = (await import('puppeteer')).default;
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.setContent(htmlContent);
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
    });
    
    await browser.close();
    return pdfBuffer;
  }

  // ============================================================================
  // FINANCIAL ANALYTICS AND REPORTING
  // ============================================================================
  
  async getFinancialSummary(startDate?: string, endDate?: string): Promise<{
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    totalGst: number;
    totalGatewayCharges: number;
    profitMargin: number;
    transactionCount: number;
    averageTransactionValue: number;
  }> {
    let whereConditions = [eq(financialTransactions.status, 'active')];
    
    if (startDate && endDate) {
      whereConditions.push(
        between(financialTransactions.transactionDate, startDate, endDate)
      );
    }

    const transactions = await db
      .select()
      .from(financialTransactions)
      .where(and(...whereConditions));

    const summary = transactions.reduce((acc, transaction) => {
      const amount = parseFloat(transaction.amount);
      const gst = parseFloat(transaction.gstAmount || '0');
      const gateway = parseFloat(transaction.gatewayCharges || '0');
      
      if (transaction.type === 'income') {
        acc.totalIncome += amount;
      } else {
        acc.totalExpenses += amount;
      }
      
      acc.totalGst += gst;
      acc.totalGatewayCharges += gateway;
      acc.transactionCount += 1;
      
      return acc;
    }, {
      totalIncome: 0,
      totalExpenses: 0,
      totalGst: 0,
      totalGatewayCharges: 0,
      transactionCount: 0
    });

    const netProfit = summary.totalIncome - summary.totalExpenses;
    const profitMargin = summary.totalIncome > 0 ? (netProfit / summary.totalIncome) * 100 : 0;
    const averageTransactionValue = summary.transactionCount > 0 
      ? (summary.totalIncome + summary.totalExpenses) / summary.transactionCount 
      : 0;

    return {
      ...summary,
      netProfit,
      profitMargin,
      averageTransactionValue
    };
  }

  async getPeriodAnalytics(period: 'day' | 'month' | 'year', startDate: string, endDate: string) {
    let groupByFormat: string;
    let dateFormat: string;
    
    switch (period) {
      case 'day':
        groupByFormat = 'YYYY-MM-DD';
        dateFormat = 'YYYY-MM-DD';
        break;
      case 'month':
        groupByFormat = 'YYYY-MM';
        dateFormat = 'YYYY-MM';
        break;
      case 'year':
        groupByFormat = 'YYYY';
        dateFormat = 'YYYY';
        break;
    }

    const transactions = await db
      .select({
        date: sql`TO_CHAR(${financialTransactions.transactionDate}, '${groupByFormat}')`,
        type: financialTransactions.type,
        amount: financialTransactions.amount,
        gstAmount: financialTransactions.gstAmount,
        gatewayCharges: financialTransactions.gatewayCharges
      })
      .from(financialTransactions)
      .where(
        and(
          eq(financialTransactions.status, 'active'),
          between(financialTransactions.transactionDate, startDate, endDate)
        )
      )
      .orderBy(sql`TO_CHAR(${financialTransactions.transactionDate}, '${groupByFormat}')`);

    // Group and aggregate by period
    const analytics = transactions.reduce((acc: any, transaction: any) => {
      const date = transaction.date;
      
      if (!acc[date]) {
        acc[date] = {
          period: date,
          totalIncome: 0,
          totalExpenses: 0,
          totalGst: 0,
          totalGatewayCharges: 0,
          transactionCount: 0,
          netProfit: 0
        };
      }
      
      const amount = parseFloat(transaction.amount);
      const gst = parseFloat(transaction.gstAmount || '0');
      const gateway = parseFloat(transaction.gatewayCharges || '0');
      
      if (transaction.type === 'income') {
        acc[date].totalIncome += amount;
      } else {
        acc[date].totalExpenses += amount;
      }
      
      acc[date].totalGst += gst;
      acc[date].totalGatewayCharges += gateway;
      acc[date].transactionCount += 1;
      acc[date].netProfit = acc[date].totalIncome - acc[date].totalExpenses;
      
      return acc;
    }, {});

    return Object.values(analytics);
  }

  async getCategoryWiseAnalytics(startDate?: string, endDate?: string) {
    let whereConditions = [eq(financialTransactions.status, 'active')];
    
    if (startDate && endDate) {
      whereConditions.push(
        between(financialTransactions.transactionDate, startDate, endDate)
      );
    }

    const analytics = await db
      .select({
        categoryId: financialTransactions.categoryId,
        type: financialTransactions.type,
        totalAmount: sql`SUM(${financialTransactions.amount})`,
        transactionCount: sql`COUNT(*)`,
        avgAmount: sql`AVG(${financialTransactions.amount})`,
        categoryName: transactionCategories.name
      })
      .from(financialTransactions)
      .leftJoin(transactionCategories, eq(financialTransactions.categoryId, transactionCategories.id))
      .where(and(...whereConditions))
      .groupBy(financialTransactions.categoryId, financialTransactions.type, transactionCategories.name)
      .orderBy(sql`SUM(${financialTransactions.amount}) DESC`);

    return analytics.map(item => ({
      categoryId: item.categoryId,
      categoryName: item.categoryName || 'Uncategorized',
      type: item.type,
      totalAmount: parseFloat(item.totalAmount as string),
      transactionCount: parseInt(item.transactionCount as string),
      averageAmount: parseFloat(item.avgAmount as string)
    }));
  }

  async getMonthlyTrends(year?: number) {
    const targetYear = year || new Date().getFullYear();
    const startDate = `${targetYear}-01-01`;
    const endDate = `${targetYear}-12-31`;

    const monthlyData = await db
      .select({
        month: sql`EXTRACT(MONTH FROM ${financialTransactions.transactionDate})`,
        type: financialTransactions.type,
        totalAmount: sql`SUM(${financialTransactions.amount})`,
        transactionCount: sql`COUNT(*)`
      })
      .from(financialTransactions)
      .where(
        and(
          eq(financialTransactions.status, 'active'),
          between(financialTransactions.transactionDate, startDate, endDate)
        )
      )
      .groupBy(sql`EXTRACT(MONTH FROM ${financialTransactions.transactionDate})`, financialTransactions.type)
      .orderBy(sql`EXTRACT(MONTH FROM ${financialTransactions.transactionDate})`);

    // Initialize 12 months with zero values
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      monthName: new Date(2024, i).toLocaleDateString('en-US', { month: 'long' }),
      totalIncome: 0,
      totalExpenses: 0,
      netProfit: 0,
      transactionCount: 0
    }));

    // Fill with actual data
    monthlyData.forEach((item: any) => {
      const monthIndex = parseInt(item.month) - 1;
      const amount = parseFloat(item.totalAmount);
      const count = parseInt(item.transactionCount);
      
      if (item.type === 'income') {
        months[monthIndex].totalIncome += amount;
      } else {
        months[monthIndex].totalExpenses += amount;
      }
      
      months[monthIndex].transactionCount += count;
      months[monthIndex].netProfit = months[monthIndex].totalIncome - months[monthIndex].totalExpenses;
    });

    return months;
  }

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

    const topCategories = await db
      .select({
        categoryId: financialTransactions.categoryId,
        categoryName: transactionCategories.name,
        totalAmount: sql`SUM(${financialTransactions.amount})`,
        transactionCount: sql`COUNT(*)`
      })
      .from(financialTransactions)
      .leftJoin(transactionCategories, eq(financialTransactions.categoryId, transactionCategories.id))
      .where(and(...whereConditions))
      .groupBy(financialTransactions.categoryId, transactionCategories.name)
      .orderBy(sql`SUM(${financialTransactions.amount}) DESC`)
      .limit(limit);

    return topCategories.map(category => ({
      categoryId: category.categoryId,
      categoryName: category.categoryName || 'Uncategorized',
      totalAmount: parseFloat(category.totalAmount as string),
      transactionCount: parseInt(category.transactionCount as string)
    }));
  }

  // ============================================================================
  // INTERNATIONAL TRANSACTIONS
  // ============================================================================

  async getInternationalTransactions(startDate?: string, endDate?: string) {
    let whereConditions = [
      eq(financialTransactions.status, 'active'),
      eq(financialTransactions.isInternational, true)
    ];
    
    if (startDate && endDate) {
      whereConditions.push(
        between(financialTransactions.transactionDate, startDate, endDate)
      );
    }

    const transactions = await db
      .select()
      .from(financialTransactions)
      .where(and(...whereConditions))
      .orderBy(desc(financialTransactions.transactionDate));

    // Add exchange rate calculations and conversion to INR
    const enhancedTransactions = transactions.map(transaction => {
      const exchangeRate = this.getExchangeRate(transaction.currency);
      const inrAmount = parseFloat(transaction.amount) * exchangeRate;
      
      return {
        ...transaction,
        exchangeRate,
        inrAmount: inrAmount.toFixed(2),
        formattedAmount: this.formatCurrencyAmount(transaction.amount, transaction.currency)
      };
    });

    return enhancedTransactions;
  }

  private getExchangeRate(currency: string): number {
    // In a real application, you would fetch live exchange rates from an API
    // For now, using approximate exchange rates to INR
    const exchangeRates: { [key: string]: number } = {
      'USD': 83.25,
      'EUR': 90.15,
      'GBP': 105.30,
      'AUD': 54.80,
      'SGD': 61.50,
      'AED': 22.65,
      'CAD': 61.20,
      'JPY': 0.56,
      'CNY': 11.45,
      'CHF': 94.20,
      'SEK': 7.85,
      'NOK': 7.70,
      'DKK': 12.10,
      'PLN': 20.50,
      'CZK': 3.55,
      'HUF': 0.23,
      'RON': 18.25,
      'BGN': 46.15,
      'HRK': 12.35,
      'RUB': 0.90,
      'BRL': 15.65,
      'MXN': 4.85,
      'INR': 1.00
    };
    
    return exchangeRates[currency] || 1.00;
  }

  private formatCurrencyAmount(amount: string, currency: string): string {
    const currencySymbols: { [key: string]: string } = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'AUD': 'A$',
      'SGD': 'S$',
      'AED': 'د.إ',
      'CAD': 'C$',
      'JPY': '¥',
      'CNY': '¥',
      'CHF': 'CHF',
      'SEK': 'kr',
      'NOK': 'kr',
      'DKK': 'kr',
      'PLN': 'zł',
      'CZK': 'Kč',
      'HUF': 'Ft',
      'RON': 'lei',
      'BGN': 'лв',
      'HRK': 'kn',
      'RUB': '₽',
      'BRL': 'R$',
      'MXN': '$',
      'INR': '₹'
    };
    
    const symbol = currencySymbols[currency] || currency;
    return `${symbol}${parseFloat(amount).toFixed(2)}`;
  }

  async getInternationalTransactionSummary(startDate?: string, endDate?: string) {
    const transactions = await this.getInternationalTransactions(startDate, endDate);
    
    const summary = transactions.reduce((acc: any, transaction: any) => {
      const currency = transaction.currency;
      const amount = parseFloat(transaction.amount);
      const inrAmount = parseFloat(transaction.inrAmount);
      
      if (!acc.byCurrency[currency]) {
        acc.byCurrency[currency] = {
          currency,
          totalAmount: 0,
          totalInrAmount: 0,
          transactionCount: 0,
          averageExchangeRate: transaction.exchangeRate
        };
      }
      
      acc.byCurrency[currency].totalAmount += amount;
      acc.byCurrency[currency].totalInrAmount += inrAmount;
      acc.byCurrency[currency].transactionCount += 1;
      
      acc.totalInrValue += inrAmount;
      acc.totalTransactions += 1;
      
      return acc;
    }, {
      byCurrency: {},
      totalInrValue: 0,
      totalTransactions: 0
    });

    return {
      ...summary,
      byCurrency: Object.values(summary.byCurrency)
    };
  }

  async getGatewayChargesSummary(startDate?: string, endDate?: string) {
    let whereConditions = [eq(financialTransactions.status, 'active')];
    
    if (startDate && endDate) {
      whereConditions.push(
        between(financialTransactions.transactionDate, startDate, endDate)
      );
    }

    const transactions = await db
      .select({
        paymentGateway: financialTransactions.paymentGateway,
        gatewayCharges: financialTransactions.gatewayCharges,
        currency: financialTransactions.currency,
        amount: financialTransactions.amount,
        type: financialTransactions.type,
        transactionDate: financialTransactions.transactionDate
      })
      .from(financialTransactions)
      .where(and(...whereConditions));

    const summary = transactions.reduce((acc: any, transaction) => {
      const gateway = transaction.paymentGateway || 'Other';
      const charges = parseFloat(transaction.gatewayCharges || '0');
      const amount = parseFloat(transaction.amount);
      
      if (!acc[gateway]) {
        acc[gateway] = {
          gateway,
          totalCharges: 0,
          totalVolume: 0,
          transactionCount: 0,
          averageChargeRate: 0,
          currencies: new Set(),
          monthlyBreakdown: {}
        };
      }
      
      acc[gateway].totalCharges += charges;
      acc[gateway].totalVolume += amount;
      acc[gateway].transactionCount += 1;
      acc[gateway].currencies.add(transaction.currency);
      
      // Monthly breakdown
      const month = new Date(transaction.transactionDate).toISOString().substring(0, 7); // YYYY-MM
      if (!acc[gateway].monthlyBreakdown[month]) {
        acc[gateway].monthlyBreakdown[month] = {
          charges: 0,
          volume: 0,
          count: 0
        };
      }
      
      acc[gateway].monthlyBreakdown[month].charges += charges;
      acc[gateway].monthlyBreakdown[month].volume += amount;
      acc[gateway].monthlyBreakdown[month].count += 1;
      
      return acc;
    }, {});

    // Calculate final metrics
    const result = Object.values(summary).map((gateway: any) => ({
      ...gateway,
      averageChargeRate: gateway.totalVolume > 0 
        ? (gateway.totalCharges / gateway.totalVolume) * 100 
        : 0,
      currencies: Array.from(gateway.currencies),
      monthlyBreakdown: Object.entries(gateway.monthlyBreakdown).map(([month, data]: [string, any]) => ({
        month,
        ...data,
        chargeRate: data.volume > 0 ? (data.charges / data.volume) * 100 : 0
      }))
    }));

    return result;
  }

  async getPaymentGatewayComparison(startDate?: string, endDate?: string) {
    const summary = await this.getGatewayChargesSummary(startDate, endDate);
    
    // Calculate overall metrics
    const overallMetrics = summary.reduce((acc, gateway: any) => {
      acc.totalCharges += gateway.totalCharges;
      acc.totalVolume += gateway.totalVolume;
      acc.totalTransactions += gateway.transactionCount;
      return acc;
    }, {
      totalCharges: 0,
      totalVolume: 0,
      totalTransactions: 0
    });

    const avgChargeRate = overallMetrics.totalVolume > 0 
      ? (overallMetrics.totalCharges / overallMetrics.totalVolume) * 100 
      : 0;

    // Rank gateways by efficiency (lowest charge rate is best)
    const rankedGateways = summary
      .sort((a: any, b: any) => a.averageChargeRate - b.averageChargeRate)
      .map((gateway: any, index: number) => ({
        ...gateway,
        rank: index + 1,
        efficiencyScore: avgChargeRate > 0 
          ? ((avgChargeRate - gateway.averageChargeRate) / avgChargeRate * 100).toFixed(2)
          : '0.00',
        marketShare: overallMetrics.totalVolume > 0 
          ? ((gateway.totalVolume / overallMetrics.totalVolume) * 100).toFixed(2)
          : '0.00'
      }));

    return {
      overallMetrics: {
        ...overallMetrics,
        averageChargeRate: avgChargeRate
      },
      gatewayComparison: rankedGateways,
      recommendations: this.generateGatewayRecommendations(rankedGateways)
    };
  }

  private generateGatewayRecommendations(rankedGateways: any[]): string[] {
    const recommendations: string[] = [];
    
    if (rankedGateways.length === 0) {
      return ['No transaction data available for recommendations.'];
    }
    
    const bestGateway = rankedGateways[0];
    const worstGateway = rankedGateways[rankedGateways.length - 1];
    
    if (rankedGateways.length > 1) {
      recommendations.push(`${bestGateway.gateway} offers the best rates with ${bestGateway.averageChargeRate.toFixed(2)}% charges.`);
      
      if (parseFloat(worstGateway.averageChargeRate) > parseFloat(bestGateway.averageChargeRate) + 0.5) {
        recommendations.push(`Consider switching volume from ${worstGateway.gateway} to ${bestGateway.gateway} to save on transaction fees.`);
      }
    }
    
    const highVolumeGateways = rankedGateways.filter((g: any) => parseFloat(g.marketShare) > 30);
    if (highVolumeGateways.length > 0) {
      recommendations.push(`Negotiate better rates with ${highVolumeGateways.map((g: any) => g.gateway).join(', ')} due to high transaction volumes.`);
    }
    
    return recommendations;
  }
}

export const financialService = new FinancialService();