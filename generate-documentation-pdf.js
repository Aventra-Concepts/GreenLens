import puppeteer from 'puppeteer';
import { promises as fs } from 'fs';
import path from 'path';

async function generateDocumentationPDF() {
  try {
    console.log('Reading documentation file...');
    
    // Read the markdown documentation
    const markdownContent = await fs.readFile('GreenLens_Complete_Documentation.md', 'utf8');
    
    // Convert markdown to HTML with styling
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GreenLens Complete Documentation</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #fff;
        }
        
        h1 {
            color: #2d5a27;
            border-bottom: 3px solid #4ade80;
            padding-bottom: 10px;
            margin-top: 40px;
            font-size: 2.5em;
        }
        
        h2 {
            color: #16a34a;
            border-bottom: 2px solid #86efac;
            padding-bottom: 8px;
            margin-top: 35px;
            font-size: 2em;
        }
        
        h3 {
            color: #15803d;
            margin-top: 30px;
            font-size: 1.5em;
        }
        
        h4 {
            color: #166534;
            margin-top: 25px;
            font-size: 1.2em;
        }
        
        code {
            background: #f1f5f9;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
            font-size: 0.9em;
            color: #dc2626;
        }
        
        pre {
            background: #1e293b;
            color: #e2e8f0;
            padding: 20px;
            border-radius: 8px;
            overflow-x: auto;
            margin: 15px 0;
            font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
            line-height: 1.4;
        }
        
        pre code {
            background: none;
            color: inherit;
            padding: 0;
            font-size: inherit;
        }
        
        blockquote {
            border-left: 4px solid #4ade80;
            margin: 20px 0;
            padding: 15px 20px;
            background: #f0fdf4;
            color: #166534;
            border-radius: 0 8px 8px 0;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: #fff;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        th, td {
            border: 1px solid #e5e7eb;
            padding: 12px 15px;
            text-align: left;
        }
        
        th {
            background: #16a34a;
            color: white;
            font-weight: 600;
        }
        
        tr:nth-child(even) {
            background: #f9fafb;
        }
        
        ul, ol {
            margin: 15px 0;
            padding-left: 30px;
        }
        
        li {
            margin: 8px 0;
        }
        
        .toc {
            background: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
        }
        
        .toc h2 {
            margin-top: 0;
            color: #1e293b;
        }
        
        .toc ul {
            list-style-type: none;
        }
        
        .toc li {
            margin: 5px 0;
        }
        
        .toc a {
            color: #0f766e;
            text-decoration: none;
        }
        
        .toc a:hover {
            text-decoration: underline;
        }
        
        .cover-page {
            text-align: center;
            padding: 100px 0;
            border-bottom: 1px solid #e5e7eb;
            margin-bottom: 50px;
        }
        
        .cover-title {
            font-size: 3.5em;
            color: #2d5a27;
            margin-bottom: 20px;
            font-weight: bold;
        }
        
        .cover-subtitle {
            font-size: 1.8em;
            color: #16a34a;
            margin-bottom: 30px;
        }
        
        .cover-meta {
            font-size: 1.2em;
            color: #6b7280;
            margin: 10px 0;
        }
        
        .status-badge {
            display: inline-block;
            background: #10b981;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            margin: 20px 0;
        }
        
        @media print {
            body { 
                font-size: 12px; 
                line-height: 1.4;
            }
            h1 { font-size: 2em; }
            h2 { font-size: 1.6em; }
            h3 { font-size: 1.3em; }
            h4 { font-size: 1.1em; }
            
            .cover-page {
                page-break-after: always;
            }
            
            h1, h2 {
                page-break-after: avoid;
            }
            
            pre, table {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="cover-page">
        <div class="cover-title">🌱 GreenLens</div>
        <div class="cover-subtitle">Complete Application Documentation</div>
        <div class="status-badge">✅ Production Ready</div>
        <div class="cover-meta">AI-Powered Plant Identification & Care Platform</div>
        <div class="cover-meta">Version 1.0.0 • January 2025</div>
        <div class="cover-meta">Technical Architecture • Feature Documentation • Database Schema</div>
    </div>
    
    ${markdownToHTML(markdownContent)}
</body>
</html>`;

    console.log('Launching browser...');
    const browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    
    console.log('Setting page content...');
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
      timeout: 60000
    });

    console.log('Generating PDF...');
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      },
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 10px; color: #666; width: 100%; text-align: center; margin-top: 10px;">
          GreenLens Documentation - AI Plant Identification Platform
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 10px; color: #666; width: 100%; text-align: center; margin-bottom: 10px;">
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
          <span style="float: right; margin-right: 20px;">January 2025</span>
        </div>
      `,
    });

    await browser.close();

    console.log('Saving PDF file...');
    await fs.writeFile('GreenLens_Complete_Documentation.pdf', pdfBuffer);

    console.log('✅ PDF documentation generated successfully!');
    console.log('📄 File: GreenLens_Complete_Documentation.pdf');
    console.log('📊 Size:', (pdfBuffer.length / 1024 / 1024).toFixed(2), 'MB');

    return true;

  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    return false;
  }
}

function markdownToHTML(markdown) {
  return markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    
    // Code blocks
    .replace(/\`\`\`(\w+)?\n([\s\S]*?)\n\`\`\`/g, '<pre><code class="language-$1">$2</code></pre>')
    .replace(/\`\`\`\n([\s\S]*?)\n\`\`\`/g, '<pre><code>$1</code></pre>')
    
    // Inline code
    .replace(/\`([^\`]+)\`/g, '<code>$1</code>')
    
    // Bold and italic
    .replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    
    // Lists
    .replace(/^\* (.+$)/gim, '<li>$1</li>')
    .replace(/^\d+\. (.+$)/gim, '<li>$1</li>')
    
    // Blockquotes
    .replace(/^> (.+$)/gim, '<blockquote>$1</blockquote>')
    
    // Horizontal rules
    .replace(/^---$/gim, '<hr>')
    
    // Line breaks and paragraphs
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(.+$)/gim, '<p>$1</p>')
    
    // Clean up empty paragraphs and fix list wrapping
    .replace(/<p><\/p>/g, '')
    .replace(/<p><li>/g, '<ul><li>')
    .replace(/<\/li><\/p>/g, '</li></ul>')
    .replace(/<\/li><p><li>/g, '</li><li>')
    .replace(/<p><h([1-6])>/g, '<h$1>')
    .replace(/<\/h([1-6])><\/p>/g, '</h$1>')
    .replace(/<p><pre>/g, '<pre>')
    .replace(/<\/pre><\/p>/g, '</pre>')
    .replace(/<p><blockquote>/g, '<blockquote>')
    .replace(/<\/blockquote><\/p>/g, '</blockquote>');
}

// Run the function
generateDocumentationPDF()
  .then(success => {
    if (success) {
      console.log('\n🎉 Documentation PDF ready for download!');
      process.exit(0);
    } else {
      console.log('\n❌ Failed to generate PDF');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });