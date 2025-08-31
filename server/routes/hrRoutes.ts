import { Router } from "express";
import { hrService } from "../services/hrService";
import { 
  insertStaffRoleSchema,
  insertStaffMemberSchema,
  insertJobPostingSchema,
  insertJobApplicationSchema,
  insertEmployeeRecordSchema,
  insertLeaveRequestSchema,
  insertSalaryAdvanceSchema,
  insertAttendanceRecordSchema,
  insertPayrollPeriodSchema,
  insertSalaryStructureSchema,
  insertTaxSlabSchema,
  insertStatutoryRateSchema,
  insertPayrollRecordSchema,
} from "../../shared/schema";
import { payrollCalculationService } from "../services/payrollCalculationService";
import { isAuthenticated } from "../auth";

const router = Router();

// Middleware to check if user is admin or HR manager
const requireHRAccess = async (req: any, res: any, next: any) => {
  const user = req.user;
  if (!user || (!user.isAdmin && !user.isSuperAdmin)) {
    return res.status(403).json({ message: "HR access required" });
  }
  next();
};

// ============================================================================
// STAFF ROLES MANAGEMENT
// ============================================================================

// Get all staff roles
router.get("/roles", isAuthenticated, requireHRAccess, async (req, res) => {
  try {
    const roles = await hrService.getAllStaffRoles();
    res.json(roles);
  } catch (error) {
    console.error("Error fetching staff roles:", error);
    res.status(500).json({ message: "Failed to fetch staff roles" });
  }
});

// Get active staff roles
router.get("/roles/active", isAuthenticated, requireHRAccess, async (req, res) => {
  try {
    const roles = await hrService.getActiveStaffRoles();
    res.json(roles);
  } catch (error) {
    console.error("Error fetching active staff roles:", error);
    res.status(500).json({ message: "Failed to fetch active staff roles" });
  }
});

// Create new staff role
router.post("/roles", isAuthenticated, requireHRAccess, async (req, res) => {
  try {
    const validatedData = insertStaffRoleSchema.parse(req.body);
    const role = await hrService.createStaffRole(validatedData);
    res.status(201).json(role);
  } catch (error) {
    console.error("Error creating staff role:", error);
    res.status(400).json({ message: "Invalid role data", error: error.message });
  }
});

// Update staff role
router.put("/roles/:id", isAuthenticated, requireHRAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = insertStaffRoleSchema.partial().parse(req.body);
    const role = await hrService.updateStaffRole(id, updates);
    
    if (!role) {
      return res.status(404).json({ message: "Staff role not found" });
    }
    
    res.json(role);
  } catch (error) {
    console.error("Error updating staff role:", error);
    res.status(400).json({ message: "Invalid role data", error: error.message });
  }
});

// Delete staff role
router.delete("/roles/:id", isAuthenticated, requireHRAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await hrService.deleteStaffRole(id);
    
    if (!deleted) {
      return res.status(404).json({ message: "Staff role not found" });
    }
    
    res.json({ message: "Staff role deleted successfully" });
  } catch (error) {
    console.error("Error deleting staff role:", error);
    res.status(500).json({ message: "Failed to delete staff role" });
  }
});

// ============================================================================
// STAFF MEMBERS MANAGEMENT
// ============================================================================

// Get all staff members
router.get("/staff", isAuthenticated, requireHRAccess, async (req, res) => {
  try {
    const { search, department, status } = req.query;
    
    let staff;
    if (search) {
      staff = await hrService.searchStaffMembers(search as string);
    } else if (department) {
      staff = await hrService.getStaffMembersByDepartment(department as string);
    } else if (status === 'active') {
      staff = await hrService.getActiveStaffMembers();
    } else {
      staff = await hrService.getAllStaffMembers();
    }
    
    res.json(staff);
  } catch (error) {
    console.error("Error fetching staff members:", error);
    res.status(500).json({ message: "Failed to fetch staff members" });
  }
});

// Get staff member by ID
router.get("/staff/:id", isAuthenticated, requireHRAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await hrService.getStaffMemberById(id);
    
    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }
    
    res.json(staff);
  } catch (error) {
    console.error("Error fetching staff member:", error);
    res.status(500).json({ message: "Failed to fetch staff member" });
  }
});

// Create new staff member
router.post("/staff", isAuthenticated, requireHRAccess, async (req, res) => {
  try {
    const validatedData = insertStaffMemberSchema.parse({
      ...req.body,
      createdBy: req.user.id
    });
    const staff = await hrService.createStaffMember(validatedData);
    res.status(201).json(staff);
  } catch (error) {
    console.error("Error creating staff member:", error);
    res.status(400).json({ message: "Invalid staff member data", error: error.message });
  }
});

// Update staff member
router.put("/staff/:id", isAuthenticated, requireHRAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = insertStaffMemberSchema.partial().parse(req.body);
    const staff = await hrService.updateStaffMember(id, updates);
    
    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }
    
    res.json(staff);
  } catch (error) {
    console.error("Error updating staff member:", error);
    res.status(400).json({ message: "Invalid staff member data", error: error.message });
  }
});

// ============================================================================
// JOB POSTINGS MANAGEMENT
// ============================================================================

// Get all job postings
router.get("/jobs", async (req, res) => {
  try {
    const { status } = req.query;
    
    let jobs;
    if (status === 'published') {
      jobs = await hrService.getPublishedJobPostings();
    } else {
      jobs = await hrService.getAllJobPostings();
    }
    
    res.json(jobs);
  } catch (error) {
    console.error("Error fetching job postings:", error);
    res.status(500).json({ message: "Failed to fetch job postings" });
  }
});

// Get job posting by ID or slug
router.get("/jobs/:identifier", async (req, res) => {
  try {
    const { identifier } = req.params;
    
    let job;
    if (identifier.includes('-')) {
      // Likely a slug
      job = await hrService.getJobPostingBySlug(identifier);
    } else {
      // Likely an ID
      job = await hrService.getJobPostingById(identifier);
    }
    
    if (!job) {
      return res.status(404).json({ message: "Job posting not found" });
    }
    
    // Increment view count for published jobs
    if (job.status === 'published') {
      await hrService.incrementJobPostingViews(job.id);
    }
    
    res.json(job);
  } catch (error) {
    console.error("Error fetching job posting:", error);
    res.status(500).json({ message: "Failed to fetch job posting" });
  }
});

// Create new job posting (HR access required)
router.post("/jobs", isAuthenticated, requireHRAccess, async (req, res) => {
  try {
    const validatedData = insertJobPostingSchema.parse({
      ...req.body,
      postedBy: req.user.id
    });
    const job = await hrService.createJobPosting(validatedData);
    res.status(201).json(job);
  } catch (error) {
    console.error("Error creating job posting:", error);
    res.status(400).json({ message: "Invalid job posting data", error: error.message });
  }
});

// Update job posting
router.put("/jobs/:id", isAuthenticated, requireHRAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = insertJobPostingSchema.partial().parse(req.body);
    const job = await hrService.updateJobPosting(id, updates);
    
    if (!job) {
      return res.status(404).json({ message: "Job posting not found" });
    }
    
    res.json(job);
  } catch (error) {
    console.error("Error updating job posting:", error);
    res.status(400).json({ message: "Invalid job posting data", error: error.message });
  }
});

// Publish job posting
router.put("/jobs/:id/publish", isAuthenticated, requireHRAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const job = await hrService.publishJobPosting(id);
    
    if (!job) {
      return res.status(404).json({ message: "Job posting not found" });
    }
    
    res.json(job);
  } catch (error) {
    console.error("Error publishing job posting:", error);
    res.status(500).json({ message: "Failed to publish job posting" });
  }
});

// ============================================================================
// JOB APPLICATIONS MANAGEMENT
// ============================================================================

// Submit job application (public endpoint)
router.post("/applications", async (req, res) => {
  try {
    const validatedData = insertJobApplicationSchema.parse(req.body);
    const application = await hrService.createJobApplication(validatedData);
    res.status(201).json({
      id: application.id,
      status: application.status,
      message: "Application submitted successfully"
    });
  } catch (error) {
    console.error("Error submitting application:", error);
    res.status(400).json({ message: "Invalid application data", error: error.message });
  }
});

// Get all applications (HR access required)
router.get("/applications", isAuthenticated, requireHRAccess, async (req, res) => {
  try {
    const { jobPostingId } = req.query;
    
    let applications;
    if (jobPostingId) {
      applications = await hrService.getJobApplicationsByPosting(jobPostingId as string);
    } else {
      applications = await hrService.getAllJobApplications();
    }
    
    res.json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ message: "Failed to fetch applications" });
  }
});

// Get application by ID
router.get("/applications/:id", isAuthenticated, requireHRAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const application = await hrService.getJobApplicationById(id);
    
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    
    res.json(application);
  } catch (error) {
    console.error("Error fetching application:", error);
    res.status(500).json({ message: "Failed to fetch application" });
  }
});

// Update application status
router.put("/applications/:id/status", isAuthenticated, requireHRAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const application = await hrService.updateApplicationStatus(id, status, req.user.id);
    
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    
    res.json(application);
  } catch (error) {
    console.error("Error updating application status:", error);
    res.status(500).json({ message: "Failed to update application status" });
  }
});

// Update application details
router.put("/applications/:id", isAuthenticated, requireHRAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = insertJobApplicationSchema.partial().parse({
      ...req.body,
      reviewedBy: req.user.id
    });
    const application = await hrService.updateJobApplication(id, updates);
    
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    
    res.json(application);
  } catch (error) {
    console.error("Error updating application:", error);
    res.status(400).json({ message: "Invalid application data", error: error.message });
  }
});

// ============================================================================
// LEAVE REQUESTS MANAGEMENT
// ============================================================================

// Get all leave requests
router.get("/leaves", isAuthenticated, requireHRAccess, async (req, res) => {
  try {
    const { status, staffMemberId } = req.query;
    
    let leaves;
    if (staffMemberId) {
      leaves = await hrService.getLeaveRequestsByStaff(staffMemberId as string);
    } else if (status === 'pending') {
      leaves = await hrService.getPendingLeaveRequests();
    } else {
      leaves = await hrService.getAllLeaveRequests();
    }
    
    res.json(leaves);
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    res.status(500).json({ message: "Failed to fetch leave requests" });
  }
});

// Create leave request
router.post("/leaves", isAuthenticated, requireHRAccess, async (req, res) => {
  try {
    const validatedData = insertLeaveRequestSchema.parse(req.body);
    const leave = await hrService.createLeaveRequest(validatedData);
    res.status(201).json(leave);
  } catch (error) {
    console.error("Error creating leave request:", error);
    res.status(400).json({ message: "Invalid leave request data", error: error.message });
  }
});

// Approve leave request
router.put("/leaves/:id/approve", isAuthenticated, requireHRAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;
    const leave = await hrService.approveLeaveRequest(id, req.user.id, comments);
    
    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }
    
    res.json(leave);
  } catch (error) {
    console.error("Error approving leave request:", error);
    res.status(500).json({ message: "Failed to approve leave request" });
  }
});

// Reject leave request
router.put("/leaves/:id/reject", isAuthenticated, requireHRAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;
    
    if (!comments) {
      return res.status(400).json({ message: "Rejection reason is required" });
    }
    
    const leave = await hrService.rejectLeaveRequest(id, req.user.id, comments);
    
    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }
    
    res.json(leave);
  } catch (error) {
    console.error("Error rejecting leave request:", error);
    res.status(500).json({ message: "Failed to reject leave request" });
  }
});

// ============================================================================
// SALARY ADVANCES MANAGEMENT
// ============================================================================

// Get all salary advances
router.get("/advances", isAuthenticated, requireHRAccess, async (req, res) => {
  try {
    const { status, staffMemberId } = req.query;
    
    let advances;
    if (staffMemberId) {
      advances = await hrService.getSalaryAdvancesByStaff(staffMemberId as string);
    } else if (status === 'pending') {
      advances = await hrService.getPendingSalaryAdvances();
    } else {
      advances = await hrService.getAllSalaryAdvances();
    }
    
    res.json(advances);
  } catch (error) {
    console.error("Error fetching salary advances:", error);
    res.status(500).json({ message: "Failed to fetch salary advances" });
  }
});

// Create salary advance request
router.post("/advances", isAuthenticated, requireHRAccess, async (req, res) => {
  try {
    const validatedData = insertSalaryAdvanceSchema.parse(req.body);
    const advance = await hrService.createSalaryAdvance(validatedData);
    res.status(201).json(advance);
  } catch (error) {
    console.error("Error creating salary advance:", error);
    res.status(400).json({ message: "Invalid salary advance data", error: error.message });
  }
});

// Approve salary advance
router.put("/advances/:id/approve", isAuthenticated, requireHRAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedAmount, repaymentPeriod } = req.body;
    
    if (!approvedAmount || !repaymentPeriod) {
      return res.status(400).json({ message: "Approved amount and repayment period are required" });
    }
    
    const advance = await hrService.approveSalaryAdvance(id, req.user.id, approvedAmount, repaymentPeriod);
    
    if (!advance) {
      return res.status(404).json({ message: "Salary advance not found" });
    }
    
    res.json(advance);
  } catch (error) {
    console.error("Error approving salary advance:", error);
    res.status(500).json({ message: "Failed to approve salary advance" });
  }
});

// Reject salary advance
router.put("/advances/:id/reject", isAuthenticated, requireHRAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const advance = await hrService.rejectSalaryAdvance(id, req.user.id);
    
    if (!advance) {
      return res.status(404).json({ message: "Salary advance not found" });
    }
    
    res.json(advance);
  } catch (error) {
    console.error("Error rejecting salary advance:", error);
    res.status(500).json({ message: "Failed to reject salary advance" });
  }
});

// ============================================================================
// HR ANALYTICS AND REPORTS
// ============================================================================

// Get HR statistics
router.get("/statistics", isAuthenticated, requireHRAccess, async (req, res) => {
  try {
    const stats = await hrService.getHRStatistics();
    res.json(stats);
  } catch (error) {
    console.error("Error fetching HR statistics:", error);
    res.status(500).json({ message: "Failed to fetch HR statistics" });
  }
});

// Get department statistics
router.get("/departments/stats", isAuthenticated, requireHRAccess, async (req, res) => {
  try {
    const stats = await hrService.getDepartmentStats();
    res.json(stats);
  } catch (error) {
    console.error("Error fetching department statistics:", error);
    res.status(500).json({ message: "Failed to fetch department statistics" });
  }
});

// ============================================================================
// ATTENDANCE MANAGEMENT
// ============================================================================

// Get attendance records
router.get("/attendance", isAuthenticated, requireHRAccess, async (req, res) => {
  try {
    const { staffMemberId, startDate, endDate, month, year } = req.query;
    
    let attendance;
    if (staffMemberId && startDate && endDate) {
      attendance = await hrService.getAttendanceByStaffAndDateRange(
        staffMemberId as string, 
        startDate as string, 
        endDate as string
      );
    } else if (staffMemberId && month && year) {
      attendance = await hrService.getAttendanceByStaffAndMonth(
        staffMemberId as string, 
        parseInt(month as string), 
        parseInt(year as string)
      );
    } else if (startDate && endDate) {
      attendance = await hrService.getAttendanceByDateRange(startDate as string, endDate as string);
    } else {
      attendance = await hrService.getAllAttendanceRecords();
    }
    
    res.json(attendance);
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    res.status(500).json({ message: "Failed to fetch attendance records" });
  }
});

// Get attendance record by ID
router.get("/attendance/:id", isAuthenticated, requireHRAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const attendance = await hrService.getAttendanceRecordById(id);
    
    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }
    
    res.json(attendance);
  } catch (error) {
    console.error("Error fetching attendance record:", error);
    res.status(500).json({ message: "Failed to fetch attendance record" });
  }
});

// Record login time
router.post("/attendance/login", isAuthenticated, requireHRAccess, async (req, res) => {
  try {
    const { staffMemberId, workLocation, notes } = req.body;
    const ipAddress = req.ip;
    const deviceInfo = req.headers['user-agent'];
    
    const attendance = await hrService.recordLogin(staffMemberId, {
      workLocation,
      notes,
      ipAddress,
      deviceInfo
    });
    
    res.status(201).json(attendance);
  } catch (error) {
    console.error("Error recording login:", error);
    res.status(400).json({ message: "Failed to record login", error: error.message });
  }
});

// Record logout time
router.put("/attendance/:id/logout", isAuthenticated, requireHRAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    
    const attendance = await hrService.recordLogout(id, { notes });
    
    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }
    
    res.json(attendance);
  } catch (error) {
    console.error("Error recording logout:", error);
    res.status(500).json({ message: "Failed to record logout" });
  }
});

// Create manual attendance record
router.post("/attendance", isAuthenticated, requireHRAccess, async (req, res) => {
  try {
    const validatedData = insertAttendanceRecordSchema.parse({
      ...req.body,
      ipAddress: req.ip,
      deviceInfo: req.headers['user-agent']
    });
    const attendance = await hrService.createAttendanceRecord(validatedData);
    res.status(201).json(attendance);
  } catch (error) {
    console.error("Error creating attendance record:", error);
    res.status(400).json({ message: "Invalid attendance data", error: error.message });
  }
});

// Update attendance record
router.put("/attendance/:id", isAuthenticated, requireHRAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = insertAttendanceRecordSchema.partial().parse(req.body);
    const attendance = await hrService.updateAttendanceRecord(id, updates);
    
    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }
    
    res.json(attendance);
  } catch (error) {
    console.error("Error updating attendance record:", error);
    res.status(400).json({ message: "Invalid attendance data", error: error.message });
  }
});

// Approve attendance record
router.put("/attendance/:id/approve", isAuthenticated, requireHRAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const attendance = await hrService.approveAttendanceRecord(id, req.user.id);
    
    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }
    
    res.json(attendance);
  } catch (error) {
    console.error("Error approving attendance record:", error);
    res.status(500).json({ message: "Failed to approve attendance record" });
  }
});

// Get attendance summary for a staff member
router.get("/attendance/summary/:staffMemberId", isAuthenticated, requireHRAccess, async (req, res) => {
  try {
    const { staffMemberId } = req.params;
    const { month, year } = req.query;
    
    const summary = await hrService.getAttendanceSummary(
      staffMemberId,
      month ? parseInt(month as string) : undefined,
      year ? parseInt(year as string) : undefined
    );
    
    res.json(summary);
  } catch (error) {
    console.error("Error fetching attendance summary:", error);
    res.status(500).json({ message: "Failed to fetch attendance summary" });
  }
});

// ============================================================================
// PAYROLL MANAGEMENT
// ============================================================================

// Get all payroll periods
router.get("/payroll/periods", isAuthenticated, requireHRAccess, async (req, res) => {
  try {
    const periods = await hrService.getAllPayrollPeriods();
    res.json(periods);
  } catch (error) {
    console.error("Error fetching payroll periods:", error);
    res.status(500).json({ message: "Failed to fetch payroll periods" });
  }
});

// Create payroll period
router.post("/payroll/periods", isAuthenticated, requireHRAccess, async (req, res) => {
  try {
    const validatedData = insertPayrollPeriodSchema.parse(req.body);
    const period = await hrService.createPayrollPeriod(validatedData);
    res.status(201).json(period);
  } catch (error) {
    console.error("Error creating payroll period:", error);
    res.status(400).json({ message: "Invalid payroll period data", error: error.message });
  }
});

// Get salary structures
router.get("/payroll/salary-structures", isAuthenticated, requireHRAccess, async (req, res) => {
  try {
    const { staffMemberId } = req.query;
    const structures = await hrService.getSalaryStructures(staffMemberId as string);
    res.json(structures);
  } catch (error) {
    console.error("Error fetching salary structures:", error);
    res.status(500).json({ message: "Failed to fetch salary structures" });
  }
});

// Create salary structure
router.post("/payroll/salary-structures", isAuthenticated, requireHRAccess, async (req, res) => {
  try {
    const validatedData = insertSalaryStructureSchema.parse(req.body);
    // Calculate gross salary
    const grossSalary = 
      Number(validatedData.basicSalary) +
      Number(validatedData.hra || 0) +
      Number(validatedData.da || 0) +
      Number(validatedData.conveyanceAllowance || 0) +
      Number(validatedData.medicalAllowance || 0) +
      Number(validatedData.specialAllowance || 0) +
      Number(validatedData.performanceIncentive || 0) +
      Number(validatedData.otherAllowances || 0);
    
    const structureData = {
      ...validatedData,
      grossSalary: grossSalary.toString(),
      createdBy: req.user.id
    };
    
    const structure = await hrService.createSalaryStructure(structureData);
    res.status(201).json(structure);
  } catch (error) {
    console.error("Error creating salary structure:", error);
    res.status(400).json({ message: "Invalid salary structure data", error: error.message });
  }
});

// Get current statutory rates
router.get("/payroll/statutory-rates", isAuthenticated, requireHRAccess, async (req, res) => {
  try {
    const rates = await hrService.getCurrentStatutoryRates();
    res.json(rates);
  } catch (error) {
    console.error("Error fetching statutory rates:", error);
    res.status(500).json({ message: "Failed to fetch statutory rates" });
  }
});

// Update statutory rates
router.post("/payroll/statutory-rates", isAuthenticated, requireHRAccess, async (req, res) => {
  try {
    const validatedData = insertStatutoryRateSchema.parse(req.body);
    const rates = await hrService.createStatutoryRates(validatedData);
    res.status(201).json(rates);
  } catch (error) {
    console.error("Error updating statutory rates:", error);
    res.status(400).json({ message: "Invalid statutory rates data", error: error.message });
  }
});

// Get tax slabs
router.get("/payroll/tax-slabs", isAuthenticated, requireHRAccess, async (req, res) => {
  try {
    const { assessmentYear, regime } = req.query;
    const slabs = await hrService.getTaxSlabs(
      assessmentYear as string,
      regime as 'old' | 'new'
    );
    res.json(slabs);
  } catch (error) {
    console.error("Error fetching tax slabs:", error);
    res.status(500).json({ message: "Failed to fetch tax slabs" });
  }
});

// Create/Update tax slabs
router.post("/payroll/tax-slabs", isAuthenticated, requireHRAccess, async (req, res) => {
  try {
    const validatedData = insertTaxSlabSchema.parse(req.body);
    const slab = await hrService.createTaxSlab(validatedData);
    res.status(201).json(slab);
  } catch (error) {
    console.error("Error creating tax slab:", error);
    res.status(400).json({ message: "Invalid tax slab data", error: error.message });
  }
});

// Calculate payroll for a period
router.post("/payroll/calculate/:periodId", isAuthenticated, requireHRAccess, async (req, res) => {
  try {
    const { periodId } = req.params;
    const { staffMemberIds } = req.body; // Optional: calculate for specific employees
    
    const result = await hrService.calculatePayrollForPeriod(periodId, req.user.id, staffMemberIds);
    res.json(result);
  } catch (error) {
    console.error("Error calculating payroll:", error);
    res.status(500).json({ message: "Failed to calculate payroll", error: error.message });
  }
});

// Get payroll records for a period
router.get("/payroll/records/:periodId", isAuthenticated, requireHRAccess, async (req, res) => {
  try {
    const { periodId } = req.params;
    const records = await hrService.getPayrollRecords(periodId);
    res.json(records);
  } catch (error) {
    console.error("Error fetching payroll records:", error);
    res.status(500).json({ message: "Failed to fetch payroll records" });
  }
});

// Get individual payroll record
router.get("/payroll/record/:recordId", isAuthenticated, requireHRAccess, async (req, res) => {
  try {
    const { recordId } = req.params;
    const record = await hrService.getPayrollRecord(recordId);
    
    if (!record) {
      return res.status(404).json({ message: "Payroll record not found" });
    }
    
    res.json(record);
  } catch (error) {
    console.error("Error fetching payroll record:", error);
    res.status(500).json({ message: "Failed to fetch payroll record" });
  }
});

// Approve payroll record
router.put("/payroll/record/:recordId/approve", isAuthenticated, requireHRAccess, async (req, res) => {
  try {
    const { recordId } = req.params;
    const record = await hrService.approvePayrollRecord(recordId, req.user.id);
    
    if (!record) {
      return res.status(404).json({ message: "Payroll record not found" });
    }
    
    res.json(record);
  } catch (error) {
    console.error("Error approving payroll record:", error);
    res.status(500).json({ message: "Failed to approve payroll record" });
  }
});

// Mark payroll as paid
router.put("/payroll/record/:recordId/pay", isAuthenticated, requireHRAccess, async (req, res) => {
  try {
    const { recordId } = req.params;
    const { paymentMode, paymentReference } = req.body;
    
    const record = await hrService.markPayrollAsPaid(
      recordId, 
      req.user.id, 
      paymentMode, 
      paymentReference
    );
    
    if (!record) {
      return res.status(404).json({ message: "Payroll record not found" });
    }
    
    res.json(record);
  } catch (error) {
    console.error("Error marking payroll as paid:", error);
    res.status(500).json({ message: "Failed to mark payroll as paid" });
  }
});

// Generate salary slip
router.get("/payroll/salary-slip/:recordId", isAuthenticated, requireHRAccess, async (req, res) => {
  try {
    const { recordId } = req.params;
    const salarySlip = await hrService.generateSalarySlip(recordId);
    
    if (!salarySlip) {
      return res.status(404).json({ message: "Payroll record not found" });
    }
    
    res.json(salarySlip);
  } catch (error) {
    console.error("Error generating salary slip:", error);
    res.status(500).json({ message: "Failed to generate salary slip" });
  }
});

// Get payroll analytics
router.get("/payroll/analytics", isAuthenticated, requireHRAccess, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const analytics = await hrService.getPayrollAnalytics(
      startDate as string,
      endDate as string
    );
    res.json(analytics);
  } catch (error) {
    console.error("Error fetching payroll analytics:", error);
    res.status(500).json({ message: "Failed to fetch payroll analytics" });
  }
});

export default router;