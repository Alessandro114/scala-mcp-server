# /invoice-chase — Chase Overdue Invoices

Review and take action on overdue invoices.

## What this skill does
1. Lists all overdue invoices
2. Calculates total outstanding amount
3. Groups by aging (30/60/90+ days)
4. Helps draft follow-up emails

## Instructions
Use SCALA MCP tools:
1. `invoice_list` with status=overdue
2. `finance_summary` for context on total receivables

Present overdue invoices grouped by urgency:
```
OVERDUE INVOICES — EUR [total]

CRITICAL (90+ days) — EUR X
- #INV-001 | Customer Name | EUR 1,500 | Due: 2026-04-15

WARNING (60-90 days) — EUR Y
- #INV-002 | Customer Name | EUR 800 | Due: 2026-05-20

ATTENTION (30-60 days) — EUR Z
- #INV-003 | Customer Name | EUR 2,200 | Due: 2026-06-10
```

Then ask: "Want me to send reminders for any of these?"
If yes, use `invoice_send` for each selected invoice.

Never be aggressive in follow-ups. Professional and firm.