---
description: Review and chase overdue invoices — grouped by aging (30/60/90+ days), with total outstanding and option to send reminders.
---

# Chase Overdue Invoices

Review overdue invoices and help collect payment.

## Steps
1. Call `invoice_list` with status=overdue
2. Call `finance_summary` for context on total receivables

## Output Format
Group invoices by urgency:

OVERDUE INVOICES — EUR [total]

CRITICAL (90+ days) — EUR X
- #INV-001 | Customer | EUR 1,500 | Due: 2026-04-15

WARNING (60-90 days) — EUR Y
- #INV-002 | Customer | EUR 800 | Due: 2026-05-20

ATTENTION (30-60 days) — EUR Z
- #INV-003 | Customer | EUR 2,200 | Due: 2026-06-10

Then ask: "Want me to send reminders for any of these?"
If yes, use `invoice_send` for each selected invoice.
