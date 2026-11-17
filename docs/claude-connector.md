# S.C.A.L.A. connector for Claude

Connect Claude to your S.C.A.L.A. account so it can **read** your data and answer questions about it, for example "how is my pipeline doing?", "what was my cash flow over the last six months?" or "which workflows had errors?".

- **Server address:** `https://mcp.get-scala.com/mcp` (HTTPS, OAuth 2.0 sign-in)
- **Access:** read-only. The connector never creates, changes, deletes or sends anything, and it does not move money.
- **Support:** support@get-scala.com
- **Privacy policy:** https://get-scala.com/privacy

## What it can read

The connector exposes 14 read-only tools. Claude calls one of them, S.C.A.L.A. returns the data of your account, and Claude explains it.

| Tool | What it reads |
|---|---|
| `crm_list_contacts` | CRM contacts with optional search: name, email, phone, company, deal stage, score, tags. Parameters: search, stage, limit (default 20). |
| `crm_pipeline` | Pipeline view: contacts grouped by stage, with counts and deal values. |
| `crm_contact_timeline` | Activity timeline of one contact: calls, emails, meetings, notes, deals. |
| `finance_summary` | Financial overview: revenue, expenses, profit, outstanding invoices, cash position, month-over-month trends. |
| `finance_health_score` | Business health score 0-100 with breakdown: liquidity, profitability, receivables aging, burn rate. |
| `finance_cash_flow` | Inflows, outflows and net cash by period (daily, weekly, monthly). |
| `sara_conversations` | Recent SARA assistant conversations with message counts and last activity. |
| `sara_insights` | SARA's analysis of trends, anomalies and recommendations. |
| `sara_alerts` | Active alerts (for example low stock, overdue invoices, missed bookings). |
| `sara_proactive` | SARA's proactive suggestions on what to act on. |
| `vertical_kpis` | KPIs of one vertical module (for example DineOS or PropertyOS). |
| `vertical_access` | Which vertical modules are active on your account. |
| `workflow_list` | Automation workflows with status, trigger type, last run and success rate. |
| `workflow_stats` | Workflow statistics: total runs, success rate, average duration, errors. |

The data returned depends on your account and on the modules you have active. Results can include personal data of your own customers (for example contact names, emails and phone numbers) if you ask for it.

## How to connect it

1. In Claude, open **Settings → Connectors** and add a custom connector.
2. Enter `https://mcp.get-scala.com/mcp`.
3. Sign in with your S.C.A.L.A. account and click **Allow** on the consent page. You must be signed in to S.C.A.L.A. first; if you are not, you are asked to log in.
4. Ask Claude about your data. To disconnect, remove the connector in Claude.

## Plans and trial

- The connector is available on the **Growth, Scale and Enterprise** plans.
- A new S.C.A.L.A. account created with an email address starts with a **14-day Growth trial, no card required**. Create the account at https://app.get-scala.com first, then connect.
- On a lower plan, an expired trial, or a canceled, unpaid or expired subscription, the connection is refused.
- A brand-new account is empty, so Claude finds no data until you add contacts or activate modules.

## Limits

- Read-only.
- Up to 120 requests per minute per user.
- Access tokens last one hour and renew automatically for up to 30 days; after that you sign in again.
- Answers reflect your account data at the time of the question.

## What it does not do

- It does not create, change or delete anything (no contacts, invoices, bookings or workflows).
- It does not send emails, messages, WhatsApp or SMS.
- It does not move money or make payments.
- It does not generate images, video or audio.
- It does not run workflows or make SARA reply to your customers.
- This version does not include invoices, bookings or the Score company database.

## Data and privacy

The data a tool returns is shown to Claude so it can answer your question. You decide to connect the connector and you can disconnect it at any time. See the [S.C.A.L.A. privacy policy](https://get-scala.com/privacy).

## Support

Write to support@get-scala.com.
