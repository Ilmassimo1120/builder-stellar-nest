# ChargeSource - Comprehensive Requirements Document
## EV Infrastructure Platform for Australian Electrical Contractors

**Version:** 1.0  
**Last Updated:** 2025  
**Target Audience:** Development Teams, Product Managers, Stakeholders  
**Scope:** High-level with detailed feature status and architecture

---

## EXECUTIVE SUMMARY

**ChargeSource** is a comprehensive SaaS platform specifically designed for Australian electrical contractors to streamline the planning, quoting, and procurement of commercial and residential EV charging infrastructure projects. The platform integrates project management, dynamic quoting (CPQ), supplier procurement, customer portals, and accounting/CRM integrations into a single unified workspace.

### Key Metrics
- **Active Contractors:** 500+
- **Projects Completed:** 15,000+
- **Revenue Generated:** $50M+
- **Target Market:** Australian electrical contractors (SMEs to mid-size firms)
- **Primary Use Cases:** EV charging site assessments, fast quoting, compliance tracking, customer engagement

### Core Value Proposition
- Reduce quote preparation from hours to minutes (40% faster)
- Increase project win rate by up to 40% with professional quotes
- Eliminate manual compliance checking with automated AS/NZS 3000 validation
- Integrate with existing accounting/CRM workflows (Xero, MYOB, QuickBooks, HubSpot, Pipedrive)
- Transparent client engagement via white-label customer portal

---

## PRODUCT VISION & MARKET POSITIONING

### Mission Statement
To empower Australian electrical contractors with intelligent, compliant, and integrated tools that accelerate EV infrastructure project delivery and profitability.

### Market Context
- **Regulatory Landscape:** Australian electrical work must comply with AS/NZS 3000 (Australian/New Zealand Standard for electrical installations), state-based electrical contractor licensing, and GST/Tax reporting.
- **Market Opportunity:** Growing EV adoption in Australia (30,000+ EVs sold annually); electrical contractors need specialized tools to capture this segment.
- **Competitive Positioning:** Purpose-built for Australian contractors (local compliance, accounting integrations, regional pricing), not a generic project management tool adapted for EV.

### Geographic Focus
🇦🇺 **Australia-first platform** with compliance for:
- All Australian states and territories
- GST compliance and Australian tax reporting (Xero, MYOB integration)
- AS/NZS 3000 electrical standards
- Australian supplier networks and pricing

---

## TARGET AUDIENCE & USER PERSONAS

### Primary Users

#### 1. **Electrical Contractors (Owners/Estimators)**
- **Goal:** Quickly create accurate quotes, win more EV projects
- **Pain Points:** Manual site assessments, inconsistent quoting, compliance burden
- **Usage:** 5-20 hours/week on projects, quotes, compliance docs
- **Key Features:** Project Wizard, Smart Quoting, compliance checklist

#### 2. **Sales Managers / Account Executives**
- **Goal:** Manage pipeline, forecast revenue, report to leadership
- **Pain Points:** Tracking leads, quote follow-ups, visibility into deal status
- **Usage:** Daily dashboard access, CRM sync, reporting
- **Key Features:** Dashboard, CRM integration (HubSpot/Pipedrive), Analytics

#### 3. **Project Managers / Field Teams**
- **Goal:** Coordinate project execution, track progress, manage documents
- **Pain Points:** Scattered information, poor handoff from estimator to site crew
- **Usage:** Mobile-first project tracking, document access on-site
- **Key Features:** Mobile app, document management, real-time updates

#### 4. **Office Administrators / Finance**
- **Goal:** Invoice clients, reconcile with accounting system, track inventory
- **Pain Points:** Manual invoice entry, accounting system not talking to quotes
- **Usage:** Daily accounting tasks, invoicing, supplier orders
- **Key Features:** Quote-to-invoice automation, Xero/MYOB sync, procurement integration

#### 5. **Clients (Residential/Commercial)**
- **Goal:** Track project progress, approve quotes, access documents
- **Pain Points:** Unclear timelines, hard to reach support, scattered documents
- **Usage:** Weekly check-ins, document uploads, communication
- **Key Features:** Client portal, quote approval workflow, progress tracking

---

## FEATURE MATRIX & STATUS

### Legend
| Status | Symbol | Meaning |
|--------|--------|---------|
| ✅ Working / Functional | ✅ | Fully implemented and tested |
| ⚠️ Partial / In Progress | ⚠️ | Partially working, stubs/TODOs present |
| ❌ Stub / Non-Functional | ❌ | Placeholder code, simulated responses |
| 🔄 Planned / Roadmap | 🔄 | Designed but not yet started |

---

## FEATURE CATALOG

### 1. **PROJECT MANAGEMENT**

#### 1.1 Project Planning Wizard
| Aspect | Detail | Status |
|--------|--------|--------|
| **Description** | Multi-step wizard for gathering site assessment data, client requirements, charger selection, grid analysis, compliance |
| **Core Workflow** | Client Requirements → Site Assessment → Charger Selection → Grid Capacity → Compliance → Summary |
| **Cloud Save/Load** | Uses localStorage; Supabase sync NOT implemented | ⚠️ |
| **Charger Auto-Selection** | Recommends charger types based on organization & site type | ✅ |
| **Compliance Checklist** | AS/NZS 3000 compliance items for Australian electrical work | ✅ |
| **Site Assessment Tools** | Address capture, site type selection, power availability | ✅ |
| **Grid Capacity Analysis** | Estimates grid capacity required, warns if insufficient | ✅ |
| **Edit/Duplicate Projects** | Save drafts, reopen, duplicate for similar projects | ✅ |

**Key Files:** `client/pages/ProjectWizard.tsx`, `client/lib/supabase.ts`  
**Open Issues:**
- Line 515-516: Cloud storage integration commented out (TODO)
- Projects not persisted to Supabase when autoConfigureSupabase() is true
- No conflict resolution if project edited in multiple sessions

---

#### 1.2 Projects Dashboard & Management
| Aspect | Detail | Status |
|--------|--------|--------|
| **Project List View** | Grid/Map view, filter by status, search by name/client | ✅ |
| **Project Status Tracking** | Planning → Quoting → In Progress → Completed / Cancelled | ✅ |
| **Google Maps Integration** | Visualize projects by location with markers | ⚠️ |
| **Geocoding** | Address → latitude/longitude conversion | ❌ |
| **Project Duplication** | Quick-copy project template for similar jobs | ✅ |
| **Project Deletion** | Remove projects from localStorage; Supabase delete NOT wired | ⚠️ |
| **Progress Tracking** | Visual % completion, milestones | ✅ |

**Key Files:** `client/pages/Projects.tsx`  
**Open Issues:**
- Line 270-272: Coordinates undefined, geocoding TODO
- Line 634-636: Supabase delete not implemented
- Map requires valid Google Maps API key; fallback to list view if missing
- No bulk project operations (batch export, archive)

---

### 2. **SMART QUOTING ENGINE (CPQ)**

#### 2.1 Quote Builder & Generation
| Aspect | Detail | Status |
|--------|--------|--------|
| **Dynamic Quote Creation** | Build quotes from component selection, auto-calculate costs | ✅ |
| **Line Items** | Add chargers, installation labor, materials, markups | ✅ |
| **Auto Cost Calculation** | Real-time pricing updates, material databases | ✅ |
| **Project Templates** | Save/reuse quote templates for recurring projects | ✅ |
| **Manual Cost Override** | Override auto-calculated costs for special deals | ✅ |
| **Margin Management** | Track and optimize profit margins per quote | ✅ |
| **Volume Discounts** | Apply discounts for bulk/multi-charger orders | ⚠️ |
| **PDF Generation** | Professional quote PDF export, customizable branding | ✅ |
| **Quote Versioning** | Multiple versions per quote, version history | ✅ |
| **Quote Status Workflow** | Draft → Pending Review → Sent → Viewed → Accepted/Rejected/Expired | ✅ |

**Key Files:** `client/pages/QuoteBuilder.tsx`, `client/lib/quoteService.ts`, `supabase/functions/generate-quote-pdf`  
**Open Issues:**
- Volume discount logic in database but not fully tested
- PDF generation client-side (may fail for very large documents); server-side Deno function exists but requires deployment
- No real-time co-editing (single user at a time)
- Quote expiry logic exists but not actively enforced

---

#### 2.2 Quoting Analytics & Reporting
| Aspect | Detail | Status |
|--------|--------|--------|
| **Quote Win Rate** | Dashboard metric showing acceptance rate | ✅ |
| **Average Quote Value** | Trending and average quote amounts | ✅ |
| **Time-to-Quote** | Metric tracking how fast quotes are created | ✅ |
| **Quote Performance** | Filter by month, contractor, client type | ✅ |

**Key Files:** `client/pages/Analytics.tsx`, `client/pages/Quotes.tsx`

---

### 3. **PROCUREMENT & SUPPLIER INTEGRATION**

#### 3.1 Product Catalogue
| Aspect | Detail | Status |
|--------|--------|--------|
| **EV Charger Catalogue** | Pre-loaded charger models, specs, pricing | ✅ |
| **Product Search** | Filter by charger type, power rating, price | ✅ |
| **Real-time Pricing** | Supplier API integration for live prices | ⚠️ |
| **Inventory Status** | Show stock availability by supplier | ⚠️ |
| **Product Categories** | Chargers, cables, installation materials, labor | ✅ |
| **Custom Products** | Add custom SKUs, in-house materials | ✅ |
| **Price Management** | Admin can manage product prices, markups | ✅ |

**Key Files:** `client/lib/productCatalog.ts`, `client/pages/Catalogue.tsx`  
**Open Issues:**
- Real-time pricing from supplier APIs is UI-ready but API connections not fully integrated
- Inventory sync requires 3rd-party supplier API keys (not configured)

---

#### 3.2 Supplier Integration & Procurement
| Aspect | Detail | Status |
|--------|--------|--------|
| **Supplier Directory** | List of approved suppliers with contact info | ✅ |
| **Quote-to-Order** | Convert quote line items into supplier orders | ⚠️ |
| **Order Tracking** | Track purchase orders through fulfillment | ⚠️ |
| **Payment Integration** | Stripe / PayPal for supplier payments | ⚠️ |
| **Inventory Management** | Track warehouse stock, reorder points | ⚠️ |

**Key Files:** `client/pages/Catalogue.tsx`, `client/lib/productCatalog.ts`  
**Open Issues:**
- Quote-to-order requires full supplier API integrations (not yet wired)
- Payment processing stubs exist but require Stripe/PayPal configuration

---

### 4. **DOCUMENT MANAGEMENT & FILE STORAGE**

#### 4.1 Cloud File Storage
| Aspect | Detail | Status |
|--------|--------|--------|
| **Supabase Storage Buckets** | File upload to Supabase buckets (documents, videos, user files) | ⚠️ |
| **Bucket Setup** | Three buckets: charge-source-documents, charge-source-user-files, charge-source-videos | ⚠️ |
| **File Upload** | Web upload with drag-and-drop, progress tracking | ⚠️ |
| **File Permissions** | Private by default; share with specific users/clients | ⚠️ |
| **File Versioning** | Track file versions, restore previous versions | ⚠️ |
| **Secure File Access** | Signed URLs, time-limited access links | ⚠️ |
| **File Metadata** | Track owner, upload date, tags, description | ⚠️ |

**Key Files:** `client/lib/services/fileStorageService.ts`, `client/lib/services/enhancedFileStorageService.ts`, `server/routes/create-storage-buckets.ts`, `supabase/functions/secure-file-*`  
**Open Issues:**
- Storage buckets must be created manually (see setup scripts)
- Supabase edge functions (secure-file-upload/list/delete) require deployment
- Fallback upload mechanisms (Edge, Netlify) require respective service deployment
- File permissions use Supabase RLS (Row-Level Security) — RLS policies must be configured

---

#### 4.2 Document Management & Templates
| Aspect | Detail | Status |
|--------|--------|--------|
| **Quote Document** | Auto-generated quote PDFs with branding | ✅ |
| **Compliance Docs** | AS/NZS 3000 checklists, safety certifications | ✅ |
| **Contract Templates** | Standard contracts for scope of work | ⚠️ |
| **Project Plans** | Schedule, resource allocation docs | ⚠️ |
| **Invoice Templates** | Customizable invoice layouts | ⚠️ |
| **Template Library** | Pre-built, user can customize | ⚠️ |

**Key Files:** `client/lib/advancedPDFGenerator.ts`, `client/components/DocumentManagement.tsx`

---

### 5. **CUSTOMER PORTAL & CLIENT ENGAGEMENT**

#### 5.1 Client Portal
| Aspect | Detail | Status |
|--------|--------|--------|
| **Public Quote View** | Client can view quote (public link, no login needed) | ✅ |
| **Quote Approval Workflow** | Client accepts/rejects/negotiates quote | ⚠️ |
| **Project Progress Tracking** | Client sees real-time project status | ⚠️ |
| **Document Access** | Client can download quotes, compliance docs, schedules | ⚠️ |
| **Communication Hub** | Messaging between contractor and client | ⚠️ |
| **White-Label Branding** | Custom domain, contractor branding on portal | ⚠️ |
| **Payment Status** | Client sees invoice status, payment options | ⚠️ |

**Key Files:** `client/pages/ClientPortal.tsx`, `client/pages/ClientPortalDemo.tsx`  
**Open Issues:**
- Portal is read-only for demo; approval workflow not wired
- Messaging requires real-time backend (WebSocket or polling)
- White-label requires multi-tenant setup and custom domain routing

---

### 6. **ACCOUNT & USER MANAGEMENT**

#### 6.1 Authentication & Authorization
| Aspect | Detail | Status |
|--------|--------|--------|
| **Email/Password Registration** | Standard sign-up with email verification | ✅ |
| **Google OAuth** | "Sign in with Google" integration | ⚠️ |
| **Session Management** | Persistent sessions, token refresh | ✅ |
| **Password Reset** | Email-based password recovery | ✅ |
| **Multi-Factor Authentication (MFA)** | 2FA via email/SMS (optional) | ❌ |
| **Role-Based Access Control (RBAC)** | Admin, Manager, User roles with permissions | ✅ |
| **Team Invitations** | Invite team members, assign roles | ✅ |
| **API Keys** | Generate API keys for programmatic access | ⚠️ |

**Key Files:** `client/hooks/useAuth.tsx`, `client/hooks/useSupabaseAuth.tsx`, `client/pages/Login.tsx`, `client/pages/Register.tsx`  
**Open Issues:**
- Google OAuth requires Supabase provider configuration (not tested in all environments)
- API key generation UI exists but keys not fully functional for REST API calls
- MFA not implemented

---

#### 6.2 User Settings & Preferences
| Aspect | Detail | Status |
|--------|--------|--------|
| **Profile Management** | Edit name, email, phone, company info | ✅ |
| **Notification Preferences** | Email frequency, alert types | ⚠️ |
| **Dashboard Customization** | Save dashboard views, widget preferences | ⚠️ |
| **Category/Product Ordering** | Drag-to-reorder products, categories | ✅ |
| **Export User Data** | GDPR-compliant export of user data | ⚠️ |

**Key Files:** `client/pages/Settings.tsx`, `client/lib/userPreferencesService.ts`

---

### 7. **INTEGRATIONS**

#### 7.1 Accounting Software Integrations
| Integration | Status | Details |
|---|---|---|
| **QuickBooks Online** | ❌ | Stub; code ready but API not authenticated |
| **QuickBooks Desktop** | ❌ | Not implemented |
| **Xero** | ❌ | Stub; GST reporting template available |
| **MYOB** | ❌ | Stub; Australian tax compliance ready |
| **FreshBooks** | ⚠️ | UI available, API integration incomplete |
| **Sage** | ⚠️ | Advanced reporting ready; sync not active |

**Key Files:** `client/pages/Integrations.tsx`  
**Capabilities Planned:**
- Two-way invoice sync (quote → invoice → accounting system)
- Automatic GST compliance reporting
- Financial dashboard integration
- Real-time account balance sync

**Issues:**
- No API keys configured for any accounting provider
- Requires user to authenticate with each provider
- Invoice sync requires RLS policies in Supabase

---

#### 7.2 CRM Integrations
| Integration | Status | Details |
|---|---|---|
| **HubSpot** | ⚠️ | Lead/contact sync stub; demo simulation |
| **Pipedrive** | ⚠️ | Deal tracking stub; API token required |
| **Salesforce** | ❌ | Not implemented |
| **Monday CRM** | ❌ | Not implemented |

**Key Files:** `client/lib/services/customerProviders/hubspotProvider.ts`, `server/routes/crm-leads.ts`  
**Capabilities Planned:**
- Lead sync from ChargeSource to CRM
- Deal tracking (quote → deal → won/lost)
- Contact and company sync
- Email activity logging

**Issues:**
- HubSpot & Pipedrive providers require API keys (not configured)
- CRM lead submission endpoint simulates responses (see line 52-59 in crm-leads.ts)
- No real-time sync; batch sync only

---

#### 7.3 Communication Integrations
| Integration | Status | Details |
|---|---|---|
| **Slack** | ❌ | Not implemented |
| **Microsoft Teams** | ❌ | Not implemented |
| **Email (SendGrid/SES)** | ❌ | Stubs; demo confirmation emails simulated |

**Key Files:** `server/routes/email-confirmation.ts`  
**Open Issues:**
- Email sending is stubbed (see line 141-156 in email-confirmation.ts, commented SendGrid code)
- No real transactional emails sent (demo/testing only)
- Requires SendGrid API key or AWS SES configuration

---

#### 7.4 Payment Integrations
| Integration | Status | Details |
|---|---|---|
| **Stripe** | ⚠️ | UI ready; checkout not fully integrated |
| **PayPal** | ⚠️ | UI ready; integration incomplete |
| **Square** | ❌ | Not implemented |

**Key Files:** `client/pages/Integrations.tsx`

---

#### 7.5 Cloud Storage & Backup
| Integration | Status | Details |
|---|---|---|
| **Google Drive** | ❌ | Not implemented |
| **Dropbox** | ❌ | Not implemented |
| **OneDrive** | ❌ | Not implemented |
| **AWS S3** | ❌ | Not implemented |

**Key Files:** N/A

---

### 8. **ANALYTICS & REPORTING**

#### 8.1 Business Intelligence Dashboard
| Aspect | Detail | Status |
|--------|--------|--------|
| **Revenue Dashboard** | Total revenue, monthly trends, forecast | ✅ |
| **Project Analytics** | Projects by status, completion rate, duration | ✅ |
| **Quote Performance** | Win rate, average quote value, time-to-quote | ✅ |
| **Customer Analytics** | Active customers, repeat rate, satisfaction | ⚠️ |
| **Team Performance** | By contractor: projects, revenue, efficiency | ⚠️ |
| **Real-time Metrics** | Live update of key KPIs | ⚠️ |

**Key Files:** `client/pages/Analytics.tsx`, `client/pages/Dashboard.tsx`  
**Open Issues:**
- Customer satisfaction metrics require survey integration
- Team performance requires contractor-level data granularity (partially available)

---

#### 8.2 Custom Reports
| Aspect | Detail | Status |
|--------|--------|--------|
| **Report Builder** | Drag-and-drop report builder | ❌ |
| **Export Formats** | CSV, Excel, PDF reports | ⚠️ |
| **Scheduled Reports** | Auto-send reports via email | ❌ |
| **Data Visualization** | Charts, graphs, drill-down analytics | ✅ |

**Key Files:** `client/pages/Analytics.tsx`

---

### 9. **COMPLIANCE & SAFETY**

#### 9.1 AS/NZS 3000 Compliance
| Aspect | Detail | Status |
|--------|--------|--------|
| **Automated Compliance Checklist** | AS/NZS 3000 required items per installation type | ✅ |
| **Compliance Verification** | Mark items as complete, track evidence | ✅ |
| **Document Checklist** | Required docs per project (electrical cert, inspection, etc.) | ✅ |
| **Audit Trail** | Compliance history, who approved, when | ⚠️ |
| **Non-Compliance Alerts** | Red flags if required items missed | ⚠️ |

**Key Files:** `client/pages/Compliance.tsx`, `client/pages/ProjectWizard.tsx` (step 5)

**Australian Electrical Standards Context:**
- **AS/NZS 3000** is the primary Australian standard for electrical installations
- Compliance is mandatory before installation
- Contractors must be licensed (state-based)
- Compliance documentation must be retained for 5 years

---

#### 9.2 Safety Management
| Aspect | Detail | Status |
|--------|--------|--------|
| **Safety Checklist** | On-site safety items (PPE, site hazards, traffic control) | ⚠️ |
| **Risk Assessment** | Identify project risks, mitigation steps | ⚠️ |
| **Incident Reporting** | Log incidents, attach photos, notify management | ❌ |
| **Training Tracking** | Track staff certifications and training completion | ⚠️ |

**Key Files:** N/A (Compliance module has basic checklist)

---

### 10. **TRAINING & SUPPORT**

#### 10.1 Training Portal
| Aspect | Detail | Status |
|--------|--------|--------|
| **Video Tutorials** | On-demand training videos for features | ⚠️ |
| **Knowledge Base** | Articles, FAQs, troubleshooting guides | ⚠️ |
| **Certification Program** | Track user certifications and training completion | ❌ |
| **Onboarding Wizard** | First-time user setup and guidance | ⚠️ |

**Key Files:** `client/pages/Training.tsx`, `client/pages/TrainingPublic.tsx`

---

#### 10.2 Support & Help
| Aspect | Detail | Status |
|--------|--------|--------|
| **Help Centre** | Self-service support articles and guides | ✅ |
| **Chat Support** | AI-powered support assistant | ⚠️ |
| **Email Support** | Support tickets via email | ⚠️ |
| **Phone Support** | 1800 number for priority support | ❌ |

**Key Files:** `client/pages/HelpCentre.tsx`, `client/components/SupportAIAssistant.tsx`

---

### 11. **ADMIN & MANAGEMENT FEATURES**

#### 11.1 Admin Dashboard
| Aspect | Detail | Status |
|--------|--------|--------|
| **User Management** | View users, roles, disable accounts, reset passwords | ✅ |
| **Contractor Management** | Approve contractors, manage profiles, view metrics | ✅ |
| **Product Catalogue Management** | Add/edit/delete products, prices, categories | ✅ |
| **System Health** | Monitor Supabase, storage, API health | ⚠️ |
| **Audit Logs** | Track system activities, user actions | ⚠️ |

**Key Files:** `client/pages/AdminCatalogue.tsx`, `client/pages/Users.tsx`

---

#### 11.2 Business Settings & Configuration
| Aspect | Detail | Status |
|--------|--------|--------|
| **Company Branding** | Logo, colors, domain customization | ⚠️ |
| **Email Templates** | Customize demo request, confirmation emails | ⚠️ |
| **Pricing Configuration** | Manage charger prices, labor rates, markups | ✅ |
| **Global Settings** | GST rate, currency, tax settings | ✅ |

**Key Files:** `client/pages/Settings.tsx`

---

### 12. **QUALITY ASSURANCE & TESTING**

#### 12.1 Test Coverage
| Area | Status | Details |
|---|---|---|
| **Unit Tests** | ⚠️ | Partial coverage with Vitest; core features have tests |
| **Integration Tests** | ⚠️ | Some integration tests; Supabase mocks used |
| **E2E Tests** | ❌ | Not implemented (no Cypress/Playwright tests) |
| **Authentication Tests** | ⚠️ | OAuth callback tested; edge cases not covered |
| **API Tests** | ⚠️ | Basic endpoint tests; integration scenarios incomplete |

**Key Files:** `client/pages/__tests__/*`, `vitest.config.ts`

---

## TECHNICAL ARCHITECTURE

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT (React)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Pages: Dashboard, Projects, Quotes, etc.            │  │
│  │  Components: UI library (Radix), custom components   │  │
│  │  State: useAuth, useCustomerIntegration, React Query │  │
│  └──────────────────────────────────────────────────────┘  │
│                         ��� (HTTP/REST)                       │
├─────────────────────────────────────────────────────────────┤
│                SERVER (Express.js)                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Routes: /api/ping, /api/demo, /api/create-buckets  │  │
│  │  Auth: Session management, token validation          │  │
│  │  CRM/Email: Lead submission, demo confirmations      │  │
│  └──────────────────────────────────────────────────────┘  │
│                         ↓                                   │
├─────────────────────────────────────────────────────────────┤
│          BACKEND SERVICES (Supabase + Edge Functions)       │
│  ┌─────────────────┐  ┌───────────────────────��────────┐   │
│  │  PostgreSQL DB  │  │  Supabase Edge Functions (Deno)│   │
│  │  - Users        │  │  - secure-file-upload          │   │
│  │  - Projects     │  │  - secure-file-list            │   │
│  │  - Quotes       │  │  - secure-file-delete          │   │
│  │  - File Assets  │  │  - generate-quote-pdf          │   │
│  │  - Global Sett  │  │  - calculate-quote-totals      │   │
│  └─────────────────┘  └────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Supabase Storage                                    │  │
│  │  - charge-source-documents (bucket)                  │  │
│  │  - charge-source-user-files (bucket)                 │  │
│  │  - charge-source-videos (bucket)                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                         ↓                                   │
├─────────────────────────────────────────────────────────────┤
│  EXTERNAL INTEGRATIONS (3rd-party APIs)                     │
│  - Accounting: Xero, MYOB, QuickBooks                      │
│  - CRM: HubSpot, Pipedrive, Salesforce                     │
│  - Email: SendGrid, AWS SES                                │
│  - Payments: Stripe, PayPal                                │
│  - Maps: Google Maps API                                   │
└─────────────────────────────────────────────────────────────┘
```

### Stack Summary
| Layer | Technology | Notes |
|-------|-----------|-------|
| **Frontend** | React 18 + TypeScript + Vite | SPA mode, hot reload in dev |
| **Styling** | TailwindCSS 3 + Radix UI | Pre-built component library |
| **State Management** | React Hooks + TanStack Query | Query caching, mutations |
| **Backend** | Express.js (Node.js) | Single Express server integrated with Vite |
| **Database** | PostgreSQL (Supabase) | Managed by Supabase |
| **Edge Functions** | Deno (Supabase Functions) | Serverless PDF generation, file ops |
| **File Storage** | Supabase Storage (S3-compatible) | Bucket-based with RLS |
| **Authentication** | Supabase Auth (JWT tokens) | Email/password + OAuth (Google) |
| **Real-time** | Supabase Realtime (opt-in) | Websocket-based subscriptions |
| **Deployment** | Netlify (serverless) | Netlify Functions wrapper + serverless-http |
| **Testing** | Vitest + React Testing Library | Unit/integration tests |

---

## DATA MODELS

### Core Entity Relationships

```
users (1) ──→ (M) projects
           ──→ (M) quotes
           ──→ (M) file_assets
           
projects (1) ──→ (M) quotes
           ──→ (M) line_items (via quotes)
           ──→ (M) documents
           
quotes (1) ──→ (M) line_items
          ──→ (M) attachments
          ──→ (1) project
          
global_settings (singleton) ──→ GST rate, volume discounts
```

### Database Tables (PostgreSQL)

#### **users**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  role ENUM('global_admin', 'admin', 'sales', 'partner', 'user'),
  first_name VARCHAR,
  last_name VARCHAR,
  company VARCHAR,
  phone VARCHAR,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### **projects**
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  status ENUM('draft', 'in_progress', 'completed', 'cancelled'),
  user_id UUID REFERENCES users(id),
  client_info JSONB (contact, company, address),
  site_assessment JSONB (site_type, address, power_availability),
  charger_selection JSONB (charging_type, power_rating, quantity),
  estimated_budget DECIMAL(12,2),
  progress INT (0-100),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### **quotes**
```sql
CREATE TABLE quotes (
  id UUID PRIMARY KEY,
  quote_number VARCHAR UNIQUE,
  title VARCHAR,
  description TEXT,
  status ENUM('draft', 'pending_review', 'sent', 'viewed', 'accepted', 'rejected', 'expired'),
  user_id UUID REFERENCES users(id),
  project_id UUID REFERENCES projects(id),
  client_info JSONB,
  line_items JSONB[] (product, qty, unit_price, total),
  totals JSONB (subtotal, gst, total),
  settings JSONB (markup%, branding),
  valid_until TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  sent_at TIMESTAMP,
  attachments JSONB[] (file_urls, pdf_url)
);
```

#### **file_assets**
```sql
CREATE TABLE file_assets (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  project_id UUID REFERENCES projects(id),
  file_name VARCHAR,
  file_type VARCHAR (pdf, docx, xlsx, etc),
  file_size BIGINT,
  s3_path VARCHAR (bucket/path/to/file),
  uploaded_at TIMESTAMP,
  is_approved BOOLEAN,
  version INT,
  metadata JSONB (tags, description)
);
```

#### **global_settings**
```sql
CREATE TABLE global_settings (
  id UUID PRIMARY KEY,
  gst_rate DECIMAL(5,2) (10% for Australia),
  volume_discounts JSONB (threshold: discount% pairs),
  currency VARCHAR (AUD),
  updated_at TIMESTAMP
);
```

---

## API ENDPOINTS

### Core REST API

#### **Authentication**
```
POST   /api/auth/register           (Email/password registration)
POST   /api/auth/login              (Email/password login)
POST   /api/auth/logout             (Clear session)
POST   /api/auth/reset-password     (Email-based reset)
GET    /api/auth/callback           (OAuth redirect handler)
GET    /api/auth/me                 (Get current user)
```

#### **Projects**
```
GET    /api/projects                (List user's projects)
POST   /api/projects                (Create new project)
GET    /api/projects/:id            (Get project details)
PUT    /api/projects/:id            (Update project)
DELETE /api/projects/:id            (Delete project)
GET    /api/projects/:id/quotes     (Get quotes for project)
```

#### **Quotes**
```
GET    /api/quotes                  (List user's quotes)
POST   /api/quotes                  (Create new quote)
GET    /api/quotes/:id              (Get quote details)
PUT    /api/quotes/:id              (Update quote)
DELETE /api/quotes/:id              (Delete quote)
POST   /api/quotes/:id/pdf          (Generate/download PDF)
POST   /api/quotes/:id/send         (Send quote to client)
POST   /api/quotes/:id/accept       (Client accepts quote)
```

#### **File Storage**
```
POST   /api/files/upload            (Upload file to storage)
GET    /api/files/:id               (Get file metadata)
DELETE /api/files/:id               (Delete file)
GET    /api/files/:id/download      (Get signed download URL)
GET    /api/files?project_id=:id    (List files for project)
```

#### **Catalogue & Products**
```
GET    /api/products                (List products)
GET    /api/products/:id            (Get product details)
POST   /api/products                (Admin: create product)
PUT    /api/products/:id            (Admin: update product)
DELETE /api/products/:id            (Admin: delete product)
GET    /api/products/search?q=:term (Search products)
```

#### **Admin & CRM**
```
POST   /api/crm/leads               (Submit lead to CRM)
POST   /api/email/demo-confirm      (Send demo confirmation email)
GET    /api/create-storage-buckets  (Initialize Supabase buckets)
GET    /api/health                  (Health check)
```

#### **Integrations**
```
GET    /api/integrations            (List connected integrations)
POST   /api/integrations/:provider/auth (Authenticate with provider)
GET    /api/integrations/:provider/status (Get integration status)
```

---

## INTEGRATIONS DETAIL

### 1. Accounting Software (Xero, MYOB, QuickBooks)

**Australian Context:**  
Xero and MYOB are dominant in Australian SME accounting. Both support:
- **GST Compliance:** Automatic GST reporting (10% in Australia)
- **BAS (Business Activity Statement):** Quarterly tax reporting
- **PAYG Tax:** Withholding tax management

**Planned Flow:**
```
Quote (ChargeSource) → Invoice (ChargeSource) → Sync → Accounting (Xero/MYOB)
                                                          ↓ (GST calc)
                                                       BAS Ready
```

**Status:** ❌ **Not Implemented**

---

### 2. CRM Systems (HubSpot, Pipedrive)

**Planned Functionality:**
- Lead capture from demo requests
- Contact sync (contractor ↔ CRM)
- Deal tracking (quote → deal)
- Activity logging (quote sent, viewed, accepted)

**Status:** ⚠️ **Stub Code Only**

**Current Code State:**
- `client/lib/services/customerProviders/hubspotProvider.ts` — methods defined but require API keys
- `server/routes/crm-leads.ts` — endpoint simulates success, no real API calls

**Missing:**
- API key authentication (server-side secure storage)
- Real API calls to HubSpot/Pipedrive
- Error handling and retry logic

---

### 3. Email/Transactional Services (SendGrid, AWS SES)

**Planned Functionality:**
- Demo request confirmation emails
- Quote sent notifications
- Invoice delivery
- Support ticket notifications

**Status:** ❌ **Stubbed, No Real Sending**

**Current Code State:**
- `server/routes/email-confirmation.ts` — sendEmail() logs instead of sending
- Template defined but no provider integration

**Missing:**
- SendGrid or AWS SES API configuration
- API key in server environment
- Real email sending implementation
- Bounce/delivery tracking

---

### 4. Payment Processors (Stripe, PayPal)

**Planned Functionality:**
- Accept deposits for quotes
- Invoice payment collection
- Subscription payments

**Status:** ⚠️ **UI Ready, Logic Incomplete**

**Missing:**
- Stripe/PayPal API keys
- Webhook handlers for payment confirmation
- PCI compliance setup

---

### 5. Google Maps API

**Used For:**
- Project location visualization
- Geocoding addresses → lat/lng

**Status:** ⚠️ **Partial**

**Current Code State:**
- `client/pages/Projects.tsx` — loads Google Maps script (line 473-476)
- Map requires valid API key; geocoding not implemented

**Missing:**
- Address geocoding service
- Real-time marker updates
- Route optimization

---

### 6. Supabase Edge Functions

**Deployed Functions:**

| Function | Purpose | Status |
|----------|---------|--------|
| `secure-file-upload` | Secure file upload handler | ⚠️ Stub |
| `secure-file-list` | List files with permissions | ⚠️ Stub |
| `secure-file-delete` | Delete files with auth | ⚠️ Stub |
| `generate-quote-pdf` | Server-side PDF generation | ⚠️ Stub |
| `calculate-quote-totals` | Real-time total calculation | ⚠️ Stub |

**Missing:**
- Functions not deployed to Supabase
- Deno environment requires SUPABASE_SERVICE_ROLE_KEY
- Edge function endpoints not called from client

---

## AUSTRALIAN REGULATORY COMPLIANCE

### 1. **AS/NZS 3000 Electrical Standards**

**What is AS/NZS 3000?**
- Australian/New Zealand Standard for safe electrical installation
- Mandatory compliance for all electrical work
- Covers AC installations, safety switching, earthing, protection

**ChargeSource Implementation:**
- ✅ Compliance checklist in Project Wizard (Step 5)
- ✅ Automatic items per charger/site type
- ✅ Documentation tracking (cert retention, inspection)
- ⚠️ Audit trail incomplete (who signed off, when)

**Required Electrical Certifications:**
- **Electrical Installation Certificate** — signed by licensed electrician
- **Inspection Certificate** — signed by authorised inspector
- **Test Report** — electrical testing results

---

### 2. **Licensing & Credentials**

**Electrical Contractor License:**
- Required in all Australian states
- State-specific (NSW, VIC, QLD, etc.)
- Must be displayed and current

**ChargeSource:**
- ❌ No license verification system
- ⚠️ Can track certification dates in profile
- 🔄 Future: Integrate with state licensing bodies

---

### 3. **GST (Goods & Services Tax)**

**Australian GST (10%)**
- Mandatory for businesses with turnover > $75,000
- Applied to most goods/services
- Quarterly BAS (Business Activity Statement) reporting required

**ChargeSource Implementation:**
- ✅ Auto-calculate GST in quotes
- ✅ Global settings for GST rate (10% default)
- ✅ Quote totals: Subtotal → GST → Total
- ⚠️ BAS export not implemented

---

### 4. **Data Privacy & Protection**

**Privacy Act 1988 (Australian):**
- Contractors collect customer PII (name, address, payment details)
- Must comply with Australian Privacy Principles (APPs)

**ChargeSource:**
- ✅ Supabase handles encryption at rest
- ⚠️ Audit logs incomplete (who accessed what data)
- ❌ Right-to-be-forgotten (data deletion) not automated
- ❌ Data portability export incomplete

---

### 5. **Consumer Law**

**Australian Consumer Law (ACL):**
- Consumer has right to refund if service not delivered
- Contractor must provide clear scope and timeline

**ChargeSource:**
- ✅ Scope of work documented in quotes
- ✅ Project timeline tracking
- ⚠️ Dispute/refund workflow not implemented

---

### 6. **Workplace Health & Safety**

**Work Health & Safety Act (2011):**
- Electrical contractors responsible for safe work practices
- Must manage electrical hazards (electrocution, arc flash, etc.)

**ChargeSource:**
- ⚠️ Safety checklist in Compliance module (incomplete)
- ❌ Incident reporting not implemented
- ❌ SWMS (Safe Work Method Statement) templates not provided

---

## DEPLOYMENT & INFRASTRUCTURE

### Development Environment
```bash
npm run dev                 # Start Vite + Express dev server on port 8080
npm run typecheck          # TypeScript validation
npm test                   # Run Vitest tests
```

### Production Build
```bash
npm run build              # Build client (dist/spa) + server (dist/server)
npm start                  # Start production server
npm run build:optimized    # Optimized build with compression
```

### Deployment Targets
1. **Netlify** (recommended)
   - Uses `netlify/functions/api.ts` wrapper
   - Serverless function environment
   - Auto HTTPS, CDN, analytics

2. **Vercel** (alternative)
   - Requires API route setup
   - Similar serverless model
   - Better for Next.js projects

3. **Self-hosted** (Docker/VPS)
   - `npm run build && npm start`
   - Requires Node.js runtime
   - Manual SSL/CDN setup

---

### Environment Variables

#### **Required (Client)**
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
```

#### **Required (Server)**
```env
SUPABASE_SERVICE_ROLE_KEY=xxx
PORT=3000 (or 8080 in dev)
```

#### **Optional**
```env
VITE_GOOGLE_MAPS_API_KEY=xxx
VITE_SENTRY_DSN=xxx
SENDGRID_API_KEY=xxx
HUBSPOT_API_KEY=xxx
```

---

### Database Migrations

Setup scripts in `scripts/`:
- `setup-supabase.js` — Create tables, RLS policies, sample data
- `create-buckets.js` — Create storage buckets
- `setup-charge-source-storage.js` — Combined setup

**To run (requires SUPABASE_SERVICE_ROLE_KEY):**
```bash
node scripts/setup-supabase.js
node scripts/create-buckets.js
```

---

## ROADMAP & FUTURE ENHANCEMENTS

### Q1 2025: Core Fixes & Reliability
- [x] Verify Supabase connection stability
- [ ] Fix ProjectWizard cloud save (enable Supabase sync)
- [ ] Implement geocoding for project addresses
- [ ] Deploy Supabase edge functions
- [ ] Configure real transactional email (SendGrid)
- [ ] Google OAuth full testing & documentation

**Priority: HIGH**

---

### Q2 2025: Integrations & Automation
- [ ] Implement Xero integration (quote → invoice → accounting)
- [ ] Implement HubSpot CRM lead sync
- [ ] Real payment processing (Stripe checkout)
- [ ] Automated demo request email workflow
- [ ] Supplier quote automation

**Priority: HIGH**

---

### Q3 2025: Advanced Features
- [ ] Real-time quote collaboration (WebSocket)
- [ ] Mobile app (React Native)
- [ ] Advanced reporting & BI dashboards
- [ ] Predictive pricing AI (ML-based charger recommendations)
- [ ] Multi-tenancy & white-label portals

**Priority: MEDIUM**

---

### Q4 2025: Compliance & Scale
- [ ] State electrical licensing integration
- [ ] MYOB integration with BAS export
- [ ] QuickBooks integration
- [ ] Advanced audit logging (GDPR compliance)
- [ ] High-availability deployment (multi-region)

**Priority: MEDIUM**

---

## KNOWN ISSUES & LIMITATIONS

### Critical Issues
1. **Cloud Persistence Not Fully Wired**
   - ProjectWizard saves only to localStorage
   - Supabase integration incomplete
   - Fix: Implement projectService.createProject/updateProject calls

2. **Email Sending Stubbed**
   - Demo confirmations simulated (see server/routes/email-confirmation.ts:158)
   - No real emails sent
   - Fix: Configure SendGrid/AWS SES and implement sendEmail()

3. **CRM Lead Submission Simulated**
   - HubSpot/Pipedrive APIs not called (see server/routes/crm-leads.ts:52)
   - Fix: Implement real API calls with secure API key handling

4. **Storage Buckets Not Auto-Created**
   - Manual setup required (`/api/create-storage-buckets` endpoint or scripts)
   - Edge functions not deployed
   - Fix: Run setup scripts with SUPABASE_SERVICE_ROLE_KEY present

### Medium Issues
1. **Google Maps Geocoding Missing**
   - Project coordinates undefined (projects.tsx:271)
   - Map shows only projects with manual lat/lng
   - Fix: Implement geocoding service (Google or server-side alternative)

2. **Project Deletion Not Cloud-Wired**
   - Projects deleted from localStorage only (projects.tsx:634-636)
   - Fix: Call projectService.deleteProject(id) when Supabase connected

3. **Google OAuth Configuration**
   - Requires proper Supabase provider setup
   - Redirect URIs must match deployed domains
   - Fix: Configure in Supabase dashboard + Google Cloud Console

### Low Priority
1. **Multi-Factor Authentication** — Not implemented
2. **Advanced Report Builder** — UI only, no custom logic
3. **Incident Reporting** — Safety module incomplete
4. **Scheduled Report Emails** — Not automated
5. **API Key Authentication** — UI present, not functional

---

## DEVELOPER GUIDE FOR IMPLEMENTATION

### For New Developers:

1. **Read AGENTS.md** for architecture and conventions
2. **Review CHARGESOURCE_REQUIREMENTS.md** (this document) for feature status
3. **Check `client/pages/__tests__/` for test examples**
4. **Review `client/lib/supabase.ts` for data layer patterns**
5. **Understand Supabase RLS (Row-Level Security) for data permissions**
6. **Test against real Supabase instance (not mocks) before merge**

### Key Development Files:
- `client/App.tsx` — Route definitions, provider setup
- `client/lib/supabase.ts` — Supabase client, projectService
- `client/hooks/useAuth.tsx` — Auth state and operations
- `server/index.ts` — API endpoints, server config
- `supabase/functions/*` — Deno edge functions (requires deployment)

### Before Deploying:
1. Run `npm run typecheck` (no TS errors)
2. Run `npm test` (tests pass)
3. Test with real Supabase credentials
4. Verify edge functions deployed
5. Test storage buckets accessible
6. Verify email sending works (SendGrid configured)
7. Test OAuth flows with real Google account

---

## APPENDIX: TECHNICAL DEBT

| Item | Severity | Effort | Notes |
|------|----------|--------|-------|
| Supabase auto-config heuristics | Medium | Medium | Multiple fallback modes, hard to debug |
| localStorage vs Supabase inconsistency | High | Medium | Data sync issues across devices |
| Edge function deployment workflow | Medium | High | Manual process, no CI/CD automation |
| Email provider configuration | High | Medium | Requires manual setup, no defaults |
| CRM API authentication | Medium | High | Secure key storage needed |
| Test coverage (E2E) | Medium | High | No Cypress/Playwright suite |
| Type safety (any types) | Low | Medium | Some JSONB fields use `any` |
| Real-time sync | Low | High | No WebSocket for live collab |

---

## CONCLUSION

ChargeSource is a **comprehensive, feature-rich platform** with strong core functionality (project planning, quoting, document management) and a well-designed architecture (React + Supabase + Edge Functions). However, **several integrations and cloud-dependent features are incomplete** and require configuration/deployment before production use.

### Immediate Priority (1-2 weeks):
1. Verify Supabase setup (tables, buckets, edge functions)
2. Implement cloud save in ProjectWizard
3. Configure real email sending (SendGrid)
4. Test Google OAuth in all environments

### Medium Priority (2-4 weeks):
1. Implement Xero/MYOB integration
2. Add geocoding for project locations
3. Deploy Supabase edge functions
4. Configure HubSpot CRM sync

### Long-term Priority (1-3 months):
1. Advanced features (real-time collab, mobile app, advanced reporting)
2. Compliance enhancements (licensing verification, BAS export)
3. Performance optimization (caching, pagination, analytics)

**Status:** ✅ **Ready for beta with configuration** | 🔄 **Full production use requires integration completion**

---

*Document prepared for developer onboarding and stakeholder alignment.*  
*For questions or clarifications, contact the development team.*
