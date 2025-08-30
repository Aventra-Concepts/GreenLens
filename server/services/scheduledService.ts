import { StudentConversionService } from "./studentConversionService";

class ScheduledService {
  private conversionInterval: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  // Start the scheduled services
  start(): void {
    if (this.isRunning) {
      console.log('Scheduled services already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting scheduled services...');

    // Run student conversion check daily at 9:00 AM
    this.scheduleStudentConversion();

    // Initial run to catch any pending conversions
    this.runStudentConversionCheck();
  }

  // Stop the scheduled services
  stop(): void {
    if (this.conversionInterval) {
      clearInterval(this.conversionInterval);
      this.conversionInterval = null;
    }
    this.isRunning = false;
    console.log('Scheduled services stopped');
  }

  // Schedule daily student conversion check
  private scheduleStudentConversion(): void {
    // Calculate milliseconds until next 9:00 AM
    const now = new Date();
    const next9AM = new Date();
    next9AM.setHours(9, 0, 0, 0);
    
    // If it's already past 9 AM today, schedule for tomorrow
    if (now.getTime() > next9AM.getTime()) {
      next9AM.setDate(next9AM.getDate() + 1);
    }
    
    const msUntil9AM = next9AM.getTime() - now.getTime();
    
    // Set timeout for first run at 9:00 AM
    setTimeout(() => {
      this.runStudentConversionCheck();
      
      // Then set interval for every 24 hours
      this.conversionInterval = setInterval(() => {
        this.runStudentConversionCheck();
      }, 24 * 60 * 60 * 1000); // 24 hours
      
    }, msUntil9AM);
    
    console.log(`Student conversion scheduled for: ${next9AM.toLocaleString()}`);
  }

  // Run the student conversion check
  private async runStudentConversionCheck(): Promise<void> {
    try {
      console.log('Running scheduled student conversion check...');
      
      // Temporarily disabled until database schema is fixed
      // await StudentConversionService.updateAllStudentConversionDates();
      
      // Run automatic conversion
      const result = await StudentConversionService.runAutomaticConversion();
      
      console.log(`Student conversion completed: ${result.convertedCount} students converted`);
      
      if (result.errors.length > 0) {
        console.error('Student conversion errors:', result.errors);
      }
      
    } catch (error) {
      console.error('Error in scheduled student conversion:', error);
    }
  }

  // Manual trigger for testing
  async triggerStudentConversion(): Promise<{ convertedCount: number; errors: string[] }> {
    return await StudentConversionService.runAutomaticConversion();
  }

  // Check if services are running
  getStatus(): { running: boolean; nextConversionTime?: string } {
    const status: { running: boolean; nextConversionTime?: string } = {
      running: this.isRunning
    };

    if (this.isRunning) {
      const next9AM = new Date();
      next9AM.setHours(9, 0, 0, 0);
      
      if (new Date().getTime() > next9AM.getTime()) {
        next9AM.setDate(next9AM.getDate() + 1);
      }
      
      status.nextConversionTime = next9AM.toISOString();
    }

    return status;
  }
}

// Export singleton instance
export const scheduledService = new ScheduledService();