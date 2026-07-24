# /business-health — Business Health Check

Run a comprehensive health check on your business using SCALA data.

## What this skill does
1. Pulls your financial summary (revenue, expenses, profit)
2. Gets your business health score with breakdown
3. Checks SARA alerts for urgent issues
4. Reviews cash flow trends
5. Generates an actionable summary with priorities

## Instructions
Use these SCALA MCP tools in sequence:
1. `finance_summary` — get the financial overview
2. `finance_health_score` — get the health score breakdown
3. `sara_alerts` — check for urgent business alerts
4. `finance_cash_flow` with months=3 — recent cash flow trend
5. `sara_proactive` — get AI suggestions

Present results as a structured report:
- Health Score: X/100 (with emoji color)
- Key Metrics: revenue, profit margin, cash position
- Alerts: list any urgent items
- Top 3 Actions: prioritized recommendations
- Cash Flow Trend: up/down/stable with numbers

Keep it concise — max 20 lines. Business owners want signal, not noise.