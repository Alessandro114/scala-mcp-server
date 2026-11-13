# Server MCP remoto (Claude Directory)

Streamable HTTP, stateless, **sola lettura (v1)**. Codice: `src/remote.ts`. Il server stdio
(`npx scala-mcp-server`) resta invariato e continua a usare `SCALA_API_KEY`.

## Come funziona
1. Claude chiama `POST https://mcp.get-scala.com/mcp`. Senza Bearer risponde `401` con
   `WWW-Authenticate: Bearer resource_metadata=".../.well-known/oauth-protected-resource"`.
2. Claude scopre l'authorization server (backend, `src/routes/mcpOauth.ts`), fa OAuth 2.0 + PKCE S256
   (registrazione dinamica del client, consenso dell'utente loggato nell'app) e ottiene un access
   token a scadenza breve (scope `mcp:read`) piu' un refresh token ruotato.
3. Ogni richiesta MCP porta il Bearer. Il server lo valida sul backend (`/api/mcp-oauth/whoami`; cache 20 s per gli esiti positivi,
   60 s per i negativi, richieste identiche fuse, al massimo 16 validazioni concorrenti, stop per IP dopo 30
   token non validi al minuto) e lo inoltra come `X-API-Key` (con `cf-connecting-ip: mcp-<hash>` per-token, cosi' il limite per IP del backend
   non e' condiviso da tutti gli utenti): autenticazione, rate limit, scope e RLS sono
   quelli del backend. **Nessuna credenziale viene letta dall'ambiente in modalita' remota.**

## Livelli (strumenti secondo il piano)
Il livello lo decide il backend al consenso OAuth dal piano dell'utente (`plan_tier` + `subscription_status`) e
lo scrive nella chiave emessa; `whoami` risponde `{ ok: true, tier }` e questo server espone solo i tool di quel livello.
Verso Claude lo scope resta `mcp:read`. Un tool che non sta in nessun elenco (`src/annotations.ts`) non viene esposto;
chiamare un tool fuori livello risponde `Unknown tool`. Il backend applica comunque lo stesso limite sui percorsi (403).

| Livello | Piani | Tool |
|---|---|---|
| `full` | Growth, Scale, Enterprise (`MCP_OAUTH_MIN_PLAN`, default `growth`) | i 14 qui sotto |
| nessuno | free, scaduti, annullati | consenso rifiutato |

SOLO SARA e' respinto al consenso finche' non esiste il livello `sara`. Il livello si ricalcola a ogni refresh (token di accesso: 1 ora). Rilascio: backend per primo; un `whoami` senza livello
(backend vecchio) fa rispondere 503 a questo server, mai un livello inventato.

## Tool del livello `full` (14, tutti `readOnlyHint`)
crm_list_contacts, crm_pipeline, crm_contact_timeline, finance_summary,
finance_health_score, finance_cash_flow, sara_conversations, sara_insights, sara_alerts,
sara_proactive, vertical_kpis, vertical_access, workflow_list, workflow_stats.
Esclusi anche invoice_list (serve Fatture in Cloud collegato) e booking_get_slots (serve una pagina di prenotazione).
Non esposti: tutte le scritture; i 4 tool Score (richiedono l'integrazione dei crediti per-utente nel
backend); vertical_list_data (tabella libera); invoice_get_pdf (risposta binaria).

## Variabili d'ambiente
| Variabile | Default | Note |
|---|---|---|
| `MCP_REMOTE` | – | **obbligatoria =1** (il processo rifiuta di partire senza) |
| `PORT` / `HOST` | 3030 / 127.0.0.1 | in Docker `HOST=0.0.0.0`, pubblicare solo su 127.0.0.1 |
| `MCP_PUBLIC_URL` | https://mcp.get-scala.com | deve coincidere con l'URL inserito in Claude |
| `MCP_OAUTH_ISSUER` | = MCP_PUBLIC_URL | issuer dell'authorization server (backend) |
| `SCALA_API_URL` | https://app.get-scala.com | backend; in prod preferire l'indirizzo interno |
| `MCP_RATE_PER_MIN` | 120 | per token |
| `MCP_MAX_INFLIGHT` | 64 | richieste concorrenti |
| `MCP_ALLOWED_ORIGINS` | vuoto | i browser sono rifiutati (Origin) |

## nginx (esempio, da NON applicare senza passare dall'orchestratore)
```nginx
server {
    server_name mcp.get-scala.com;
    # TLS come gli altri vhost. Cloudflare/WAF: consentire 160.79.104.0/21 (egress Anthropic).
    location = /mcp                                  { proxy_pass http://127.0.0.1:3030; proxy_read_timeout 70s; }
    location = /healthz                              { proxy_pass http://127.0.0.1:3030; }
    location /.well-known/oauth-protected-resource   { proxy_pass http://127.0.0.1:3030; }
    location = /.well-known/oauth-authorization-server { proxy_pass http://127.0.0.1:3001/api/mcp-oauth/metadata; }
    location = /register  { proxy_pass http://127.0.0.1:3001/api/mcp-oauth/register; }
    location = /authorize { proxy_pass http://127.0.0.1:3001/api/mcp-oauth/authorize; }
    location = /token     { proxy_pass http://127.0.0.1:3001/api/mcp-oauth/token; }
    location = /revoke    { proxy_pass http://127.0.0.1:3001/api/mcp-oauth/revoke; }
    # tutto il resto: 404
}
```
Backend: `MCP_OAUTH_ISSUER=https://mcp.get-scala.com`, migrazione `409_mcp_oauth.sql`.

## Test
`npm test` (node:test): server HTTP reale + backend finto. Copre 401/503, metadata, allowlist, livello `full`,
isolamento fra token in parallelo, assenza di credenziali d'ambiente, path traversal, Origin, limiti.
