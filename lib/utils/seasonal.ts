interface SeasonalContext {
  season: string;
  context: string;
  marketInsight: string;
}

export function getSeasonalContext(date: Date = new Date()): SeasonalContext {
  const month = date.getMonth() + 1;

  if (month >= 6 && month <= 9) {
    return {
      season: "Monsoon Season",
      context: "India's monsoon season — humidity affects dental equipment. Clinics face sterilization challenges, moisture-related issues with electronic equipment.",
      marketInsight: "Focus on equipment maintenance, humidity-proof solutions, sterilization best practices during monsoon.",
    };
  }

  if (month === 10 || month === 11) {
    return {
      season: "Diwali / Festival Season",
      context: "Festival and Diwali season — major purchasing period for dental clinics. Many clinics upgrade equipment before year-end.",
      marketInsight: "Focus on equipment upgrades, new clinic setups, festive offers, and year-end investment decisions.",
    };
  }

  if (month === 12 || month === 1) {
    return {
      season: "Year-End / New Year",
      context: "Year-end tax-saving season and New Year clinic setup period. Dentists invest in equipment for tax benefits under Section 32.",
      marketInsight: "Focus on ROI analysis, tax-saving equipment purchases, clinic modernization for the new year.",
    };
  }

  if (month === 2 || month === 3) {
    return {
      season: "Financial Year-End",
      context: "Indian financial year ending (March 31). Last chance for business equipment tax deductions. Budget season for next FY.",
      marketInsight: "Focus on depreciation benefits, budget planning for FY, bulk purchasing strategies.",
    };
  }

  if (month === 4 || month === 5) {
    return {
      season: "Summer / New FY",
      context: "New financial year begins. Summer heat affects dental materials and patient footfall increases. Dental health awareness campaigns.",
      marketInsight: "Focus on new clinic openings, fresh equipment budgets, summer dental care tips, practice growth.",
    };
  }

  return {
    season: "General",
    context: "Regular business period for dental practices across India.",
    marketInsight: "Focus on general practice efficiency, equipment guides, clinical best practices.",
  };
}
