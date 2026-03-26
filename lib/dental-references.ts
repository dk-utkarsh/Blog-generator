/**
 * Authoritative dental textbook references used for content credibility.
 * The blog writing prompt uses these to ground content in established dental literature.
 */
export const DENTAL_REFERENCES: Record<string, string[]> = {
  "General Anatomy": ["BD Chaurasia's Human Anatomy (Vol. 3: Head & Neck)"],
  "General Physiology": ["A.K. Jain's Textbook of Physiology for Dental Students", "Sembulingam"],
  "Biochemistry": ["U. Satyanarayana's Biochemistry", "DM Vasudevan"],
  "Dental Anatomy & Histology": ["Wheeler's Dental Anatomy, Physiology and Occlusion"],
  "Oral Histology": ["Orban's Oral Histology and Embryology", "Maji Jose"],
  "General Pathology": ["Harsh Mohan's Textbook of Pathology"],
  "Microbiology": ["C.P. Baveja's Textbook of Microbiology", "Ananthanarayan"],
  "Pharmacology": ["K.D. Tripathi's Essentials of Pharmacology for Dentistry"],
  "Dental Materials": ["Phillips' Science of Dental Materials", "V.R. Manappallil"],
  "Conservative Dentistry": ["V. Gopikrishna's Preclinical Manual", "Sturdevant's Art and Science of Operative Dentistry"],
  "Prosthodontics": ["Deepak Nallaswamy's Essentials of Prosthodontics", "Rangarajan"],
  "Oral Pathology": ["Shafer's Textbook of Oral Pathology"],
  "Oral Medicine & Radiology": ["Ghom's Textbook of Oral Medicine", "White & Pharoah's Oral Radiology"],
  "Oral & Maxillofacial Surgery": ["Neelima Malik's Textbook of Oral and Maxillofacial Surgery", "SM Balaji"],
  "Periodontics": ["Carranza's Clinical Periodontology"],
  "Orthodontics": ["S.I. Bhalajhi's Orthodontics: The Art and Science"],
  "Pedodontics": ["Shobha Tandon's Textbook of Paediatric Dentistry", "Nikhil Marwah"],
  "Endodontics": ["Grossman's Endodontic Practice"],
  "Public Health Dentistry": ["Soben Peter's Essentials of Public Health Dentistry"],
};

/**
 * Get relevant textbook references for a given dental category.
 * Returns a formatted string for inclusion in the blog writing prompt.
 */
export function getRelevantReferences(category: string): string {
  const relevant: string[] = [];

  const categoryLower = category.toLowerCase();

  for (const [subject, books] of Object.entries(DENTAL_REFERENCES)) {
    const subjectLower = subject.toLowerCase();

    // Match by keyword overlap
    if (
      categoryLower.includes(subjectLower) ||
      subjectLower.includes(categoryLower) ||
      // Equipment-related topics map to dental materials
      (categoryLower.includes("autoclave") && subjectLower.includes("microbiology")) ||
      (categoryLower.includes("steriliz") && subjectLower.includes("microbiology")) ||
      (categoryLower.includes("handpiece") && subjectLower.includes("dental materials")) ||
      (categoryLower.includes("rvg") && subjectLower.includes("radiology")) ||
      (categoryLower.includes("x-ray") && subjectLower.includes("radiology")) ||
      (categoryLower.includes("scaler") && subjectLower.includes("periodontics")) ||
      (categoryLower.includes("apex") && subjectLower.includes("endodontics")) ||
      (categoryLower.includes("endo") && subjectLower.includes("endodontics")) ||
      (categoryLower.includes("curing") && subjectLower.includes("dental materials")) ||
      (categoryLower.includes("composite") && subjectLower.includes("conservative")) ||
      (categoryLower.includes("impression") && subjectLower.includes("prosthodontics")) ||
      (categoryLower.includes("chair") && subjectLower.includes("dental materials")) ||
      (categoryLower.includes("compressor") && subjectLower.includes("dental materials")) ||
      (categoryLower.includes("camera") && subjectLower.includes("radiology")) ||
      (categoryLower.includes("laser") && subjectLower.includes("oral surgery"))
    ) {
      relevant.push(...books);
    }
  }

  // Always include Dental Materials as it's relevant to most equipment topics
  if (relevant.length === 0) {
    relevant.push(...DENTAL_REFERENCES["Dental Materials"]);
  }

  const unique = [...new Set(relevant)];
  return unique.map((b) => `- ${b}`).join("\n");
}
