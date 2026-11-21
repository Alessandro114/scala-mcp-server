---
description: Deep-dive research on a potential client or partner before a meeting — company profile, financials where licensed, talking points, and objection handlers.
---

# Prospect Research

Research a potential client/partner using SCALA Score data.

## Input
The user provides: company name or VAT number, country, context (meeting/cold outreach/proposal).
Use $ARGUMENTS if provided.

## Steps
1. Call `search_companies` to find the company
2. Call `lookup_company` for the full profile
3. Data notes: search is by company name prefix or tax_id (+ country); there is no sector/NACE filter. Revenue, employees and net income exist only for FR, NO, LT, EE, LV, CO; elsewhere the record has financials_withheld='licence_not_confirmed' — say so, never estimate. Label revenue_type (reported = filed accounts, estimated = model). Keep data_licences attribution.

## Output Format
One-page briefing:
- Company snapshot (identification data; revenue/employees only if available)
- Financial trajectory (growing/stable/declining)
- 3 talking points tailored to their situation
- 2 potential objections and handlers
- Recommended next step

For cold outreach context, also draft a short personalized message.
