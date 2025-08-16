interface LocalizedName {
  language: string;
  name: string;
  region?: string;
}

interface PlantNameTranslation {
  scientificName: string;
  commonNames: LocalizedName[];
}

export class PlantNamesService {
  // Common plant name translations for major languages
  private nameDatabase: Map<string, LocalizedName[]> = new Map([
    // Example entries - in production this would come from a comprehensive database
    ['Rosa', [
      { language: 'en', name: 'Rose' },
      { language: 'es', name: 'Rosa' },
      { language: 'fr', name: 'Rose' },
      { language: 'de', name: 'Rose' },
      { language: 'it', name: 'Rosa' },
      { language: 'pt', name: 'Rosa' },
      { language: 'zh', name: '玫瑰' },
      { language: 'ja', name: 'バラ' },
      { language: 'ko', name: '장미' },
      { language: 'ar', name: 'وردة' },
      { language: 'hi', name: 'गुलाब' },
      { language: 'ru', name: 'Роза' },
    ]],
    ['Aloe vera', [
      { language: 'en', name: 'Aloe Vera' },
      { language: 'es', name: 'Sábila' },
      { language: 'fr', name: 'Aloès' },
      { language: 'de', name: 'Echte Aloe' },
      { language: 'it', name: 'Aloe Vera' },
      { language: 'pt', name: 'Babosa' },
      { language: 'zh', name: '芦荟' },
      { language: 'ja', name: 'アロエベラ' },
      { language: 'ko', name: '알로에 베라' },
      { language: 'ar', name: 'الألوة فيرا' },
      { language: 'hi', name: 'घृतकुमारी' },
      { language: 'ru', name: 'Алоэ вера' },
    ]],
  ]);

  async getLocalizedNames(scientificName: string, preferredLanguage: string = 'en'): Promise<{
    primaryName: string;
    alternativeNames: LocalizedName[];
  }> {
    // First try exact match
    let localizedNames = this.nameDatabase.get(scientificName);
    
    // If not found, try genus match
    if (!localizedNames) {
      const genus = scientificName.split(' ')[0];
      localizedNames = this.nameDatabase.get(genus);
    }

    // Fallback to scientific name if no translations found
    if (!localizedNames) {
      return {
        primaryName: scientificName,
        alternativeNames: []
      };
    }

    // Find preferred language name
    const preferredName = localizedNames.find(name => name.language === preferredLanguage);
    const primaryName = preferredName?.name || localizedNames.find(name => name.language === 'en')?.name || scientificName;

    // Return other language alternatives
    const alternativeNames = localizedNames.filter(name => 
      name.language !== preferredLanguage && name.name !== primaryName
    );

    return {
      primaryName,
      alternativeNames
    };
  }

  async enrichPlantSpecies(species: any, preferredLanguage: string = 'en'): Promise<any> {
    const { primaryName, alternativeNames } = await this.getLocalizedNames(
      species.scientificName, 
      preferredLanguage
    );

    return {
      ...species,
      localizedNames: {
        primary: primaryName,
        alternatives: alternativeNames,
        scientific: species.scientificName,
      }
    };
  }

  // Get available languages for UI
  getSupportedLanguages(): Array<{ code: string; name: string; nativeName: string }> {
    return [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'es', name: 'Spanish', nativeName: 'Español' },
      { code: 'fr', name: 'French', nativeName: 'Français' },
      { code: 'de', name: 'German', nativeName: 'Deutsch' },
      { code: 'it', name: 'Italian', nativeName: 'Italiano' },
      { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
      { code: 'zh', name: 'Chinese', nativeName: '中文' },
      { code: 'ja', name: 'Japanese', nativeName: '日本語' },
      { code: 'ko', name: 'Korean', nativeName: '한국어' },
      { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
      { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
      { code: 'ru', name: 'Russian', nativeName: 'Русский' },
    ];
  }
}

export const plantNamesService = new PlantNamesService();