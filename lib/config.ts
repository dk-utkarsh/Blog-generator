export const GEMINI_TEXT_MODEL = "gemini-2.5-pro";

// Categories matching live DentalKart blog — weighted by actual usage
// "Advancements in Dentistry" is used ~38% of the time as a catch-all
export const DENTAL_CATEGORIES = [
  "Advancements in Dentistry",
  "General Dentistry",
  "Endodontics",
  "Dentistry Tips",
  "Prosthodontics",
  "Orthodontics",
  "3D Printing",
  "Periodontal",
  "Aesthetic Dentistry",
];


export const CONTENT_TYPES = [
  "Clinical Decision Guide",
  "Technique Comparison",
  "Step-by-Step Protocol",
  "Troubleshooting",
  "Material Selection Guide",
  "Case-Based Analysis",
  "Technology Overview",
  "Evidence-Based Review",
  "Comprehensive Guide",
  "Classification & Types",
];

// DentalKart product category URLs — use these for accurate linking
// Category URLs are more reliable than search URLs
export const DENTALKART_PRODUCT_LINKS: Record<string, { url: string; label: string }[]> = {
  // Equipment
  scaler: [
    { url: "https://www.dentalkart.com/c/ultrasonic-scalers.html", label: "ultrasonic scalers" },
    { url: "https://www.dentalkart.com/search?query=scaler+tips", label: "scaler tips" },
  ],
  autoclave: [
    { url: "https://www.dentalkart.com/c/autoclaves-1.html", label: "autoclaves" },
    { url: "https://www.dentalkart.com/c/sterilization.html", label: "sterilization products" },
  ],
  handpiece: [
    { url: "https://www.dentalkart.com/c/hand-pieces.html", label: "dental handpieces" },
    { url: "https://www.dentalkart.com/c/airotor.html", label: "airotor handpieces" },
  ],
  composite: [
    { url: "https://www.dentalkart.com/c/composite.html", label: "dental composites" },
    { url: "https://www.dentalkart.com/c/finishing-polishing-materials.html", label: "finishing and polishing kits" },
  ],
  endodontic: [
    { url: "https://www.dentalkart.com/c/endodontics.html", label: "endodontic products" },
    { url: "https://www.dentalkart.com/c/bio-mechanical-preparation.html", label: "rotary files" },
    { url: "https://www.dentalkart.com/c/endo-motor.html", label: "endomotors" },
    { url: "https://www.dentalkart.com/c/root-canal-sealers.html", label: "root canal sealers" },
    { url: "https://www.dentalkart.com/c/gutta-percha-points.html", label: "gutta percha points" },
    { url: "https://www.dentalkart.com/c/obturation-system.html", label: "obturation systems" },
  ],
  orthodontic: [
    { url: "https://www.dentalkart.com/c/orthodontics.html", label: "orthodontic products" },
    { url: "https://www.dentalkart.com/search?query=brackets", label: "orthodontic brackets" },
    { url: "https://www.dentalkart.com/search?query=archwire", label: "orthodontic wires" },
  ],
  implant: [
    { url: "https://www.dentalkart.com/c/implantology.html", label: "implant products" },
    { url: "https://www.dentalkart.com/c/bones-grafts-and-membrane.html", label: "bone grafts and membranes" },
  ],
  impression: [
    { url: "https://www.dentalkart.com/c/impression-material.html", label: "impression materials" },
    { url: "https://www.dentalkart.com/search?query=alginate", label: "alginate" },
  ],
  surgery: [
    { url: "https://www.dentalkart.com/c/oral-surgery.html", label: "oral surgery products" },
    { url: "https://www.dentalkart.com/c/sutures-needles.html", label: "sutures and needles" },
    { url: "https://www.dentalkart.com/c/anaesthetics.html", label: "dental anaesthetics" },
    { url: "https://www.dentalkart.com/c/extraction-instrument.html", label: "extraction instruments" },
  ],
  bonding: [
    { url: "https://www.dentalkart.com/c/bonds-etchants.html", label: "bonding agents and etchants" },
  ],
  chair: [
    { url: "https://www.dentalkart.com/c/dental-chair.html", label: "dental chairs" },
  ],
  xray: [
    { url: "https://www.dentalkart.com/c/x-ray-machines.html", label: "dental X-ray machines" },
    { url: "https://www.dentalkart.com/c/dental-x-ray.html", label: "X-ray accessories" },
  ],
  curing: [
    { url: "https://www.dentalkart.com/c/led-light-cure.html", label: "LED light cure units" },
  ],
  disposable: [
    { url: "https://www.dentalkart.com/c/disposables.html", label: "dental disposables" },
  ],
  periodontic: [
    { url: "https://www.dentalkart.com/c/periodontics.html", label: "periodontic products" },
  ],
  prosthodontic: [
    { url: "https://www.dentalkart.com/c/prosthodontics.html", label: "prosthodontic products" },
  ],
  cement: [
    { url: "https://www.dentalkart.com/search?query=dental+cement", label: "dental cements" },
  ],
  bur: [
    { url: "https://www.dentalkart.com/c/burs.html", label: "dental burs" },
  ],
  instrument: [
    { url: "https://www.dentalkart.com/c/instruments.html", label: "dental instruments" },
  ],
  matrix: [
    { url: "https://www.dentalkart.com/c/matrix-bands.html", label: "matrix bands" },
  ],
  whitening: [
    { url: "https://www.dentalkart.com/search?query=bleaching", label: "teeth whitening products" },
  ],
  denture: [
    { url: "https://www.dentalkart.com/search?query=denture+base+material", label: "denture base materials" },
    { url: "https://www.dentalkart.com/search?query=denture+teeth", label: "denture teeth sets" },
    { url: "https://www.dentalkart.com/search?query=denture+relining", label: "denture relining materials" },
    { url: "https://www.dentalkart.com/c/prosthodontics.html", label: "prosthodontic products" },
  ],
  laser: [
    { url: "https://www.dentalkart.com/search?query=dental+laser", label: "dental lasers" },
  ],
  aligner: [
    { url: "https://www.dentalkart.com/c/orthodontics.html", label: "orthodontic products" },
  ],
  crown: [
    { url: "https://www.dentalkart.com/search?query=crown+preparation", label: "crown preparation kits" },
    { url: "https://www.dentalkart.com/search?query=temporary+crown", label: "temporary crown materials" },
  ],
  filling: [
    { url: "https://www.dentalkart.com/c/composite.html", label: "composite filling materials" },
    { url: "https://www.dentalkart.com/search?query=temporary+filling", label: "temporary filling materials" },
  ],
  polish: [
    { url: "https://www.dentalkart.com/c/finishing-polishing-materials.html", label: "finishing and polishing kits" },
  ],
  suction: [
    { url: "https://www.dentalkart.com/search?query=suction+unit", label: "dental suction units" },
  ],
  loupes: [
    { url: "https://www.dentalkart.com/search?query=dental+loupes", label: "dental loupes" },
  ],
  camera: [
    { url: "https://www.dentalkart.com/search?query=intraoral+camera", label: "intraoral cameras" },
  ],
  gloves: [
    { url: "https://www.dentalkart.com/c/disposables.html", label: "dental disposables" },
  ],
  retract: [
    { url: "https://www.dentalkart.com/search?query=gingival+retraction", label: "gingival retraction materials" },
  ],
  shade: [
    { url: "https://www.dentalkart.com/search?query=shade+guide", label: "shade guides" },
  ],
  articulat: [
    { url: "https://www.dentalkart.com/search?query=articulating+paper", label: "articulating paper" },
  ],
  rubber: [
    { url: "https://www.dentalkart.com/search?query=rubber+dam", label: "rubber dam kits" },
  ],
  fluoride: [
    { url: "https://www.dentalkart.com/search?query=fluoride+varnish", label: "fluoride varnish" },
  ],
  sealant: [
    { url: "https://www.dentalkart.com/search?query=pit+fissure+sealant", label: "pit and fissure sealants" },
  ],
};

// Get relevant product links for a blog topic
export function getProductLinksForTopic(title: string, category: string, keyword: string): string {
  const searchText = `${title} ${category} ${keyword}`.toLowerCase();
  const matchedLinks: { url: string; label: string }[] = [];

  for (const [key, links] of Object.entries(DENTALKART_PRODUCT_LINKS)) {
    if (searchText.includes(key)) {
      matchedLinks.push(...links);
    }
  }

  // Always include the main search link for the keyword
  matchedLinks.push({
    url: `https://www.dentalkart.com/search?query=${encodeURIComponent(keyword)}`,
    label: keyword,
  });

  // Deduplicate
  const unique = [...new Map(matchedLinks.map((l) => [l.url, l])).values()];

  return unique
    .map((l) => `- [${l.label}](${l.url})`)
    .join("\n");
}

export const FORBIDDEN_PATTERNS = [
  "Compressor + Comparison",
  "Compressor + Noise",
  "3D Scanner + ROI",
  "3D Printer + ROI",
  "CAD/CAM + ROI",
  "RVG + Wireless vs Wired",
  "Autoclave + Class B vs N",
  "Chair + Hydraulic vs Electric",
];
