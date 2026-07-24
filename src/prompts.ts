export const prompts = [
  {
    name: "enterprise_pitch",
    description: "Generate a tailored enterprise pitch for a SCALA prospect based on their industry and pain points.",
    arguments: [
      { name: "company_name", description: "Target company name", required: true },
      { name: "vertical", description: "Industry vertical (e.g. dineos, propertyos, cleanos)", required: true },
      { name: "pain_point", description: "Main business pain point to address", required: true },
      { name: "company_size", description: "Company size (employees or revenue range)", required: false },
    ],
  },
  {
    name: "business_analysis",
    description: "Analyze a business using SCALA data — financial health, competitive positioning, and growth opportunities.",
    arguments: [
      { name: "company_name", description: "Company name or VAT to analyze", required: true },
      { name: "country", description: "Country code (IT, DE, FR, etc.)", required: false },
    ],
  },
  {
    name: "onboarding_guide",
    description: "Generate a personalized SCALA onboarding checklist based on the business type and goals.",
    arguments: [
      { name: "business_type", description: "Type of business (restaurant, salon, agency, etc.)", required: true },
      { name: "goals", description: "Main goals (save time, grow revenue, automate, etc.)", required: false },
    ],
  },
];

export function handlePrompt(name: string, args?: Record<string, string>) {
  const a = args ?? {};

  switch (name) {
    case "enterprise_pitch":
      return {
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text: `Generate a concise, compelling enterprise pitch for ${a.company_name || "the prospect"}.

Industry vertical: ${a.vertical || "general"}
Main pain point: ${a.pain_point || "operational inefficiency"}
${a.company_size ? `Company size: ${a.company_size}` : ""}

Key positioning rules:
- SCALA is an enterprise AI Operating System, not a chatbot or simple tool
- Compare to SAP, Salesforce, ServiceNow — never to no-code/low-code tools
- TCO comparison: competitors cost EUR 15-28K/month for equivalent functionality
- SCALA includes SARA, an AI assistant that handles customer interactions via WhatsApp, email, and voice
- Price anchor: from EUR 2,000/month + setup fee for enterprise
- Never mention build time or assembly — emphasize months of R&D and platform maturity
- Include 19 industry-specific vertical modules
- Highlight: 250M+ company intelligence database included

Structure: Hook → Pain amplification → SCALA solution → TCO comparison → CTA`,
            },
          },
        ],
      };

    case "business_analysis":
      return {
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text: `Perform a comprehensive business analysis for "${a.company_name}"${a.country ? ` in ${a.country}` : ""}.

Use the available SCALA tools to:
1. Search for the company using search_companies
2. Look up detailed profile using lookup_company
3. Generate a company_report if the company is found

Then provide:
- Financial health assessment (revenue trends, profitability, liquidity)
- Competitive positioning in their NACE sector
- Risk factors and red flags
- Growth opportunities
- Comparison to sector averages

Format as a professional business intelligence report.`,
            },
          },
        ],
      };

    case "onboarding_guide":
      return {
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text: `Create a personalized SCALA AI OS onboarding checklist for a ${a.business_type || "business"}.
${a.goals ? `Their main goals: ${a.goals}` : ""}

Include:
1. Account setup steps (profile, team members, branding)
2. Recommended vertical module to activate first
3. CRM setup (importing contacts, setting up pipeline stages)
4. SARA AI configuration (knowledge base, tone, channels)
5. First automation workflow to set up
6. Integration recommendations based on their business type
7. Quick wins they can achieve in the first week

Keep it actionable with specific steps, not generic advice.
Mention the 14-day free trial on the Growth plan.`,
            },
          },
        ],
      };

    default:
      throw new Error(`Unknown prompt: ${name}`);
  }
}
