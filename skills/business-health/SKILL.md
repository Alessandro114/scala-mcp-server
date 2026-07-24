---
description: Run a comprehensive business health check using SCALA data — financial summary, health score, alerts, cash flow trends, and AI recommendations.
---

# Business Health Check

Run a comprehensive health check on the user's business using SCALA MCP tools.

## Steps
1. Call `finance_summary` for the financial overview
2. Call `finance_health_score` for the health score breakdown
3. Call `sara_alerts` to check for urgent business alerts
4. Call `finance_cash_flow` with months=3 for recent trends
5. Call `sara_proactive` for AI suggestions

## Output Format
Present as a structured report:
- Health Score: X/100
- Key Metrics: revenue, profit margin, cash position
- Alerts: list any urgent items
- Top 3 Actions: prioritized recommendations
- Cash Flow Trend: up/down/stable with numbers

Keep it concise — max 20 lines. Business owners want signal, not noise.
