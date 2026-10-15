---
description: Research competitors using SCALA's company database (financials only for FR, NO, LT, EE, LV, CO) — search by name or tax id, compare available financials, and generate competitive positioning analysis.
---

# Competitive Intelligence Report

Research competitors using SCALA Score data.

## Input
The user provides: company name or industry, country (default IT), number of competitors (default 5).
Use $ARGUMENTS if provided.

## Steps
1. Call `search_companies` with the company name (or tax_id) and country
2. Call `lookup_company` for each top result
3. Financials exist only for FR, NO, LT, EE, LV, CO (`financials_withheld` elsewhere); label `revenue_type` reported/estimated

## Output Format
Comparison table:
| Company | Revenue | Employees | Health | Key Strength |

Then:
- Market position analysis
- Gaps and opportunities
- Recommended actions

Use real data only. Never fabricate company information.
