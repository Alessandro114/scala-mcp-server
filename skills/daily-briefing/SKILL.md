---
description: Get your morning business briefing in 30 seconds — alerts, overdue invoices, pipeline snapshot, KPIs, and AI suggestions.
---

# Daily Business Briefing

Generate a morning briefing using SCALA MCP tools.

## Steps
1. Call `sara_alerts` for urgent items
2. Call `sara_proactive` for AI suggestions
3. Call `sara_insights` for business trends
4. Call `invoice_list` with status=overdue for money to collect
5. Call `crm_pipeline` for pipeline snapshot
6. Call `vertical_access` to check active verticals, then `vertical_kpis` for the primary one

## Output Format
```
Good morning! Here's your briefing for [date]:

URGENT (X items)
- [alert details]

MONEY
- X overdue invoices totaling EUR Y
- Pipeline: X leads, Y proposals, Z won this month

KPIs ([vertical name])
- [metric]: value

SARA SUGGESTS
- [suggestion]
```

Keep it scannable. Busy people read this on their phone.
