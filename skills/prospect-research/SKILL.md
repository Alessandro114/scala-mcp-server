---
description: Deep-dive research on a potential client or partner before a meeting — company profile, financial health, competitors, talking points, and objection handlers.
---

# Prospect Research

Research a potential client/partner using SCALA Score data.

## Input
The user provides: company name or VAT number, country, context (meeting/cold outreach/proposal).
Use $ARGUMENTS if provided.

## Steps
1. Call `search_companies` to find the company
2. Call `lookup_company` for full profile
3. Call `company_report` type=pro for financial analysis
4. Call `search_companies` with same NACE code for competitor context

## Output Format
One-page briefing:
- Company snapshot (revenue, employees, health, founded)
- Financial trajectory (growing/stable/declining)
- Industry position vs top 5 competitors
- 3 talking points tailored to their situation
- 2 potential objections and handlers
- Recommended next step

For cold outreach context, also draft a short personalized message.
