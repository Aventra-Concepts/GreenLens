import { geminiService } from "./gemini";

export class CarePlannerService {
  async generateCarePlan({ identification, catalogInfo }: any) {
    try {
      // Merge identification and catalog data, then use Gemini to synthesize comprehensive care plan
      const carePlan = await geminiService.synthesizeCarePlan({
        identification,
        catalog: catalogInfo,
      });

      // Add additional metadata
      const enrichedCarePlan = {
        ...carePlan,
        plant_info: {
          commonName: identification.species.commonName,
          scientificName: identification.species.scientificName,
          family: catalogInfo.family || 'Unknown',
          difficulty: this.assessDifficulty(carePlan, catalogInfo),
          petSafe: this.assessPetSafety(identification.species.scientificName),
          matureSize: catalogInfo.matureSize || 'Varies',
          growthRate: catalogInfo.growthRate || 'Medium',
        },
        care_reminders: this.generateCareReminders(carePlan),
        generated_at: new Date().toISOString(),
      };

      return enrichedCarePlan;

    } catch (error) {
      console.error("Care planner error:", error);
      throw new Error("Failed to generate comprehensive care plan");
    }
  }

  private assessDifficulty(carePlan: any, catalogInfo: any): string {
    const careLevel = catalogInfo.careLevel?.toLowerCase();
    
    if (careLevel === 'easy' || careLevel === 'low') return 'Easy';
    if (careLevel === 'moderate' || careLevel === 'medium') return 'Moderate';
    if (careLevel === 'hard' || careLevel === 'high') return 'Difficult';

    // Assess based on care requirements
    let complexityScore = 0;
    
    if (carePlan.watering?.frequency?.includes('daily')) complexityScore += 2;
    else if (carePlan.watering?.frequency?.includes('weekly')) complexityScore += 1;
    
    if (carePlan.humidity?.range?.includes('60')) complexityScore += 1;
    if (carePlan.light?.level?.includes('direct')) complexityScore += 1;
    
    if (complexityScore <= 1) return 'Easy';
    if (complexityScore <= 3) return 'Moderate';
    return 'Difficult';
  }

  private assessPetSafety(scientificName: string): boolean {
    // Basic pet safety assessment - in production, this would use a comprehensive database
    const toxicToCommonPets = [
      'ficus lyrata', 'monstera deliciosa', 'pothos', 'epipremnum',
      'philodendron', 'dieffenbachia', 'caladium', 'alocasia',
      'colocasia', 'anthurium', 'spathiphyllum', 'zamioculcas'
    ];
    
    const lowerName = scientificName.toLowerCase();
    return !toxicToCommonPets.some(toxic => lowerName.includes(toxic));
  }

  private generateCareReminders(carePlan: any) {
    const reminders = [];
    
    // Watering reminders
    if (carePlan.watering?.frequency) {
      const frequency = carePlan.watering.frequency.toLowerCase();
      if (frequency.includes('daily')) {
        reminders.push({ type: 'watering', interval: 'daily', message: 'Check soil moisture' });
      } else if (frequency.includes('week')) {
        const days = this.extractDays(frequency) || 7;
        reminders.push({ type: 'watering', interval: `${days}d`, message: 'Water when soil is dry' });
      }
    }

    // Fertilizing reminders
    if (carePlan.fertilizer?.frequency) {
      const frequency = carePlan.fertilizer.frequency.toLowerCase();
      if (frequency.includes('monthly')) {
        reminders.push({ type: 'fertilizing', interval: '30d', message: 'Apply diluted fertilizer' });
      } else if (frequency.includes('weekly')) {
        reminders.push({ type: 'fertilizing', interval: '7d', message: 'Apply weekly fertilizer' });
      }
    }

    // General care reminders
    reminders.push({ type: 'inspection', interval: '7d', message: 'Check for pests and diseases' });
    reminders.push({ type: 'cleaning', interval: '14d', message: 'Dust leaves and clean plant' });

    return reminders;
  }

  private extractDays(text: string): number | null {
    const match = text.match(/(\d+)[\s-]*days?/i);
    return match ? parseInt(match[1]) : null;
  }
}

export const carePlannerService = new CarePlannerService();
