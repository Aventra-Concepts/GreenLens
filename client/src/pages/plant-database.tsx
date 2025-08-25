import { useState } from 'react';
import { ChevronDown, ChevronUp, Microscope, Leaf, Dna, Zap, ArrowLeft, Search, BookOpen, FlaskConical, Sprout, TreePine, Layers } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

// Import generated images with correct spelling and numbering
import ClassificationTreeImage from '@assets/generated_images/Figure_1_Plant_classification_9e2d76c1.png';
import PhotosynthesisImage from '@assets/generated_images/Figure_2_Photosynthesis_process_77187dd0.png';
import PlantCellImage from '@assets/generated_images/Figure_3_Plant_cell_056ba9a3.png';
import RootAnatomyImage from '@assets/generated_images/Figure_4_Root_anatomy_e1520e9a.png';
import PlantGeneticsImage from '@assets/generated_images/Figure_5_Plant_genetics_b7425d0c.png';
import PlantPathologyImage from '@assets/generated_images/Figure_6_Plant_pathology_41a5c986.png';
import PlantEvolutionImage from '@assets/generated_images/Figure_7_Plant_evolution_b661011e.png';
import PlantEcologyImage from '@assets/generated_images/Figure_8_Plant_ecology_fdcd7049.png';
import PlantBiotechnologyImage from '@assets/generated_images/Figure_9_Plant_biotechnology_7b4082bb.png';
import RegionalFloweringImage from '@assets/generated_images/Figure_10_Regional_flowering_plants_eec73aa6.png';
import RegionalFruitingImage from '@assets/generated_images/Figure_11_Regional_fruiting_plants_5bb63955.png';
import RegionalVegetativeImage from '@assets/generated_images/Figure_12_Regional_vegetative_plants_e53fa2eb.png';
import DecorativePlantsImage from '@assets/generated_images/Figure_13_Decorative_plants_c9b3a735.png';

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
      image: PlantGeneticsImage,
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
      image: PlantPathologyImage,
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
      image: PlantEvolutionImage,
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
      image: PlantEcologyImage,
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
      image: PlantBiotechnologyImage,
      content: [
        'Tissue culture techniques enable the propagation of plants from small tissue samples under sterile laboratory conditions. This technology allows rapid multiplication of disease-free plants, preservation of rare species, and production of secondary metabolites for pharmaceutical applications.',
        'Genetic transformation methods allow scientists to introduce new genes into plants to confer beneficial traits such as disease resistance, improved nutritional content, or enhanced stress tolerance. Common techniques include Agrobacterium-mediated transformation and particle bombardment.',
        'Marker-assisted breeding uses DNA markers linked to desirable traits to accelerate the plant breeding process. This approach increases breeding efficiency by allowing early selection of plants with desired characteristics before they reach reproductive maturity.',
        'Genomic sequencing and analysis provide detailed information about plant genomes, enabling identification of genes responsible for important traits and understanding of evolutionary relationships. This information guides both basic research and applied breeding programs.',
        'Plant biotechnology applications include production of pharmaceuticals in plants, development of biofuels from plant biomass, and creation of plants with enhanced environmental remediation capabilities. These applications demonstrate the potential for plants to address global challenges.'
      ]
    },
    {
      id: 'regional-flowering',
      title: 'Regional Flowering Plants',
      icon: Sprout,
      description: 'Flowering plant species distribution and adaptation across global regions',
      image: RegionalFloweringImage,
      tables: [
        {
          title: 'Flowering Plants by Climate Regions',
          headers: ['Region', 'Climate Type', 'Common Flowers', 'Bloom Season', 'Adaptation Features'],
          rows: [
            ['Tropical', 'Hot, humid', 'Hibiscus, Orchids, Bird of Paradise', 'Year-round', 'Large leaves, bright colors'],
            ['Temperate', 'Moderate seasons', 'Roses, Tulips, Daffodils', 'Spring-Summer', 'Seasonal dormancy'],
            ['Mediterranean', 'Dry summers', 'Lavender, Oleander, Poppy', 'Spring', 'Drought tolerance'],
            ['Desert', 'Arid, hot', 'Desert Marigold, Prickly Pear', 'Spring', 'Water storage, waxy coating'],
            ['Alpine', 'Cold, windy', 'Edelweiss, Alpine Forget-me-not', 'Short summer', 'Low growth, deep roots'],
            ['Arctic Tundra', 'Very cold', 'Arctic Poppy, Purple Saxifrage', 'Brief summer', 'Cushion growth form']
          ]
        }
      ],
      content: [
        'Tropical regions support the greatest diversity of flowering plants, with over 170,000 species found in rainforests alone. These plants exhibit remarkable adaptations including large, colorful blooms to attract pollinators in dense forest understories, and many produce flowers directly on tree trunks (cauliflory) for better pollinator access.',
        'Temperate flowering plants have evolved sophisticated seasonal timing mechanisms, with many species requiring vernalization (cold treatment) to trigger flowering. Spring ephemerals like trout lilies and bloodroot complete their entire flowering cycle before tree leaves emerge, maximizing light capture.',
        'Mediterranean climate regions harbor unique flowering plant communities adapted to hot, dry summers and mild, wet winters. Many species like lavender and rosemary produce aromatic oils that deter herbivores and reduce water loss while attracting specialized pollinators.',
        'Desert flowering plants employ diverse water conservation strategies, with many species like desert lupines timing their reproduction to coincide with rare rainfall events. Some cacti produce massive floral displays that can be seen from great distances to attract pollinators in sparse environments.',
        'High-altitude flowering plants face extreme conditions including intense UV radiation, temperature fluctuations, and short growing seasons. Alpine species often produce disproportionately large flowers relative to their plant size to maximize reproductive success during brief flowering windows.'
      ]
    },
    {
      id: 'regional-fruiting',
      title: 'Regional Fruiting Plants',
      icon: TreePine,
      description: 'Fruit-bearing plants and their regional cultivation patterns worldwide',
      image: RegionalFruitingImage,
      tables: [
        {
          title: 'Major Fruit Crops by Geographic Region',
          headers: ['Region', 'Primary Fruits', 'Growing Season', 'Soil Preference', 'Water Requirements'],
          rows: [
            ['Southeast Asia', 'Mango, Durian, Rambutan', 'Year-round', 'Well-drained loam', 'High humidity'],
            ['Mediterranean', 'Citrus, Grapes, Figs', 'Spring-Fall', 'Sandy loam', 'Moderate, winter rain'],
            ['North America', 'Apples, Berries, Stone fruits', 'Spring-Fall', 'Various', 'Regular watering'],
            ['South America', 'Avocado, Papaya, Passion fruit', 'Variable', 'Rich, organic', 'Consistent moisture'],
            ['Africa', 'Baobab, Marula, Date palm', 'Seasonal', 'Sandy, alkaline', 'Drought tolerant'],
            ['Australia', 'Macadamia, Finger lime, Kakadu plum', 'Variable', 'Acidic to neutral', 'Low to moderate']
          ]
        }
      ],
      content: [
        'Tropical fruit plants have evolved diverse strategies for seed dispersal, with many producing large, fleshy fruits consumed by mammals and birds. Fruits like durian and jackfruit can weigh several kilograms and contain multiple large seeds adapted for dispersal by large animals in forest ecosystems.',
        'Mediterranean fruit crops are typically adapted to dry summers through deep root systems and waxy fruit coatings that reduce water loss. Citrus fruits contain high levels of citric acid and essential oils that provide natural preservation and protection against pathogens during long ripening periods.',
        'Temperate fruit trees require specific chilling hours (temperatures below 45°F) during winter dormancy to break bud and flower properly. This adaptation ensures that flowering occurs after the threat of killing frosts has passed, maximizing reproductive success.',
        'Desert fruiting plants like prickly pear cacti produce fruits with high sugar content and thick, waxy skins to attract animal dispersers while minimizing water loss. Many desert fruits ripen during cooler months when animals have greater water needs and travel wider areas.',
        'Cold-climate fruiting plants often produce berries rich in antioxidants and natural antifreeze compounds that allow fruits to remain edible even after freezing. Species like cloudberries and lingonberries have evolved to fruit during the brief Arctic summer when migrating animals are present.'
      ]
    },
    {
      id: 'regional-vegetative',
      title: 'Regional Vegetative Plants',
      icon: Leaf,
      description: 'Leafy vegetables and crops adapted to different climatic regions',
      image: RegionalVegetativeImage,
      tables: [
        {
          title: 'Vegetative Crops by Climate Zone',
          headers: ['Climate Zone', 'Leafy Vegetables', 'Growing Season', 'Temperature Range', 'Special Requirements'],
          rows: [
            ['Cool Season', 'Spinach, Kale, Lettuce', 'Fall-Spring', '50-70°F', 'Short days for some'],
            ['Warm Season', 'Amaranth, Chard, Collards', 'Summer', '70-85°F', 'Heat tolerance'],
            ['Tropical', 'Water spinach, Moringa, Taro', 'Year-round', '75-95°F', 'High humidity'],
            ['Mediterranean', 'Arugula, Radicchio, Endive', 'Fall-Spring', '55-75°F', 'Cool, moist winters'],
            ['Desert', 'Purslane, Desert sage, Epazote', 'Cool season', '60-80°F', 'Low water needs'],
            ['Temperate', 'Cabbage, Brussels sprouts, Leeks', 'Fall-Spring', '45-75°F', 'Frost tolerance']
          ]
        }
      ],
      content: [
        'Cool-season leafy vegetables have evolved efficient photosynthesis at lower temperatures and often accumulate sugars as natural antifreeze compounds. Plants like spinach and kale actually become sweeter after frost exposure as starch converts to sugar for cellular protection.',
        'Tropical leafy vegetables typically grow rapidly in high humidity and heat, with many species like amaranth and water spinach capable of regenerative harvest where leaves can be continuously cut while the plant continues growing. These plants often have succulent stems for water storage.',
        'Mediterranean region vegetables are adapted to grow during mild, wet winters and survive dry summers through deep taproots or underground storage organs. Many species like radicchio develop bitter compounds that concentrate during stress, providing natural pest protection.',
        'Desert-adapted leafy plants employ CAM photosynthesis, opening stomata at night to collect CO2 while minimizing water loss during hot days. Species like purslane store water in thick, fleshy leaves and can survive extended drought periods while remaining edible.',
        'Cold-climate vegetative plants often require vernalization for proper development and can withstand temperatures well below freezing. Brussels sprouts and kale can survive temperatures down to 20°F while maintaining nutritional quality and palatability.'
      ]
    },
    {
      id: 'decorative-plants',
      title: 'Decorative Indoor and Outdoor Plants',
      icon: FlaskConical,
      description: 'Ornamental plants for landscaping and interior decoration by regional preferences',
      image: DecorativePlantsImage,
      tables: [
        {
          title: 'Popular Decorative Plants by Region',
          headers: ['Region', 'Indoor Plants', 'Outdoor Plants', 'Maintenance Level', 'Key Features'],
          rows: [
            ['North America', 'Pothos, Snake plant, Monstera', 'Maple, Oak, Azalea', 'Low-Medium', 'Seasonal color'],
            ['Europe', 'Ficus, Peace lily, Ivy', 'Rose, Lavender, Boxwood', 'Medium', 'Formal gardens'],
            ['Asia', 'Bamboo, Bonsai, Orchids', 'Cherry blossom, Camellia', 'Medium-High', 'Zen aesthetics'],
            ['Australia', 'Eucalyptus, Kangaroo vine', 'Bottlebrush, Grevillea', 'Low', 'Drought tolerant'],
            ['Tropical', 'Bromeliad, Anthurium, Palms', 'Hibiscus, Plumeria, Bougainvillea', 'Medium', 'Bright colors'],
            ['Mediterranean', 'Olive bonsai, Succulents', 'Rosemary, Sage, Cypress', 'Low', 'Aromatic foliage']
          ]
        }
      ],
      content: [
        'Indoor decorative plants serve both aesthetic and functional purposes, with many species improving air quality by removing volatile organic compounds. Popular houseplants like snake plants and pothos are particularly effective at filtering formaldehyde and benzene from indoor air while requiring minimal maintenance.',
        'Regional preferences for outdoor ornamental plants often reflect cultural traditions and local climate adaptations. Japanese gardens emphasize asymmetrical balance with plants like bamboo and ornamental maples, while English gardens favor structured designs with roses, lavender, and boxwood hedges.',
        'Succulent plants have gained worldwide popularity for both indoor and outdoor decoration due to their low water requirements and architectural forms. Species like echeveria and jade plants store water in thick leaves and can survive extended periods without irrigation while maintaining attractive appearances.',
        'Native plant gardening movements encourage the use of indigenous decorative species that support local wildlife and require fewer inputs. Native plants are pre-adapted to local soil and climate conditions, making them more sustainable choices for ornamental landscaping.',
        'Seasonal decorative plant rotation allows gardeners to maintain year-round visual interest by replacing summer annuals with cold-tolerant species. This practice maximizes garden aesthetics while working with natural plant life cycles and regional growing seasons.'
      ]
    },
    {
      id: 'usa-flowering',
      title: 'USA Flowering Plants',
      icon: Sprout,
      description: 'Native and cultivated flowering plants across American climate zones',
      tables: [
        {
          title: 'Flowering Plants by US Climate Zones',
          headers: ['USDA Zone', 'Region', 'Native Flowers', 'Popular Cultivars', 'Peak Bloom'],
          rows: [
            ['3-4', 'Northern Plains', 'Purple Coneflower, Black-eyed Susan', 'Hardy Hibiscus, Daylilies', 'July-August'],
            ['5-6', 'Midwest/Northeast', 'Wild Bergamot, New England Aster', 'Peonies, Iris, Tulips', 'May-June'],
            ['7-8', 'Mid-Atlantic/South', 'Cardinal Flower, Coral Honeysuckle', 'Azaleas, Dogwood, Magnolia', 'April-May'],
            ['9-10', 'Deep South/Florida', 'Firebush, Coontie', 'Camellias, Gardenias, Oleander', 'Year-round'],
            ['11', 'Hawaii/S. Florida', 'Hawaiian Hibiscus, Bird of Paradise', 'Plumeria, Bougainvillea', 'Year-round'],
            ['Var.', 'California', 'California Poppy, Lupine', 'Roses, Lavender, Jasmine', 'Spring-Fall']
          ]
        }
      ],
      content: [
        'The United States encompasses diverse flowering plant communities across multiple climate zones, from arctic tundra in Alaska to tropical rainforests in Hawaii. Native wildflower meadows once covered vast areas of the Great Plains, featuring species like purple coneflower and prairie blazingstar that have become popular in modern sustainable landscaping.',
        'The Eastern deciduous forests harbor spectacular spring ephemeral displays, with trout lilies, bloodroot, and wild ginger carpeting forest floors before tree canopy closure. These native plants have adapted to complete their entire reproductive cycle during the brief window of early spring sunlight.',
        'Desert Southwest flowering plants like desert marigold and ghost plant demonstrate remarkable drought adaptations, often remaining dormant for years until sufficient rainfall triggers mass blooming events. The Sonoran Desert spring wildflower displays can transform entire landscapes into colorful carpets visible from satellite imagery.',
        'Pacific Coast regions support unique flowering plant communities including endemic California poppies and lupines that have co-evolved with Mediterranean-type climate patterns. Many California native plants require specific fire cycles for seed germination and population renewal.',
        'Southeastern wetlands and coastal areas feature distinctive flowering plants like swamp hibiscus and cardinal flower that tolerate periodic flooding while providing critical habitat for migrating hummingbirds and butterflies along major flyway corridors.'
      ]
    },
    {
      id: 'usa-fruiting',
      title: 'USA Fruiting Plants',
      icon: TreePine,
      description: 'Native and commercial fruit production across American agricultural regions',
      tables: [
        {
          title: 'Major US Fruit Production by State',
          headers: ['State', 'Primary Fruits', 'Native Species', 'Harvest Season', 'Production Value'],
          rows: [
            ['California', 'Grapes, Almonds, Citrus', 'Manzanita, Elderberry', 'Year-round', '$20+ billion'],
            ['Florida', 'Oranges, Grapefruit', 'Saw Palmetto, Coontie', 'Oct-June', '$1.2 billion'],
            ['Washington', 'Apples, Cherries, Pears', 'Salmonberry, Huckleberry', 'July-Oct', '$2.3 billion'],
            ['Georgia', 'Peaches, Pecans', 'Muscadine Grape, Persimmon', 'June-Nov', '$1.1 billion'],
            ['Michigan', 'Cherries, Blueberries, Apples', 'Wild Strawberry, Elderberry', 'July-Oct', '$900 million'],
            ['New York', 'Apples, Grapes', 'Wild Black Cherry, Hawthorn', 'Aug-Oct', '$800 million']
          ]
        }
      ],
      content: [
        'American fruit production spans diverse climatic regions, with California leading global production of almonds, grapes, and stone fruits due to its Mediterranean climate and extensive irrigation systems. The Central Valley produces over 80% of the world\'s almonds, requiring precise timing of bloom and harvest to maximize yield quality.',
        'Native American fruit plants like elderberries, serviceberries, and wild plums provided essential nutrition for indigenous peoples and early settlers. Many of these species remain important for wildlife habitat and are experiencing renewed interest for sustainable food systems and permaculture applications.',
        'The Great Lakes region specializes in cold-hardy fruits including tart cherries, blueberries, and cold-climate apples that require specific winter chill hours for proper fruit development. Lake effect climate moderation allows fruit cultivation further north than would otherwise be possible.',
        'Southern states excel in warm-season and subtropical fruits, with Georgia peaches, Florida citrus, and Texas grapefruits representing major agricultural industries. These crops face increasing challenges from climate change, requiring development of heat and drought-tolerant varieties.',
        'Pacific Northwest fruit production benefits from volcanic soils and consistent moisture, supporting premium apple, pear, and berry crops. The region\'s unique climate creates ideal conditions for wine grapes, establishing world-renowned viticultural areas in Washington, Oregon, and Northern California.'
      ]
    },
    {
      id: 'usa-vegetative',
      title: 'USA Vegetative Plants',
      icon: Leaf,
      description: 'Leafy greens and vegetable crops cultivated across American farming regions',
      tables: [
        {
          title: 'Vegetable Production by US Region',
          headers: ['Region', 'Major Leafy Crops', 'Native Edibles', 'Growing Season', 'Soil Type'],
          rows: [
            ['California Central Valley', 'Lettuce, Spinach, Kale', 'Lamb\'s quarters, Purslane', 'Year-round', 'Alluvial loam'],
            ['Southeast', 'Collards, Turnip greens', 'Pokeweed, Wild garlic', 'Fall-Spring', 'Sandy loam'],
            ['Northeast', 'Cabbage, Swiss chard', 'Wild leeks, Watercress', 'Spring-Fall', 'Glacial till'],
            ['Great Plains', 'Wheat grass, Sunflowers', 'Prairie turnip, Wild onion', 'Spring-Summer', 'Prairie soil'],
            ['Southwest', 'Chard, Arugula', 'Desert sage, Epazote', 'Fall-Spring', 'Caliche/clay'],
            ['Pacific Northwest', 'Lettuce, Asian greens', 'Salmonberry leaves, Nettle', 'Spring-Fall', 'Volcanic ash']
          ]
        }
      ],
      content: [
        'California\'s Salinas Valley, known as "America\'s Salad Bowl," produces over 70% of the nation\'s lettuce and leafy greens through year-round cultivation enabled by Mediterranean climate and advanced irrigation technology. The region\'s cool coastal fog provides natural cooling that extends growing seasons for cool-season crops.',
        'Traditional Native American leafy vegetables included lamb\'s quarters, purslane, and wild amaranth, which remain valuable nutritional sources and are being reintroduced into modern sustainable agriculture systems. These plants often outperform conventional crops in drought conditions and poor soils.',
        'Southern states specialize in heat-tolerant leafy greens like collards, turnip greens, and mustard greens that thrive in hot, humid summers. These crops are deeply embedded in regional cuisine and culture, providing essential nutrients during periods when cool-season vegetables cannot survive.',
        'Northeast organic farming has revitalized production of cold-hardy greens including kale, Brussels sprouts, and winter lettuce varieties that can survive freezing temperatures. Season extension techniques like cold frames and high tunnels allow year-round production even in northern climates.',
        'Urban agriculture movements across American cities are promoting leafy green production in vertical farms, rooftop gardens, and community plots, reducing food miles and increasing access to fresh vegetables in urban food deserts while building community resilience.'
      ]
    },
    {
      id: 'usa-decorative',
      title: 'USA Decorative Plants',
      icon: FlaskConical,
      description: 'Ornamental landscaping plants popular across American regions and climates',
      tables: [
        {
          title: 'Popular US Landscaping Plants by Region',
          headers: ['Region', 'Shade Trees', 'Flowering Shrubs', 'Perennials', 'Lawn Alternatives'],
          rows: [
            ['Northeast', 'Sugar Maple, Oak', 'Rhododendron, Lilac', 'Hosta, Daylily', 'Fine fescue'],
            ['Southeast', 'Live Oak, Magnolia', 'Azalea, Camellia', 'Iris, Daffodil', 'Zoysia grass'],
            ['Midwest', 'Burr Oak, Hackberry', 'Spirea, Forsythia', 'Purple Coneflower, Bee Balm', 'Buffalo grass'],
            ['Southwest', 'Desert Willow, Mesquite', 'Palo Verde, Desert Broom', 'Desert Marigold, Brittlebush', 'Desert grass mix'],
            ['Pacific Coast', 'Coast Redwood, Douglas Fir', 'Manzanita, Ceanothus', 'California Poppy, Lupine', 'Native sedges'],
            ['Mountain West', 'Aspen, Blue Spruce', 'Serviceberry, Chokecherry', 'Indian Paintbrush, Penstemon', 'Buffalo grass']
          ]
        }
      ],
      content: [
        'American residential landscaping traditions vary dramatically by region, with New England favoring formal foundation plantings of rhododendrons and boxwood, while Western xeriscaping emphasizes drought-tolerant natives like manzanita and ceanothus. Regional plant societies promote locally adapted species that support wildlife corridors.',
        'The American lawn industry represents a $60 billion market, but increasing environmental awareness is driving adoption of native grass alternatives like buffalo grass in arid regions and fine fescue in cooler areas. These alternatives require significantly less water, fertilizer, and maintenance than traditional turf grass.',
        'Native plant movements across the US promote indigenous species for landscaping, with organizations like the National Wildlife Federation encouraging homeowners to create certified wildlife habitats using regionally appropriate plants that support local pollinator populations and bird migration patterns.',
        'Climate change adaptation in American landscaping increasingly emphasizes resilient plant selections that can tolerate temperature extremes, drought, and severe weather events. Many regions are updating plant hardiness recommendations as temperature zones shift northward.',
        'Urban heat island mitigation through strategic tree planting has become a priority in American cities, with programs focusing on canopy coverage goals and species selection for maximum cooling benefits. Street tree diversity helps prevent widespread loss from species-specific diseases and pests.'
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
                                  <table className="min-w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-xs">
                                    <thead className="bg-green-50 dark:bg-green-900/30">
                                      <tr>
                                        {table.headers.map((header, headerIndex) => (
                                          <th
                                            key={headerIndex}
                                            className="px-2 py-1.5 text-left text-xs font-medium text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-600 break-words max-w-xs"
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
                                              className="px-2 py-1.5 text-xs text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 break-words max-w-xs leading-tight"
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