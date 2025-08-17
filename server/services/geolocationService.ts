// Geolocation service to detect user location and determine product availability
export class GeolocationService {
  static async detectUserCountry(ip?: string): Promise<string> {
    try {
      // Use a simple IP geolocation service
      if (!ip || ip === '127.0.0.1' || ip === '::1') {
        // For local development, return a default country
        return 'US';
      }

      // Use ipapi.co for IP geolocation (free tier available)
      const response = await fetch(`https://ipapi.co/${ip}/country/`);
      if (response.ok) {
        const country = await response.text();
        return country.trim();
      }
    } catch (error) {
      console.error('Geolocation detection failed:', error);
    }
    
    // Fallback to US if detection fails
    return 'US';
  }

  static isIndianUser(country: string): boolean {
    return country === 'IN';
  }

  static getAvailableProducts(country: string) {
    const isIndia = this.isIndianUser(country);
    
    return {
      gardeningTools: isIndia,
      ebooks: true, // Available globally
      country,
      region: isIndia ? 'India' : 'International'
    };
  }
}