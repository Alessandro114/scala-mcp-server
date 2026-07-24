# /prospect-research — Deep Prospect Research

Research a potential client/partner before a meeting or outreach.

## What this skill does
1. Looks up the company in SCALA's 250M+ database
2. Analyzes financial health and trajectory
3. Identifies industry competitors for context
4. Generates talking points and objection handlers

## Instructions
Ask the user for:
- Company name or VAT number
- Country (if not obvious from the name)
- Context: "meeting", "cold outreach", or "proposal"

Use SCALA MCP tools:
1. `search_companies` to find the company
2. `lookup_company` for the full profile
3. `company_report` type=pro for financial analysis
4. `search_companies` again with same NACE code to find their competitors

Generate a one-page briefing:
- Company snapshot (revenue, employees, health, founded)
- Financial trajectory (growing/stable/declining)
- Industry position (vs top 5 competitors)
- 3 talking points tailored to their situation
- 2 potential objections and how to handle them
- Recommended next step

For "cold outreach" context, also draft a short personalized message.