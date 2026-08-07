import { apiRequest } from "./api.js";

export const resources = [
  {
    uri: "scala://pricing",
    name: "SCALA Pricing",
    description: "Current SCALA AI OS pricing: SMB plans, enterprise tiers, add-ons, and setup fees.",
    mimeType: "application/json",
  },
  {
    uri: "scala://verticals",
    name: "SCALA Verticals",
    description: "All 20 industry verticals available in SCALA AI OS with descriptions.",
    mimeType: "application/json",
  },
  {
    uri: "scala://capabilities",
    name: "SCALA Capabilities",
    description: "Full list of SCALA platform capabilities: CRM, invoicing, SARA AI, bookings, analytics, and more.",
    mimeType: "application/json",
  },
];

const PRICING_DATA = {
  smb: {
    growth: { monthly_eur: 97, annual_eur: 970, includes: ["CRM", "Invoicing", "Bookings", "1 vertical", "SARA AI chat", "Email support"] },
    scale: { monthly_eur: 197, annual_eur: 1970, includes: ["Everything in Growth", "All 20 verticals", "WhatsApp Business", "Workflows", "Integrations", "Priority support"] },
  },
  sara_standalone: { monthly_eur: 9.90, description: "SARA AI assistant only (freelancers)" },
  enterprise: {
    tier_2: { monthly_from_eur: 2000, setup_from_eur: 5000, description: "Single-vertical, <50 users" },
    tier_1: { monthly_from_eur: 5000, setup_from_eur: 15000, description: "Multi-site, facility management, hospitality" },
  },
  addons: {
    whatsapp_connect: { monthly_eur: 19 },
    voice: { monthly_eur: 29 },
    wa_business_api: { monthly_eur: 39 },
    ai_credits_1000: { eur: 5 },
  },
  trial: { days: 14, plan: "growth" },
};

const VERTICALS_DATA = [
  { slug: "dineos", name: "DineOS", industry: "Restaurants & F&B", features: ["Menu management", "Table orders", "Kitchen display", "Reviews", "QR ordering"] },
  { slug: "propertyos", name: "PropertyOS", industry: "Real Estate", features: ["Listings", "Transactions", "Commissions", "Property matching", "Valuations"] },
  { slug: "agencyos", name: "AgencyOS", industry: "Marketing Agencies", features: ["Campaign management", "Client portal", "Creative review", "Quote-to-project"] },
  { slug: "motoros", name: "MotorOS", industry: "Car Dealerships", features: ["Vehicle inventory", "Workshop management", "Test drives", "Trade-in estimates", "VIN decode"] },
  { slug: "travelos", name: "TravelOS", industry: "Travel Agencies", features: ["Itineraries", "Vouchers", "Flight/hotel search (Amadeus)", "Travel quotes"] },
  { slug: "studioos", name: "StudioOS", industry: "Architecture & Engineering", features: ["Project management", "SAL milestones", "Timesheets", "Subcontractors", "Permits"] },
  { slug: "beautyos", name: "BeautyOS", industry: "Beauty & Wellness", features: ["Appointments", "Service catalog", "Client history", "Loyalty"] },
  { slug: "cleanos", name: "CleanOS", industry: "Cleaning & Facility Management", features: ["Work orders", "Site management", "Shift scheduling", "Quality tracking"] },
  { slug: "shopos", name: "ShopOS", industry: "Retail", features: ["Product catalog", "Inventory", "Categories", "POS integration"] },
  { slug: "wellnessos", name: "WellnessOS", industry: "Fitness & Wellness", features: ["Class scheduling", "Bookings", "Member management", "Attendance"] },
  { slug: "dermalyos", name: "DermalyOS", industry: "Dermatology & Medical", features: ["Patient records", "Consent forms", "Treatment plans", "Before/after photos"] },
  { slug: "serviceos", name: "ServiceOS", industry: "Field Services", features: ["Job scheduling", "Technician dispatch", "Service reports"] },
  { slug: "projectos", name: "ProjectOS", industry: "Project Management", features: ["Tasks", "Milestones", "Time tracking", "Jira/Monday/Asana sync"] },
  { slug: "networkos", name: "NetworkOS", industry: "MLM & Referral Networks", features: ["Commission networks", "Downline tracking", "Referral programs"] },
  { slug: "praxisos", name: "PraxisOS", industry: "Medical Practices", features: ["Patient scheduling", "Treatment records", "Billing"] },
  { slug: "trichoos", name: "TrichoOS", industry: "Hair & Trichology", features: ["Scalp analysis", "Treatment tracking", "Product recommendations"] },
  { slug: "reputationos", name: "ReputationOS", industry: "Reputation Management", features: ["Review aggregation", "Sentiment analysis", "Response automation"] },
  { slug: "ados", name: "AdOS", industry: "Advertising", features: ["Campaign planning", "Budget tracking", "Cross-channel reports"] },
  { slug: "landiq", name: "LandIQ", industry: "Real Estate Development", features: ["Feasibility analysis", "Zoning data", "Market comparables", "Automated reports"] },
];

const CAPABILITIES_DATA = {
  core: ["CRM & Sales Pipeline", "Invoicing (multi-provider)", "Booking & Appointments", "Financial Analytics", "Workflow Automation", "API Keys & Webhooks"],
  ai: ["SARA AI Assistant (chat, WhatsApp, email, voice)", "Proactive Business Insights", "Smart Alerts", "AI-powered document OCR", "AI image generation"],
  integrations: ["Google Analytics/Ads", "Meta Ads", "Search Console", "YouTube Analytics", "Salesforce/HubSpot/Zoho", "Shopify/WooCommerce", "Mailchimp/ActiveCampaign", "Stripe/Xero/QuickBooks", "Amadeus (flights/hotels)", "Microsoft Dynamics 365", "Jira/Monday/Asana/Slack"],
  enterprise: ["SSO (SAML)", "2FA (TOTP + WebAuthn/passkeys)", "Audit log", "Multi-branch", "Franchise management", "White-label embed", "SAF-T export", "GDPR compliance tools"],
  verticals: VERTICALS_DATA.map((v) => `${v.name} (${v.industry})`),
};

export async function handleResource(uri: string) {
  switch (uri) {
    case "scala://pricing":
      return { contents: [{ uri, mimeType: "application/json", text: JSON.stringify(PRICING_DATA, null, 2) }] };
    case "scala://verticals":
      return { contents: [{ uri, mimeType: "application/json", text: JSON.stringify(VERTICALS_DATA, null, 2) }] };
    case "scala://capabilities":
      return { contents: [{ uri, mimeType: "application/json", text: JSON.stringify(CAPABILITIES_DATA, null, 2) }] };
    default:
      throw new Error(`Unknown resource: ${uri}`);
  }
}
