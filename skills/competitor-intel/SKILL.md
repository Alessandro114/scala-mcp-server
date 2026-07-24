---
description: Research competitors using SCALA's 250M+ company database — search by industry, compare financials, and generate competitive positioning analysis.
---

# Competitive Intelligence Report

Research competitors using SCALA Score data.

## Input
The user provides: company name or industry, country (default IT), number of competitors (default 5).
Use $ARGUMENTS if provided.

## Steps
1. Call `search_companies` with the industry NACE code and country
2. Call `lookup_company` for each top result
3. Optionally call `company_report` for the most interesting competitor

## Output Format
Comparison table:
| Company | Revenue | Employees | Health | Key Strength |

Then:
- Market position analysis
- Gaps and opportunities
- Recommended actions

Use real data only. Never fabricate company information.
