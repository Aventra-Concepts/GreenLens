import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generatePremiumFeaturesPDF() {
  // Read the markdown file
  const markdownPath = path.join(__dirname, '..', 'premium_features_documentation.md');
  const markdownContent = fs.readFileSync(markdownPath, 'utf8');
  
  // Convert markdown to HTML with styling
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>My Garden Premium Features</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #fff;
            padding: 40px;
            max-width: 1000px;
            margin: 0 auto;
        }
        
        h1 {
            color: #2d5a27;
            font-size: 2.5em;
            margin-bottom: 30px;
            text-align: center;
            border-bottom: 3px solid #4a9eff;
            padding-bottom: 15px;
        }
        
        h2 {
            color: #2d5a27;
            font-size: 1.8em;
            margin: 30px 0 15px 0;
            border-left: 4px solid #4a9eff;
            padding-left: 15px;
        }
        
        h3 {
            color: #1a6b1a;
            font-size: 1.4em;
            margin: 20px 0 10px 0;
        }
        
        h4 {
            color: #2d5a27;
            font-size: 1.2em;
            margin: 15px 0 8px 0;
            font-weight: 600;
        }
        
        p {
            margin-bottom: 12px;
            text-align: justify;
        }
        
        ul, ol {
            margin: 10px 0 20px 25px;
        }
        
        li {
            margin-bottom: 8px;
            line-height: 1.5;
        }
        
        strong {
            color: #2d5a27;
            font-weight: 600;
        }
        
        .feature-section {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border: 1px solid #bae6fd;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .premium-badge {
            background: linear-gradient(135deg, #4a9eff 0%, #2563eb 100%);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: 600;
            display: inline-block;
            margin: 5px 10px 5px 0;
        }
        
        .price-section {
            background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
            border: 2px solid #10b981;
            border-radius: 15px;
            padding: 30px;
            margin: 30px 0;
            text-align: center;
        }
        
        .price {
            font-size: 2.5em;
            font-weight: bold;
            color: #059669;
            margin: 10px 0;
        }
        
        .save-badge {
            background: #ef4444;
            color: white;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 0.8em;
            font-weight: 600;
            margin-left: 10px;
        }
        
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            color: #6b7280;
            font-style: italic;
        }
        
        .logo {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .logo h1 {
            background: linear-gradient(135deg, #059669 0%, #10b981 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-size: 3em;
            margin: 0;
            border: none;
            padding: 0;
        }
        
        .highlight-box {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }
        
        @media print {
            body {
                padding: 20px;
            }
            
            .feature-section {
                break-inside: avoid;
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="logo">
        <h1>🌱 GreenLens</h1>
    </div>

    <h1>My Garden Premium Features</h1>
    
    <div class="highlight-box">
        <strong>Premium Membership Benefits:</strong> Unlock unlimited plant identifications, advanced AI health predictions, expert consultations, and exclusive community features.
    </div>

    <div class="feature-section">
        <h2>🌱 Core Premium Benefits</h2>
        
        <h4><span class="premium-badge">UNLIMITED</span> Plant Identifications</h4>
        <ul>
            <li>Remove all limits on daily plant identifications</li>
            <li>Access to advanced AI recognition algorithms</li>
            <li>Higher accuracy rates with premium AI models</li>
            <li>Batch upload capability (up to 10 images at once)</li>
        </ul>

        <h4><span class="premium-badge">AI POWERED</span> Advanced Health Predictions</h4>
        <ul>
            <li>Real-time plant health monitoring and analysis</li>
            <li>Predictive disease detection before symptoms appear</li>
            <li>Personalized care recommendations based on location and climate</li>
            <li>Early warning system for potential plant issues</li>
            <li>Monthly health reports with trend analysis</li>
        </ul>

        <h4><span class="premium-badge">UNLIMITED</span> Plant Collection Management</h4>
        <ul>
            <li>Unlimited plant entries in your digital garden</li>
            <li>Advanced filtering and sorting options</li>
            <li>Custom plant categories and tags</li>
            <li>Detailed plant profiles with care history</li>
            <li>Photo timeline tracking plant growth over time</li>
        </ul>
    </div>

    <div class="feature-section">
        <h2>🧠 AI-Powered Features</h2>
        
        <h4><span class="premium-badge">SMART AI</span> Care Assistant</h4>
        <ul>
            <li>Personalized watering schedules based on plant type, season, and local weather</li>
            <li>Fertilizer recommendations with timing alerts</li>
            <li>Pruning guidance with visual instructions</li>
            <li>Seasonal care adjustments automatically applied</li>
            <li>Integration with local weather data for optimized care</li>
        </ul>

        <h4><span class="premium-badge">95%+ ACCURACY</span> Disease Diagnosis & Treatment</h4>
        <ul>
            <li>Advanced disease identification with 95%+ accuracy</li>
            <li>Comprehensive treatment plans with step-by-step instructions</li>
            <li>Access to expert botanist consultations</li>
            <li>Medication and treatment product recommendations</li>
            <li>Progress tracking for treatment effectiveness</li>
        </ul>
    </div>

    <div class="feature-section">
        <h2>🏆 Gamification & Achievement System</h2>
        
        <h4><span class="premium-badge">50+ BADGES</span> Advanced Achievement Tracking</h4>
        <ul>
            <li>50+ unique badges and achievements to unlock</li>
            <li>Seasonal challenges and competitions</li>
            <li>Plant care streak tracking with rewards</li>
            <li>Experience points system with level progression</li>
            <li>Monthly leaderboards with premium member exclusive contests</li>
        </ul>

        <h4><span class="premium-badge">ANALYTICS</span> Garden Statistics & Analytics</h4>
        <ul>
            <li>Comprehensive dashboard with plant health metrics</li>
            <li>Growth rate analysis and comparisons</li>
            <li>Care activity tracking and insights</li>
            <li>Success rate statistics for different plant types</li>
            <li>Year-over-year garden improvement reports</li>
        </ul>
    </div>

    <div class="feature-section">
        <h2>🌍 Social & Community Features</h2>
        
        <h4><span class="premium-badge">EXCLUSIVE</span> Premium Community Access</h4>
        <ul>
            <li>Exclusive premium member forums</li>
            <li>Direct messaging with other premium gardeners</li>
            <li>Share achievements and milestones with friends</li>
            <li>Join premium-only gardening groups by region or plant type</li>
            <li>Access to expert-moderated Q&A sessions</li>
        </ul>
    </div>

    <div class="feature-section">
        <h2>🛠 Premium Tools & Utilities</h2>
        
        <h4><span class="premium-badge">ADVANCED</span> Plant Identification</h4>
        <ul>
            <li>Multiple image analysis for higher accuracy</li>
            <li>Plant part identification (flowers, leaves, bark, fruits)</li>
            <li>Similar species comparison and differentiation</li>
            <li>Rare and exotic plant recognition</li>
            <li>Historical identification search and comparison</li>
        </ul>

        <h4><span class="premium-badge">SMART</span> Care Management System</h4>
        <ul>
            <li>Automated care reminders with smart scheduling</li>
            <li>Integration with calendar applications</li>
            <li>Weather-based care adjustments</li>
            <li>Vacation mode with care delegation features</li>
            <li>Emergency care alerts for critical situations</li>
        </ul>
    </div>

    <div class="feature-section">
        <h2>💡 Exclusive Premium Content</h2>
        
        <h4><span class="premium-badge">EXPERT</span> Knowledge Base</h4>
        <ul>
            <li>Advanced plant care articles and guides</li>
            <li>Video tutorials on specialized techniques</li>
            <li>Seasonal planting calendars by region</li>
            <li>Pest and disease identification photo library</li>
            <li>Professional growing tips and trade secrets</li>
        </ul>

        <h4><span class="premium-badge">SAVINGS</span> Marketplace Benefits</h4>
        <ul>
            <li>Exclusive discounts on gardening supplies</li>
            <li>Premium member pricing on plant purchases</li>
            <li>Early access to new plant varieties and seeds</li>
            <li>Free shipping on orders over $25</li>
            <li>Curated monthly plant care product boxes</li>
        </ul>
    </div>

    <h2>💰 Pricing Options</h2>
    
    <div class="price-section">
        <h3>Monthly Premium</h3>
        <div class="price">$9.99<span style="font-size: 0.4em; color: #6b7280;">/month</span></div>
        <ul style="text-align: left; margin: 20px 0;">
            <li>All premium features included</li>
            <li>Cancel anytime</li>
            <li>7-day free trial for new users</li>
        </ul>
    </div>

    <div class="price-section" style="border-color: #059669;">
        <h3>Annual Premium <span class="save-badge">Save 25%</span></h3>
        <div class="price">$89.99<span style="font-size: 0.4em; color: #6b7280;">/year</span></div>
        <p><strong>Only $7.50/month - Save $30 per year!</strong></p>
        <ul style="text-align: left; margin: 20px 0;">
            <li>All premium features included</li>
            <li>2 months free compared to monthly billing</li>
            <li>14-day free trial for new users</li>
            <li>Exclusive annual subscriber benefits</li>
        </ul>
    </div>

    <div class="price-section" style="border-color: #7c3aed;">
        <h3>Family Plan <span class="save-badge">Best Value</span></h3>
        <div class="price">$149.99<span style="font-size: 0.4em; color: #6b7280;">/year</span></div>
        <p><strong>Up to 5 accounts - Only $2.50/month per person!</strong></p>
        <ul style="text-align: left; margin: 20px 0;">
            <li>All premium features for each family member</li>
            <li>Shared garden collaboration tools</li>
            <li>Family achievement competitions</li>
            <li>Combined reporting and analytics</li>
        </ul>
    </div>

    <div class="footer">
        <p><strong>GreenLens Premium</strong> - Transform your gardening experience with AI-powered plant care</p>
        <p>Features are continuously updated and improved based on user feedback and technological advances.</p>
        <br>
        <p>© 2024 GreenLens. All rights reserved.</p>
    </div>
</body>
</html>`;

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();
    
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0'
    });
    
    const pdfPath = path.join(__dirname, '..', 'attached_assets', 'My_Garden_Premium_Features.pdf');
    
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });
    
    await browser.close();
    
    console.log('Premium features PDF generated successfully at:', pdfPath);
    return pdfPath;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

// Export the function
export { generatePremiumFeaturesPDF };

// Run the function if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generatePremiumFeaturesPDF()
    .then((path) => console.log('PDF saved to:', path))
    .catch((error) => console.error('Failed to generate PDF:', error));
}