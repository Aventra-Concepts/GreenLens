import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, Globe, BookOpen } from "lucide-react";

export default function DocumentationDownload() {
  const handleDownloadHTML = () => {
    window.open('/download/documentation.html', '_blank');
  };

  const handleDownloadMarkdown = () => {
    window.open('/download/documentation.md', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <BookOpen className="w-4 h-4" />
            Documentation Portal
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🌱 GreenLens Complete Documentation
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Download the complete technical documentation for the GreenLens AI Plant Identification & Care Platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* HTML Documentation Card */}
          <Card className="border-2 border-green-200 hover:border-green-300 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Globe className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">HTML Documentation</CardTitle>
                  <CardDescription>PDF-ready with professional styling</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Professional cover page with branding
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Table of contents with navigation
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Print-optimized with proper page breaks
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Code syntax highlighting
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">How to convert to PDF:</h4>
                <ol className="text-sm text-blue-700 space-y-1">
                  <li>1. Download and open the HTML file in your browser</li>
                  <li>2. Press Ctrl+P (or Cmd+P on Mac)</li>
                  <li>3. Choose "Save as PDF" destination</li>
                  <li>4. Enable "Background graphics" in settings</li>
                  <li>5. Click "Save"</li>
                </ol>
              </div>
              <Button onClick={handleDownloadHTML} className="w-full bg-green-600 hover:bg-green-700">
                <Download className="w-4 h-4 mr-2" />
                Download HTML (41 KB)
              </Button>
            </CardContent>
          </Card>

          {/* Markdown Documentation Card */}
          <Card className="border-2 border-blue-200 hover:border-blue-300 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Markdown Documentation</CardTitle>
                  <CardDescription>Raw format for developers</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  Raw markdown format
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  Compatible with any text editor
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  Easy to integrate into documentation systems
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  Version control friendly
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Best for:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Integration with documentation systems</li>
                  <li>• Version control and collaborative editing</li>
                  <li>• Converting to other formats</li>
                  <li>• Reading in development environments</li>
                </ul>
              </div>
              <Button onClick={handleDownloadMarkdown} variant="outline" className="w-full border-blue-300 text-blue-700 hover:bg-blue-50">
                <Download className="w-4 h-4 mr-2" />
                Download Markdown (24 KB)
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Documentation Overview */}
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="text-2xl text-center">📚 Documentation Contents</CardTitle>
            <CardDescription className="text-center">Comprehensive technical guide covering every aspect of GreenLens</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-purple-800">Architecture & Design</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Frontend Architecture (React + TypeScript)</li>
                  <li>• Backend Architecture (Express.js)</li>
                  <li>• Database Design (PostgreSQL)</li>
                  <li>• AI Integration Pipeline</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-green-800">Features & Pages</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• All 50+ Pages Documented</li>
                  <li>• Plant Identification System</li>
                  <li>• Disease Diagnosis Engine</li>
                  <li>• E-book Publishing Platform</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-800">Technical Details</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 35 Database Tables Schema</li>
                  <li>• 100+ API Endpoints</li>
                  <li>• Security Implementation</li>
                  <li>• Deployment Guide</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-orange-800">Dashboard Systems</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• User Dashboard</li>
                  <li>• Author Dashboard</li>
                  <li>• Admin Dashboard</li>
                  <li>• Super Admin Panel</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-red-800">Performance & Quality</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Performance Optimization</li>
                  <li>• Known Issues & Bugs</li>
                  <li>• Troubleshooting Guide</li>
                  <li>• Best Practices</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-teal-800">Technology Stack</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 140+ Dependencies Listed</li>
                  <li>• External API Integrations</li>
                  <li>• Development Guidelines</li>
                  <li>• Production Setup</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-8 bg-white rounded-xl px-8 py-4 shadow-lg border border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">300+</div>
              <div className="text-sm text-gray-600">Pages</div>
            </div>
            <div className="w-px h-10 bg-gray-300"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">35</div>
              <div className="text-sm text-gray-600">DB Tables</div>
            </div>
            <div className="w-px h-10 bg-gray-300"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">100+</div>
              <div className="text-sm text-gray-600">API Endpoints</div>
            </div>
            <div className="w-px h-10 bg-gray-300"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">140+</div>
              <div className="text-sm text-gray-600">Dependencies</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}