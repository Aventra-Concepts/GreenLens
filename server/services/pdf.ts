import puppeteer from 'puppeteer';
import type { PlantResult } from '@shared/schema';

export class PdfService {
  async generatePlantReport(plantResult: PlantResult): Promise<Buffer> {
    let browser;
    
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();
      
      // Generate HTML content for the report
      const htmlContent = this.generateReportHTML(plantResult);
      
      await page.setContent(htmlContent, { 
        waitUntil: 'networkidle0' 
      });

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
        printBackground: true,
      });

      return pdfBuffer;

    } catch (error) {
      console.error('PDF generation error:', error);
      throw new Error('Failed to generate PDF report');
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  private generateReportHTML(plantResult: PlantResult): string {
    const species = plantResult.species as any;
    const carePlan = plantResult.careJSON as any;
    const diseases = plantResult.diseasesJSON as any;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Plant Care Report - ${species.commonName}</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .header {
            background: linear-gradient(135deg, #22c55e, #16a34a);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0 0 10px 0;
            font-size: 2.5em;
        }
        .header p {
            margin: 0;
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .section {
            margin-bottom: 40px;
            page-break-inside: avoid;
        }
        .section h2 {
            color: #16a34a;
            border-bottom: 2px solid #22c55e;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .care-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 20px;
        }
        .care-item {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 8px;
            padding: 20px;
        }
        .care-item h3 {
            color: #15803d;
            margin: 0 0 10px 0;
        }
        .care-item p {
            margin: 0;
            color: #374151;
        }
        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .info-table th,
        .info-table td {
            border: 1px solid #d1d5db;
            padding: 12px;
            text-align: left;
        }
        .info-table th {
            background: #f9fafb;
            font-weight: bold;
        }
        .confidence-badge {
            background: #22c55e;
            color: white;
            padding: 4px 12px;
            border-radius: 16px;
            font-weight: bold;
            display: inline-block;
        }
        .disease-warning {
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 8px;
            padding: 15px;
            margin: 10px 0;
        }
        .disease-warning h4 {
            color: #dc2626;
            margin: 0 0 10px 0;
        }
        .footer {
            text-align: center;
            padding: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 0.9em;
        }
        .generated-date {
            color: #6b7280;
            font-size: 0.9em;
            text-align: right;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${species.commonName}</h1>
        <p><em>${species.scientificName}</em></p>
        <span class="confidence-badge">${Math.round(parseFloat(plantResult.confidence || '0') * 100)}% Confidence</span>
    </div>

    <div class="content">
        <div class="generated-date">
            Generated on ${new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
        </div>

        <div class="section">
            <h2>Plant Information</h2>
            <table class="info-table">
                <tr>
                    <th>Common Name</th>
                    <td>${species.commonName}</td>
                </tr>
                <tr>
                    <th>Scientific Name</th>
                    <td><em>${species.scientificName}</em></td>
                </tr>
                <tr>
                    <th>Family</th>
                    <td>${carePlan?.plant_info?.family || 'Unknown'}</td>
                </tr>
                <tr>
                    <th>Care Difficulty</th>
                    <td>${carePlan?.plant_info?.difficulty || 'Moderate'}</td>
                </tr>
                <tr>
                    <th>Pet Safe</th>
                    <td>${carePlan?.plant_info?.petSafe ? 'Yes' : 'No'}</td>
                </tr>
                <tr>
                    <th>Growth Rate</th>
                    <td>${carePlan?.plant_info?.growthRate || 'Medium'}</td>
                </tr>
            </table>
        </div>

        <div class="section">
            <h2>Care Instructions</h2>
            <div class="care-grid">
                <div class="care-item">
                    <h3>💧 Watering</h3>
                    <p><strong>Frequency:</strong> ${carePlan?.watering?.frequency || 'As needed'}</p>
                    <p>${carePlan?.watering?.description || 'Water when soil feels dry to touch.'}</p>
                </div>
                <div class="care-item">
                    <h3>☀️ Light</h3>
                    <p><strong>Level:</strong> ${carePlan?.light?.level || 'Bright indirect'}</p>
                    <p>${carePlan?.light?.description || 'Place in bright, indirect sunlight.'}</p>
                </div>
                <div class="care-item">
                    <h3>💨 Humidity</h3>
                    <p><strong>Range:</strong> ${carePlan?.humidity?.range || '40-60%'}</p>
                    <p>${carePlan?.humidity?.description || 'Maintain moderate humidity levels.'}</p>
                </div>
                <div class="care-item">
                    <h3>🌡️ Temperature</h3>
                    <p><strong>Range:</strong> ${carePlan?.temperature?.range || '65-75°F'}</p>
                    <p>${carePlan?.temperature?.description || 'Keep in comfortable room temperature.'}</p>
                </div>
            </div>
        </div>

        ${carePlan?.soil ? `
        <div class="section">
            <h2>Soil & Fertilizing</h2>
            <div class="care-item">
                <h3>🌱 Soil Requirements</h3>
                <p><strong>Type:</strong> ${carePlan.soil.type}</p>
                <p>${carePlan.soil.details}</p>
                <p><strong>Repotting:</strong> ${carePlan.soil.repotting}</p>
            </div>
            ${carePlan.fertilizer ? `
            <div class="care-item" style="margin-top: 20px;">
                <h3>🌿 Fertilizing</h3>
                <p><strong>Frequency:</strong> ${carePlan.fertilizer.frequency}</p>
                <p>${carePlan.fertilizer.details}</p>
            </div>
            ` : ''}
        </div>
        ` : ''}

        ${diseases && diseases.diseases && diseases.diseases.length > 0 ? `
        <div class="section">
            <h2>Health Assessment</h2>
            <p><strong>Overall Status:</strong> ${diseases.overall_health_status}</p>
            ${diseases.diseases.map((disease: any) => `
            <div class="disease-warning">
                <h4>⚠️ ${disease.name}</h4>
                <p><strong>Severity:</strong> ${disease.severity}</p>
                <p><strong>Description:</strong> ${disease.description}</p>
                ${disease.treatment?.immediate_actions ? `
                <p><strong>Immediate Actions:</strong></p>
                <ul>
                    ${disease.treatment.immediate_actions.map((action: string) => `<li>${action}</li>`).join('')}
                </ul>
                ` : ''}
            </div>
            `).join('')}
        </div>
        ` : ''}

        ${carePlan?.seasonal_care ? `
        <div class="section">
            <h2>Seasonal Care</h2>
            <div class="care-grid">
                <div class="care-item">
                    <h3>🌸 Spring</h3>
                    <p>${carePlan.seasonal_care.spring}</p>
                </div>
                <div class="care-item">
                    <h3>☀️ Summer</h3>
                    <p>${carePlan.seasonal_care.summer}</p>
                </div>
                <div class="care-item">
                    <h3>🍂 Fall</h3>
                    <p>${carePlan.seasonal_care.fall}</p>
                </div>
                <div class="care-item">
                    <h3>❄️ Winter</h3>
                    <p>${carePlan.seasonal_care.winter}</p>
                </div>
            </div>
        </div>
        ` : ''}
    </div>

    <div class="footer">
        <p>Generated by GreenLens - AI-Powered Plant Care</p>
        <p>For more plant care tips and identification, visit greenlens.com</p>
    </div>
</body>
</html>
    `;
  }
}

export const pdfService = new PdfService();
