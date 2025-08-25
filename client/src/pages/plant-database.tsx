import { useState } from 'react';
import { ChevronDown, ChevronUp, Microscope, Leaf, Dna, Zap, ArrowLeft, Search, BookOpen, FlaskConical, Sprout, TreePine, Layers } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

// Import generated images
import PlantCellImage from '@assets/generated_images/Plant_cell_structure_diagram_1a666e09.png';
import PhotosynthesisImage from '@assets/generated_images/Photosynthesis_process_diagram_98665ae6.png';
import ClassificationTreeImage from '@assets/generated_images/Plant_classification_tree_b308df90.png';
import RootAnatomyImage from '@assets/generated_images/Root_anatomy_diagram_9c5f037d.png';

interface DatabaseSection {
  id: string;
  title: string;
  icon: any;
  description: string;
  content: string[];
  image?: string;
  tables?: Array<{
    title: string;
    headers: string[];
    rows: string[][];
  }>;
}

export default function PlantDatabase() {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const toggleSection = (id: string) => {
    const newOpenSections = new Set(openSections);
    if (newOpenSections.has(id)) {
      newOpenSections.delete(id);
    } else {
      newOpenSections.add(id);
    }
    setOpenSections(newOpenSections);
  };

  const databaseSections: DatabaseSection[] = [
    {
      id: 'plant-classification',
      title: 'Plant Kingdom Classification',
      icon: Layers,
      description: 'Taxonomic organization and evolutionary relationships of plant groups',
      image: ClassificationTreeImage,
      tables: [
        {
          title: 'Major Plant Groups and Characteristics',
          headers: ['Group', 'Common Name', 'Vascular System', 'Reproduction', 'Approximate Species'],
          rows: [
            ['Bryophyta', 'Mosses', 'None', 'Spores', '12,000'],
            ['Marchantiophyta', 'Liverworts', 'None', 'Spores', '9,000'],
            ['Anthocerotophyta', 'Hornworts', 'None', 'Spores', '300'],
            ['Pteridophyta', 'Ferns', 'Xylem & Phloem', 'Spores', '12,000'],
            ['Coniferophyta', 'Conifers', 'Xylem & Phloem', 'Seeds (naked)', '630'],
            ['Cycadophyta', 'Cycads', 'Xylem & Phloem', 'Seeds (naked)', '300'],
            ['Ginkgophyta', 'Ginkgo', 'Xylem & Phloem', 'Seeds (naked)', '1'],
            ['Magnoliophyta', 'Flowering Plants', 'Xylem & Phloem', 'Seeds (enclosed)', '300,000+']
          ]
        }
      ],
      content: [
        'The plant kingdom (Plantae) represents one of the major domains of life, encompassing over 400,000 described species. Modern classification systems organize plants based on evolutionary relationships, morphological characteristics, and molecular evidence.',
        'Bryophytes represent the earliest land plants, including mosses (Bryophyta), liverworts (Marchantiophyta), and hornworts (Anthocerotophyta). These non-vascular plants lack true roots, stems, and leaves, relying on simple structures for water and nutrient transport.',
        'Pteridophytes include ferns, horsetails, and club mosses, representing the first vascular plants. They possess specialized tissues (xylem and phloem) for transport but reproduce via spores rather than seeds. This group includes approximately 12,000 species worldwide.',
        'Gymnosperms are seed-bearing plants with naked seeds not enclosed in fruits. Major groups include conifers (Coniferophyta), cycads (Cycadophyta), ginkgo (Ginkgophyta), and gnetophytes (Gnetophyta). These plants dominated Earth before flowering plants evolved.',
        'Angiosperms or flowering plants represent the most diverse and successful plant group with over 300,000 species. They are characterized by flowers, fruits, and seeds enclosed within carpels. This group is divided into monocotyledons and dicotyledons based on seed structure and other characteristics.'
      ]
    },
    {
      id: 'plant-physiology',
      title: 'Plant Physiology',
      icon: Leaf,
      description: 'Understanding how plants function at the cellular and molecular level',
      image: PhotosynthesisImage,
      tables: [
        {
          title: 'Essential Plant Nutrients',
          headers: ['Element', 'Symbol', 'Type', 'Primary Function'],
          rows: [
            ['Nitrogen', 'N', 'Macronutrient', 'Protein synthesis, chlorophyll'],
            ['Phosphorus', 'P', 'Macronutrient', 'Energy transfer, DNA/RNA'],
            ['Potassium', 'K', 'Macronutrient', 'Water regulation, enzyme activation'],
            ['Calcium', 'Ca', 'Macronutrient', 'Cell wall structure, signaling'],
            ['Magnesium', 'Mg', 'Macronutrient', 'Chlorophyll center, enzyme cofactor'],
            ['Sulfur', 'S', 'Macronutrient', 'Protein structure, amino acids'],
            ['Iron', 'Fe', 'Micronutrient', 'Electron transport, chlorophyll synthesis'],
            ['Manganese', 'Mn', 'Micronutrient', 'Photosystem II, enzyme activation'],
            ['Zinc', 'Zn', 'Micronutrient', 'Enzyme function, growth regulators'],
            ['Copper', 'Cu', 'Micronutrient', 'Electron transport, lignin synthesis']
          ]
        }
      ],
      content: [
        'Photosynthesis is the fundamental process by which plants convert light energy into chemical energy. This complex biochemical pathway occurs in chloroplasts, where chlorophyll molecules capture photons and initiate a series of reactions that ultimately produce glucose and oxygen from carbon dioxide and water. The process consists of two main stages: light-dependent reactions in the thylakoids and light-independent reactions (Calvin cycle) in the stroma.',
        'Plant respiration operates continuously in all living plant cells, breaking down stored carbohydrates to release energy for cellular activities. Unlike photosynthesis, respiration occurs in mitochondria and consumes oxygen while producing carbon dioxide, making it essential for plant survival during dark periods.',
        'Water transport in plants follows a sophisticated system called the transpiration-cohesion theory. Water molecules move from roots to leaves through xylem vessels, driven by transpiration at leaf surfaces and the cohesive properties of water molecules that create a continuous column.',
        'Nutrient uptake involves both passive and active transport mechanisms across root cell membranes. Essential macronutrients like nitrogen, phosphorus, and potassium are absorbed through specific transport proteins, while micronutrients are often chelated by root exudates to enhance availability.',
        'Hormone regulation controls virtually every aspect of plant growth and development. Auxins promote cell elongation and root formation, gibberellins stimulate stem elongation and seed germination, cytokinins encourage cell division, abscisic acid manages stress responses, and ethylene triggers fruit ripening and senescence.'
      ]
    },
    {
      id: 'plant-genetics',
      title: 'Plant Genetics',
      icon: Dna,
      description: 'The hereditary mechanisms that control plant traits and evolution',
      content: [
        'DNA structure in plants follows the same double helix model as other organisms, but plant genomes often contain significantly more repetitive sequences and polyploid chromosome sets. Many crop plants are polyploid, meaning they have multiple complete sets of chromosomes, which can enhance genetic diversity and hybrid vigor.',
        'Gene expression in plants is highly regulated by environmental factors, allowing remarkable phenotypic plasticity. Epigenetic modifications, including DNA methylation and histone modifications, enable plants to adapt their gene expression patterns in response to changing conditions without altering the underlying DNA sequence.',
        'Mendelian inheritance patterns govern how traits pass from parent plants to offspring, but plant genetics often involves more complex patterns due to polyploidy, gene linkage, and environmental interactions. Understanding these patterns is crucial for plant breeding and conservation efforts.',
        'Chloroplast and mitochondrial genetics represent unique inheritance systems in plants. These organelles contain their own DNA, which is typically maternally inherited and codes for essential components of photosynthesis and respiration. This creates additional layers of genetic complexity in plant inheritance.',
        'Plant breeding relies on genetic principles to develop improved varieties with enhanced yield, disease resistance, and environmental tolerance. Modern techniques include marker-assisted selection, which uses DNA markers linked to desired traits to accelerate the breeding process and increase precision in trait selection.'
      ]
    },
    {
      id: 'plant-pathology',
      title: 'Plant Pathology',
      icon: FlaskConical,
      description: 'The study of plant diseases and their management strategies',
      content: [
        'Fungal diseases represent the largest category of plant pathogens, affecting virtually all plant species. Common mechanisms include direct tissue invasion through natural openings or wounds, enzyme production that breaks down cell walls, and toxin release that disrupts normal cellular functions. Understanding fungal life cycles is essential for developing effective control strategies.',
        'Bacterial plant pathogens typically enter through natural openings like stomata or wounds, then multiply in intercellular spaces or vascular systems. Many bacterial diseases are characterized by water-soaked lesions, wilting, or systemic infections that can rapidly spread through plant populations under favorable environmental conditions.',
        'Viral infections in plants often require vector transmission by insects, nematodes, or mechanical means. Once inside plant cells, viruses hijack cellular machinery for replication and can cause symptoms ranging from mild mottling to severe stunting, deformation, or death. Many viral diseases have no cure, making prevention crucial.',
        'Plant immune systems involve both innate and acquired resistance mechanisms. Pattern recognition receptors detect common pathogen molecules, triggering defense responses including antimicrobial compound production, cell wall strengthening, and programmed cell death to limit pathogen spread.',
        'Integrated disease management combines multiple strategies including resistant varieties, cultural practices, biological control agents, and targeted chemical applications. This holistic approach reduces reliance on any single control method while maintaining long-term effectiveness and environmental sustainability.'
      ]
    },
    {
      id: 'molecular-biology',
      title: 'Molecular Biology',
      icon: Microscope,
      description: 'Cellular and molecular mechanisms underlying plant life processes',
      image: PlantCellImage,
      content: [
        'Cell wall composition and structure provide plants with structural support and protection while allowing controlled growth and expansion. Primary cell walls consist mainly of cellulose microfibrils embedded in a matrix of hemicelluloses and pectins, while secondary walls may contain lignin for additional strength and water resistance. Plant cells are distinguished from animal cells by their rigid cell walls, large central vacuoles, and chloroplasts.',
        'Protein synthesis in plants follows the central dogma of molecular biology but includes unique features such as chloroplast and mitochondrial protein synthesis systems. Many plant proteins are post-translationally modified and targeted to specific cellular compartments through signal sequences.',
        'Signal transduction pathways allow plants to perceive and respond to environmental stimuli including light, gravity, touch, and chemical signals. These complex cascades often involve phosphorylation events, second messengers, and transcriptional regulation to coordinate appropriate physiological responses.',
        'Membrane transport systems regulate the movement of water, ions, and molecules across cellular membranes. Aquaporins facilitate water transport, ion channels control electrical gradients, and various pumps and transporters maintain cellular homeostasis while enabling selective uptake and exclusion of substances.',
        'Gene regulation mechanisms control when and where specific genes are expressed during plant development and in response to environmental conditions. Transcription factors, chromatin remodeling complexes, and RNA processing mechanisms work together to fine-tune gene expression patterns.'
      ]
    },
    {
      id: 'plant-anatomy',
      title: 'Plant Anatomy',
      icon: TreePine,
      description: 'The structural organization of plant tissues and organs',
      image: RootAnatomyImage,
      tables: [
        {
          title: 'Plant Tissue Types and Functions',
          headers: ['Tissue Type', 'Location', 'Function', 'Cell Characteristics'],
          rows: [
            ['Epidermis', 'Outer surface', 'Protection, gas exchange', 'Flat, waxy cuticle'],
            ['Parenchyma', 'Throughout plant', 'Storage, photosynthesis', 'Thin walls, large vacuoles'],
            ['Collenchyma', 'Young stems, leaves', 'Flexible support', 'Thickened corners'],
            ['Sclerenchyma', 'Mature stems, seeds', 'Rigid support', 'Thick, lignified walls'],
            ['Xylem', 'Vascular bundles', 'Water transport', 'Dead at maturity, hollow'],
            ['Phloem', 'Vascular bundles', 'Sugar transport', 'Living, sieve plates'],
            ['Meristem', 'Growing points', 'Cell division', 'Small, dense cytoplasm'],
            ['Cambium', 'Between xylem/phloem', 'Secondary growth', 'Actively dividing']
          ]
        }
      ],
      content: [
        'Root anatomy reflects functional specialization for absorption and anchorage. The epidermis and root hairs maximize surface area for nutrient and water uptake, while the cortex provides storage and transport functions. The central vascular cylinder contains xylem and phloem tissues organized in patterns that vary among plant families.',
        'Stem structure supports the plant body and facilitates transport between roots and leaves. Vascular bundles contain xylem for water transport and phloem for sugar transport, while supporting tissues like collenchyma and sclerenchyma provide mechanical strength. Cambial activity enables secondary growth in woody plants.',
        'Leaf anatomy is optimized for photosynthesis and gas exchange. The upper and lower epidermis provide protection while allowing controlled gas exchange through stomata. Mesophyll tissues contain chloroplasts for photosynthesis, and vascular bundles form the leaf venation system for transport.',
        'Meristematic tissues are regions of active cell division that enable plant growth throughout the plant life cycle. Apical meristems at root and shoot tips produce primary growth, while lateral meristems like the vascular cambium and cork cambium enable secondary growth and thickness increase.',
        'Reproductive anatomy includes the specialized structures involved in plant reproduction. Flowers contain male stamens and female pistils, while fruits develop from fertilized ovaries to protect and disperse seeds. Understanding reproductive anatomy is essential for plant breeding and conservation efforts.'
      ]
    },
    {
      id: 'plant-evolution',
      title: 'Plant Evolution',
      icon: Sprout,
      description: 'The evolutionary history and diversification of plant life',
      content: [
        'Plant evolution began with the transition from aquatic algae to terrestrial plants approximately 500 million years ago. This major evolutionary event required the development of specialized structures for water conservation, structural support, and reproduction in terrestrial environments.',
        'The evolution of vascular tissues marked a crucial advancement that enabled plants to grow larger and colonize diverse terrestrial habitats. Xylem and phloem tissues provided efficient transport systems for water, minerals, and organic compounds throughout the plant body.',
        'Seed evolution represented another major breakthrough, providing protection and nutrition for developing embryos while enabling dispersal to new habitats. Seeds allowed plants to reproduce successfully in drier environments and contributed to the diversification of terrestrial ecosystems.',
        'Flower evolution and the co-evolution with pollinators led to the incredible diversity of flowering plants we see today. The development of specialized floral structures and pollination mechanisms enabled more efficient reproduction and rapid diversification of plant species.',
        'Adaptive radiation has resulted in plants colonizing virtually every habitat on Earth, from tropical rainforests to arctic tundra. Understanding evolutionary relationships helps scientists predict plant responses to environmental changes and guides conservation efforts.'
      ]
    },
    {
      id: 'plant-ecology',
      title: 'Plant Ecology',
      icon: Zap,
      description: 'Interactions between plants and their environment',
      content: [
        'Plant community dynamics involve complex interactions between species competing for light, water, nutrients, and space. Succession patterns show how plant communities change over time, with pioneer species preparing habitats for later successional species in predictable sequences.',
        'Nutrient cycling in ecosystems depends heavily on plant processes including uptake, storage, and decomposition. Plants play crucial roles in carbon, nitrogen, and phosphorus cycles, influencing global biogeochemical processes and climate regulation.',
        'Plant-animal interactions include pollination, seed dispersal, and herbivory relationships that have shaped the evolution of both plants and animals. These mutually beneficial or antagonistic relationships are essential for ecosystem functioning and biodiversity maintenance.',
        'Adaptation to environmental stress has resulted in remarkable diversity in plant form and function. Drought adaptations include waxy cuticles and water storage tissues, while cold adaptations include antifreeze proteins and specialized membrane compositions.',
        'Climate change impacts on plant communities include shifts in species distributions, altered phenology, and changes in competitive relationships. Understanding these responses is crucial for predicting future ecosystem changes and developing conservation strategies.'
      ]
    },
    {
      id: 'biotechnology',
      title: 'Plant Biotechnology',
      icon: BookOpen,
      description: 'Modern techniques for plant improvement and research',
      content: [
        'Tissue culture techniques enable the propagation of plants from small tissue samples under sterile laboratory conditions. This technology allows rapid multiplication of disease-free plants, preservation of rare species, and production of secondary metabolites for pharmaceutical applications.',
        'Genetic transformation methods allow scientists to introduce new genes into plants to confer beneficial traits such as disease resistance, improved nutritional content, or enhanced stress tolerance. Common techniques include Agrobacterium-mediated transformation and particle bombardment.',
        'Marker-assisted breeding uses DNA markers linked to desirable traits to accelerate the plant breeding process. This approach increases breeding efficiency by allowing early selection of plants with desired characteristics before they reach reproductive maturity.',
        'Genomic sequencing and analysis provide detailed information about plant genomes, enabling identification of genes responsible for important traits and understanding of evolutionary relationships. This information guides both basic research and applied breeding programs.',
        'Plant biotechnology applications include production of pharmaceuticals in plants, development of biofuels from plant biomass, and creation of plants with enhanced environmental remediation capabilities. These applications demonstrate the potential for plants to address global challenges.'
      ]
    }
  ];

  const filteredSections = databaseSections.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.content.some(content => content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-green-900/20">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-3 mb-4">
              <Link href="/">
                <Button
                  variant="outline"
                  className="px-4 py-2 border border-green-600 text-green-600 dark:text-green-400 rounded-lg font-medium hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors"
                  data-testid="button-back-home"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Plant Database
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Comprehensive scientific knowledge about plant biology, from molecular mechanisms to ecological interactions
            </p>
          </div>

          {/* Search */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search plant biology topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                data-testid="input-search-database"
              />
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {databaseSections.slice(0, 4).map((section) => {
              const IconComponent = section.icon;
              return (
                <div
                  key={section.id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => toggleSection(section.id)}
                  data-testid={`card-${section.id}`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <IconComponent className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {section.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {section.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Database Sections */}
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Scientific Knowledge Base
            </h2>
            
            <div className="space-y-4">
              {filteredSections.map((section) => {
                const IconComponent = section.icon;
                const isOpen = openSections.has(section.id);
                
                return (
                  <div key={section.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      data-testid={`button-toggle-${section.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <IconComponent className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {section.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {section.description}
                            </p>
                          </div>
                        </div>
                        {isOpen ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </button>
                    
                    {isOpen && (
                      <div className="px-6 pb-6">
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                          <div className="space-y-6">
                            {/* Display image if available */}
                            {section.image && (
                              <div className="text-center">
                                <img
                                  src={section.image}
                                  alt={`${section.title} diagram`}
                                  className="max-w-full h-auto rounded-lg shadow-lg mx-auto"
                                  data-testid={`image-${section.id}`}
                                />
                              </div>
                            )}
                            
                            {/* Display content paragraphs */}
                            <div className="space-y-4">
                              {section.content.map((paragraph, index) => (
                                <p
                                  key={index}
                                  className="text-gray-700 dark:text-gray-300 leading-relaxed"
                                  data-testid={`text-content-${section.id}-${index}`}
                                >
                                  {paragraph}
                                </p>
                              ))}
                            </div>
                            
                            {/* Display tables if available */}
                            {section.tables && section.tables.map((table, tableIndex) => (
                              <div key={tableIndex} className="mt-6">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                  {table.title}
                                </h4>
                                <div className="overflow-x-auto">
                                  <table className="min-w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg">
                                    <thead className="bg-green-50 dark:bg-green-900/30">
                                      <tr>
                                        {table.headers.map((header, headerIndex) => (
                                          <th
                                            key={headerIndex}
                                            className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-600"
                                            data-testid={`table-header-${section.id}-${tableIndex}-${headerIndex}`}
                                          >
                                            {header}
                                          </th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {table.rows.map((row, rowIndex) => (
                                        <tr
                                          key={rowIndex}
                                          className={rowIndex % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-700'}
                                        >
                                          {row.map((cell, cellIndex) => (
                                            <td
                                              key={cellIndex}
                                              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600"
                                              data-testid={`table-cell-${section.id}-${tableIndex}-${rowIndex}-${cellIndex}`}
                                            >
                                              {cell}
                                            </td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {filteredSections.length === 0 && searchTerm && (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  No results found for "{searchTerm}". Try a different search term.
                </p>
              </div>
            )}
          </div>

          {/* Research Notice */}
          <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-8 text-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Scientific Knowledge Repository
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-3xl mx-auto">
              This database compiles scientific knowledge from public domain sources and educational materials. 
              The information represents current understanding in plant biology and is continuously updated 
              with new discoveries and research findings.
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>All content is derived from publicly available scientific literature and educational resources.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}