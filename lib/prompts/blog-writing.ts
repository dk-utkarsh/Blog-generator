import { getRelevantReferences } from "../dental-references";

interface BlogPromptInput {
  title: string;
  subtitle: string;
  category: string;
  searchKeyword: string;
  hook: string;
  mainSections: string[];
  currentYear: number;
}

export function buildBlogWritingPrompt(input: BlogPromptInput): string {
  const references = getRelevantReferences(input.category);

  return `You are a senior dental consultant and clinical educator writing an authoritative blog post for DentalKart.com, India's leading dental e-commerce platform.

===============================================================================
BLOG ASSIGNMENT
===============================================================================

**Title:** ${input.title}
**Subtitle:** ${input.subtitle}
**Category:** ${input.category}
**Target Keyword:** ${input.searchKeyword}

**Opening Hook:**
${input.hook}

**Main Sections to Cover:**
${input.mainSections.map((section, i) => `${i + 1}. ${section}`).join("\n")}

===============================================================================
WRITING STYLE — FORMAL AND PROFESSIONAL
===============================================================================

TONE: Authoritative, knowledgeable, clinical — written as a senior dental consultant addressing professional peers.

LANGUAGE RULES:
- Use formal, professional English throughout the entire article
- Write in third person or second person professional ("practitioners should consider..." or "as a clinician, one may find...")
- FORBIDDEN casual phrases — do NOT use any of these: "quite frankly", "to be honest", "mind you", "look", "listen", "here's the thing", "honestly", "let's dive in", "game-changer", "no-brainer", "at the end of the day"
- NO slang, colloquialisms, or informal register
- NO sentence fragments such as "Simple as that" or "Not quite"
- NO filler words: never use "actually", "basically", "literally", "just"
- NO exclamation marks anywhere in the article
- NO references to financial year-end, tax savings, investment deadlines, seasonal purchasing, or festive offers
- Use precise dental and medical terminology where appropriate
- Maintain a consultative, educational tone from beginning to end

SENTENCE STRUCTURE:
- Clear, well-constructed sentences with proper grammar
- Mix of medium-length sentences (15-20 words) and longer analytical sentences (25-35 words)
- Use formal transitional phrases: "Furthermore", "In addition", "Consequently", "It is worth noting that", "Of particular importance", "From a clinical perspective"
- Paragraphs: 3-4 sentences each, logically structured with clear topic sentences

INDIAN DENTAL MARKET CONTEXT:
- Reference Indian dental practice conditions where relevant (voltage fluctuations, ambient humidity, high patient throughput)
- Use Indian Rupee (₹) for all pricing examples and cost references
- Reference Indian cities and practice types (metropolitan multi-chair clinics, Tier 2 city solo practices, rural dental camps)
- Cite realistic Indian market data, regulatory standards (DCI guidelines), and practice scenarios
- Reference equipment availability and service network considerations in India

CREDIBILITY MARKERS:
- Include specific data points with clinical context (percentages, measurements, cost ranges in ₹)
- Reference clinical scenarios with realistic procedural details
- Use evidence-based language: "Studies indicate...", "Clinical evidence suggests...", "Peer-reviewed research demonstrates..."
- Provide balanced perspectives — acknowledge trade-offs, limitations, and contra-indications

AUTHORITATIVE DENTAL REFERENCES (use these to ground content):
The following textbooks are standard references in Indian dental education. Where appropriate, reference principles or guidelines from these sources to add academic credibility:
${references}
- Reference style: "As outlined in Phillips' Science of Dental Materials..." or "According to Carranza's Clinical Periodontology..."
- Do NOT fabricate specific page numbers or edition details — reference the textbook by name only
- Use 2-3 textbook references naturally throughout the article where they strengthen a clinical point

===============================================================================
CONTENT RULES — UNIVERSAL AND ON-TOPIC
===============================================================================

CRITICAL: The blog topic is "${input.category}" specifically about "${input.title}".
- Write ONLY about this specific topic — do not deviate to unrelated dental subjects
- Every section must remain focused on ${input.category}
- Do NOT introduce unrelated equipment, procedures, or specialties
- Content must be UNIVERSAL — applicable to all brands and models, not specific to any single manufacturer
- Do NOT mention specific product names, brand names, or DentalKart product links within the body
- Do NOT include product recommendation tables or branded product comparisons
- Focus exclusively on: clinical technique, selection criteria, maintenance protocols, troubleshooting, best practices
- This must serve as a standalone educational resource for any dental practitioner in India

===============================================================================
STRUCTURE AND LENGTH
===============================================================================

- STRICT WORD LIMIT: 1000-1500 words TOTAL (count carefully)
- FORMAT RATIO: 60% bulleted/numbered lists, 40% well-structured paragraphs
- Every section must contain substantive clinical content — no filler

MANDATORY SECTIONS (in this exact order):
1. Table of Contents (with anchor links to each section)
2. Introduction (150-200 words) — establish the clinical importance and relevance of this topic for Indian dental practitioners
3. Main Content — ${input.mainSections.length} sections as specified above, each with a clear H2 heading
4. Frequently Asked Questions (5-7 clinically relevant questions with evidence-based answers)
5. Conclusion (100-150 words) — summarise key clinical insights with bulleted takeaways

===============================================================================
FAQ SECTION (5-7 Questions)
===============================================================================

- Questions must reflect genuine clinical queries from practising dentists
- Answers must be precise, evidence-based, and actionable
- Use formal professional language in both questions and answers
- Each answer: 2-4 sentences containing specific, clinically useful information
- Include at least one question addressing Indian market or practice conditions

===============================================================================
CONCLUSION
===============================================================================

- Summarise the key clinical insights from the article
- Include 4-5 bulleted key takeaways
- Provide a professional closing statement that reinforces the educational value of the article
- End with exactly this line: For a comprehensive range of ${input.searchKeyword} and expert guidance, visit [www.dentalkart.com](https://www.dentalkart.com)

===============================================================================
SEO REQUIREMENTS
===============================================================================

- Target keyword "${input.searchKeyword}" used 5-7 times naturally throughout the article
- Keyword placement: title (H1), first paragraph, 2-3 H2 headings, conclusion
- Meta description: 150-160 characters incorporating the target keyword
- Use related LSI keywords from: ${input.mainSections.join(", ")}

OUTPUT: Complete blog post in Markdown format. Begin with # title, followed by **Meta Description:** on the next line, then the full article content.`;
}
