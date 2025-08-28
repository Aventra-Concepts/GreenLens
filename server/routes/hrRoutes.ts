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
} from "../../shared/schema";
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

export default router;