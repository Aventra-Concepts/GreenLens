import { Link } from "wouter";
import { Layout } from "@/components/Layout";
import { ArrowLeft, MapPin, Phone, Globe, Mail, CheckCircle, AlertCircle, Search } from "lucide-react";
import { useState } from "react";

export default function SoilTestingCenters() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");

  const soilTestingCenters = [
    {
      country: "United States",
      code: "US",
      centers: [
        {
          name: "USDA Natural Resources Conservation Service",
          website: "https://www.nrcs.usda.gov/",
          phone: "+1-202-720-3210",
          email: "info@nrcs.usda.gov",
          description: "Federal agency providing soil testing services nationwide",
          locations: "All 50 states"
        },
        {
          name: "University Extension Services",
          website: "https://nifa.usda.gov/land-grant-colleges-and-universities-partner-website-directory",
          description: "State university extension programs offering affordable soil testing",
          locations: "All states - contact local extension office"
        },
        {
          name: "A&L Agricultural Laboratories",
          website: "https://www.alabs.com/",
          phone: "+1-901-527-2780",
          email: "memphis@alabs.com",
          description: "Private laboratory network with multiple locations",
          locations: "Multiple states"
        }
      ]
    },
    {
      country: "Canada",
      code: "CA",
      centers: [
        {
          name: "Agriculture and Agri-Food Canada",
          website: "https://www.agr.gc.ca/",
          phone: "+1-613-773-1000",
          description: "Federal agricultural research and soil testing services",
          locations: "All provinces and territories"
        },
        {
          name: "Provincial Agricultural Labs",
          description: "Each province has agricultural laboratories offering soil testing",
          locations: "Contact provincial agriculture departments"
        },
        {
          name: "ALS Environmental",
          website: "https://www.alsglobal.com/",
          phone: "+1-780-413-5227",
          description: "Private laboratory services across Canada",
          locations: "Major cities nationwide"
        }
      ]
    },
    {
      country: "United Kingdom",
      code: "GB",
      centers: [
        {
          name: "Natural Resources Wales",
          website: "https://naturalresources.wales/",
          phone: "+44-300-065-3000",
          description: "Soil testing services for Wales",
          locations: "Wales"
        },
        {
          name: "Scottish Government Rural Payments",
          website: "https://www.ruralpayments.org/",
          phone: "+44-300-244-9990",
          description: "Agricultural testing services for Scotland",
          locations: "Scotland"
        },
        {
          name: "ADAS UK Ltd",
          website: "https://www.adas.uk/",
          phone: "+44-1733-367-521",
          email: "info@adas.co.uk",
          description: "Private agricultural consultancy with soil testing",
          locations: "England, Wales, Scotland"
        },
        {
          name: "NRM Laboratories",
          website: "https://www.nrm.uk.com/",
          phone: "+44-1344-886-338",
          description: "Independent soil and plant analysis laboratory",
          locations: "UK nationwide"
        }
      ]
    },
    {
      country: "Australia",
      code: "AU",
      centers: [
        {
          name: "CSIRO Agriculture and Food",
          website: "https://www.csiro.au/",
          phone: "+61-3-9545-2176",
          description: "National research organization providing soil testing",
          locations: "All states and territories"
        },
        {
          name: "Department of Primary Industries",
          description: "State-based agricultural departments offering soil testing services",
          locations: "Each state has its own DPI office"
        },
        {
          name: "Incitec Pivot Fertilisers",
          website: "https://www.incitecpivotfertilisers.com.au/",
          phone: "+61-3-8080-7000",
          description: "Commercial soil testing and fertilizer recommendations",
          locations: "Major agricultural regions"
        },
        {
          name: "CSBP Limited",
          website: "https://www.csbp.com.au/",
          phone: "+61-8-9411-8777",
          description: "Soil and plant tissue analysis services",
          locations: "Western Australia, other states"
        }
      ]
    },
    {
      country: "India",
      code: "IN",
      centers: [
        {
          name: "Indian Council of Agricultural Research (ICAR)",
          website: "https://icar.org.in/",
          phone: "+91-11-2578-9011",
          description: "National agricultural research organization with soil testing labs",
          locations: "All states through State Agricultural Universities"
        },
        {
          name: "State Department of Agriculture",
          description: "Each state has soil testing laboratories under agriculture department",
          locations: "All states - contact local Krishi Vigyan Kendra"
        },
        {
          name: "Fertilizer Companies",
          description: "Major fertilizer companies like UPL, Coromandel offer soil testing",
          locations: "Agricultural districts nationwide"
        },
        {
          name: "Private Agricultural Labs",
          description: "Commercial laboratories in major agricultural states",
          locations: "Punjab, Haryana, UP, Maharashtra, Karnataka"
        }
      ]
    },
    {
      country: "Germany",
      code: "DE",
      centers: [
        {
          name: "Landwirtschaftliche Untersuchungs- und Forschungsanstalt (LUFA)",
          website: "https://www.lufa-nord-west.de/",
          phone: "+49-441-801-300",
          description: "Agricultural testing and research institutes",
          locations: "Each federal state has LUFA institutes"
        },
        {
          name: "Bodentestservice Deutschland",
          website: "https://www.bodentest.de/",
          phone: "+49-30-233-2000",
          description: "Private soil testing service for home gardens",
          locations: "Nationwide mail-in service"
        },
        {
          name: "Raiffeisen Laboratories",
          description: "Agricultural cooperative laboratories",
          locations: "Rural areas throughout Germany"
        }
      ]
    },
    {
      country: "France",
      code: "FR",
      centers: [
        {
          name: "Laboratoire d'Analyse des Sols d'Arras (LASA)",
          website: "https://www.lasa-arras.fr/",
          phone: "+33-3-21-23-71-81",
          description: "Agricultural soil analysis laboratory",
          locations: "Northern France, mail-in service available"
        },
        {
          name: "INRAE (Institut National de Recherche)",
          website: "https://www.inrae.fr/",
          description: "National agricultural research institute",
          locations: "Research centers across France"
        },
        {
          name: "Chambers of Agriculture",
          description: "Regional agricultural chambers offering soil testing",
          locations: "All departments (départements)"
        }
      ]
    },
    {
      country: "Brazil",
      code: "BR",
      centers: [
        {
          name: "EMBRAPA (Brazilian Agricultural Research Corporation)",
          website: "https://www.embrapa.br/",
          phone: "+55-61-3448-4433",
          description: "National agricultural research organization",
          locations: "All states through regional centers"
        },
        {
          name: "State Agricultural Research Institutes",
          description: "Each state has agricultural research institutes with soil labs",
          locations: "All states - contact state EMATER offices"
        },
        {
          name: "Private Agricultural Laboratories",
          description: "Commercial soil testing laboratories",
          locations: "Major agricultural regions like Cerrado, South"
        }
      ]
    },
    {
      country: "China",
      code: "CN",
      centers: [
        {
          name: "Chinese Academy of Agricultural Sciences (CAAS)",
          website: "http://www.caas.cn/",
          description: "National agricultural research academy with soil testing",
          locations: "All provinces through provincial academies"
        },
        {
          name: "Ministry of Agriculture and Rural Affairs",
          description: "Government agricultural departments at provincial level",
          locations: "All provinces and autonomous regions"
        },
        {
          name: "Agricultural Universities",
          description: "Major agricultural universities offer soil testing services",
          locations: "Beijing, Nanjing, Northwest A&F University, etc."
        }
      ]
    },
    {
      country: "Japan",
      code: "JP",
      centers: [
        {
          name: "Japan Soil Association",
          website: "https://www.japan-soil.net/",
          description: "National soil science organization",
          locations: "All prefectures"
        },
        {
          name: "Agricultural Research Centers",
          description: "Prefectural agricultural research centers",
          locations: "Each prefecture has agricultural testing facilities"
        },
        {
          name: "JA Group (Agricultural Cooperatives)",
          description: "Agricultural cooperative associations offering soil testing",
          locations: "Rural areas nationwide"
        }
      ]
    },
    {
      country: "South Africa",
      code: "ZA",
      centers: [
        {
          name: "Agricultural Research Council (ARC)",
          website: "https://www.arc.agric.za/",
          phone: "+27-12-427-9700",
          description: "National agricultural research organization",
          locations: "All provinces"
        },
        {
          name: "University of Stellenbosch - Soil Science",
          website: "https://www.sun.ac.za/",
          phone: "+27-21-808-4933",
          description: "Academic soil testing and research",
          locations: "Western Cape, mail-in service"
        },
        {
          name: "Provincial Department of Agriculture",
          description: "Each province has agricultural departments with soil testing",
          locations: "All 9 provinces"
        }
      ]
    },
    {
      country: "Netherlands",
      code: "NL",
      centers: [
        {
          name: "Eurofins Agro",
          website: "https://www.eurofins-agro.com/",
          phone: "+31-26-366-1111",
          description: "Leading agricultural testing laboratory",
          locations: "Netherlands and Belgium"
        },
        {
          name: "Wageningen University & Research",
          website: "https://www.wur.nl/",
          phone: "+31-317-480-100",
          description: "University soil research and testing services",
          locations: "Wageningen, mail-in service"
        },
        {
          name: "BLGG AgroXpertus",
          website: "https://www.blgg.nl/",
          phone: "+31-73-687-4444",
          description: "Agricultural laboratory services",
          locations: "Netherlands nationwide"
        }
      ]
    }
  ];

  const filteredCenters = soilTestingCenters.filter(country => {
    const matchesSearch = searchTerm === "" || 
      country.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.centers.some(center => 
        center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        center.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesCountry = selectedCountry === "" || country.code === selectedCountry;
    
    return matchesSearch && matchesCountry;
  });

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="mb-8">
            <Link href="/">
              <button className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-6 font-medium transition-colors" data-testid="back-to-home">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </button>
            </Link>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <MapPin className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  Soil Testing Centers
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  Find professional soil testing laboratories worldwide for accurate garden soil analysis
                </p>
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-8">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-semibold mb-1">Professional Soil Analysis</p>
                  <p>
                    Get comprehensive soil testing for pH, nutrients, organic matter, and contamination analysis. 
                    Professional testing provides accurate results for optimal garden planning.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by country or testing center name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    data-testid="search-centers"
                  />
                </div>
              </div>
              <div className="md:w-48">
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  data-testid="filter-country"
                >
                  <option value="">All Countries</option>
                  {soilTestingCenters.map(country => (
                    <option key={country.code} value={country.code}>
                      {country.country}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Soil Testing Centers */}
          <div className="space-y-8">
            {filteredCenters.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300">
                  No soil testing centers found matching your search criteria.
                </p>
              </div>
            ) : (
              filteredCenters.map((country) => (
                <div key={country.code} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                  <div className="bg-green-600 text-white px-6 py-4">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                      <MapPin className="w-6 h-6" />
                      {country.country}
                    </h2>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid gap-6">
                      {country.centers.map((center, index) => (
                        <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex flex-col md:flex-row md:items-start gap-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                {center.name}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-300 mb-3">
                                {center.description}
                              </p>
                              
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                  <MapPin className="w-4 h-4" />
                                  <span>Coverage: {center.locations}</span>
                                </div>
                                
                                {'phone' in center && center.phone && (
                                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Phone className="w-4 h-4" />
                                    <span>{center.phone}</span>
                                  </div>
                                )}
                                
                                {'email' in center && center.email && (
                                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Mail className="w-4 h-4" />
                                    <a href={`mailto:${center.email}`} className="text-green-600 hover:text-green-700 underline">
                                      {center.email}
                                    </a>
                                  </div>
                                )}
                                
                                {'website' in center && center.website && (
                                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Globe className="w-4 h-4" />
                                    <a 
                                      href={center.website} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-green-600 hover:text-green-700 underline"
                                    >
                                      Visit Website
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Information Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mt-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              What to Expect from Professional Soil Testing
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Basic Soil Analysis</h3>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Soil pH levels</li>
                  <li>• Nutrient content (N-P-K)</li>
                  <li>• Organic matter percentage</li>
                  <li>• Soil texture analysis</li>
                  <li>• Electrical conductivity</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Advanced Testing</h3>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Heavy metal contamination</li>
                  <li>• Micronutrient analysis</li>
                  <li>• Soil biological activity</li>
                  <li>• Pesticide residue testing</li>
                  <li>• Carbon/nitrogen ratios</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
              <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">💡 Pro Tip</h4>
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Most testing centers provide fertilizer recommendations based on your soil results. 
                Contact them directly for pricing, sample collection instructions, and turnaround times.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}