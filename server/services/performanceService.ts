import { db } from "../db";
import {
  performanceReportTemplates,
  performanceReports,
  performanceEvaluations,
  performanceImprovementPlans,
  performanceGoals,
  performanceMetrics,
  staffMembers,
  type PerformanceReportTemplate,
  type PerformanceReport,
  type PerformanceEvaluation,
  type PerformanceImprovementPlan,
  type PerformanceGoal,
  type PerformanceMetric,
  type InsertPerformanceReportTemplate,
  type InsertPerformanceReport,
  type InsertPerformanceEvaluation,
  type InsertPerformanceImprovementPlan,
  type InsertPerformanceGoal,
  type InsertPerformanceMetric,
} from "../../shared/schema";
import { eq, desc, count, and, or, ilike, sql, gte, lte } from "drizzle-orm";

export class PerformanceService {
  
  // ============================================================================
  // PERFORMANCE REPORT TEMPLATES
  // ============================================================================

  async createTemplate(templateData: InsertPerformanceReportTemplate): Promise<PerformanceReportTemplate> {
    const [template] = await db.insert(performanceReportTemplates).values(templateData).returning();
    return template;
  }

  async getTemplates(type?: string, isActive?: boolean): Promise<PerformanceReportTemplate[]> {
    const conditions = [];
    
    if (type) {
      conditions.push(eq(performanceReportTemplates.type, type));
    }
    
    if (isActive !== undefined) {
      conditions.push(eq(performanceReportTemplates.isActive, isActive));
    }
    
    if (conditions.length > 0) {
      return db
        .select()
        .from(performanceReportTemplates)
        .where(and(...conditions))
        .orderBy(desc(performanceReportTemplates.createdAt));
    }
    
    return db
      .select()
      .from(performanceReportTemplates)
      .orderBy(desc(performanceReportTemplates.createdAt));
  }

  async getTemplateById(id: string): Promise<PerformanceReportTemplate | null> {
    const [template] = await db
      .select()
      .from(performanceReportTemplates)
      .where(eq(performanceReportTemplates.id, id));
    return template || null;
  }

  async updateTemplate(id: string, updates: Partial<InsertPerformanceReportTemplate>): Promise<PerformanceReportTemplate | null> {
    const [updated] = await db
      .update(performanceReportTemplates)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(performanceReportTemplates.id, id))
      .returning();
    return updated || null;
  }

  async deleteTemplate(id: string): Promise<boolean> {
    const result = await db
      .delete(performanceReportTemplates)
      .where(eq(performanceReportTemplates.id, id));
    return (result.rowCount || 0) > 0;
  }

  // ============================================================================
  // PERFORMANCE REPORTS
  // ============================================================================

  async createReport(reportData: InsertPerformanceReport): Promise<PerformanceReport> {
    const [report] = await db.insert(performanceReports).values(reportData).returning();
    return report;
  }

  async getReports(filters?: {
    staffMemberId?: string;
    reportType?: string;
    status?: string;
    reviewerId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any[]> {
    const conditions = [];

    if (filters?.staffMemberId) {
      conditions.push(eq(performanceReports.staffMemberId, filters.staffMemberId));
    }
    
    if (filters?.reportType) {
      conditions.push(eq(performanceReports.reportType, filters.reportType));
    }
    
    if (filters?.status) {
      conditions.push(eq(performanceReports.status, filters.status));
    }
    
    if (filters?.reviewerId) {
      conditions.push(eq(performanceReports.reviewerId, filters.reviewerId));
    }
    
    if (filters?.startDate) {
      conditions.push(gte(performanceReports.startDate, filters.startDate));
    }
    
    if (filters?.endDate) {
      conditions.push(lte(performanceReports.endDate, filters.endDate));
    }

    if (conditions.length > 0) {
      return db
        .select({
          id: performanceReports.id,
          staffMemberId: performanceReports.staffMemberId,
          templateId: performanceReports.templateId,
          reportType: performanceReports.reportType,
          reviewPeriod: performanceReports.reviewPeriod,
          startDate: performanceReports.startDate,
          endDate: performanceReports.endDate,
          overallScore: performanceReports.overallScore,
          overallRating: performanceReports.overallRating,
          confidenceLevel: performanceReports.confidenceLevel,
          status: performanceReports.status,
          reviewerId: performanceReports.reviewerId,
          reviewerName: performanceReports.reviewerName,
          submittedAt: performanceReports.submittedAt,
          approvedAt: performanceReports.approvedAt,
          createdAt: performanceReports.createdAt,
          staffMemberName: sql<string>`${staffMembers.firstName} || ' ' || ${staffMembers.lastName}`,
          staffMemberEmail: staffMembers.email,
          department: staffMembers.department,
        })
        .from(performanceReports)
        .leftJoin(staffMembers, eq(performanceReports.staffMemberId, staffMembers.id))
        .where(and(...conditions))
        .orderBy(desc(performanceReports.createdAt));
    }

    return db
      .select({
        id: performanceReports.id,
        staffMemberId: performanceReports.staffMemberId,
        templateId: performanceReports.templateId,
        reportType: performanceReports.reportType,
        reviewPeriod: performanceReports.reviewPeriod,
        startDate: performanceReports.startDate,
        endDate: performanceReports.endDate,
        overallScore: performanceReports.overallScore,
        overallRating: performanceReports.overallRating,
        confidenceLevel: performanceReports.confidenceLevel,
        status: performanceReports.status,
        reviewerId: performanceReports.reviewerId,
        reviewerName: performanceReports.reviewerName,
        submittedAt: performanceReports.submittedAt,
        approvedAt: performanceReports.approvedAt,
        createdAt: performanceReports.createdAt,
        staffMemberName: sql<string>`${staffMembers.firstName} || ' ' || ${staffMembers.lastName}`,
        staffMemberEmail: staffMembers.email,
        department: staffMembers.department,
      })
      .from(performanceReports)
      .leftJoin(staffMembers, eq(performanceReports.staffMemberId, staffMembers.id))
      .orderBy(desc(performanceReports.createdAt));
  }

  async getReportById(id: string): Promise<any> {
    const [report] = await db
      .select({
        id: performanceReports.id,
        staffMemberId: performanceReports.staffMemberId,
        templateId: performanceReports.templateId,
        reportType: performanceReports.reportType,
        reviewPeriod: performanceReports.reviewPeriod,
        startDate: performanceReports.startDate,
        endDate: performanceReports.endDate,
        overallScore: performanceReports.overallScore,
        overallRating: performanceReports.overallRating,
        confidenceLevel: performanceReports.confidenceLevel,
        status: performanceReports.status,
        reviewerId: performanceReports.reviewerId,
        reviewerName: performanceReports.reviewerName,
        reviewerComments: performanceReports.reviewerComments,
        submittedAt: performanceReports.submittedAt,
        approvedAt: performanceReports.approvedAt,
        createdAt: performanceReports.createdAt,
        staffMemberName: sql<string>`${staffMembers.firstName} || ' ' || ${staffMembers.lastName}`,
        staffMemberEmail: staffMembers.email,
        department: staffMembers.department,
        employeeId: staffMembers.employeeId,
      })
      .from(performanceReports)
      .leftJoin(staffMembers, eq(performanceReports.staffMemberId, staffMembers.id))
      .where(eq(performanceReports.id, id));
    
    if (!report) return null;

    // Get evaluations for this report
    const evaluations = await this.getEvaluationsByReportId(id);
    
    return {
      ...report,
      evaluations,
    };
  }

  async updateReport(id: string, updates: Partial<InsertPerformanceReport>): Promise<PerformanceReport | null> {
    const [updated] = await db
      .update(performanceReports)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(performanceReports.id, id))
      .returning();
    return updated || null;
  }

  async submitReport(
    id: string, 
    submittedBy: string,
    evaluations: InsertPerformanceEvaluation[]
  ): Promise<{ report: PerformanceReport; evaluations: PerformanceEvaluation[] }> {
    // Update report status
    const [report] = await db
      .update(performanceReports)
      .set({
        status: 'submitted',
        submittedAt: new Date(),
        submittedBy,
        updatedAt: new Date(),
      })
      .where(eq(performanceReports.id, id))
      .returning();

    // Calculate overall score from evaluations
    let totalScore = 0;
    let totalWeight = 0;
    
    for (const evaluation of evaluations) {
      totalScore += Number(evaluation.score) * Number(evaluation.weight || 1);
      totalWeight += Number(evaluation.weight || 1);
    }
    
    const overallScore = totalWeight > 0 ? totalScore / totalWeight : 0;
    
    // Update overall score
    await db
      .update(performanceReports)
      .set({ overallScore: overallScore.toFixed(2) })
      .where(eq(performanceReports.id, id));

    // Insert evaluations
    const insertedEvaluations = await db
      .insert(performanceEvaluations)
      .values(evaluations.map(e => ({ ...e, reportId: id })))
      .returning();

    return { report, evaluations: insertedEvaluations };
  }

  async approveReport(id: string, approvedBy: string): Promise<PerformanceReport | null> {
    const [updated] = await db
      .update(performanceReports)
      .set({
        status: 'approved',
        approvedAt: new Date(),
        approvedBy,
        updatedAt: new Date(),
      })
      .where(eq(performanceReports.id, id))
      .returning();
    return updated || null;
  }

  async getReportsByDepartment(department: string, reportType?: string): Promise<any[]> {
    const conditions = [eq(staffMembers.department, department)];
    
    if (reportType) {
      conditions.push(eq(performanceReports.reportType, reportType));
    }

    return db
      .select({
        id: performanceReports.id,
        staffMemberId: performanceReports.staffMemberId,
        templateId: performanceReports.templateId,
        reportType: performanceReports.reportType,
        reviewPeriod: performanceReports.reviewPeriod,
        startDate: performanceReports.startDate,
        endDate: performanceReports.endDate,
        overallScore: performanceReports.overallScore,
        overallRating: performanceReports.overallRating,
        confidenceLevel: performanceReports.confidenceLevel,
        status: performanceReports.status,
        reviewerId: performanceReports.reviewerId,
        reviewerName: performanceReports.reviewerName,
        submittedAt: performanceReports.submittedAt,
        approvedAt: performanceReports.approvedAt,
        createdAt: performanceReports.createdAt,
        staffMemberName: sql<string>`${staffMembers.firstName} || ' ' || ${staffMembers.lastName}`,
        staffMemberEmail: staffMembers.email,
        department: staffMembers.department,
        employeeId: staffMembers.employeeId,
      })
      .from(performanceReports)
      .leftJoin(staffMembers, eq(performanceReports.staffMemberId, staffMembers.id))
      .where(and(...conditions))
      .orderBy(desc(performanceReports.createdAt));
  }

  // ============================================================================
  // PERFORMANCE EVALUATIONS
  // ============================================================================

  async createEvaluation(evaluationData: InsertPerformanceEvaluation): Promise<PerformanceEvaluation> {
    const [evaluation] = await db.insert(performanceEvaluations).values(evaluationData).returning();
    return evaluation;
  }

  async getEvaluationsByReportId(reportId: string): Promise<PerformanceEvaluation[]> {
    return db
      .select()
      .from(performanceEvaluations)
      .where(eq(performanceEvaluations.reportId, reportId))
      .orderBy(performanceEvaluations.category);
  }

  async updateEvaluation(id: string, updates: Partial<InsertPerformanceEvaluation>): Promise<PerformanceEvaluation | null> {
    const [updated] = await db
      .update(performanceEvaluations)
      .set(updates)
      .where(eq(performanceEvaluations.id, id))
      .returning();
    return updated || null;
  }

  // ============================================================================
  // PERFORMANCE ANALYTICS
  // ============================================================================

  async getPerformanceAnalytics(filters?: {
    department?: string;
    reportType?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    
    // Overall performance statistics
    const totalReports = await db
      .select({ count: count() })
      .from(performanceReports);

    const reportsByStatus = await db
      .select({
        status: performanceReports.status,
        count: count(),
      })
      .from(performanceReports)
      .groupBy(performanceReports.status);

    const avgScoreByDepartment = await db
      .select({
        department: staffMembers.department,
        avgScore: sql<number>`AVG(CAST(${performanceReports.overallScore} AS DECIMAL))`,
        reportCount: count(),
      })
      .from(performanceReports)
      .leftJoin(staffMembers, eq(performanceReports.staffMemberId, staffMembers.id))
      .where(eq(performanceReports.status, 'approved'))
      .groupBy(staffMembers.department);

    const monthlyTrends = await db
      .select({
        month: sql<string>`TO_CHAR(${performanceReports.submittedAt}, 'YYYY-MM')`,
        avgScore: sql<number>`AVG(CAST(${performanceReports.overallScore} AS DECIMAL))`,
        reportCount: count(),
      })
      .from(performanceReports)
      .where(eq(performanceReports.status, 'approved'))
      .groupBy(sql`TO_CHAR(${performanceReports.submittedAt}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${performanceReports.submittedAt}, 'YYYY-MM')`);

    return {
      totalReports: totalReports[0]?.count || 0,
      reportsByStatus,
      avgScoreByDepartment,
      monthlyTrends,
    };
  }

  async getDepartmentPerformanceSummary(department: string): Promise<any> {
    const summary = await db
      .select({
        totalEmployees: count(sql`DISTINCT ${staffMembers.id}`),
        totalReports: count(performanceReports.id),
        avgScore: sql<number>`AVG(CAST(${performanceReports.overallScore} AS DECIMAL))`,
        excellentCount: count(sql`CASE WHEN ${performanceReports.overallRating} = 'excellent' THEN 1 END`),
        goodCount: count(sql`CASE WHEN ${performanceReports.overallRating} = 'good' THEN 1 END`),
        needsImprovementCount: count(sql`CASE WHEN ${performanceReports.overallRating} = 'needs_improvement' THEN 1 END`),
      })
      .from(staffMembers)
      .leftJoin(performanceReports, eq(staffMembers.id, performanceReports.staffMemberId))
      .where(and(
        eq(staffMembers.department, department),
        eq(performanceReports.status, 'approved')
      ));

    return summary[0] || {};
  }

  // ============================================================================
  // PERFORMANCE GOALS
  // ============================================================================

  async createGoal(goalData: InsertPerformanceGoal): Promise<PerformanceGoal> {
    const [goal] = await db.insert(performanceGoals).values(goalData).returning();
    return goal;
  }

  async getGoalsByStaffMember(staffMemberId: string): Promise<PerformanceGoal[]> {
    return db
      .select()
      .from(performanceGoals)
      .where(eq(performanceGoals.staffMemberId, staffMemberId))
      .orderBy(desc(performanceGoals.createdAt));
  }

  async updateGoalProgress(id: string, progress: number, notes?: string): Promise<PerformanceGoal | null> {
    const status = progress >= 100 ? 'completed' : 'active';
    
    const [updated] = await db
      .update(performanceGoals)
      .set({
        progress,
        status,
        updatedAt: new Date(),
      })
      .where(eq(performanceGoals.id, id))
      .returning();
    return updated || null;
  }

  // ============================================================================
  // REPORT GENERATION
  // ============================================================================

  async generateMonthlyReport(
    staffMemberId: string, 
    templateId: string, 
    reviewPeriod: string,
    reviewerId: string
  ): Promise<PerformanceReport> {
    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const reportData: InsertPerformanceReport = {
      staffMemberId,
      templateId,
      reportType: 'monthly',
      reviewPeriod,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      status: 'draft',
      reviewerId,
    };

    return this.createReport(reportData);
  }

  async generateAnnualReport(
    staffMemberId: string, 
    templateId: string, 
    year: number,
    reviewerId: string
  ): Promise<PerformanceReport> {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const reportData: InsertPerformanceReport = {
      staffMemberId,
      templateId,
      reportType: 'annual',
      reviewPeriod: year.toString(),
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      status: 'draft',
      reviewerId,
    };

    return this.createReport(reportData);
  }

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  async generateBulkMonthlyReports(
    departmentIds: string[], 
    templateId: string, 
    reviewPeriod: string,
    reviewerId: string
  ): Promise<{ success: number; errors: string[] }> {
    let success = 0;
    const errors: string[] = [];

    // Get all staff members in specified departments
    const staffList = await db
      .select()
      .from(staffMembers)
      .where(sql`${staffMembers.department} = ANY(${departmentIds})`);

    for (const staff of staffList) {
      try {
        await this.generateMonthlyReport(staff.id, templateId, reviewPeriod, reviewerId);
        success++;
      } catch (error: any) {
        errors.push(`Failed to create report for ${staff.firstName} ${staff.lastName}: ${error.message}`);
      }
    }

    return { success, errors };
  }
}

export const performanceService = new PerformanceService();