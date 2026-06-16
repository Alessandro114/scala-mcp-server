<p align="center">
  <strong>Your AI assistant can now search 250M+ companies across 40+ countries. Free.</strong>
</p>

<p align="center">
  <a href="https://modelcontextprotocol.io"><img src="https://img.shields.io/badge/MCP-compatible-purple" alt="MCP"></a>
  <a href="https://www.npmjs.com/package/scala-mcp-server"><img src="https://img.shields.io/npm/v/scala-mcp-server" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/scala-mcp-server"><img src="https://img.shields.io/npm/dm/scala-mcp-server" alt="npm downloads"></a>
  <a href="https://github.com/Alessandro114/scala-mcp-server/blob/main/LICENSE"><img src="https://img.shields.io/github/license/Alessandro114/scala-mcp-server" alt="License"></a>
  <a href="https://get-scala.com/score"><img src="https://img.shields.io/badge/companies-250M%2B-green" alt="Companies"></a>
  <a href="https://glama.ai/mcp/servers/Alessandro114/scala-mcp-server"><img src="https://glama.ai/mcp/servers/Alessandro114/scala-mcp-server/badges/score.svg" alt="Glama Score"></a>
</p>

# S.C.A.L.A. MCP Server

An [MCP server](https://modelcontextprotocol.io) that gives Claude, ChatGPT, Codex, and any MCP-compatible AI agent access to the [S.C.A.L.A. Score](https://get-scala.com/score) company intelligence database -- 250M+ companies across 40+ countries.

## Quick Start

```bash
npx -y scala-mcp-server
```

That's it. One command. Set your API key and go:

```bash
SCALA_API_KEY=your-key npx -y scala-mcp-server
```

> Get a free API key at [app.get-scala.com](https://app.get-scala.com) -- no credit card required.

---

## What It Does

Once connected, your AI assistant can:

- **Search companies** by name, VAT number, keyword -- across 40+ countries
- **Lookup** detailed company profiles (revenue, employees, health score, industry)
- **Generate reports** (financial health, risk assessment, due diligence)
- **Explore the database** -- stats, country coverage, credit balance

## Setup

### Claude Desktop

Add to your `claude_desktop_config.json`:

<details>
<summary><strong>macOS</strong>: <code>~/Library/Application Support/Claude/claude_desktop_config.json</code></summary>

```json
{
  "mcpServers": {
    "scala-score": {
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
    "scala-score": {
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
claude mcp add scala-score -e SCALA_API_KEY=your-key -- npx -y scala-mcp-server
```

### Any MCP Client

```bash
SCALA_API_KEY=your-key npx -y scala-mcp-server
```

Or install globally:

```bash
npm install -g scala-mcp-server
SCALA_API_KEY=your-key scala-mcp
```

## Tools

| Tool | Description | Credits |
|------|-------------|---------|
| `search_companies` | Search by name, VAT, keyword with country/NACE/status filters | 1 |
| `lookup_company` | Full company profile by ID or VAT number | 1 |
| `company_report` | Health report -- basic (5), pro (10), enterprise (20) | 5-20 |
| `database_stats` | Total companies, countries, last update | 0 |
| `list_countries` | All countries with company counts | 0 |
| `check_credits` | Remaining credits, plan info, reset date | 0 |

## Demo

Here's what a real conversation looks like:

> **You:** Find the top 10 restaurant chains in Italy

> **Claude:** *uses `search_companies` with query="ristorante catena", country="IT", nace="56.10"*
>
> I found 10 restaurant chains in Italy. Here are the largest by revenue:
>
> | # | Company | Revenue | Employees | Health |
> |---|---------|---------|-----------|--------|
> | 1 | AUTOGRILL S.P.A. | EUR 3.2B | 12,400 | 82/100 |
> | 2 | CHEF EXPRESS S.P.A. | EUR 890M | 4,200 | 78/100 |
> | ... | | | | |

---

> **You:** Look up Ferrero's financial health

> **Claude:** *uses `lookup_company` with company_id="IT02727330014"*
>
> **Ferrero International S.A.**
> - Revenue: EUR 17.0B
> - Employees: 41,000+
> - Health Score: 94/100
> - NACE: 10.82 (Cocoa, chocolate and sugar confectionery)
> - Status: Active since 1946

---

> **You:** Compare construction companies in Milan vs Munich

> **Claude:** *uses `search_companies` twice with country="IT"/country="DE" and nace="41"*
>
> Milan has 3x more construction companies, but Munich firms average 40% higher revenue. Health scores are comparable (avg 68 vs 71).

## Get Your API Key

1. Sign up at [app.get-scala.com](https://app.get-scala.com)
2. Navigate to **Score > API**
3. Generate your key
4. Set `SCALA_API_KEY` as environment variable

Free tier includes credits to get started -- no credit card required.

## Pricing

| Plan | Credits/mo | Best for |
|------|-----------|----------|
| Free | 50 | Testing, evaluation |
| Starter | 500 | Personal projects |
| Growth | 5,000 | Regular lookups |
| Enterprise | 50,000+ | Bulk analysis, integrations |

See [get-scala.com/score](https://get-scala.com/score) for current pricing.

## How It Works

```
Your AI Assistant  <-->  MCP Protocol  <-->  scala-mcp-server  <-->  S.C.A.L.A. Score API
                                                                          |
                                                                    250M+ companies
                                                                    40+ countries
                                                                    NACE industry codes
                                                                    Financial data
```

The server communicates over **stdio** using the [Model Context Protocol](https://modelcontextprotocol.io). No HTTP server, no ports, no configuration beyond the API key.

## Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run the build: `npm run build`
5. Test locally: `SCALA_API_KEY=test npx .`
6. Commit: `git commit -m "feat: add my feature"`
7. Push: `git push origin feature/my-feature`
8. Open a Pull Request

### Development

```bash
git clone https://github.com/Alessandro114/scala-mcp-server.git
cd scala-mcp-server
npm install
npm run dev    # Run with tsx (hot reload)
npm run build  # Compile TypeScript
```

## Ecosystem

- **[enrich-companies (npm)](https://www.npmjs.com/package/enrich-companies)** -- CLI to enrich CSV files with company data
- **[enrich-companies (PyPI)](https://pypi.org/project/enrich-companies/)** -- Same tool, Python version
- **[Score Company Lookup](https://chromewebstore.google.com/detail/score-company-lookup/)** -- Chrome extension
- **[scala-score (PyPI)](https://pypi.org/project/scala-score/)** -- Python SDK
- **[world-company-database](https://github.com/Alessandro114/world-company-database)** -- Bulk dataset (Kaggle + HuggingFace)
- [Score API Docs](https://app.get-scala.com/api/docs/ui) -- REST API documentation
- [n8n Integration](https://github.com/Alessandro114/n8n-nodes-scala) -- n8n workflow nodes

## License

[MIT](LICENSE) -- Copyright (c) 2026 Alessandro Binda / S.C.A.L.A. AI OS
