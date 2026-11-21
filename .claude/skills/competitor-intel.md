# /competitor-intel — Competitive Intelligence Report

Research named competitors using the SCALA Score company database.

## Instructions
Ask the user for the competitor names or tax ids and the country.

Then use SCALA MCP tools:
1. `search_companies` per competitor (name or tax_id, + country)
2. `lookup_company` for each result

Present as a comparison table (Company | Country | Status | Sector | Revenue/employees only where available | revenue_type).
Then add: gaps and opportunities, recommended actions.

Data notes: search is by company name prefix or tax_id (+ country); there is no sector/NACE filter. Revenue, employees and net income exist only for FR, NO, LT, EE, LV, CO; elsewhere the record has financials_withheld='licence_not_confirmed' — say so, never estimate. Label revenue_type (reported = filed accounts, estimated = model). Keep data_licences attribution.

Use real data only. Never fabricate company information.
