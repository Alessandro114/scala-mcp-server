# /daily-briefing — Morning Business Briefing

Get your daily business briefing in 30 seconds.

## What this skill does
1. Checks SARA alerts and proactive suggestions
2. Reviews today's bookings
3. Shows pipeline changes
4. Highlights overdue invoices
5. Shows KPIs for your active vertical

## Instructions
Use these SCALA MCP tools:
1. `sara_alerts` — urgent items
2. `sara_proactive` — AI suggestions for today
3. `sara_insights` — business trends
4. `invoice_list` with status=overdue — money to collect
5. `crm_pipeline` — pipeline snapshot
6. `vertical_access` — check which verticals are active, then `vertical_kpis` for the primary one

Format as a morning briefing:
```
Good morning! Here's your briefing for [date]:

URGENT (X items)
- [alert 1]
- [alert 2]

MONEY
- X overdue invoices totaling EUR Y
- Pipeline: X leads, Y proposals, Z won this month

KPIs ([vertical name])
- [metric 1]: value
- [metric 2]: value

SARA SUGGESTS
- [suggestion 1]
- [suggestion 2]
```

Keep it scannable. Busy people read this on their phone.