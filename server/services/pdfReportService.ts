import puppeteer from 'puppeteer';

interface PlantAnalysisData {
  id: string;
  species: {
    scientific: string;
    common: string;
    confidence: number;
  };
  healthAssessment: {
    isHealthy: boolean;
    diseases?: Array<{
      name: string;
      confidence: number;
      description: string;
    }>;
    issues?: string[];
  };
  careInstructions: string;
  recommendations: string[];
}

interface UserData {
  email?: string;
}

export class PDFReportService {
  async generatePlantAnalysisReport(
    analysisData: PlantAnalysisData,
    userData: UserData
  ): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    try {
      const page = await browser.newPage();
      
      // Generate HTML content for the PDF
      const htmlContent = this.generateReportHTML(analysisData, userData);
      
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      // Generate PDF
      const pdf = await page.pdf({
        format: 'A4',
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px',
        },
        printBackground: true,
      });

      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  private generateReportHTML(analysisData: PlantAnalysisData, userData: UserData): string {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const healthStatus = analysisData.healthAssessment.isHealthy ? 'Healthy' : 'Needs Attention';
    const healthColor = analysisData.healthAssessment.isHealthy ? '#10B981' : '#F59E0B';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Plant Analysis Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #fff;
        }
        
        .header {
            background: linear-gradient(135deg, #10B981, #059669);
            color: white;
            padding: 30px;
            text-align: center;
            margin-bottom: 30px;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            font-weight: 300;
        }
        
        .header .subtitle {
            font-size: 1.2em;
            opacity: 0.9;
        }
        
        .content {
            padding: 0 30px;
            max-width: 800px;
            margin: 0 auto;
        }
        
        .section {
            margin-bottom: 40px;
            background: #f8f9fa;
            border-radius: 8px;
            padding: 25px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .section h2 {
            color: #10B981;
            font-size: 1.8em;
            margin-bottom: 20px;
            border-bottom: 2px solid #10B981;
            padding-bottom: 10px;
        }
        
        .species-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .info-card {
            background: white;
            padding: 20px;
            border-radius: 6px;
            border-left: 4px solid #10B981;
        }
        
        .info-card h3 {
            color: #374151;
            font-size: 1.1em;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .info-card p {
            font-size: 1.3em;
            font-weight: 600;
            color: #10B981;
        }
        
        .health-status {
            background: white;
            padding: 20px;
            border-radius: 6px;
            border-left: 4px solid ${healthColor};
            margin-bottom: 20px;
        }
        
        .health-badge {
            display: inline-block;
            background: ${healthColor};
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 1.1em;
        }
        
        .issues-list {
            background: white;
            padding: 20px;
            border-radius: 6px;
            margin-top: 15px;
        }
        
        .issues-list ul {
            list-style: none;
        }
        
        .issues-list li {
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
            position: relative;
            padding-left: 25px;
        }
        
        .issues-list li:before {
            content: "⚠️";
            position: absolute;
            left: 0;
        }
        
        .care-instructions {
            background: white;
            padding: 25px;
            border-radius: 6px;
            line-height: 1.8;
            font-size: 1.05em;
        }
        
        .recommendations {
            background: white;
            padding: 20px;
            border-radius: 6px;
        }
        
        .recommendations ul {
            list-style: none;
        }
        
        .recommendations li {
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
            position: relative;
            padding-left: 30px;
        }
        
        .recommendations li:before {
            content: "✅";
            position: absolute;
            left: 0;
        }
        
        .footer {
            margin-top: 40px;
            padding: 30px;
            background: #f3f4f6;
            text-align: center;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
        }
        
        .footer .powered-by {
            font-size: 1.1em;
            margin-bottom: 10px;
        }
        
        .footer .greenlens {
            color: #10B981;
            font-weight: 700;
        }
        
        .confidence-meter {
            background: white;
            padding: 15px;
            border-radius: 6px;
            margin-top: 15px;
        }
        
        .confidence-bar {
            background: #e5e7eb;
            height: 10px;
            border-radius: 5px;
            overflow: hidden;
        }
        
        .confidence-fill {
            background: linear-gradient(90deg, #10B981, #059669);
            height: 100%;
            width: ${(analysisData.species.confidence * 100)}%;
            transition: width 0.3s ease;
        }
        
        .confidence-text {
            margin-top: 8px;
            font-weight: 600;
            color: #374151;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Plant Analysis Report</h1>
        <div class="subtitle">Powered by <span style="color: #34D399; font-weight: bold;">GreenLens AI Technology</span></div>
        <div style="margin-top: 15px; font-size: 1em; opacity: 0.8;">
            Generated on ${currentDate} • Report ID: ${analysisData.id}
        </div>
    </div>

    <div class="content">
        <div class="section">
            <h2>Species Identification</h2>
            <div class="species-info">
                <div class="info-card">
                    <h3>Scientific Name</h3>
                    <p>${analysisData.species.scientific}</p>
                </div>
                <div class="info-card">
                    <h3>Common Name</h3>
                    <p>${analysisData.species.common}</p>
                </div>
            </div>
            <div class="confidence-meter">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-weight: 600; color: #374151;">Identification Confidence</span>
                    <span style="font-weight: 700; color: #10B981;">${Math.round(analysisData.species.confidence * 100)}%</span>
                </div>
                <div class="confidence-bar">
                    <div class="confidence-fill"></div>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>Health Assessment</h2>
            <div class="health-status">
                <span class="health-badge">${healthStatus}</span>
            </div>
            ${analysisData.healthAssessment.issues && analysisData.healthAssessment.issues.length > 0 ? `
                <div class="issues-list">
                    <h3 style="margin-bottom: 15px; color: #374151;">Observed Issues:</h3>
                    <ul>
                        ${analysisData.healthAssessment.issues.map(issue => `<li>${issue}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            ${analysisData.healthAssessment.diseases && analysisData.healthAssessment.diseases.length > 0 ? `
                <div class="issues-list" style="margin-top: 15px;">
                    <h3 style="margin-bottom: 15px; color: #374151;">Potential Diseases:</h3>
                    <ul>
                        ${analysisData.healthAssessment.diseases.map(disease => `
                            <li>
                                <strong>${disease.name}</strong> (${Math.round(disease.confidence * 100)}% confidence)
                                <br><span style="color: #6b7280; font-size: 0.9em;">${disease.description}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            ` : ''}
        </div>

        <div class="section">
            <h2>Care Instructions</h2>
            <div class="care-instructions">
                ${analysisData.careInstructions}
            </div>
        </div>

        <div class="section">
            <h2>Recommendations</h2>
            <div class="recommendations">
                <ul>
                    ${analysisData.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
        </div>
    </div>

    <div class="footer">
        <div class="powered-by">
            Powered by <span class="greenlens">GreenLens AI Technology</span>
        </div>
        <div style="font-size: 0.9em;">
            Professional plant identification and care recommendations
        </div>
        ${userData.email ? `<div style="margin-top: 10px; font-size: 0.9em;">Generated for: ${userData.email}</div>` : ''}
    </div>
</body>
</html>
    `;
  }
}