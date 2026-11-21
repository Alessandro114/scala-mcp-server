# /prospect-research — Prospect Briefing

Ask the user for: company name or tax id, country, context ("meeting", "cold outreach", "proposal").

Use SCALA MCP tools:
1. `search_companies` to find the company
2. `lookup_company` for the full profile

Generate a one-page briefing: snapshot (identification data; financials only where available), talking points, 2 potential objections.

Data notes: search is by company name prefix or tax_id (+ country); there is no sector/NACE filter. Revenue, employees and net income exist only for FR, NO, LT, EE, LV, CO; elsewhere the record has financials_withheld='licence_not_confirmed' — say so, never estimate. Label revenue_type (reported = filed accounts, estimated = model). Keep data_licences attribution.
