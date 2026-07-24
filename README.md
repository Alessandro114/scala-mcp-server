<p align="center">
  <img src="https://get-scala.com/scala-logo.svg" width="80" alt="SCALA">
</p>

<h1 align="center">S.C.A.L.A. MCP Server</h1>

<p align="center">
  <strong>Run your entire business from Claude. 33 tools. 19 industries. 250M+ companies.</strong>
</p>

<p align="center">
  <a href="https://modelcontextprotocol.io"><img src="https://img.shields.io/badge/MCP-compatible-purple" alt="MCP"></a>
  <a href="https://www.npmjs.com/package/scala-mcp-server"><img src="https://img.shields.io/npm/v/scala-mcp-server" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/scala-mcp-server"><img src="https://img.shields.io/npm/dm/scala-mcp-server" alt="npm downloads"></a>
  <a href="https://github.com/Alessandro114/scala-mcp-server/blob/main/LICENSE"><img src="https://img.shields.io/github/license/Alessandro114/scala-mcp-server" alt="License"></a>
  <a href="https://smithery.ai/server/Alessandro114/scala-mcp-server"><img src="https://smithery.ai/badge/Alessandro114/scala-mcp-server" alt="Smithery"></a>
  <a href="https://glama.ai/mcp/servers/Alessandro114/scala-mcp-server"><img src="https://glama.ai/mcp/servers/Alessandro114/scala-mcp-server/badges/score.svg" alt="Glama Score"></a>
</p>

---

An [MCP server](https://modelcontextprotocol.io) that turns Claude into a full business operating system. Manage your CRM, send invoices, book appointments, chat with your AI assistant, run workflows, and search 250M+ companies — all without leaving your AI conversation.

## Quick Start

```bash
npx -y scala-mcp-server
```

One command. Set your API key and go:

```bash
SCALA_API_KEY=your-key npx -y scala-mcp-server
```

> Get a free API key at [app.get-scala.com](https://app.get-scala.com) — 14-day trial, no credit card.

---

## What You Can Do

### CRM & Sales Pipeline
> "Show my sales pipeline"
> "Create a contact for Maria Rossi at Ferrero"
> "Move the Johnson deal to 'proposal' stage"
> "Show the timeline for contact abc-123"

### Bookings & Appointments
> "What slots are available tomorrow at 2pm?"
> "Book a consultation for Marco next Thursday at 10am"
> "Cancel booking #456"

### Invoicing
> "List all overdue invoices"
> "Create an invoice for the Q3 consulting work — EUR 4,500"
> "Send invoice #789 to the client"

### SARA AI Assistant
> "Ask SARA what happened with customer complaints this week"
> "Show me SARA's business insights"
> "What alerts does SARA have for me?"

### Financial Analytics
> "What's my business health score?"
> "Show cash flow for the last 6 months"
> "Give me a financial summary"

### 19 Industry Verticals
> "Show restaurant KPIs — covers, avg ticket, food cost"
> "List all vehicles in the dealership inventory"
> "What are this month's real estate commissions?"
> "Show studio project milestones"

### Company Intelligence (250M+ companies)
> "Find the top 10 SaaS companies in Germany"
> "Look up Ferrero's financial health"
> "Compare construction companies in Milan vs Munich"
> "Generate a due diligence report on company XYZ"

### Workflow Automation
> "List all active workflows"
> "Run the weekly report workflow"
> "Show workflow success rates"

---

## Setup

### Smithery (Recommended)

```bash
npx @smithery/cli mcp add Alessandro114/scala-mcp-server --config '{"scalaApiKey":"your-key"}'
```

### Claude Desktop

Add to your `claude_desktop_config.json`:

<details>
<summary><strong>macOS</strong>: <code>~/Library/Application Support/Claude/claude_desktop_config.json</code></summary>

```json
{
  "mcpServers": {
    "scala": {
      "command": "npx",
      "args": ["-y", "scala-mcp-server"],
      "env": {
        "SCALA_API_KEY": "your-api-key"
      }
    }
  }
}
```
</details>

<details>
<summary><strong>Windows</strong>: <code>%APPDATA%\Claude\claude_desktop_config.json</code></summary>

```json
{
  "mcpServers": {
    "scala": {
      "command": "npx",
      "args": ["-y", "scala-mcp-server"],
      "env": {
        "SCALA_API_KEY": "your-api-key"
      }
    }
  }
}
```
</details>

### Claude Code

```bash
claude mcp add scala -e SCALA_API_KEY=your-key -- npx -y scala-mcp-server
```

### Any MCP Client

```bash
SCALA_API_KEY=your-key npx -y scala-mcp-server
```

---

## Tools (33)

### Company Intelligence
| Tool | Description | Credits |
|------|-------------|---------|
| `search_companies` | Search 250M+ companies by name, VAT, keyword | 1 |
| `lookup_company` | Full company profile by ID or VAT | 1 |
| `company_report` | Health report (basic/pro/enterprise) | 5-20 |
| `database_stats` | Database statistics | 0 |
| `list_countries` | Countries with company counts | 0 |
| `check_credits` | API credits and plan info | 0 |

### CRM
| Tool | Description |
|------|-------------|
| `crm_list_contacts` | List/search contacts with pipeline stage filter |
| `crm_create_contact` | Create contact with name, email, company, tags |
| `crm_update_contact` | Update any contact field |
| `crm_pipeline` | Pipeline view grouped by stage |
| `crm_contact_timeline` | Full activity timeline for a contact |

### Bookings
| Tool | Description |
|------|-------------|
| `booking_get_slots` | Available time slots for a business |
| `booking_create` | Create booking with auto-confirmation email |
| `booking_cancel` | Cancel a booking |

### Invoicing
| Tool | Description |
|------|-------------|
| `invoice_list` | List invoices with status filter |
| `invoice_create` | Create invoice (multi-provider) |
| `invoice_send` | Email invoice to customer |
| `invoice_get_pdf` | Get invoice PDF |

### SARA AI
| Tool | Description |
|------|-------------|
| `sara_chat` | Chat with SARA about your business |
| `sara_conversations` | List conversation history |
| `sara_insights` | AI-generated business insights |
| `sara_alerts` | Active business alerts |
| `sara_proactive` | Proactive AI suggestions |

### Finance
| Tool | Description |
|------|-------------|
| `finance_summary` | Revenue, expenses, profit overview |
| `finance_health_score` | Business health score (0-100) |
| `finance_cash_flow` | Cash flow by period |

### Industry Verticals (19)
| Tool | Description |
|------|-------------|
| `vertical_kpis` | KPIs for any vertical (DineOS, PropertyOS, etc.) |
| `vertical_list_data` | List records from any vertical table |
| `vertical_create_record` | Create records in any vertical |
| `vertical_access` | Check active modules |

### Workflows
| Tool | Description |
|------|-------------|
| `workflow_list` | List automation workflows |
| `workflow_run` | Execute a workflow |
| `workflow_stats` | Workflow statistics |

---

## Resources

The server exposes static resources that Claude can read for context:

| Resource | URI | Description |
|----------|-----|-------------|
| Pricing | `scala://pricing` | Current plans, enterprise tiers, add-ons |
| Verticals | `scala://verticals` | All 19 industry modules with features |
| Capabilities | `scala://capabilities` | Full platform feature list |

---

## Prompts

Pre-built prompt templates for common workflows:

| Prompt | Description |
|--------|-------------|
| `enterprise_pitch` | Generate a tailored enterprise pitch |
| `business_analysis` | Comprehensive business intelligence report |
| `onboarding_guide` | Personalized onboarding checklist |

---

## Supported Verticals

| Module | Industry |
|--------|----------|
| DineOS | Restaurants & F&B |
| PropertyOS | Real Estate |
| AgencyOS | Marketing Agencies |
| MotorOS | Car Dealerships |
| TravelOS | Travel Agencies |
| StudioOS | Architecture & Engineering |
| BeautyOS | Beauty & Wellness |
| CleanOS | Cleaning & Facility Management |
| ShopOS | Retail |
| WellnessOS | Fitness & Wellness |
| DermalyOS | Dermatology & Medical |
| ServiceOS | Field Services |
| ProjectOS | Project Management |
| NetworkOS | MLM & Referral |
| PraxisOS | Medical Practices |
| TrichoOS | Hair & Trichology |
| ReputationOS | Reputation Management |
| AdOS | Advertising |
| LandIQ | Real Estate Development |

---

## Architecture

```
Your AI  <-->  MCP Protocol  <-->  scala-mcp-server  <-->  S.C.A.L.A. API
                                        |
                              33 tools + 3 resources + 3 prompts
                                        |
                    CRM - Invoicing - Bookings - SARA AI - Finance
                    Workflows - 19 Verticals - 250M+ Companies
```

## Ecosystem

- **[enrich-companies (npm)](https://www.npmjs.com/package/enrich-companies)** — CLI to enrich CSV files with company data
- **[enrich-companies (PyPI)](https://pypi.org/project/enrich-companies/)** — Same tool, Python version
- **[Score Company Lookup](https://chromewebstore.google.com/detail/score-company-lookup/)** — Chrome extension
- **[scala-score (PyPI)](https://pypi.org/project/scala-score/)** — Python SDK
- **[world-company-database](https://github.com/Alessandro114/world-company-database)** — Bulk dataset (Kaggle + HuggingFace)
- [Score API Docs](https://app.get-scala.com/api/docs/ui) — REST API documentation
- [n8n Integration](https://github.com/Alessandro114/n8n-nodes-scala) — n8n workflow nodes

## Development

```bash
git clone https://github.com/Alessandro114/scala-mcp-server.git
cd scala-mcp-server
npm install
npm run dev    # Run with tsx (hot reload)
npm run build  # Compile TypeScript
```

## License

[MIT](LICENSE) — Copyright (c) 2026 Alessandro Binda / S.C.A.L.A. AI OS
