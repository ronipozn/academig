var helpers = require('./helpers.ts');
var async = require("async");

exports.version = "0.1.0";

exports.topics = function (req, res) {
  var getp = req.query;

  async.waterfall([
    // get Research Topics per Department
    function (cb) {
      console.log('topics.getp.term',getp.term);
      let topics = research_topics;
      // switch (getp.term) {
      //   case "biology":
      //     topics = research_topics.biology;
      //   case "chemistry":
      //     topics = research_topics.chemistry;
      //   case "earth_science":
      //     topics = research_topics.earth_science;
      //   case "space_sciences":
      //     topics = research_topics.space_sciences;
      //   case "physics":
      //     topics = research_topics.physics;
      //   case "computer_science":
      //     topics = research_topics.computer_science;
      //   case "mathematics":
      //     topics = research_topics.mathematics;
      // }
      cb(null, topics)
    },
  ],
  function (err, topics) {
    if (err) {
      helpers.send_failure(res, helpers.http_code_for_error(err), err);
    } else {
      helpers.send_success(res, topics);
    }
});
}

// Missing:
// Materials Chemistry

const research_topics = [
  "Abnormal psychology",
  "Accounting",
  "Acoustical engineering",
  "Acoustics",
  "Actuarial science",
  "Aerodynamics",
  "Aeronautics",
  "Aerospace engineering",
  "Aesthetics",
  "Affect control theory",
  "Affine geometry",
  "African philosophy",
  "African studies",
  "Africana studies",
  "Agrochemistry",
  "Algebra",
  "Algebraic (symbolic) computation",
  "Algebraic geometry",
  "Algebraic number theory",
  "Algebraic topology",
  "Algorithms",
  "Alternative medicine",
  "American politics",
  "American studies",
  "Analysis",
  "Analytic number theory",
  "Analytic philosophy",
  "Analytical chemistry",
  "Analytical sociology",
  "Anarchism",
  "Anatomy",
  "Andrology",
  "Animal rights",
  "Appalachian studies",
  "Applied ethics",
  "Applied philosophy",
  "Applied physics",
  "Applied psychology",
  "Applied sociology",
  "Approximation theory",
  "Architectural engineering",
  "Architectural sociology",
  "Area studies",
  "Aristotelianism",
  "Arithmetic combinatorics",
  "Artificial intelligence",
  "Artificial neural network",
  "Asian psychology",
  "Asian studies",
  "Assignment problem",
  "Associative algebra",
  "Astrobiology",
  "Astrochemistry",
  "Astronautics",
  "Astronomy",
  "Astrophysical plasma",
  "Astrophysics",
  "Atmospheric chemistry",
  "Atmospheric science / Meteorology",
  "Atomic",
  "Australian studies",
  "Automata theory (Formal languages)",
  "Automated reasoning",
  "Automotive engineering",
  "Bariatric surgery",
  "Behavioral geography",
  "Behavioral sociology",
  "Biochemical engineering",
  "Biochemical systems theory",
  "Biochemistry",
  "Biocybernetics",
  "Bioengineering",
  "Bioethics",
  "Biogeography / Phytogeography",
  "Biological psychology",
  "Biological systems engineering",
  "Biomaterials",
  "Biomechanical engineering",
  "Biomedical engineering",
  "Biomedicine",
  "Biomolecular engineering",
  "Bionics",
  "Biophysics",
  "Biophysics",
  "Black holes",
  "Black psychology",
  "Botany",
  "Business management",
  "Calculus",
  "Canadian politics",
  "Canadian studies",
  "Cardiac electrophysiology",
  "Cardiology",
  "Cardiothoracic surgery",
  "Catalysis",
  "Category theory",
  "Cell biology",
  "Celtic studies",
  "Central Asian studies",
  "Ceramic engineering",
  "Chaos theory",
  "Chemical biology",
  "Chemical engineering",
  "Cheminformatics",
  "Child psychopathology",
  "Chronobiology",
  "Civics",
  "Climatology / Paleoclimatology / Palaeogeography",
  "Clinical biochemistry",
  "Clinical immunology",
  "Clinical laboratory sciences/Clinical pathology/Laboratory medicine",
  "Clinical microbiology",
  "Clinical neuropsychology",
  "Clinical physiology",
  "Clinical psychology",
  "Clinical Social Work",
  "Cloud computing",
  "Coastal engineering",
  "Coastal geography / Oceanography",
  "Coding theory",
  "Cognitive geography",
  "Cognitive psychology",
  "Cognitive science",
  "Collective behavior",
  "Combinatorics",
  "Community informatics",
  "Community practice",
  "Community psychology",
  "Commutative algebra",
  "Comparative politics",
  "Comparative psychology",
  "Comparative sociology",
  "Compilers",
  "Complex analysis",
  "Complex systems",
  "Computability theory",
  "Computational biology (bioinformatics)",
  "Computational biology",
  "Computational chemistry",
  "Computational complexity theory",
  "Computational economics",
  "Computational finance",
  "Computational fluid dynamics",
  "Computational geometry",
  "Computational mathematics",
  "Computational neuroscience",
  "Computational number theory",
  "Computational physics",
  "Computational sociology",
  "Computational systems biology",
  "Computer architecture",
  "Computer communications (networks)",
  "Computer engineering",
  "Computer graphics",
  "Computer science",
  "Computer security and reliability",
  "Computer vision",
  "Computer-aided engineering",
  "Computing in mathematics",
  "Computing in social sciences",
  "Conceptual systems",
  "Concurrency theory",
  "Concurrent programming",
  "Condensed matter physics",
  "Conflict theory",
  "Conservation biology",
  "Conservation psychology",
  "Consumer psychology",
  "Continental philosophy",
  "Continuum mechanics",
  "Control engineering",
  "Control systems engineering",
  "Control systems",
  "Control theory",
  "Convex geometry",
  "Cosmochemistry",
  "Counseling psychology",
  "Criminal psychology",
  "Criminology/Criminal justice",
  "Critical management studies",
  "Critical sociology",
  "Cross-cultural studies",
  "Cryogenics",
  "Cryptography",
  "Crystallography",
  "Cultural geography",
  "Cultural psychology",
  "Cultural sociology",
  "Cultural studies/ethnic studies",
  "Culturology",
  "Cybernetics",
  "Cytogenetics",
  "Cytohematology",
  "Cytology",
  "Data management",
  "Data mining",
  "Data structures",
  "Data visualization",
  "Database",
  "Deaf studies",
  "Decision analysis",
  "Demography",
  "Demography/Population",
  "Dental hygiene and epidemiology",
  "Dental surgery",
  "Dentistry",
  "Dermatology",
  "Determinism and Free will",
  "Development geography",
  "Developmental biology",
  "Developmental psychology",
  "Developmental systems theory",
  "Differential algebra",
  "Differential psychology",
  "Differential topology",
  "Digital humanities (Humanities computing)",
  "Digital sociology",
  "Discrete geometry",
  "Distance education",
  "Distributed algorithms",
  "Distributed computing",
  "Distributed database",
  "Dramaturgical sociology",
  "Dynamic programming",
  "Dynamical systems",
  "Earth systems engineering and management",
  "Earthquake engineering",
  "East Asian studies",
  "Eastern philosophy",
  "Ecological engineering",
  "Ecological psychology",
  "Ecological systems theory",
  "Ecology",
  "Econometrics",
  "Economic development",
  "Economic geography",
  "Economic sociology",
  "Economic sociology/Socioeconomics",
  "Ecosystem ecology",
  "Edaphology / Pedology or Soil science",
  "Edaphology",
  "Educational psychology",
  "Educational sociology",
  "Electricity",
  "Electrochemistry",
  "Electromagnetism",
  "Electronic engineering",
  "Elementary particle physics",
  "Emergency medicine",
  "Empirical sociology",
  "Endocrinology",
  "Endodontics",
  "Engineering cybernetics",
  "Engineering geology",
  "Engineering physics",
  "Enterprise systems engineering",
  "Environmental chemistry",
  "Environmental engineering",
  "Environmental ethics",
  "Environmental psychology",
  "Environmental science",
  "Environmental sociology",
  "Epidemiology",
  "Epistemology",
  "Ergodic theory",
  "Ergonomics",
  "Ethics",
  "Ethnology",
  "Ethnomethodology",
  "European studies",
  "Evolutionary biology",
  "Evolutionary psychology",
  "Evolutionary sociology",
  "Experimental physics",
  "Experimental psychology",
  "Expert systems",
  "Family psychology",
  "Family systems theory",
  "Family therapy",
  "Fault-tolerant computing",
  "Feminine psychology",
  "Feminist philosophy",
  "Feminist sociology",
  "Femtochemistry",
  "Field theory",
  "Figurational sociology",
  "Finance",
  "Financial social work",
  "Finite element analysis",
  "Finite geometry",
  "Flavor",
  "Flow chemistry",
  "Fluid dynamics",
  "Fluid mechanics",
  "Food engineering",
  "Forensic developmental psychology",
  "Forensic psychiatry",
  "Forensic psychology",
  "Formal methods (Formal verification)",
  "Fourier analysis",
  "Fractal geometry",
  "Functional analysis",
  "Functional programming",
  "Futures studies",
  "Fuzzy logic",
  "Galaxy formation and evolution",
  "Galois geometry",
  "Game theory",
  "Gamma ray astronomy",
  "Gastroenterology",
  "Gemology",
  "Gender studies",
  "General practice",
  "General systems theory",
  "General topology",
  "Genetics",
  "Geobiology",
  "Geobiology",
  "Geochemistry",
  "Geodesy",
  "Geology",
  "Geometric number theory",
  "Geometric topology",
  "Geometry and Topology",
  "Geophysics",
  "Geopolitics (Political geography)",
  "Geostatistics",
  "Geotechnical engineering",
  "Geriatrics",
  "German studies",
  "Gerontology",
  "Glaciology",
  "Graph theory",
  "Gravitational astronomy",
  "Green chemistry",
  "Grid computing",
  "Group Fitness / aerobics",
  "Group psychology",
  "Group representation",
  "Group theory",
  "Gynaecology",
  "Haemostasiology",
  "Harmonic analysis",
  "Health geography",
  "Health informatics/Clinical informatics",
  "Health psychology",
  "Heat transfer",
  "Helioseismology",
  "Hematology",
  "Hepatology",
  "Heterosexism",
  "High-energy astrophysics",
  "High-performance computing",
  "Highway engineering",
  "Histochemistry",
  "Histology",
  "Historical geography",
  "Historical sociology",
  "History of computer hardware",
  "History of computer science",
  "Homological algebra",
  "Human biology",
  "Human ecology",
  "Human performance technology",
  "Human sexual behavior",
  "Human sexuality",
  "Human-computer interaction",
  "Humanistic informatics",
  "Humanistic psychology",
  "Humanistic sociology",
  "Hydraulic engineering",
  "Hydrodynamics",
  "Hydrogenation",
  "Hydrology/ Limnology / Hydrogeology",
  "Image processing",
  "Immunochemistry",
  "Imperative programming",
  "Implantology",
  "Indigenous psychology",
  "Indology",
  "Industrial engineering",
  "Industrial sociology",
  "Infectious disease",
  "Information architecture",
  "Information management",
  "Information retrieval",
  "Information theory",
  "Infrared astronomy",
  "Inorganic chemistry",
  "Instructional design",
  "Instructional simulation",
  "Instrumentation engineering",
  "Integral geometry",
  "Integral geometry",
  "Intensive care medicine",
  "Interactionism",
  "Internal medicine",
  "International organizations",
  "International relations",
  "Internet",
  "Interpretive sociology",
  "Interstellar medium",
  "Intuitionistic logic",
  "Inventory theory",
  "Iranian studies",
  "Japanese studies",
  "Jealousy sociology",
  "Justification",
  "K-theory",
  "Kinesiology / Exercise science / Human performance",
  "Knowledge management",
  "Korean studies",
  "Landscape ecology",
  "Language geography",
  "Latin American studies",
  "Lattice theory (Order theory)",
  "Legal psychology",
  "Leisure studies",
  "Libertarianism",
  "Lichenology",
  "Lie algebra",
  "Linear algebra (Vector space)",
  "Linear programming",
  "Living systems theory",
  "Logic in computer science",
  "Logic programming",
  "Logic",
  "LTI system theory",
  "Machine learning",
  "Macrosociology",
  "Magnetohydrodynamics",
  "Management cybernetics",
  "Manufacturing engineering",
  "Marine biology",
  "Marine chemistry",
  "Marine engineering",
  "Marketing geography",
  "Marketing",
  "Marxism",
  "Marxist sociology",
  "Mass transfer",
  "Materials engineering",
  "Mathematical chemistry",
  "Mathematical logic and Foundations of mathematics",
  "Mathematical logic",
  "Mathematical optimization",
  "Mathematical physics",
  "Mathematical psychology",
  "Mathematical sociology",
  "Mathematical statistics",
  "Mathematical system theory",
  "Measure theory",
  "Mechanics",
  "Mechanochemistry",
  "Mechatronics",
  "Media psychology",
  "Medical cybernetics",
  "Medical physics",
  "Medical psychology",
  "Medical sociology",
  "Medical toxicology",
  "Medicinal chemistry",
  "Medicine‎",
  "Men's studies",
  "Mental health",
  "Mesosociology",
  "Meta-ethics",
  "Meta-philosophy",
  "Metaphysics",
  "Microbiology",
  "Microsociology",
  "Microwave astronomy",
  "Middle Eastern studies",
  "Military geography",
  "Military psychology",
  "Military sociology",
  "Mining engineering",
  "Modal logic",
  "Model theory",
  "Molecular biology",
  "Molecular engineering",
  "Molecular genetics",
  "Molecular mechanics",
  "Molecular physics",
  "Moral psychology",
  "Moral psychology and Descriptive ethics",
  "Morphology",
  "Multi-valued logic",
  "Multilinear algebra",
  "Multimedia",
  "Music psychology",
  "Music therapy",
  "Mycology",
  "Nanoengineering",
  "Nanomaterials",
  "Nanotechnology",
  "Nationalism studies",
  "Natural language processing (Computational linguistics)",
  "Natural product chemistry",
  "Natural resource sociology",
  "Nephrology",
  "Network science",
  "Neural engineering",
  "Neuro-ophthalmology",
  "Neurochemistry",
  "Neurology",
  "Neuropsychology",
  "Neuroscience",
  "Neurosurgery",
  "New Cybernetics",
  "Newtonian dynamics",
  "Non-associative algebra",
  "Non-Euclidean geometry",
  "Non-standard analysis",
  "Noncommutative algebra",
  "Noncommutative geometry",
  "Normative ethics",
  "Nuclear engineering",
  "Nuclear physics",
  "Number theory",
  "Numerical analysis",
  "Numerical simulations",
  "Nursing",
  "Nutrition and dietetics",
  "Nutrition",
  "Object database",
  "Object-oriented programming",
  "Observational astronomy",
  "Obstetrics",
  "Occupational health psychology",
  "Occupational hygiene",
  "Occupational psychology",
  "Occupational therapy",
  "Occupational toxicology",
  "Ocean engineering",
  "Oenology",
  "Oncology",
  "Ontology",
  "Operating systems",
  "Operations management",
  "Operations research",
  "Operator theory",
  "Ophthalmology",
  "Optical astronomy",
  "Optical engineering",
  "Optics",
  "Optimal maintenance",
  "Optometry",
  "Oral and maxillofacial surgery",
  "Ordinary differential equations",
  "Organic chemistry",
  "Organizational psychology",
  "Organizational studies",
  "Organometallic chemistry",
  "Orthodontics",
  "Orthopedic surgery",
  "Orthoptics",
  "Otolaryngology",
  "p-adic analysis",
  "Pakistan studies",
  "Paleobiology",
  "Paleoecology",
  "Paleontology",
  "Parallel algorithms",
  "Parallel computing",
  "Parapsychology",
  "Parasitology",
  "Partial differential equations",
  "Pathology",
  "Pathology",
  "Peace and conflict studies",
  "Pediatric psychology",
  "Pediatrics",
  "Pedology (children study)",
  "Perceptual control theory",
  "Periodontics",
  "Person-centered therapy",
  "Personal fitness training",
  "Personality psychology",
  "Petrochemistry",
  "Petroleum engineering",
  "Pharmaceutical sciences",
  "Pharmacology",
  "Pharmacy",
  "Phenomenological sociology",
  "Phenomenology",
  "Philosophical logic",
  "Philosophical traditions and schools",
  "Philosophy of Action",
  "Philosophy of artificial intelligence",
  "Philosophy of biology",
  "Philosophy of chemistry",
  "Philosophy of economics",
  "Philosophy of education",
  "Philosophy of engineering",
  "Philosophy of history",
  "Philosophy of language",
  "Philosophy of law",
  "Philosophy of mathematics",
  "Philosophy of mind",
  "Philosophy of music",
  "Philosophy of pain",
  "Philosophy of perception",
  "Philosophy of physical sciences",
  "Philosophy of physics",
  "Philosophy of psychology",
  "Philosophy of religion",
  "Philosophy of social science",
  "Philosophy of space and time",
  "Philosophy of technology",
  "Photochemistry",
  "Photonics",
  "Photonics",
  "Physical chemistry",
  "Physical cosmology",
  "Physical fitness",
  "Physical geography",
  "Physical metallurgy",
  "Physical organic chemistry",
  "Physical therapy",
  "Physiology",
  "Physiotherapy",
  "Phytochemistry",
  "Planetary science",
  "Plasma physics",
  "Plastic surgery",
  "Platonism",
  "Podiatry",
  "Policy sociology",
  "Policy studies",
  "Political behavior",
  "Political culture",
  "Political economy",
  "Political geography",
  "Political history",
  "Political philosophy",
  "Political psychology",
  "Political sociology",
  "Polymer chemistry",
  "Polymer engineering",
  "Polymer science",
  "Population geography",
  "Positive psychology",
  "Power engineering",
  "Preventive medicine",
  "Primary care",
  "Probability theory",
  "Process design",
  "Process engineering",
  "Program semantics",
  "Programming language semantics",
  "Programming languages",
  "Programming paradigms",
  "Projective geometry",
  "Proof theory",
  "Prosthodontics",
  "Psephology",
  "Psychiatry",
  "Psychoanalysis",
  "Psychoanalytic sociology",
  "Psychobiology",
  "Psychology of religion",
  "Psychology",
  "Psychometrics",
  "Psychopathology",
  "Psychophysics",
  "Psychosocial rehabilitation",
  "Public administration",
  "Public health",
  "Public law",
  "Public sociology",
  "Pulmonology",
  "Pure sociology",
  "Quantitative psychology",
  "Quantum chemistry",
  "Quantum computing",
  "Quantum field theory",
  "Quantum gravity",
  "Quantum mechanics",
  "Quantum physics",
  "Quaternary science",
  "Queer studies/Queer theory",
  "Radio astronomy",
  "Radiobiology",
  "Radiochemistry",
  "Radiology",
  "Randomized algorithms",
  "Reaction engineering",
  "Real analysis",
  "Real options analysis",
  "Reasoning errors",
  "Recreational therapy",
  "Recursion theory",
  "Rehabilitation medicine",
  "Rehabilitation psychology",
  "Relational database",
  "Religion geography",
  "Representation theory",
  "Respiratory therapy",
  "Rheumatology",
  "Ring theory",
  "Robotics",
  "Scandinavian studies",
  "Scheduling",
  "School psychology",
  "Science studies/Science and technology studies",
  "Scientific computing (Computational science)",
  "Scientific visualization",
  "Second-order cybernetics",
  "Semiconductors",
  "Set theory",
  "Sex education",
  "Sexology",
  "Sindhology",
  "Sinology",
  "Slavic studies",
  "Sleep medicine",
  "Social capital",
  "Social change",
  "Social conflict theory",
  "Social constructionism",
  "Social control",
  "Social development",
  "Social dynamics",
  "Social economy",
  "Social engineering",
  "Social geography",
  "Social movements",
  "Social network analysis",
  "Social philosophy and political philosophy",
  "Social philosophy",
  "Social policy",
  "Social psychology",
  "Social stratification",
  "Social theory",
  "Social transformation",
  "Sociobiology",
  "Sociocybernetics",
  "Sociolinguistics",
  "Sociology in Poland",
  "Sociology of aging",
  "Sociology of agriculture",
  "Sociology of art",
  "Sociology of autism",
  "Sociology of childhood",
  "Sociology of conflict",
  "Sociology of culture",
  "Sociology of cyberspace",
  "Sociology of development",
  "Sociology of deviance",
  "Sociology of disaster",
  "Sociology of education",
  "Sociology of emotions",
  "Sociology of fatherhood",
  "Sociology of finance",
  "Sociology of food",
  "Sociology of gender",
  "Sociology of generations",
  "Sociology of globalization",
  "Sociology of government",
  "Sociology of health and illness",
  "Sociology of human consciousness",
  "Sociology of immigration",
  "Sociology of knowledge",
  "Sociology of language",
  "Sociology of law",
  "Sociology of leisure",
  "Sociology of literature",
  "Sociology of markets",
  "Sociology of marriage",
  "Sociology of motherhood",
  "Sociology of music",
  "Sociology of natural resources",
  "Sociology of organizations",
  "Sociology of peace",
  "Sociology of punishment",
  "Sociology of race and ethnic relations",
  "Sociology of religion",
  "Sociology of risk",
  "Sociology of science",
  "Sociology of scientific knowledge",
  "Sociology of social change",
  "Sociology of social movements",
  "Sociology of space",
  "Sociology of sport",
  "Sociology of technology",
  "Sociology of terrorism",
  "Sociology of the body",
  "Sociology of the family",
  "Sociology of the history of science",
  "Sociology of the Internet",
  "Sociology of work",
  "Sociomusicology",
  "Sociotechnical systems theory",
  "Software engineering",
  "Soil biology",
  "Solid mechanics",
  "Solid state physics",
  "Solid-state chemistry",
  "Sonochemistry",
  "Sound and music computing",
  "Southeast Asian studies",
  "Speech-language pathology",
  "Sport psychology",
  "Sports medicine",
  "Star formation",
  "Statistical mechanics",
  "Statistics",
  "Stellar astrophysics",
  "Stellar evolution",
  "Stellar nucleosynthesis",
  "Stochastic process",
  "Stochastic processes",
  "Strategic geography",
  "String theory",
  "Structural biology",
  "Structural engineering",
  "Structural mechanics",
  "Structural sociology",
  "Support vector machine",
  "Supramolecular chemistry",
  "Surface chemistry",
  "Surgery",
  "Surveying",
  "Symbolic interactionism",
  "Synthetic biology",
  "Synthetic chemistry",
  "System dynamics",
  "Systemic therapy",
  "Systems analysis",
  "Systems analysis",
  "Systems biology",
  "Systems ecology",
  "Systems engineering",
  "Systems immunology",
  "Systems neuroscience",
  "Systems philosophy",
  "Systems psychology",
  "Systems theory in anthropology",
  "Systems theory",
  "Taxonomy",
  "Telecommunications engineering",
  "Teleology",
  "Thai studies",
  "Theism and Atheism",
  "Theoretical chemistry",
  "Theoretical physics",
  "Theoretical sociology",
  "Theory of computation",
  "Thermal physics",
  "Thermochemistry",
  "Thermodynamics",
  "Time geography",
  "Topos theory",
  "Tourism geography",
  "Traditional medicine",
  "Traffic psychology",
  "Transpersonal psychology",
  "Transport geography",
  "Transport phenomena",
  "Transportation engineering",
  "Trauma surgery",
  "Traumatology",
  "Type theory",
  "Ubiquitous computing",
  "Universal algebra",
  "Urban geography",
  "Urban studies or Urban sociology/Rural sociology",
  "Urology",
  "Utopian studies",
  "UV astronomy",
  "Vehicle engineering",
  "Veterinary medicine",
  "Victimology",
  "Virtue ethics",
  "Visual sociology",
  "VLSI design",
  "Whiteness studies",
  "Wireless computing (Mobile computing)",
  "Women's studies",
  "World-systems theory",
  "X-ray astronomy",
  "Zoology"
];

// Fields
// Agricultural Science
// Analytical Chemistry
// Architecture
// Biology
// Chemistry
// Clinical
// Computer Science
// Design
// Ecology
// Economics
// Education
// Engineering
// Geography
// Geoscience
// Humanities
// Interdisciplinary
// Materials Science
// Mathematics
// Medicine
// Microbiology
// Neuroscience
// Physics
// Political Science
// Psychology
// Social Science
// Space Science
//
// Disciplines
// Accelerator Physics
// Accounting
// Acoustics
// Aerospace & Aeronautical Engineering
// Agricultural Biotechnology
// Agricultural Economics
// Agricultural Science
// Agrochemistry
// Agronomy & Horticulture
// Allergology
// Analytical Chemistry
// Anatomy
// Anesthesiology
// Animal Ecology
// Applied Ecology
// Applied Mathematics
// Aquatic Ecology
// Archaeology
// Architecture
// Astronomy
// Astrophysics
// Atmospheric Physics & Meteorology
// Audiology & Hearing Disorders
// Automation & Robotics
// Automotive & Automobile Engineering
// Behavioral Science
// Biochemistry
// Bioinformatic Programming
// Biomaterials
// Biomedical Engineering
// Biometrics
// Bioprocess & Biosystems Engineering
// Biostatistics
// Business Development & Entrepreneurship
// Cancer Research
// Cardiovascular Health
// Cell Biology
// Cell Biophysics
// Cell Culture
// Cell Signaling
// Cellular Neuroscience
// Chemical Engineering
// Child & Developmental Psychology
// Civil Engineering
// Climate Modeling
// Clinical Laboratory Management
// Clinical Pharmacology
// Clinical Psychology
// Clinical Toxicology
// Clinical Trials
// Cognitive Science
// Communication & Media
// Computational Linguistics
// Computational Materials Science
// Computational Neuroscience
// Computational Physics
// Computer Graphics
// Computer Programming
// Computer Science
// Computer Vision
// Condensed Matter Physics
// Cosmology
// Crop Science
// Cryogenics
// Crystallography
// Cyber Security
// Data Analytics
// Data Mining
// Demography
// Dentistry & Periodontics
// Dermatology
// Developmental Biology/Embryology
// Drug Design
// Earth Geosciences
// Econometrics
// Economics
// Educational Technologies & Distance Learning
// Electrical Engineering
// Electrochemistry
// Electron & X-Ray Microscopy
// Electronic Engineering
// Electrophysiology
// Emergency Medical Care
// Endocrinology
// Energy Economics
// Energy Engineering
// Energy Materials
// Entomology
// Environmental Chemistry
// Environmental Engineering
// Environmental Policy & Law
// Environmental Science
// Epidemiology
// Epigenetics & Post-Translational Modifications
// Evolutionary Biology
// Finance
// Fisheries & Aquaculture
// Fluid Mechanics
// Food Science
// Forensic Medicine
// Forestry
// Gastroenterology
// Gender Studies
// Gene Therapy
// General Engineering
// General Molecular Biology
// General Toxicology
// Genetics & Genome Biology
// Genomic Bioinformatics
// Geochemistry
// Geoinformatics & Remote Sensing
// Geological Engineering
// Geophysics
// Geriatric Medicine
// Gynaecology & Obstetrics
// Head & Neck Surgery, Otolaryngology
// Healthcare Policy & Economics
// Hematology
// Hepatology
// Histology
// History
// Human Geography
// Human Physiology
// Human Resources Management
// Human-Computer Interaction
// Humanities
// Hydrology
// Image & Video Analysis
// Immunology
// Immunotherapy
// Industrial & Organizational Psychology
// Industrial Biotechnology
// Industrial Chemistry
// Industrial Design
// Industrial Engineering
// Inflammatory Diseases
// Information Systems
// Inorganic Chemistry
// Intellectual Property Rights & Patents
// Interdisciplinary Life Scientists
// Internal / General Medicine
// International Relations & Foreign Policy
// Internet of Things
// Kinesiology & Biomechanics
// Landscape Architecture
// Laser Applications
// Law
// Life Sciences
// Linguistics
// Livestock Management
// Logistics & Supply Chains
// Machine Learning & Artificial Intelligence
// Macroeconomics
// Manufacturing Engineering
// Marine Biology
// Marine Engineering
// Marketing
// Material Characterization & Structure
// Materials Chemistry
// Mathematical Modeling
// Mechanical Engineering
// Mechanics
// Medical & Clinical Diagnostics
// Medical Devices
// Medical Education
// Medical Genetics
// Medical Imaging
// Medical Physics
// Metabolic Disorders
// Metabolomics
// Metallurgy
// Micro & Nanofluidics
// Microbiology
// Microeconomics
// Mineralogy & Petrology
// Mobile & Cloud Computing
// Molecular Biophysics
// Molecular Characterization
// Molecular Ecology
// Molecular Modeling
// Molecular Pharmacology
// Molecular Physics
// Music Education
// Mycology
// Nanomaterials
// Nanomedicine
// Nanoscience
// Networks & Internet Technologies
// Neuroimmunology
// Neurological Diseases
// Neurology
// Neuroscience
// Nuclear Physics
// Nursing
// Nutrition & Dietetics
// Nutritional Biochemistry
// Oceanography
// Oncology
// Optical Microscopy - Biological
// Optical Microscopy - Materials
// Optics and Photonics
// Organic Chemistry
// Organization & Management
// Orthodontics
// Orthopaedics & Traumatology
// Paleobiology
// Paleogenomics
// Palliative Care
// Parasitology
// Particle Physics
// Pathology
// Pedagogy & Education Research
// Pediatrics
// Performing Arts
// Petroleum Engineering
// Pharmaceutical Engineering
// Pharmacokinetics & Pharmacodynamics
// Pharmacological Analysis
// Pharmacy
// Philology, Literature & Writing
// Photovoltaics
// Physical Chemistry
// Physical Rehabilitation & Physiotherapy
// Physical Sciences
// Plant Biology
// Plant Breeding & Plant Genetics
// Plant Pathology
// Plasma Physics
// Political Science
// Polymers
// Process & Systems Engineering
// Protein Analysis
// Proteomics
// Psychiatry
// Psychology
// Public & Global Health
// Public Administration
// Pure Mathematics
// Quality Assurance
// Quantum Computing
// Quantum Physics
// RF / Telecommunication Engineering
// Radiation Biology
// Regenerative Medicine
// Regulatory Affairs
// Religious Studies
// Reproductive Biology
// Research & Grant Management
// Respiratory Health
// Rheumatology
// Safety Engineering
// Sales
// Security & Defense
// Sedimentology
// Seismology & Tectonics
// Semiconductors & Nanoelectronics
// Social & Cultural Anthropology
// Social & Occupational Health
// Social Policy & Welfare State
// Social Psychology
// Social Science Research Methods
// Social Sciences
// Sociology
// Software Development
// Soil Science
// Solar Physics
// Solid State Physics
// Spectroscopy
// Speech & Audio Processing
// Speech Pathology
// Sport Psychology
// Sports Science
// Statistical Programming
// Statistics
// Stem Cells
// Structural Biology
// Surface Modification
// Surgery
// Sustainability & Policy
// Sustainability Economics
// Sustainable Tourism Development
// Synchrotron / X-ray Applications
// System Dynamics
// Systematics (Taxonomy)
// Systems Biology
// Theoretical & Computational Chemistry
// Theoretical & Mathematical Physics
// Thermodynamics
// Tissue Culture
// Transportation Engineering
// Tribology
// Urban Planning
// Urology & Nephrology
// Veterinary Medicine
// Virology
// Vision Research
// Visual Arts
// Visual Neuroscience
// Water Science & Engineering
// Water Treatment and Purification
// Xenobiology
// Zoology
