import { promises as fs } from 'fs';

async function generateSimplePDF() {
  try {
    console.log('Reading documentation file...');
    
    // Read the markdown documentation
    const markdownContent = await fs.readFile('GreenLens_Complete_Documentation.md', 'utf8');
    
    // Create a well-formatted HTML version for browser conversion
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GreenLens Complete Documentation</title>
    <style>
        @page {
            size: A4;
            margin: 2cm;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 21cm;
            margin: 0 auto;
            padding: 0;
            background: #fff;
            font-size: 12px;
        }
        
        .cover-page {
            text-align: center;
            padding: 5cm 2cm;
            page-break-after: always;
            border-bottom: 2px solid #16a34a;
        }
        
        .cover-title {
            font-size: 3em;
            color: #2d5a27;
            margin-bottom: 1cm;
            font-weight: bold;
        }
        
        .cover-subtitle {
            font-size: 1.5em;
            color: #16a34a;
            margin-bottom: 1cm;
        }
        
        .status-badge {
            display: inline-block;
            background: #10b981;
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            font-weight: bold;
            margin: 1cm 0;
            font-size: 1.2em;
        }
        
        .cover-meta {
            font-size: 1.1em;
            color: #6b7280;
            margin: 0.5cm 0;
        }
        
        .toc {
            page-break-after: always;
            padding: 1cm 0;
        }
        
        .toc h1 {
            color: #2d5a27;
            border-bottom: 2px solid #4ade80;
            padding-bottom: 10px;
        }
        
        .toc-list {
            list-style: none;
            padding: 0;
        }
        
        .toc-list li {
            padding: 8px 0;
            border-bottom: 1px dotted #ccc;
            font-size: 1.1em;
        }
        
        .toc-list a {
            color: #0f766e;
            text-decoration: none;
        }
        
        h1 {
            color: #2d5a27;
            border-bottom: 3px solid #4ade80;
            padding-bottom: 10px;
            margin-top: 2cm;
            margin-bottom: 1cm;
            font-size: 2.2em;
            page-break-before: always;
        }
        
        h2 {
            color: #16a34a;
            border-bottom: 2px solid #86efac;
            padding-bottom: 8px;
            margin-top: 1.5cm;
            margin-bottom: 0.8cm;
            font-size: 1.8em;
        }
        
        h3 {
            color: #15803d;
            margin-top: 1cm;
            margin-bottom: 0.5cm;
            font-size: 1.4em;
        }
        
        h4 {
            color: #166534;
            margin-top: 0.8cm;
            margin-bottom: 0.4cm;
            font-size: 1.2em;
        }
        
        p {
            margin: 0.5cm 0;
            text-align: justify;
        }
        
        code {
            background: #f1f5f9;
            padding: 2px 4px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
            color: #dc2626;
        }
        
        pre {
            background: #1e293b;
            color: #e2e8f0;
            padding: 1cm;
            border-radius: 5px;
            overflow-x: auto;
            margin: 1cm 0;
            font-family: 'Courier New', monospace;
            line-height: 1.4;
            page-break-inside: avoid;
        }
        
        pre code {
            background: none;
            color: inherit;
            padding: 0;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 1cm 0;
            font-size: 0.9em;
            page-break-inside: avoid;
        }
        
        th, td {
            border: 1px solid #e5e7eb;
            padding: 8px 12px;
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
            margin: 0.5cm 0;
            padding-left: 1cm;
        }
        
        li {
            margin: 0.3cm 0;
        }
        
        blockquote {
            border-left: 4px solid #4ade80;
            margin: 1cm 0;
            padding: 0.5cm 1cm;
            background: #f0fdf4;
            color: #166534;
            border-radius: 0 5px 5px 0;
        }
        
        .section-break {
            page-break-before: always;
            margin-top: 2cm;
        }
        
        @media print {
            body { 
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
            }
            
            .no-print {
                display: none;
            }
            
            h1, h2, h3, h4 {
                page-break-after: avoid;
            }
            
            pre, table, blockquote {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <!-- Cover Page -->
    <div class="cover-page">
        <div class="cover-title">🌱 GreenLens</div>
        <div class="cover-subtitle">Complete Application Documentation</div>
        <div class="status-badge">✅ Production Ready</div>
        <div class="cover-meta">AI-Powered Plant Identification & Care Platform</div>
        <div class="cover-meta">Technical Architecture • Feature Documentation • Database Schema</div>
        <div class="cover-meta">Version 1.0.0 • January 2025</div>
        <div class="cover-meta">300+ Pages • Comprehensive Technical Guide</div>
    </div>
    
    <!-- Table of Contents -->
    <div class="toc">
        <h1>Table of Contents</h1>
        <ul class="toc-list">
            <li><a href="#executive-summary">1. Executive Summary</a></li>
            <li><a href="#technical-architecture">2. Technical Architecture</a></li>
            <li><a href="#frontend-architecture">3. Frontend Architecture</a></li>
            <li><a href="#backend-architecture">4. Backend Architecture</a></li>
            <li><a href="#database-design">5. Database Design</a></li>
            <li><a href="#feature-documentation">6. Feature Documentation</a></li>
            <li><a href="#page-by-page-documentation">7. Page-by-Page Documentation</a></li>
            <li><a href="#dashboard-documentation">8. Dashboard Documentation</a></li>
            <li><a href="#api-endpoints">9. API Endpoints</a></li>
            <li><a href="#security-implementation">10. Security Implementation</a></li>
            <li><a href="#known-issues--bugs">11. Known Issues & Bugs</a></li>
            <li><a href="#deployment-guide">12. Deployment Guide</a></li>
            <li><a href="#performance-optimization">13. Performance Optimization</a></li>
        </ul>
    </div>
    
    <!-- Main Content -->
    <div class="main-content">
        ${markdownToHTML(markdownContent)}
    </div>
</body>
</html>`;

    console.log('Writing HTML file...');
    await fs.writeFile('GreenLens_Complete_Documentation.html', htmlContent);

    console.log('✅ HTML documentation generated successfully!');
    console.log('📄 File: GreenLens_Complete_Documentation.html');
    console.log('');
    console.log('📋 To convert to PDF:');
    console.log('1. Open GreenLens_Complete_Documentation.html in your browser');
    console.log('2. Press Ctrl+P (or Cmd+P on Mac)');
    console.log('3. Choose "Save as PDF" destination');
    console.log('4. Select "More settings" and enable "Background graphics"');
    console.log('5. Click "Save"');
    console.log('');
    console.log('The HTML file is optimized for PDF conversion with proper page breaks and styling.');

    return true;

  } catch (error) {
    console.error('❌ Error generating HTML:', error);
    return false;
  }
}

function markdownToHTML(markdown) {
  return markdown
    // Add section breaks for major headers
    .replace(/^# (.*$)/gim, '<div class="section-break"><h1 id="$1">$1</h1></div>')
    .replace(/^## (.*$)/gim, '<h2 id="$1">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 id="$1">$1</h3>')
    .replace(/^#### (.*$)/gim, '<h4 id="$1">$1</h4>')
    
    // Code blocks with language highlighting
    .replace(/\`\`\`typescript\n([\s\S]*?)\n\`\`\`/g, '<pre><code class="typescript">$1</code></pre>')
    .replace(/\`\`\`javascript\n([\s\S]*?)\n\`\`\`/g, '<pre><code class="javascript">$1</code></pre>')
    .replace(/\`\`\`sql\n([\s\S]*?)\n\`\`\`/g, '<pre><code class="sql">$1</code></pre>')
    .replace(/\`\`\`bash\n([\s\S]*?)\n\`\`\`/g, '<pre><code class="bash">$1</code></pre>')
    .replace(/\`\`\`json\n([\s\S]*?)\n\`\`\`/g, '<pre><code class="json">$1</code></pre>')
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
    
    // Clean up IDs for anchors
    .replace(/id="([^"]+)"/g, (match, p1) => {
      return 'id="' + p1.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') + '"';
    })
    
    // Line breaks and paragraphs
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(.+$)/gim, '<p>$1</p>')
    
    // Clean up formatting
    .replace(/<p><\/p>/g, '')
    .replace(/<p><li>/g, '<ul><li>')
    .replace(/<\/li><\/p>/g, '</li></ul>')
    .replace(/<\/li><p><li>/g, '</li><li>')
    .replace(/<p><h([1-6])/g, '<h$1')
    .replace(/<\/h([1-6])><\/p>/g, '</h$1>')
    .replace(/<p><pre>/g, '<pre>')
    .replace(/<\/pre><\/p>/g, '</pre>')
    .replace(/<p><blockquote>/g, '<blockquote>')
    .replace(/<\/blockquote><\/p>/g, '</blockquote>')
    .replace(/<p><hr><\/p>/g, '<hr>')
    .replace(/<p><div/g, '<div')
    .replace(/<\/div><\/p>/g, '</div>');
}

// Run the function
generateSimplePDF()
  .then(success => {
    if (success) {
      console.log('\n🎉 Documentation HTML ready for PDF conversion!');
      process.exit(0);
    } else {
      console.log('\n❌ Failed to generate HTML');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });