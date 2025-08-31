import { db } from "../db";
import {
  staffMembers,
  staffRoles,
  jobPostings,
  jobApplications,
  employeeRecords,
  leaveRequests,
  salaryAdvances,
  attendanceRecords,
  type StaffMember,
  type StaffRole,
  type JobPosting,
  type JobApplication,
  type EmployeeRecord,
  type LeaveRequest,
  type SalaryAdvance,
  type AttendanceRecord,
  type InsertStaffMember,
  type InsertStaffRole,
  type InsertJobPosting,
  type InsertJobApplication,
  type InsertEmployeeRecord,
  type InsertLeaveRequest,
  type InsertSalaryAdvance,
  type InsertAttendanceRecord,
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

  // Attendance Management
  async getAllAttendanceRecords(): Promise<AttendanceRecord[]> {
    return db
      .select()
      .from(attendanceRecords)
      .orderBy(desc(attendanceRecords.attendanceDate), desc(attendanceRecords.loginTime));
  }

  async getAttendanceRecordById(id: string): Promise<AttendanceRecord | null> {
    const [record] = await db.select().from(attendanceRecords).where(eq(attendanceRecords.id, id));
    return record || null;
  }

  async getAttendanceByStaffAndDateRange(
    staffMemberId: string, 
    startDate: string, 
    endDate: string
  ): Promise<AttendanceRecord[]> {
    return db
      .select()
      .from(attendanceRecords)
      .where(
        and(
          eq(attendanceRecords.staffMemberId, staffMemberId),
          sql`${attendanceRecords.attendanceDate} >= ${startDate}`,
          sql`${attendanceRecords.attendanceDate} <= ${endDate}`
        )
      )
      .orderBy(desc(attendanceRecords.attendanceDate));
  }

  async getAttendanceByStaffAndMonth(
    staffMemberId: string, 
    month: number, 
    year: number
  ): Promise<AttendanceRecord[]> {
    return db
      .select()
      .from(attendanceRecords)
      .where(
        and(
          eq(attendanceRecords.staffMemberId, staffMemberId),
          sql`EXTRACT(MONTH FROM ${attendanceRecords.attendanceDate}) = ${month}`,
          sql`EXTRACT(YEAR FROM ${attendanceRecords.attendanceDate}) = ${year}`
        )
      )
      .orderBy(desc(attendanceRecords.attendanceDate));
  }

  async getAttendanceByDateRange(startDate: string, endDate: string): Promise<AttendanceRecord[]> {
    return db
      .select()
      .from(attendanceRecords)
      .where(
        and(
          sql`${attendanceRecords.attendanceDate} >= ${startDate}`,
          sql`${attendanceRecords.attendanceDate} <= ${endDate}`
        )
      )
      .orderBy(desc(attendanceRecords.attendanceDate), desc(attendanceRecords.loginTime));
  }

  async recordLogin(staffMemberId: string, loginData: {
    workLocation?: string;
    notes?: string;
    ipAddress?: string;
    deviceInfo?: string;
  }): Promise<AttendanceRecord> {
    const today = new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD format
    const now = new Date();
    
    // Check if there's already a record for today
    const existingRecord = await db
      .select()
      .from(attendanceRecords)
      .where(
        and(
          eq(attendanceRecords.staffMemberId, staffMemberId),
          eq(attendanceRecords.attendanceDate, today)
        )
      );
    
    if (existingRecord.length > 0) {
      throw new Error('Login already recorded for today');
    }
    
    // Calculate if late (assuming 9 AM is start time)
    const startOfDay = new Date(now);
    startOfDay.setHours(9, 0, 0, 0);
    const isLate = now > startOfDay;
    const lateMinutes = isLate ? Math.floor((now.getTime() - startOfDay.getTime()) / (1000 * 60)) : 0;
    
    const [record] = await db
      .insert(attendanceRecords)
      .values({
        staffMemberId,
        attendanceDate: today,
        loginTime: now,
        workLocation: loginData.workLocation || 'office',
        notes: loginData.notes,
        ipAddress: loginData.ipAddress,
        deviceInfo: loginData.deviceInfo,
        status: isLate ? 'late' : 'present',
        isLate,
        lateMinutes
      })
      .returning();
    
    return record;
  }

  async recordLogout(id: string, logoutData: { notes?: string }): Promise<AttendanceRecord | null> {
    const now = new Date();
    
    // Get the existing record
    const existingRecord = await this.getAttendanceRecordById(id);
    if (!existingRecord || !existingRecord.loginTime) {
      throw new Error('No login record found');
    }
    
    if (existingRecord.logoutTime) {
      throw new Error('Logout already recorded');
    }
    
    // Calculate total hours
    const loginTime = new Date(existingRecord.loginTime);
    const totalMilliseconds = now.getTime() - loginTime.getTime();
    const totalHours = (totalMilliseconds / (1000 * 60 * 60)).toFixed(2);
    
    // Check if overtime (assuming 8 hours is standard)
    const standardHours = 8;
    const isOvertime = parseFloat(totalHours) > standardHours;
    const overtimeHours = isOvertime ? (parseFloat(totalHours) - standardHours).toFixed(2) : '0';
    
    const [updated] = await db
      .update(attendanceRecords)
      .set({
        logoutTime: now,
        totalHours,
        isOvertime,
        overtimeHours,
        notes: logoutData.notes || existingRecord.notes,
        updatedAt: new Date()
      })
      .where(eq(attendanceRecords.id, id))
      .returning();
    
    return updated || null;
  }

  async createAttendanceRecord(recordData: InsertAttendanceRecord): Promise<AttendanceRecord> {
    const [record] = await db.insert(attendanceRecords).values(recordData).returning();
    return record;
  }

  async updateAttendanceRecord(id: string, updates: Partial<InsertAttendanceRecord>): Promise<AttendanceRecord | null> {
    const [updated] = await db
      .update(attendanceRecords)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(attendanceRecords.id, id))
      .returning();
    return updated || null;
  }

  async approveAttendanceRecord(id: string, approvedBy: string): Promise<AttendanceRecord | null> {
    const [updated] = await db
      .update(attendanceRecords)
      .set({
        managerApproved: true,
        approvedBy,
        approvedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(attendanceRecords.id, id))
      .returning();
    return updated || null;
  }

  async getAttendanceSummary(staffMemberId: string, month?: number, year?: number) {
    const currentDate = new Date();
    const targetMonth = month || currentDate.getMonth() + 1;
    const targetYear = year || currentDate.getFullYear();
    
    const records = await this.getAttendanceByStaffAndMonth(staffMemberId, targetMonth, targetYear);
    
    const summary = {
      totalDays: records.length,
      presentDays: records.filter(r => r.status === 'present' || r.status === 'late').length,
      absentDays: records.filter(r => r.status === 'absent').length,
      lateDays: records.filter(r => r.isLate).length,
      halfDays: records.filter(r => r.status === 'half_day').length,
      remoteDays: records.filter(r => r.workLocation === 'remote').length,
      totalHours: records.reduce((sum, r) => sum + (parseFloat(r.totalHours || '0')), 0),
      overtimeHours: records.reduce((sum, r) => sum + (parseFloat(r.overtimeHours || '0')), 0),
      averageLoginTime: this.calculateAverageLoginTime(records),
      month: targetMonth,
      year: targetYear
    };
    
    return summary;
  }

  private calculateAverageLoginTime(records: AttendanceRecord[]): string {
    const loginRecords = records.filter(r => r.loginTime);
    if (loginRecords.length === 0) return '00:00';
    
    const totalMinutes = loginRecords.reduce((sum, record) => {
      const loginTime = new Date(record.loginTime!);
      return sum + (loginTime.getHours() * 60 + loginTime.getMinutes());
    }, 0);
    
    const avgMinutes = Math.round(totalMinutes / loginRecords.length);
    const hours = Math.floor(avgMinutes / 60);
    const minutes = avgMinutes % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
}

export const hrService = new HRService();