---
description: Research named competitors using the SCALA Score company database (financials only for FR, NO, LT, EE, LV, CO) — compare identification data and available financials.
---

# Competitive Intelligence Report

## Input
The user provides: competitor names or tax ids, country, number of competitors (default 5).
Use $ARGUMENTS if provided.

## Steps
1. Call `search_companies` per competitor (name or tax_id, + country)
2. Call `lookup_company` for each result

## Output Format
| Company | Country | Status | Sector | Revenue (only if available) | revenue_type |

Then: gaps and opportunities, recommended actions.

Data notes: search is by company name prefix or tax_id (+ country); there is no sector/NACE filter. Revenue, employees and net income exist only for FR, NO, LT, EE, LV, CO; elsewhere the record has financials_withheld='licence_not_confirmed' — say so, never estimate. Label revenue_type (reported = filed accounts, estimated = model). Keep data_licences attribution.

Use real data only. Never fabricate company information.
