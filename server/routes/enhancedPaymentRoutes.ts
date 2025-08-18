import { Router, Request, Response } from 'express';
import { enhancedPaymentService, PaymentGateway, PaymentDirection, PaymentRegion, PaymentMethod, Currency } from '../services/enhancedPaymentService';
import { requireAuth } from '../auth';
import { z } from 'zod';

const router = Router();

// Get available payment gateways
router.get('/gateways', async (req: Request, res: Response) => {
  try {
    const { currency, direction, region, method, amount } = req.query;
    
    const criteria: any = {};
    if (currency) criteria.currency = currency as Currency;
    if (direction) criteria.direction = direction as PaymentDirection;
    if (region) criteria.region = region as PaymentRegion;
    if (method) criteria.method = method as PaymentMethod;
    if (amount) criteria.amount = parseFloat(amount as string);
    
    const gateways = enhancedPaymentService.getAvailableGateways(criteria);
    
    res.json({
      success: true,
      gateways: gateways.map(g => ({
        gateway: g.gateway,
        supportedMethods: g.supportedMethods,
        supportedCurrencies: g.supportedCurrencies,
        supportedRegions: g.supportedRegions,
        supportedDirections: g.supportedDirections,
        minAmount: g.minAmount,
        maxAmount: g.maxAmount,
        processingFee: g.processingFee,
        fixedFee: g.fixedFee,
      })),
    });
  } catch (error) {
    console.error('Get gateways error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available gateways',
    });
  }
});

// Get optimal payment gateway
router.post('/optimal-gateway', async (req: Request, res: Response) => {
  try {
    const { currency, direction, region, method, amount } = req.body;
    
    if (!currency || !direction || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Currency, direction, and amount are required',
      });
    }
    
    const criteria = {
      currency: currency as Currency,
      direction: direction as PaymentDirection,
      region: region as PaymentRegion,
      method: method as PaymentMethod,
      amount: parseFloat(amount),
    };
    
    const optimalGateway = enhancedPaymentService.getOptimalGateway(criteria);
    
    if (!optimalGateway) {
      return res.status(404).json({
        success: false,
        message: 'No suitable gateway found for the given criteria',
      });
    }
    
    const fees = enhancedPaymentService.calculateFees(optimalGateway.gateway, criteria.amount);
    
    res.json({
      success: true,
      gateway: {
        name: optimalGateway.gateway,
        supportedMethods: optimalGateway.supportedMethods,
        fees: fees,
        estimatedTotal: criteria.amount + fees.totalFee,
      },
    });
  } catch (error) {
    console.error('Get optimal gateway error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to find optimal gateway',
    });
  }
});

// Create payment intent
const CreatePaymentSchema = z.object({
  amount: z.number().positive(),
  currency: z.string(),
  gateway: z.nativeEnum(PaymentGateway),
  method: z.nativeEnum(PaymentMethod),
  direction: z.nativeEnum(PaymentDirection),
  description: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

router.post('/intent', requireAuth, async (req: any, res: Response) => {
  try {
    const validatedData = CreatePaymentSchema.parse(req.body);
    
    const result = await enhancedPaymentService.createPaymentIntent({
      ...validatedData,
      currency: validatedData.currency as Currency,
    });
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Create payment intent error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
    });
  }
});

// Calculate fees for a transaction
router.post('/calculate-fees', async (req: Request, res: Response) => {
  try {
    const { gateway, amount } = req.body;
    
    if (!gateway || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Gateway and amount are required',
      });
    }
    
    const fees = enhancedPaymentService.calculateFees(gateway as PaymentGateway, parseFloat(amount));
    
    res.json({
      success: true,
      fees: {
        amount: parseFloat(amount),
        processingFee: fees.processingFee,
        fixedFee: fees.fixedFee,
        totalFee: fees.totalFee,
        finalAmount: parseFloat(amount) + fees.totalFee,
      },
    });
  } catch (error) {
    console.error('Calculate fees error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate fees',
    });
  }
});

// Get gateway status and configuration
router.get('/status', requireAuth, async (req: any, res: Response) => {
  try {
    // Only allow admins to view gateway status
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }
    
    const status = enhancedPaymentService.getGatewayStatus();
    
    res.json({
      success: true,
      gateways: status,
      summary: {
        totalGateways: status.length,
        enabledGateways: status.filter(g => g.enabled).length,
        setupCompleted: status.filter(g => g.setupCompleted).length,
        inwardGateways: status.filter(g => g.supportedDirections.includes(PaymentDirection.INWARD)).length,
        outwardGateways: status.filter(g => g.supportedDirections.includes(PaymentDirection.OUTWARD)).length,
        internationalGateways: status.filter(g => g.supportedRegions.includes(PaymentRegion.INTERNATIONAL)).length,
        domesticGateways: status.filter(g => g.supportedRegions.includes(PaymentRegion.DOMESTIC)).length,
      },
    });
  } catch (error) {
    console.error('Get gateway status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gateway status',
    });
  }
});

// Get supported currencies
router.get('/currencies', async (req: Request, res: Response) => {
  try {
    const { gateway } = req.query;
    
    if (gateway) {
      const gateways = enhancedPaymentService.getAvailableGateways({});
      const specificGateway = gateways.find(g => g.gateway === gateway);
      
      if (!specificGateway) {
        return res.status(404).json({
          success: false,
          message: 'Gateway not found',
        });
      }
      
      res.json({
        success: true,
        gateway: gateway,
        currencies: specificGateway.supportedCurrencies,
      });
    } else {
      // Return all unique currencies across all gateways
      const allGateways = enhancedPaymentService.getAvailableGateways({});
      const allCurrencies = Array.from(new Set(allGateways.flatMap(g => g.supportedCurrencies)));
      
      res.json({
        success: true,
        currencies: allCurrencies.sort(),
      });
    }
  } catch (error) {
    console.error('Get currencies error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch supported currencies',
    });
  }
});

// Get supported payment methods
router.get('/methods', async (req: Request, res: Response) => {
  try {
    const { currency, gateway, region } = req.query;
    
    const criteria: any = {};
    if (currency) criteria.currency = currency as Currency;
    if (region) criteria.region = region as PaymentRegion;
    
    let gateways = enhancedPaymentService.getAvailableGateways(criteria);
    
    if (gateway) {
      gateways = gateways.filter(g => g.gateway === gateway);
    }
    
    const allMethods = Array.from(new Set(gateways.flatMap(g => g.supportedMethods)));
    
    res.json({
      success: true,
      methods: allMethods,
      gatewayMethods: gateways.map(g => ({
        gateway: g.gateway,
        methods: g.supportedMethods,
      })),
    });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment methods',
    });
  }
});

// Regional availability
router.get('/regions', async (req: Request, res: Response) => {
  try {
    const gateways = enhancedPaymentService.getAvailableGateways({});
    
    const international = gateways.filter(g => g.supportedRegions.includes(PaymentRegion.INTERNATIONAL));
    const domestic = gateways.filter(g => g.supportedRegions.includes(PaymentRegion.DOMESTIC));
    
    res.json({
      success: true,
      regions: {
        international: {
          count: international.length,
          gateways: international.map(g => g.gateway),
          currencies: Array.from(new Set(international.flatMap(g => g.supportedCurrencies))),
          methods: Array.from(new Set(international.flatMap(g => g.supportedMethods))),
        },
        domestic: {
          count: domestic.length,
          gateways: domestic.map(g => g.gateway),
          currencies: Array.from(new Set(domestic.flatMap(g => g.supportedCurrencies))),
          methods: Array.from(new Set(domestic.flatMap(g => g.supportedMethods))),
        },
      },
    });
  } catch (error) {
    console.error('Get regions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch regional information',
    });
  }
});

export default router;