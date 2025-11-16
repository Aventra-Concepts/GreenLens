import { Express } from 'express';
import { storage } from '../storage';
import { 
  insertSeedsInventorySchema,
  insertSuppliesInventorySchema,
  insertGardenExpenseSchema,
  insertHarvestLogSchema
} from '@shared/schema';
import { z } from 'zod';

export function registerInventoryRoutes(app: Express) {

  // Seeds Inventory Routes
  app.get('/api/inventory/seeds', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const seeds = await storage.getSeedsInventory(req.user.id);
      res.json(seeds);
    } catch (error) {
      console.error('Error fetching seeds inventory:', error);
      res.status(500).json({ message: 'Failed to fetch seeds inventory' });
    }
  });

  app.post('/api/inventory/seeds', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const validatedData = insertSeedsInventorySchema.parse({
        ...req.body,
        userId: req.user.id,
      });

      const seed = await storage.createSeedsItem(validatedData);
      res.status(201).json(seed);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid data', errors: error.errors });
      }
      console.error('Error creating seed item:', error);
      res.status(500).json({ message: 'Failed to create seed item' });
    }
  });

  app.patch('/api/inventory/seeds/:id', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const updates = req.body;
      const seed = await storage.updateSeedsItem(req.params.id, req.user.id, updates);
      
      if (!seed) {
        return res.status(404).json({ message: 'Seed item not found' });
      }

      res.json(seed);
    } catch (error) {
      console.error('Error updating seed item:', error);
      res.status(500).json({ message: 'Failed to update seed item' });
    }
  });

  app.delete('/api/inventory/seeds/:id', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      await storage.deleteSeedsItem(req.params.id, req.user.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting seed item:', error);
      res.status(500).json({ message: 'Failed to delete seed item' });
    }
  });

  // Supplies Inventory Routes
  app.get('/api/inventory/supplies', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const supplies = await storage.getSuppliesInventory(req.user.id);
      res.json(supplies);
    } catch (error) {
      console.error('Error fetching supplies inventory:', error);
      res.status(500).json({ message: 'Failed to fetch supplies inventory' });
    }
  });

  app.get('/api/inventory/supplies/low-stock', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const lowStockSupplies = await storage.getLowStockSupplies(req.user.id);
      res.json(lowStockSupplies);
    } catch (error) {
      console.error('Error fetching low stock supplies:', error);
      res.status(500).json({ message: 'Failed to fetch low stock supplies' });
    }
  });

  app.post('/api/inventory/supplies', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const validatedData = insertSuppliesInventorySchema.parse({
        ...req.body,
        userId: req.user.id,
      });

      const supply = await storage.createSuppliesItem(validatedData);
      res.status(201).json(supply);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid data', errors: error.errors });
      }
      console.error('Error creating supply item:', error);
      res.status(500).json({ message: 'Failed to create supply item' });
    }
  });

  app.patch('/api/inventory/supplies/:id', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const updates = req.body;
      const supply = await storage.updateSuppliesItem(req.params.id, req.user.id, updates);
      
      if (!supply) {
        return res.status(404).json({ message: 'Supply item not found' });
      }

      res.json(supply);
    } catch (error) {
      console.error('Error updating supply item:', error);
      res.status(500).json({ message: 'Failed to update supply item' });
    }
  });

  app.delete('/api/inventory/supplies/:id', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      await storage.deleteSuppliesItem(req.params.id, req.user.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting supply item:', error);
      res.status(500).json({ message: 'Failed to delete supply item' });
    }
  });

  // Garden Expenses Routes
  app.get('/api/inventory/expenses', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { startDate, endDate } = req.query;

      let expenses;
      if (startDate && endDate) {
        expenses = await storage.getExpensesByDateRange(
          req.user.id,
          startDate as string,
          endDate as string
        );
      } else {
        expenses = await storage.getGardenExpenses(req.user.id);
      }

      res.json(expenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      res.status(500).json({ message: 'Failed to fetch expenses' });
    }
  });

  app.post('/api/inventory/expenses', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const validatedData = insertGardenExpenseSchema.parse({
        ...req.body,
        userId: req.user.id,
      });

      const expense = await storage.createGardenExpense(validatedData);
      res.status(201).json(expense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid data', errors: error.errors });
      }
      console.error('Error creating expense:', error);
      res.status(500).json({ message: 'Failed to create expense' });
    }
  });

  app.patch('/api/inventory/expenses/:id', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const updates = req.body;
      const expense = await storage.updateGardenExpense(req.params.id, req.user.id, updates);
      
      if (!expense) {
        return res.status(404).json({ message: 'Expense not found' });
      }

      res.json(expense);
    } catch (error) {
      console.error('Error updating expense:', error);
      res.status(500).json({ message: 'Failed to update expense' });
    }
  });

  app.delete('/api/inventory/expenses/:id', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      await storage.deleteGardenExpense(req.params.id, req.user.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting expense:', error);
      res.status(500).json({ message: 'Failed to delete expense' });
    }
  });

  // Harvest Logs Routes
  app.get('/api/inventory/harvests', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { startDate, endDate } = req.query;

      let harvests;
      if (startDate && endDate) {
        harvests = await storage.getHarvestsByDateRange(
          req.user.id,
          startDate as string,
          endDate as string
        );
      } else {
        harvests = await storage.getHarvestLogs(req.user.id);
      }

      res.json(harvests);
    } catch (error) {
      console.error('Error fetching harvest logs:', error);
      res.status(500).json({ message: 'Failed to fetch harvest logs' });
    }
  });

  app.post('/api/inventory/harvests', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const validatedData = insertHarvestLogSchema.parse({
        ...req.body,
        userId: req.user.id,
      });

      const harvest = await storage.createHarvestLog(validatedData);
      res.status(201).json(harvest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid data', errors: error.errors });
      }
      console.error('Error creating harvest log:', error);
      res.status(500).json({ message: 'Failed to create harvest log' });
    }
  });

  app.patch('/api/inventory/harvests/:id', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const updates = req.body;
      const harvest = await storage.updateHarvestLog(req.params.id, req.user.id, updates);
      
      if (!harvest) {
        return res.status(404).json({ message: 'Harvest log not found' });
      }

      res.json(harvest);
    } catch (error) {
      console.error('Error updating harvest log:', error);
      res.status(500).json({ message: 'Failed to update harvest log' });
    }
  });

  app.delete('/api/inventory/harvests/:id', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      await storage.deleteHarvestLog(req.params.id, req.user.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting harvest log:', error);
      res.status(500).json({ message: 'Failed to delete harvest log' });
    }
  });

  // Financial Summary Route
  app.get('/api/inventory/financials', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const financials = await storage.getInventoryFinancials(req.user.id);
      res.json(financials);
    } catch (error) {
      console.error('Error fetching financials:', error);
      res.status(500).json({ message: 'Failed to fetch financial summary' });
    }
  });
}
