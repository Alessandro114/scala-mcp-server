# /competitor-intel — Competitive Intelligence Report

Research competitors using SCALA's 250M+ company database.

## What this skill does
1. Searches for companies in the same NACE sector and country
2. Looks up detailed profiles of top competitors
3. Compares revenue, employees, and health scores
4. Generates a competitive positioning analysis

## Instructions
Ask the user for:
- Their company name or industry
- Country (default: IT)
- Number of competitors to analyze (default: 5)

Then use SCALA MCP tools:
1. `search_companies` with the industry NACE code and country
2. `lookup_company` for each top result
3. Optionally `company_report` for the most interesting competitor

Present as a comparison table:
| Company | Revenue | Employees | Health | Key Strength |
Then add:
- Market position analysis
- Gaps and opportunities
- Recommended actions

Use real data only. Never fabricate company information.