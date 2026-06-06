# S.C.A.L.A. MCP Server

[![MCP](https://img.shields.io/badge/MCP-compatible-purple)](https://modelcontextprotocol.io)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Companies](https://img.shields.io/badge/companies-244M%2B-green)](https://get-scala.com/score)

**Let AI agents search 244M+ companies.** This MCP server connects Claude, ChatGPT, Codex, and any MCP-compatible AI agent to the [S.C.A.L.A. Score API](https://get-scala.com/score).

## What It Does

Once installed, your AI assistant can:

- **Search companies** by name, VAT number, keyword — across 40+ countries
- **Lookup** detailed company profiles (revenue, employees, health score, industry)
- **Generate reports** (financial health, risk assessment)
- **Check database stats** (244M+ companies, 40+ countries)

## Setup

### Claude Code

```bash
# Install globally
npm install -g @scala/mcp-server

# Add to Claude Code
claude mcp add scala-score -e SCALA_API_KEY=your-key -- scala-mcp
```

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "scala-score": {
      "command": "npx",
      "args": ["@scala/mcp-server"],
      "env": {
        "SCALA_API_KEY": "your-api-key"
      }
    }
  }
}
```

### Any MCP Client

```bash
SCALA_API_KEY=your-key npx @scala/mcp-server
```

## Tools

| Tool | Description | Credits |
|------|-------------|---------|
| `search_companies` | Search by name/VAT/keyword with country, NACE, status filters | 1 |
| `lookup_company` | Full company profile by ID or VAT | 1 |
| `company_report` | Generate health report (basic/pro/enterprise) | 5/10/20 |
| `database_stats` | Total companies, countries, last update | 0 |
| `list_countries` | Countries with company counts | 0 |
| `check_credits` | Remaining API credits | 0 |

## Example Conversations

**You:** "Find the top 10 restaurant chains in Italy"

**Claude:** *uses `search_companies` with query="ristorante catena", country="IT", nace="56.10"*

---

**You:** "Look up Ferrero's financial health"

**Claude:** *uses `lookup_company` with company_id="IT02727330014"* → Shows revenue, employees, health score, NACE classification

---

**You:** "Compare construction companies in Milan vs Munich"

**Claude:** *uses `search_companies` twice* → Analyzes differences in company count, average revenue, health scores

## Get API Key

1. Sign up at [app.get-scala.com](https://app.get-scala.com)
2. Go to **Score > API**
3. Generate your key
4. Set `SCALA_API_KEY` environment variable

## Pricing

| Plan | Price | Credits/mo | Best for |
|------|-------|-----------|----------|
| Starter | €19/mo | 500 | Personal use, testing |
| Growth | €49/mo | 5,000 | Regular lookups |
| Enterprise | €149/mo | 50,000 | Bulk analysis, integrations |

## Links

- [S.C.A.L.A. AI OS](https://get-scala.com) — Full platform
- [Score API Docs](https://app.get-scala.com/api/docs/ui)
- [Python SDK](https://github.com/Alessandro114/scala-score-python)
- [JavaScript SDK](https://github.com/Alessandro114/scala-score-js)
- [n8n Integration](https://github.com/Alessandro114/n8n-nodes-scala)

## License

MIT
