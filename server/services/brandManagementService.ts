import { storage } from '../storage';
import { BrandSetting } from '@shared/schema';
import { AdminAuthService } from './adminAuthService';
import fs from 'fs/promises';
import path from 'path';

export interface BrandConfiguration {
  logo: {
    primary: string;
    secondary?: string;
    favicon?: string;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    primaryFont: string;
    secondaryFont: string;
    headingFont: string;
  };
  banners: {
    hero: {
      imageUrl: string;
      title: string;
      subtitle: string;
      ctaText: string;
      overlay: boolean;
    };
    promotional?: {
      imageUrl: string;
      title: string;
      link: string;
      isActive: boolean;
    }[];
  };
  content: {
    companyName: string;
    tagline: string;
    description: string;
    contactInfo: {
      email: string;
      phone: string;
      address: string;
    };
  };
  social: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
}

export class BrandManagementService {
  /**
   * Get current brand configuration
   */
  static async getBrandConfiguration(): Promise<BrandConfiguration> {
    const settings = await storage.getAllBrandSettings();
    return this.settingsToConfiguration(settings);
  }

  /**
   * Update brand settings
   */
  static async updateBrandSettings(
    updates: Partial<BrandConfiguration>,
    updatedBy: string
  ): Promise<BrandConfiguration> {
    const settingsToUpdate = this.configurationToSettings(updates);

    // Update each setting
    for (const setting of settingsToUpdate) {
      await storage.upsertBrandSetting(setting);
    }

    // Log brand update
    await AdminAuthService.logAdminAction(
      updatedBy,
      'brand_settings_updated',
      {
        updatedCategories: Object.keys(updates),
        settingsCount: settingsToUpdate.length
      }
    );

    // Generate updated CSS file
    await this.generateBrandCSS();

    return await this.getBrandConfiguration();
  }

  /**
   * Upload and set logo
   */
  static async uploadLogo(
    logoType: 'primary' | 'secondary' | 'favicon',
    fileBuffer: Buffer,
    filename: string,
    uploadedBy: string
  ): Promise<string> {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads', 'brand');
    await fs.mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const extension = path.extname(filename);
    const uniqueFilename = `${logoType}-${Date.now()}${extension}`;
    const filePath = path.join(uploadsDir, uniqueFilename);

    // Save file
    await fs.writeFile(filePath, fileBuffer);

    // Update brand setting
    const logoUrl = `/uploads/brand/${uniqueFilename}`;
    await storage.upsertBrandSetting({
      key: `logo_${logoType}`,
      value: logoUrl,
      category: 'logo',
      description: `${logoType} logo image`,
      dataType: 'file'
    });

    // Log logo upload
    await AdminAuthService.logAdminAction(
      uploadedBy,
      'logo_uploaded',
      {
        logoType,
        filename: uniqueFilename,
        originalName: filename
      }
    );

    return logoUrl;
  }

  /**
   * Create promotional banner
   */
  static async createPromotionalBanner(
    banner: {
      title: string;
      imageUrl: string;
      link: string;
      startDate?: Date;
      endDate?: Date;
      position: 'top' | 'bottom' | 'sidebar';
    },
    createdBy: string
  ): Promise<void> {
    const banners = await this.getPromotionalBanners();
    
    const newBanner = {
      id: Date.now().toString(),
      ...banner,
      isActive: true,
      createdAt: new Date(),
      createdBy
    };

    banners.push(newBanner);

    await storage.upsertBrandSetting({
      key: 'promotional_banners',
      value: JSON.stringify(banners),
      category: 'banners',
      description: 'Promotional banners configuration',
      dataType: 'json'
    });

    // Log banner creation
    await AdminAuthService.logAdminAction(
      createdBy,
      'promotional_banner_created',
      {
        bannerId: newBanner.id,
        title: banner.title,
        position: banner.position
      }
    );
  }

  /**
   * Get promotional banners
   */
  static async getPromotionalBanners(): Promise<any[]> {
    const setting = await storage.getBrandSetting('promotional_banners');
    if (!setting || !setting.value) {
      return [];
    }

    try {
      return JSON.parse(setting.value);
    } catch {
      return [];
    }
  }

  /**
   * Update promotional banner
   */
  static async updatePromotionalBanner(
    bannerId: string,
    updates: any,
    updatedBy: string
  ): Promise<void> {
    const banners = await this.getPromotionalBanners();
    const bannerIndex = banners.findIndex(b => b.id === bannerId);

    if (bannerIndex === -1) {
      throw new Error('Banner not found');
    }

    banners[bannerIndex] = {
      ...banners[bannerIndex],
      ...updates,
      updatedAt: new Date(),
      updatedBy
    };

    await storage.upsertBrandSetting({
      key: 'promotional_banners',
      value: JSON.stringify(banners),
      category: 'banners',
      description: 'Promotional banners configuration',
      dataType: 'json'
    });

    // Log banner update
    await AdminAuthService.logAdminAction(
      updatedBy,
      'promotional_banner_updated',
      {
        bannerId,
        updates: Object.keys(updates)
      }
    );
  }

  /**
   * Delete promotional banner
   */
  static async deletePromotionalBanner(bannerId: string, deletedBy: string): Promise<void> {
    const banners = await this.getPromotionalBanners();
    const filteredBanners = banners.filter(b => b.id !== bannerId);

    await storage.upsertBrandSetting({
      key: 'promotional_banners',
      value: JSON.stringify(filteredBanners),
      category: 'banners',
      description: 'Promotional banners configuration',
      dataType: 'json'
    });

    // Log banner deletion
    await AdminAuthService.logAdminAction(
      deletedBy,
      'promotional_banner_deleted',
      { bannerId }
    );
  }

  /**
   * Generate CSS file from brand settings
   */
  private static async generateBrandCSS(): Promise<void> {
    const config = await this.getBrandConfiguration();
    
    const css = `
:root {
  --brand-primary: ${config.colors.primary};
  --brand-secondary: ${config.colors.secondary};
  --brand-accent: ${config.colors.accent};
  --brand-background: ${config.colors.background};
  --brand-text: ${config.colors.text};
  --brand-font-primary: ${config.typography.primaryFont};
  --brand-font-secondary: ${config.typography.secondaryFont};
  --brand-font-heading: ${config.typography.headingFont};
}

.brand-logo-primary {
  background-image: url('${config.logo.primary}');
}

.brand-logo-secondary {
  background-image: url('${config.logo.secondary || config.logo.primary}');
}

.brand-hero-banner {
  background-image: url('${config.banners.hero.imageUrl}');
}

body {
  font-family: var(--brand-font-primary), sans-serif;
  color: var(--brand-text);
  background-color: var(--brand-background);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--brand-font-heading), sans-serif;
}

.btn-primary {
  background-color: var(--brand-primary);
  border-color: var(--brand-primary);
}

.btn-secondary {
  background-color: var(--brand-secondary);
  border-color: var(--brand-secondary);
}

.accent {
  color: var(--brand-accent);
}
`;

    // Save CSS file
    const cssPath = path.join(process.cwd(), 'client', 'src', 'brand.css');
    await fs.writeFile(cssPath, css);
  }

  /**
   * Convert settings array to configuration object
   */
  private static settingsToConfiguration(settings: BrandSetting[]): BrandConfiguration {
    const config: any = {
      logo: {},
      colors: {},
      typography: {},
      banners: { hero: {} },
      content: { contactInfo: {} },
      social: {}
    };

    settings.forEach(setting => {
      const { key, value, dataType } = setting;
      let parsedValue = value;

      if (dataType === 'json' && value) {
        try {
          parsedValue = JSON.parse(value);
        } catch {
          parsedValue = value;
        }
      }

      // Map settings to configuration structure
      const keyParts = key.split('_');
      let target = config;

      for (let i = 0; i < keyParts.length - 1; i++) {
        const part = keyParts[i];
        if (!target[part]) target[part] = {};
        target = target[part];
      }

      target[keyParts[keyParts.length - 1]] = parsedValue;
    });

    return config;
  }

  /**
   * Convert configuration object to settings array
   */
  private static configurationToSettings(config: Partial<BrandConfiguration>): Array<{
    key: string;
    value: string;
    category: string;
    description: string;
    dataType: string;
  }> {
    const settings: any[] = [];

    const addSetting = (key: string, value: any, category: string, description: string) => {
      const dataType = typeof value === 'object' ? 'json' : 'string';
      const stringValue = dataType === 'json' ? JSON.stringify(value) : String(value);

      settings.push({
        key,
        value: stringValue,
        category,
        description,
        dataType
      });
    };

    // Convert each configuration section
    if (config.logo) {
      Object.entries(config.logo).forEach(([key, value]) => {
        addSetting(`logo_${key}`, value, 'logo', `${key} logo`);
      });
    }

    if (config.colors) {
      Object.entries(config.colors).forEach(([key, value]) => {
        addSetting(`colors_${key}`, value, 'colors', `${key} color`);
      });
    }

    if (config.typography) {
      Object.entries(config.typography).forEach(([key, value]) => {
        addSetting(`typography_${key}`, value, 'typography', `${key} font`);
      });
    }

    if (config.banners?.hero) {
      Object.entries(config.banners.hero).forEach(([key, value]) => {
        addSetting(`banners_hero_${key}`, value, 'banners', `Hero banner ${key}`);
      });
    }

    if (config.content) {
      Object.entries(config.content).forEach(([key, value]) => {
        addSetting(`content_${key}`, value, 'content', `Company ${key}`);
      });
    }

    if (config.social) {
      Object.entries(config.social).forEach(([key, value]) => {
        addSetting(`social_${key}`, value, 'social', `${key} social media link`);
      });
    }

    return settings;
  }

  /**
   * Preview brand changes without saving
   */
  static async previewBrandChanges(changes: Partial<BrandConfiguration>): Promise<string> {
    const currentConfig = await this.getBrandConfiguration();
    const previewConfig = { ...currentConfig, ...changes };
    
    // Generate preview CSS
    const previewCSS = this.generatePreviewCSS(previewConfig);
    
    // Save preview CSS with unique identifier
    const previewId = Date.now().toString();
    const previewPath = path.join(process.cwd(), 'temp', `brand-preview-${previewId}.css`);
    
    await fs.mkdir(path.dirname(previewPath), { recursive: true });
    await fs.writeFile(previewPath, previewCSS);
    
    return `/temp/brand-preview-${previewId}.css`;
  }

  /**
   * Generate preview CSS
   */
  private static generatePreviewCSS(config: BrandConfiguration): string {
    return `
/* Brand Preview CSS */
:root {
  --preview-primary: ${config.colors.primary};
  --preview-secondary: ${config.colors.secondary};
  --preview-accent: ${config.colors.accent};
  --preview-background: ${config.colors.background};
  --preview-text: ${config.colors.text};
}

.preview-mode {
  --brand-primary: var(--preview-primary);
  --brand-secondary: var(--preview-secondary);
  --brand-accent: var(--preview-accent);
  --brand-background: var(--preview-background);
  --brand-text: var(--preview-text);
}
`;
  }
}