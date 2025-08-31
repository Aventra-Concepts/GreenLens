import { 
  SalaryStructure, 
  AttendanceRecord, 
  StatutoryRate, 
  TaxSlab,
  PayrollRecord,
  InsertPayrollRecord 
} from '@shared/schema';

// Indian Payroll Calculation Service
export class PayrollCalculationService {

  // Calculate provident fund deductions per Indian PF Act
  calculatePF(basicSalary: number, statutoryRates: StatutoryRate, voluntaryPF: number = 0) {
    const pfWageLimit = Number(statutoryRates.pfWageLimit) || 15000;
    const pfBasicSalary = Math.min(basicSalary, pfWageLimit);
    
    const pfEmployeeRate = Number(statutoryRates.pfEmployeeRate) || 12;
    const pfEmployerRate = Number(statutoryRates.pfEmployerRate) || 12;
    const epfRate = Number(statutoryRates.epfRate) || 8.33;
    const edliRate = Number(statutoryRates.edliRate) || 0.5;
    const pfAdminChargesRate = Number(statutoryRates.pfAdminCharges) || 1.1;

    // Employee PF contribution
    const pfEmployeeContribution = Math.round((pfBasicSalary * pfEmployeeRate) / 100);
    
    // Employer contributions
    const epfContribution = Math.round((pfBasicSalary * epfRate) / 100);
    const epsContribution = Math.round((pfBasicSalary * (pfEmployerRate - epfRate)) / 100);
    const edliContribution = Math.round((pfBasicSalary * edliRate) / 100);
    const pfAdminCharges = Math.round((pfBasicSalary * pfAdminChargesRate) / 100);
    
    const totalEmployerPF = epfContribution + epsContribution + edliContribution + pfAdminCharges;
    
    return {
      pfEmployee: pfEmployeeContribution + voluntaryPF,
      pfEmployer: totalEmployerPF,
      epf: epfContribution,
      eps: epsContribution,
      edli: edliContribution,
      pfAdminCharges,
      voluntaryPf: voluntaryPF,
      pfWageLimit,
      applicableBasic: pfBasicSalary
    };
  }

  // Calculate ESI deductions per Indian ESI Act
  calculateESI(grossSalary: number, statutoryRates: StatutoryRate) {
    const esiWageLimit = Number(statutoryRates.esiWageLimit) || 25000;
    
    // ESI is applicable only if gross salary <= wage limit
    if (grossSalary > esiWageLimit) {
      return {
        esiEmployee: 0,
        esiEmployer: 0,
        esiApplicable: false,
        esiWageLimit
      };
    }
    
    const esiEmployeeRate = Number(statutoryRates.esiEmployeeRate) || 0.75;
    const esiEmployerRate = Number(statutoryRates.esiEmployerRate) || 3.25;
    
    const esiEmployeeContribution = Math.round((grossSalary * esiEmployeeRate) / 100);
    const esiEmployerContribution = Math.round((grossSalary * esiEmployerRate) / 100);
    
    return {
      esiEmployee: esiEmployeeContribution,
      esiEmployer: esiEmployerContribution,
      esiApplicable: true,
      esiWageLimit
    };
  }

  // Calculate TDS based on Indian Income Tax slabs
  calculateTDS(annualSalary: number, taxSlabs: TaxSlab[], regime: 'old' | 'new' = 'old') {
    const applicableSlabs = taxSlabs.filter(slab => 
      slab.regime === regime && slab.isActive
    ).sort((a, b) => Number(a.slabFrom) - Number(b.slabFrom));

    let totalTax = 0;
    let remainingIncome = annualSalary;

    for (const slab of applicableSlabs) {
      const slabFrom = Number(slab.slabFrom);
      const slabTo = slab.slabTo ? Number(slab.slabTo) : Infinity;
      const taxRate = Number(slab.taxRate);
      const surcharge = Number(slab.surcharge) || 0;
      const cess = Number(slab.cess) || 4;

      if (remainingIncome <= 0) break;

      const taxableInThisSlab = Math.min(remainingIncome, slabTo - slabFrom);
      if (taxableInThisSlab > 0) {
        let slabTax = (taxableInThisSlab * taxRate) / 100;
        
        // Apply surcharge if applicable (typically for high income)
        if (surcharge > 0) {
          slabTax += (slabTax * surcharge) / 100;
        }
        
        // Apply education cess
        slabTax += (slabTax * cess) / 100;
        
        totalTax += slabTax;
        remainingIncome -= taxableInThisSlab;
      }
    }

    const monthlyTDS = Math.round(totalTax / 12);
    
    return {
      annualTax: Math.round(totalTax),
      monthlyTDS,
      effectiveRate: annualSalary > 0 ? ((totalTax / annualSalary) * 100) : 0,
      regime
    };
  }

  // Calculate professional tax based on state
  calculateProfessionalTax(grossSalary: number, statutoryRates: StatutoryRate) {
    const monthlyLimit = Number(statutoryRates.ptMonthlyLimit) || 200;
    
    // Maharashtra/Karnataka professional tax slabs
    if (grossSalary <= 15000) return 0;
    if (grossSalary <= 25000) return 150;
    if (grossSalary <= 40000) return 200;
    return Math.min(300, monthlyLimit);
  }

  // Calculate attendance-based salary adjustments
  calculateAttendanceBasedSalary(
    basicSalary: number,
    allowances: number,
    workingDays: number,
    presentDays: number,
    paidLeaves: number = 0
  ) {
    const totalPaidDays = presentDays + paidLeaves;
    const attendanceRatio = totalPaidDays / workingDays;
    
    const adjustedBasic = Math.round(basicSalary * attendanceRatio);
    const adjustedAllowances = Math.round(allowances * attendanceRatio);
    const lossOfPay = (basicSalary + allowances) - (adjustedBasic + adjustedAllowances);
    
    return {
      adjustedBasic,
      adjustedAllowances,
      adjustedGross: adjustedBasic + adjustedAllowances,
      lossOfPay,
      attendanceRatio: Math.round(attendanceRatio * 100) / 100
    };
  }

  // Calculate overtime pay
  calculateOvertimePay(
    basicSalary: number,
    overtimeHours: number,
    overtimeRate: number = 1.5,
    workingDaysInMonth: number = 26,
    hoursPerDay: number = 8
  ) {
    if (overtimeHours <= 0) return 0;
    
    const hourlyRate = basicSalary / (workingDaysInMonth * hoursPerDay);
    const overtimeHourlyRate = hourlyRate * overtimeRate;
    
    return Math.round(overtimeHours * overtimeHourlyRate);
  }

  // Main payroll calculation function
  calculatePayroll(
    salaryStructure: SalaryStructure,
    attendanceData: {
      workingDays: number;
      presentDays: number;
      absentDays: number;
      paidLeaves: number;
      unpaidLeaves: number;
      overtimeHours: number;
    },
    statutoryRates: StatutoryRate,
    taxSlabs: TaxSlab[],
    advanceDeduction: number = 0,
    adjustments: { earnings: number; deductions: number } = { earnings: 0, deductions: 0 }
  ): any {

    const basicSalary = Number(salaryStructure.basicSalary);
    const hra = Number(salaryStructure.hra) || 0;
    const da = Number(salaryStructure.da) || 0;
    const conveyanceAllowance = Number(salaryStructure.conveyanceAllowance) || 0;
    const medicalAllowance = Number(salaryStructure.medicalAllowance) || 0;
    const specialAllowance = Number(salaryStructure.specialAllowance) || 0;
    const performanceIncentive = Number(salaryStructure.performanceIncentive) || 0;
    const otherAllowances = Number(salaryStructure.otherAllowances) || 0;

    // Calculate attendance-based adjustments
    const totalAllowances = hra + da + conveyanceAllowance + medicalAllowance + 
                           specialAllowance + performanceIncentive + otherAllowances;
    
    const attendanceAdjustment = this.calculateAttendanceBasedSalary(
      basicSalary,
      totalAllowances,
      attendanceData.workingDays,
      attendanceData.presentDays,
      attendanceData.paidLeaves
    );

    // Calculate overtime
    const overtimePay = this.calculateOvertimePay(
      attendanceAdjustment.adjustedBasic,
      attendanceData.overtimeHours
    );

    // Calculate gross earnings
    const grossEarnings = attendanceAdjustment.adjustedGross + overtimePay + adjustments.earnings;

    // Calculate statutory deductions
    const pfCalculation = this.calculatePF(
      attendanceAdjustment.adjustedBasic,
      statutoryRates,
      Number(salaryStructure.voluntaryPfContribution) || 0
    );

    const esiCalculation = this.calculateESI(grossEarnings, statutoryRates);

    // Calculate annual salary for TDS
    const annualGross = grossEarnings * 12;
    const tdsCalculation = this.calculateTDS(
      annualGross,
      taxSlabs,
      salaryStructure.taxRegime as 'old' | 'new'
    );

    const professionalTax = this.calculateProfessionalTax(grossEarnings, statutoryRates);

    // Insurance deductions
    const groupHealthInsurance = Number(salaryStructure.groupHealthInsurance) || 0;
    const termInsurance = Number(salaryStructure.termInsurance) || 0;

    // Calculate total deductions
    const totalDeductions = 
      pfCalculation.pfEmployee +
      esiCalculation.esiEmployee +
      tdsCalculation.monthlyTDS +
      professionalTax +
      groupHealthInsurance +
      termInsurance +
      advanceDeduction +
      adjustments.deductions;

    // Calculate net pay
    const netPay = grossEarnings - totalDeductions;

    return {
      // Attendance data
      workingDays: attendanceData.workingDays,
      presentDays: attendanceData.presentDays,
      absentDays: attendanceData.absentDays,
      paidLeaves: attendanceData.paidLeaves,
      unpaidLeaves: attendanceData.unpaidLeaves,
      overtimeHours: attendanceData.overtimeHours.toString(),

      // Earnings
      basicSalary: attendanceAdjustment.adjustedBasic.toString(),
      hra: Math.round((hra * attendanceAdjustment.attendanceRatio)).toString(),
      da: Math.round((da * attendanceAdjustment.attendanceRatio)).toString(),
      conveyanceAllowance: Math.round((conveyanceAllowance * attendanceAdjustment.attendanceRatio)).toString(),
      medicalAllowance: Math.round((medicalAllowance * attendanceAdjustment.attendanceRatio)).toString(),
      specialAllowance: Math.round((specialAllowance * attendanceAdjustment.attendanceRatio)).toString(),
      performanceIncentive: Math.round((performanceIncentive * attendanceAdjustment.attendanceRatio)).toString(),
      overtimePay: overtimePay.toString(),
      otherEarnings: adjustments.earnings.toString(),
      grossEarnings: grossEarnings.toString(),

      // Statutory deductions
      pfEmployee: pfCalculation.pfEmployee.toString(),
      pfEmployer: pfCalculation.pfEmployer.toString(),
      epf: pfCalculation.epf.toString(),
      eps: pfCalculation.eps.toString(),
      edli: pfCalculation.edli.toString(),
      pfAdminCharges: pfCalculation.pfAdminCharges.toString(),
      voluntaryPf: pfCalculation.voluntaryPf.toString(),

      esiEmployee: esiCalculation.esiEmployee.toString(),
      esiEmployer: esiCalculation.esiEmployer.toString(),

      tdsAmount: tdsCalculation.monthlyTDS.toString(),
      professionalTax: professionalTax.toString(),

      // Insurance
      groupHealthInsurance: groupHealthInsurance.toString(),
      termInsurance: termInsurance.toString(),

      // Other deductions
      salaryAdvanceDeduction: advanceDeduction.toString(),
      otherDeductions: adjustments.deductions.toString(),
      totalDeductions: totalDeductions.toString(),

      // Net pay
      netPay: netPay.toString(),

      status: 'calculated'
    };
  }

  // Validate payroll calculations
  validatePayrollCalculation(payrollRecord: any): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    const grossEarnings = Number(payrollRecord.grossEarnings) || 0;
    const totalDeductions = Number(payrollRecord.totalDeductions) || 0;
    const netPay = Number(payrollRecord.netPay) || 0;

    // Validate calculations
    if (Math.abs((grossEarnings - totalDeductions) - netPay) > 1) {
      errors.push('Net pay calculation mismatch');
    }

    if (grossEarnings <= 0) {
      errors.push('Gross earnings must be positive');
    }

    if (netPay < 0) {
      warnings.push('Net pay is negative - please review deductions');
    }

    const presentDays = payrollRecord.presentDays || 0;
    const workingDays = payrollRecord.workingDays || 0;
    
    if (presentDays > workingDays) {
      errors.push('Present days cannot exceed working days');
    }

    // Validate statutory limits
    const pfEmployee = Number(payrollRecord.pfEmployee) || 0;
    const basicSalary = Number(payrollRecord.basicSalary) || 0;
    
    if (pfEmployee > (basicSalary * 0.12)) {
      warnings.push('PF deduction seems high - please verify');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Generate salary slip summary
  generateSalarySummary(payrollRecord: PayrollRecord) {
    const grossEarnings = Number(payrollRecord.grossEarnings);
    const totalDeductions = Number(payrollRecord.totalDeductions);
    const netPay = Number(payrollRecord.netPay);

    const deductionBreakdown = {
      statutory: {
        pf: Number(payrollRecord.pfEmployee) + Number(payrollRecord.voluntaryPf),
        esi: Number(payrollRecord.esiEmployee),
        tds: Number(payrollRecord.tdsAmount),
        professionalTax: Number(payrollRecord.professionalTax)
      },
      insurance: {
        health: Number(payrollRecord.groupHealthInsurance),
        term: Number(payrollRecord.termInsurance)
      },
      other: {
        advance: Number(payrollRecord.salaryAdvanceDeduction),
        other: Number(payrollRecord.otherDeductions)
      }
    };

    return {
      grossEarnings,
      totalDeductions,
      netPay,
      deductionBreakdown,
      takeHomePercentage: Math.round((netPay / grossEarnings) * 100),
      attendanceRatio: Math.round((payrollRecord.presentDays / payrollRecord.workingDays) * 100)
    };
  }
}

export const payrollCalculationService = new PayrollCalculationService();