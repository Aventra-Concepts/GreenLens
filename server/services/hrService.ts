import { db } from "../db";
import {
  staffMembers,
  staffRoles,
  jobPostings,
  jobApplications,
  employeeRecords,
  leaveRequests,
  salaryAdvances,
  type StaffMember,
  type StaffRole,
  type JobPosting,
  type JobApplication,
  type EmployeeRecord,
  type LeaveRequest,
  type SalaryAdvance,
  type InsertStaffMember,
  type InsertStaffRole,
  type InsertJobPosting,
  type InsertJobApplication,
  type InsertEmployeeRecord,
  type InsertLeaveRequest,
  type InsertSalaryAdvance,
} from "../../shared/schema";
import { eq, desc, count, and, or, ilike, sql } from "drizzle-orm";

export class HRService {
  // Staff Role Management
  async createStaffRole(roleData: InsertStaffRole): Promise<StaffRole> {
    const [role] = await db.insert(staffRoles).values(roleData).returning();
    return role;
  }

  async getAllStaffRoles(): Promise<StaffRole[]> {
    return db.select().from(staffRoles).orderBy(staffRoles.name);
  }

  async getActiveStaffRoles(): Promise<StaffRole[]> {
    return db
      .select()
      .from(staffRoles)
      .where(eq(staffRoles.isActive, true))
      .orderBy(staffRoles.level, staffRoles.name);
  }

  async getStaffRoleById(id: string): Promise<StaffRole | null> {
    const [role] = await db.select().from(staffRoles).where(eq(staffRoles.id, id));
    return role || null;
  }

  async updateStaffRole(id: string, updates: Partial<InsertStaffRole>): Promise<StaffRole | null> {
    const [updated] = await db
      .update(staffRoles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(staffRoles.id, id))
      .returning();
    return updated || null;
  }

  async deleteStaffRole(id: string): Promise<boolean> {
    const result = await db.delete(staffRoles).where(eq(staffRoles.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Staff Member Management
  async createStaffMember(memberData: InsertStaffMember): Promise<StaffMember> {
    // Generate employee ID
    const count = await this.getStaffMemberCount();
    const employeeId = `EMP${String(count + 1).padStart(3, '0')}`;
    
    const [member] = await db
      .insert(staffMembers)
      .values({ ...memberData, employeeId })
      .returning();
    return member;
  }

  async getAllStaffMembers(): Promise<StaffMember[]> {
    return db.select().from(staffMembers).orderBy(desc(staffMembers.createdAt));
  }

  async getActiveStaffMembers(): Promise<StaffMember[]> {
    return db
      .select()
      .from(staffMembers)
      .where(eq(staffMembers.isActive, true))
      .orderBy(staffMembers.firstName, staffMembers.lastName);
  }

  async getStaffMemberById(id: string): Promise<StaffMember | null> {
    const [member] = await db.select().from(staffMembers).where(eq(staffMembers.id, id));
    return member || null;
  }

  async getStaffMemberByEmployeeId(employeeId: string): Promise<StaffMember | null> {
    const [member] = await db.select().from(staffMembers).where(eq(staffMembers.employeeId, employeeId));
    return member || null;
  }

  async getStaffMembersByDepartment(department: string): Promise<StaffMember[]> {
    return db
      .select()
      .from(staffMembers)
      .where(and(eq(staffMembers.department, department), eq(staffMembers.isActive, true)))
      .orderBy(staffMembers.firstName);
  }

  async searchStaffMembers(query: string): Promise<StaffMember[]> {
    return db
      .select()
      .from(staffMembers)
      .where(
        or(
          ilike(staffMembers.firstName, `%${query}%`),
          ilike(staffMembers.lastName, `%${query}%`),
          ilike(staffMembers.email, `%${query}%`),
          ilike(staffMembers.employeeId, `%${query}%`),
          ilike(staffMembers.department, `%${query}%`),
          ilike(staffMembers.position, `%${query}%`)
        )
      )
      .orderBy(staffMembers.firstName);
  }

  async updateStaffMember(id: string, updates: Partial<InsertStaffMember>): Promise<StaffMember | null> {
    const [updated] = await db
      .update(staffMembers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(staffMembers.id, id))
      .returning();
    return updated || null;
  }

  async getStaffMemberCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(staffMembers);
    return result.count;
  }

  // Job Posting Management
  async createJobPosting(jobData: InsertJobPosting): Promise<JobPosting> {
    // Generate slug from title
    const slug = jobData.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || '';
    
    const [job] = await db
      .insert(jobPostings)
      .values({ ...jobData, slug })
      .returning();
    return job;
  }

  async getAllJobPostings(): Promise<JobPosting[]> {
    return db.select().from(jobPostings).orderBy(desc(jobPostings.createdAt));
  }

  async getPublishedJobPostings(): Promise<JobPosting[]> {
    return db
      .select()
      .from(jobPostings)
      .where(eq(jobPostings.status, 'published'))
      .orderBy(desc(jobPostings.publishedAt));
  }

  async getJobPostingById(id: string): Promise<JobPosting | null> {
    const [job] = await db.select().from(jobPostings).where(eq(jobPostings.id, id));
    return job || null;
  }

  async getJobPostingBySlug(slug: string): Promise<JobPosting | null> {
    const [job] = await db.select().from(jobPostings).where(eq(jobPostings.slug, slug));
    return job || null;
  }

  async updateJobPosting(id: string, updates: Partial<InsertJobPosting>): Promise<JobPosting | null> {
    const [updated] = await db
      .update(jobPostings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(jobPostings.id, id))
      .returning();
    return updated || null;
  }

  async publishJobPosting(id: string): Promise<JobPosting | null> {
    const [updated] = await db
      .update(jobPostings)
      .set({ 
        status: 'published',
        publishedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(jobPostings.id, id))
      .returning();
    return updated || null;
  }

  async incrementJobPostingViews(id: string): Promise<void> {
    await db
      .update(jobPostings)
      .set({ viewCount: sql`${jobPostings.viewCount} + 1` })
      .where(eq(jobPostings.id, id));
  }

  // Job Application Management
  async createJobApplication(applicationData: InsertJobApplication): Promise<JobApplication> {
    const [application] = await db
      .insert(jobApplications)
      .values(applicationData)
      .returning();
    
    // Increment application count for the job posting
    await db
      .update(jobPostings)
      .set({ applicationCount: sql`${jobPostings.applicationCount} + 1` })
      .where(eq(jobPostings.id, applicationData.jobPostingId));
    
    return application;
  }

  async getAllJobApplications(): Promise<JobApplication[]> {
    return db.select().from(jobApplications).orderBy(desc(jobApplications.createdAt));
  }

  async getJobApplicationsByPosting(jobPostingId: string): Promise<JobApplication[]> {
    return db
      .select()
      .from(jobApplications)
      .where(eq(jobApplications.jobPostingId, jobPostingId))
      .orderBy(desc(jobApplications.createdAt));
  }

  async getJobApplicationById(id: string): Promise<JobApplication | null> {
    const [application] = await db.select().from(jobApplications).where(eq(jobApplications.id, id));
    return application || null;
  }

  async updateJobApplication(id: string, updates: Partial<InsertJobApplication>): Promise<JobApplication | null> {
    const [updated] = await db
      .update(jobApplications)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(jobApplications.id, id))
      .returning();
    return updated || null;
  }

  async updateApplicationStatus(id: string, status: string, reviewedBy?: string): Promise<JobApplication | null> {
    const [updated] = await db
      .update(jobApplications)
      .set({
        status,
        reviewedBy,
        reviewedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(jobApplications.id, id))
      .returning();
    return updated || null;
  }

  // Employee Record Management
  async createEmployeeRecord(recordData: InsertEmployeeRecord): Promise<EmployeeRecord> {
    const [record] = await db.insert(employeeRecords).values(recordData).returning();
    return record;
  }

  async getEmployeeRecordByStaffId(staffMemberId: string): Promise<EmployeeRecord | null> {
    const [record] = await db
      .select()
      .from(employeeRecords)
      .where(eq(employeeRecords.staffMemberId, staffMemberId));
    return record || null;
  }

  async updateEmployeeRecord(id: string, updates: Partial<InsertEmployeeRecord>): Promise<EmployeeRecord | null> {
    const [updated] = await db
      .update(employeeRecords)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(employeeRecords.id, id))
      .returning();
    return updated || null;
  }

  // Leave Request Management
  async createLeaveRequest(leaveData: InsertLeaveRequest): Promise<LeaveRequest> {
    const [leave] = await db.insert(leaveRequests).values(leaveData).returning();
    return leave;
  }

  async getAllLeaveRequests(): Promise<LeaveRequest[]> {
    return db.select().from(leaveRequests).orderBy(desc(leaveRequests.createdAt));
  }

  async getLeaveRequestsByStaff(staffMemberId: string): Promise<LeaveRequest[]> {
    return db
      .select()
      .from(leaveRequests)
      .where(eq(leaveRequests.staffMemberId, staffMemberId))
      .orderBy(desc(leaveRequests.createdAt));
  }

  async getPendingLeaveRequests(): Promise<LeaveRequest[]> {
    return db
      .select()
      .from(leaveRequests)
      .where(eq(leaveRequests.status, 'pending'))
      .orderBy(leaveRequests.startDate);
  }

  async getLeaveRequestById(id: string): Promise<LeaveRequest | null> {
    const [leave] = await db.select().from(leaveRequests).where(eq(leaveRequests.id, id));
    return leave || null;
  }

  async updateLeaveRequest(id: string, updates: Partial<InsertLeaveRequest>): Promise<LeaveRequest | null> {
    const [updated] = await db
      .update(leaveRequests)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(leaveRequests.id, id))
      .returning();
    return updated || null;
  }

  async approveLeaveRequest(id: string, reviewedBy: string, comments?: string): Promise<LeaveRequest | null> {
    const [updated] = await db
      .update(leaveRequests)
      .set({
        status: 'approved',
        reviewedBy,
        reviewedAt: new Date(),
        reviewerComments: comments,
        updatedAt: new Date()
      })
      .where(eq(leaveRequests.id, id))
      .returning();
    return updated || null;
  }

  async rejectLeaveRequest(id: string, reviewedBy: string, comments: string): Promise<LeaveRequest | null> {
    const [updated] = await db
      .update(leaveRequests)
      .set({
        status: 'rejected',
        reviewedBy,
        reviewedAt: new Date(),
        reviewerComments: comments,
        updatedAt: new Date()
      })
      .where(eq(leaveRequests.id, id))
      .returning();
    return updated || null;
  }

  // Salary Advance Management
  async createSalaryAdvance(advanceData: InsertSalaryAdvance): Promise<SalaryAdvance> {
    const [advance] = await db.insert(salaryAdvances).values(advanceData).returning();
    return advance;
  }

  async getAllSalaryAdvances(): Promise<SalaryAdvance[]> {
    return db.select().from(salaryAdvances).orderBy(desc(salaryAdvances.createdAt));
  }

  async getSalaryAdvancesByStaff(staffMemberId: string): Promise<SalaryAdvance[]> {
    return db
      .select()
      .from(salaryAdvances)
      .where(eq(salaryAdvances.staffMemberId, staffMemberId))
      .orderBy(desc(salaryAdvances.createdAt));
  }

  async getPendingSalaryAdvances(): Promise<SalaryAdvance[]> {
    return db
      .select()
      .from(salaryAdvances)
      .where(eq(salaryAdvances.status, 'pending'))
      .orderBy(salaryAdvances.createdAt);
  }

  async getSalaryAdvanceById(id: string): Promise<SalaryAdvance | null> {
    const [advance] = await db.select().from(salaryAdvances).where(eq(salaryAdvances.id, id));
    return advance || null;
  }

  async updateSalaryAdvance(id: string, updates: Partial<InsertSalaryAdvance>): Promise<SalaryAdvance | null> {
    const [updated] = await db
      .update(salaryAdvances)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(salaryAdvances.id, id))
      .returning();
    return updated || null;
  }

  async approveSalaryAdvance(
    id: string,
    approvedBy: string,
    approvedAmount: number,
    repaymentPeriod: number
  ): Promise<SalaryAdvance | null> {
    const monthlyDeduction = approvedAmount / repaymentPeriod;
    
    const [updated] = await db
      .update(salaryAdvances)
      .set({
        status: 'approved',
        approvedBy,
        approvedAmount: approvedAmount.toString(),
        repaymentPeriod,
        monthlyDeduction: monthlyDeduction.toString(),
        remainingAmount: approvedAmount.toString(),
        updatedAt: new Date()
      })
      .where(eq(salaryAdvances.id, id))
      .returning();
    return updated || null;
  }

  async rejectSalaryAdvance(id: string, approvedBy: string): Promise<SalaryAdvance | null> {
    const [updated] = await db
      .update(salaryAdvances)
      .set({
        status: 'rejected',
        approvedBy,
        updatedAt: new Date()
      })
      .where(eq(salaryAdvances.id, id))
      .returning();
    return updated || null;
  }

  // HR Analytics and Reports
  async getHRStatistics() {
    const [staffCount] = await db.select({ count: count() }).from(staffMembers).where(eq(staffMembers.isActive, true));
    const [jobPostingsCount] = await db.select({ count: count() }).from(jobPostings).where(eq(jobPostings.status, 'published'));
    const [applicationsCount] = await db.select({ count: count() }).from(jobApplications);
    const [pendingLeaveCount] = await db.select({ count: count() }).from(leaveRequests).where(eq(leaveRequests.status, 'pending'));
    const [pendingAdvanceCount] = await db.select({ count: count() }).from(salaryAdvances).where(eq(salaryAdvances.status, 'pending'));

    return {
      totalStaff: staffCount.count,
      activeJobPostings: jobPostingsCount.count,
      totalApplications: applicationsCount.count,
      pendingLeaveRequests: pendingLeaveCount.count,
      pendingSalaryAdvances: pendingAdvanceCount.count,
    };
  }

  async getDepartmentStats() {
    const results = await db
      .select({
        department: staffMembers.department,
        count: count(staffMembers.id)
      })
      .from(staffMembers)
      .where(eq(staffMembers.isActive, true))
      .groupBy(staffMembers.department)
      .orderBy(desc(count(staffMembers.id)));
    
    return results;
  }
}

export const hrService = new HRService();