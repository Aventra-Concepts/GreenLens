import { db } from '../db';
import { eq, desc, and, sql, gte, lte } from 'drizzle-orm';
import {
  microclimatezones,
  plantconnections,
  aiinsights,
  gardenblueprints,
  gardencommunity,
  communityinteractions,
  gardenanalytics,
  iotdevices,
  iotsensordata,
  type InsertMicroclimatezone,
  type InsertPlantconnection,
  type InsertAiinsight,
  type InsertGardenblueprint,
  type InsertGardencommunity,
  type InsertGardenanalytics,
  type InsertIotdevice,
  type InsertIotsensordata
} from '@shared/premium-features-schema';
import { plantResults } from '@shared/schema';

export class PremiumFeaturesService {
  
  // Microclimate Zones Management
  async createMicroclimatezone(userId: string, zoneData: Omit<InsertMicroclimatezone, 'userId'>) {
    const [zone] = await db
      .insert(microclimatezones)
      .values({ ...zoneData, userId })
      .returning();
    return zone;
  }

  async getUserMicroclimatezones(userId: string) {
    return await db
      .select()
      .from(microclimatezones)
      .where(eq(microclimatezones.userId, userId))
      .orderBy(desc(microclimatezones.createdAt));
  }

  async updateMicroclimatezone(zoneId: string, userId: string, updates: Partial<InsertMicroclimatezone>) {
    const [updatedZone] = await db
      .update(microclimatezones)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(microclimatezones.id, zoneId), eq(microclimatezones.userId, userId)))
      .returning();
    return updatedZone;
  }

  // Plant Social Network - Companion Planting
  async createPlantConnection(userId: string, connectionData: Omit<InsertPlantconnection, 'userId'>) {
    const [connection] = await db
      .insert(plantconnections)
      .values({ ...connectionData, userId })
      .returning();
    return connection;
  }

  async getPlantConnections(userId: string, plantId?: string) {
    if (plantId) {
      return await db
        .select()
        .from(plantconnections)
        .where(
          and(
            eq(plantconnections.userId, userId),
            sql`(${plantconnections.plantIdA} = ${plantId} OR ${plantconnections.plantIdB} = ${plantId})`
          )
        )
        .orderBy(desc(plantconnections.createdAt));
    }
    
    return await db
      .select()
      .from(plantconnections)
      .where(eq(plantconnections.userId, userId))
      .orderBy(desc(plantconnections.createdAt));
  }

  async getCompanionPlantRecommendations(userId: string, plantSpecies: string) {
    // Get successful companion plantings from community data
    return await db
      .select({
        plantSpecies: sql<string>`CASE 
          WHEN ${plantconnections.plantIdA} = ${plantSpecies} THEN ${plantconnections.plantIdB}
          ELSE ${plantconnections.plantIdA}
        END`,
        connectionType: plantconnections.connectionType,
        benefitDescription: plantconnections.benefitDescription,
        averageRating: sql<number>`AVG(CAST(${plantconnections.userRating} as numeric))`,
        confirmationCount: sql<number>`COUNT(*)`
      })
      .from(plantconnections)
      .where(
        and(
          sql`(${plantconnections.plantIdA} = ${plantSpecies} OR ${plantconnections.plantIdB} = ${plantSpecies})`,
          eq(plantconnections.connectionType, 'companion'),
          eq(plantconnections.communityConfirmed, true)
        )
      )
      .groupBy(sql`CASE 
        WHEN ${plantconnections.plantIdA} = ${plantSpecies} THEN ${plantconnections.plantIdB}
        ELSE ${plantconnections.plantIdA}
      END`, plantconnections.connectionType, plantconnections.benefitDescription)
      .having(sql`AVG(CAST(${plantconnections.userRating} as numeric)) >= 3.5`)
      .orderBy(desc(sql`AVG(CAST(${plantconnections.userRating} as numeric))`))
      .limit(10);
  }

  // AI-Powered Intelligence
  async generateAIInsight(userId: string, insightData: Omit<InsertAiinsight, 'userId'>) {
    const [insight] = await db
      .insert(aiinsights)
      .values({ ...insightData, userId })
      .returning();
    return insight;
  }

  async getUserAIInsights(userId: string, urgencyLevel?: string) {
    if (urgencyLevel) {
      return await db
        .select()
        .from(aiinsights)
        .where(and(eq(aiinsights.userId, userId), eq(aiinsights.urgencyLevel, urgencyLevel)))
        .orderBy(desc(aiinsights.createdAt));
    }

    return await db
      .select()
      .from(aiinsights)
      .where(eq(aiinsights.userId, userId))
      .orderBy(desc(aiinsights.createdAt))
      .limit(20);
  }

  async predictPlantHealth(userId: string, plantId: string) {
    // Simulate AI prediction based on historical data
    const recentResults = await db
      .select()
      .from(plantResults)
      .where(and(eq(plantResults.userId, userId), eq(plantResults.id, plantId)))
      .orderBy(desc(plantResults.createdAt))
      .limit(10);

    if (recentResults.length === 0) {
      return null;
    }

    // Calculate health trend
    const avgConfidence = recentResults.reduce((sum, result) => sum + parseFloat(result.confidence), 0) / recentResults.length;
    const trend = avgConfidence > 80 ? 'improving' : avgConfidence > 60 ? 'stable' : 'declining';

    return {
      currentHealth: avgConfidence,
      trend,
      prediction: trend === 'declining' ? 'Potential health issues may arise in 7-14 days' : 'Plant health appears stable',
      confidence: Math.min(95, avgConfidence + 10),
      recommendations: this.generateHealthRecommendations(trend, avgConfidence)
    };
  }

  private generateHealthRecommendations(trend: string, health: number) {
    const recommendations = [];
    
    if (trend === 'declining') {
      recommendations.push('Check soil moisture levels');
      recommendations.push('Inspect for pest activity');
      recommendations.push('Consider nutrient supplementation');
    } else if (health < 70) {
      recommendations.push('Monitor daily for changes');
      recommendations.push('Ensure proper lighting conditions');
    } else {
      recommendations.push('Continue current care routine');
      recommendations.push('Consider propagation opportunities');
    }
    
    return recommendations;
  }

  // Professional Garden Management
  async createGardenBlueprint(userId: string, blueprintData: Omit<InsertGardenblueprint, 'userId'>) {
    const [blueprint] = await db
      .insert(gardenblueprints)
      .values({ ...blueprintData, userId })
      .returning();
    return blueprint;
  }

  async getUserBlueprints(userId: string) {
    return await db
      .select()
      .from(gardenblueprints)
      .where(eq(gardenblueprints.userId, userId))
      .orderBy(desc(gardenblueprints.updatedAt));
  }

  async calculateGardenValue(userId: string, blueprintId: string) {
    const blueprint = await db
      .select()
      .from(gardenblueprints)
      .where(and(eq(gardenblueprints.id, blueprintId), eq(gardenblueprints.userId, userId)))
      .limit(1);

    if (!blueprint[0]) return null;

    // Simulate garden valuation calculation
    const baseValue = 1000; // Base garden value
    const plantCount = (blueprint[0].plantPlacements as any)?.length || 0;
    const sizeMultiplier = ((blueprint[0].gardenSize as any)?.width || 10) * ((blueprint[0].gardenSize as any)?.height || 10) / 100;
    
    const estimatedValue = baseValue + (plantCount * 50) + (sizeMultiplier * 200);
    
    return {
      currentValue: estimatedValue,
      potentialValue: estimatedValue * 1.3,
      appreciationRate: 8.5, // Annual %
      factors: {
        plantDiversity: plantCount * 2,
        gardenSize: sizeMultiplier,
        sustainabilityFeatures: 15
      }
    };
  }

  // Community & Social Features
  async createCommunityPost(userId: string, postData: Omit<InsertGardencommunity, 'userId'>) {
    const [post] = await db
      .insert(gardencommunity)
      .values({ ...postData, userId })
      .returning();
    return post;
  }

  async getCommunityPosts(limit: number = 20, offset: number = 0) {
    return await db
      .select({
        id: gardencommunity.id,
        userId: gardencommunity.userId,
        postType: gardencommunity.postType,
        title: gardencommunity.title,
        content: gardencommunity.content,
        images: gardencommunity.images,
        plantTags: gardencommunity.plantTags,
        location: gardencommunity.location,
        likesCount: gardencommunity.likesCount,
        commentsCount: gardencommunity.commentsCount,
        sharesCount: gardencommunity.sharesCount,
        isVerified: gardencommunity.isVerified,
        createdAt: gardencommunity.createdAt
      })
      .from(gardencommunity)
      .where(eq(gardencommunity.privacy, 'public'))
      .orderBy(desc(gardencommunity.createdAt))
      .limit(limit)
      .offset(offset);
  }

  // Advanced Analytics & Insights
  async generateGardenAnalytics(userId: string) {
    // Get user's plant data for analysis
    const userPlants = await db
      .select()
      .from(plantResults)
      .where(eq(plantResults.userId, userId));

    const analyticsData: InsertGardenanalytics = {
      userId,
      carbonFootprint: {
        co2Absorbed: userPlants.length * 2.5, // kg CO2 per plant per month
        emissionsSaved: userPlants.length * 1.2,
        offsetEquivalent: userPlants.length * 0.5 // miles not driven
      },
      waterUsage: {
        daily: userPlants.length * 0.5, // gallons per plant
        weekly: userPlants.length * 3.5,
        monthly: userPlants.length * 15,
        efficiency: 85 // percentage
      },
      soilHealth: {
        ph: 6.8,
        nitrogen: 'adequate',
        phosphorus: 'high',
        potassium: 'adequate',
        organicMatter: 12.5 // percentage
      },
      biodiversityIndex: Math.min(100, userPlants.length * 2.3),
      yieldAnalysis: {
        currentYield: userPlants.length * 2.5, // lbs per month (simplified)
        projectedAnnualYield: userPlants.length * 30,
        marketValue: userPlants.length * 45 // USD
      },
      costBenefitAnalysis: {
        totalInvestment: userPlants.length * 25, // Average per plant
        currentSavings: userPlants.length * 45,
        roi: "180", // percentage as string
        paybackPeriod: "8" // months as string
      },
      sustainabilityScore: Math.min(100, userPlants.length * 3.2 + 25),
      recommendations: [
        'Consider adding nitrogen-fixing plants like legumes',
        'Install rainwater collection for improved water efficiency',
        'Add composting system to improve soil organic matter',
        'Plant native species to support local wildlife'
      ],
      benchmarkComparison: {
        localAverage: 65,
        nationalAverage: 58,
        yourScore: Math.min(100, userPlants.length * 3.2 + 25)
      }
    };

    const [analytics] = await db
      .insert(gardenanalytics)
      .values(analyticsData)
      .returning();

    return analytics;
  }

  // Smart Technology Integration
  async registerIoTDevice(userId: string, deviceData: Omit<InsertIotdevice, 'userId'>) {
    const [device] = await db
      .insert(iotdevices)
      .values({ ...deviceData, userId })
      .returning();
    return device;
  }

  async getUserIoTDevices(userId: string) {
    return await db
      .select()
      .from(iotdevices)
      .where(eq(iotdevices.userId, userId))
      .orderBy(desc(iotdevices.installationDate));
  }

  async recordSensorData(deviceId: string, sensorData: Omit<InsertIotsensordata, 'deviceId'>) {
    const [data] = await db
      .insert(iotsensordata)
      .values({ ...sensorData, deviceId })
      .returning();

    // Update device last data received timestamp
    await db
      .update(iotdevices)
      .set({ lastDataReceived: new Date(), isOnline: true })
      .where(eq(iotdevices.id, deviceId));

    return data;
  }

  async getSensorData(deviceId: string, sensorType?: string, hours: number = 24) {
    const cutoffTime = new Date(Date.now() - (hours * 60 * 60 * 1000));
    
    if (sensorType) {
      return await db
        .select()
        .from(iotsensordata)
        .where(and(
          eq(iotsensordata.deviceId, deviceId),
          eq(iotsensordata.sensorType, sensorType),
          gte(iotsensordata.timestamp, cutoffTime)
        ))
        .orderBy(desc(iotsensordata.timestamp));
    }

    return await db
      .select()
      .from(iotsensordata)
      .where(and(
        eq(iotsensordata.deviceId, deviceId),
        gte(iotsensordata.timestamp, cutoffTime)
      ))
      .orderBy(desc(iotsensordata.timestamp));
  }

  // Real-time Dashboard Data
  async getPremiumDashboardData(userId: string) {
    const [zones, insights, devices, analytics] = await Promise.all([
      this.getUserMicroclimatezones(userId),
      this.getUserAIInsights(userId),
      this.getUserIoTDevices(userId),
      db.select().from(gardenanalytics).where(eq(gardenanalytics.userId, userId)).orderBy(desc(gardenanalytics.reportDate)).limit(1)
    ]);

    return {
      microclimatezones: zones,
      aiInsights: insights.slice(0, 5), // Latest 5 insights
      iotDevices: devices,
      latestAnalytics: analytics[0] || null,
      systemStatus: {
        devicesOnline: devices.filter((d: any) => d.isOnline).length,
        totalDevices: devices.length,
        dataFreshness: devices.length > 0 ? 'real-time' : 'no-data',
        alertsActive: insights.filter((i: any) => i.urgencyLevel === 'high' || i.urgencyLevel === 'critical').length
      }
    };
  }
}

export const premiumFeaturesService = new PremiumFeaturesService();