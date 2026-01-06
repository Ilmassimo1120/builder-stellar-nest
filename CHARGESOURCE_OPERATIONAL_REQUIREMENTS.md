# ChargeSource Operational Requirements Checklist

**Last Updated:** January 2025  
**Status:** 50% Complete (13 of 26 requirements implemented)  
**Production Readiness:** 65% → Target 100%

---

## 🎯 Quick Status Summary

| Category                | Status  | Notes                                                |
| ----------------------- | ------- | ---------------------------------------------------- |
| **Core Infrastructure** | ⚠️ 70%  | Supabase connected, buckets need manual creation     |
| **Cloud Persistence**   | 🔴 30%  | ProjectWizard/Projects still use localStorage        |
| **Email System**        | 🔴 0%   | SendGrid integration stubbed, not implemented        |
| **Geocoding**           | 🔴 0%   | Google Maps API key present but not integrated       |
| **CRM Integrations**    | 🔴 0%   | HubSpot/Pipedrive stubs present, no live API calls   |
| **File Storage**        | ✅ 100% | Document buckets, upload service, RLS policies ready |
| **Authentication**      | ✅ 95%  | Google OAuth configured, some edge cases remain      |
| **Database Schema**     | ✅ 100% | Tables, views, triggers, RLS policies in place       |
| **Performance**         | ✅ 90%  | Lazy loading, caching, bundle optimization done      |
| **Security**            | ⚠️ 75%  | RLS policies good, needs CSP headers & rate limiting |

---

## 🔴 CRITICAL PATH - Must Complete Before Production

### 1. **Supabase Storage Buckets Setup**

**Status:** ⚠️ Needs Manual Action  
**Priority:** CRITICAL  
**Effort:** 5 minutes

**What's missing:**

- 3 storage buckets not created in Supabase Dashboard

**Required Actions:**

1. Open Supabase Dashboard → Storage
2. Create these 3 private buckets:
   - `charge-source-user-files` (50MB limit)
   - `charge-source-documents` (100MB limit)
   - `charge-source-videos` (500MB limit)

**Verification:**

- Run: `npm run test:buckets` (if script exists)
- Or manually verify in Supabase Storage UI

**Files involved:**

- `client/lib/services/simpleDocumentService.ts` (already configured for these bucket names)
- `supabase/migrations/` (schema already supports)

---

### 2. **ProjectWizard Cloud Save Implementation**

**Status:** 🔴 Not Implemented  
**Priority:** CRITICAL  
**Effort:** 4 hours

**What's missing:**

- ProjectWizard still saves to `localStorage` only
- No cloud sync with Supabase `projects` table
- TODO comment at: `client/pages/ProjectWizard.tsx:515`

**Required Changes:**

- Replace localStorage calls with `projectService.createProject()` / `projectService.updateProject()`
- Handle Supabase connection failures with graceful fallback to localStorage
- Add loading states and error notifications during cloud save

**Files to modify:**

- `client/pages/ProjectWizard.tsx` (main wizard component)
- `client/lib/services/projectService.ts` (already has methods, just needs usage)
- `client/hooks/useProjects.ts` (update hook to support cloud sync)

**Test case:**

- Create a project → Should auto-save to Supabase
- Refresh page → Project data persists from cloud
- Switch projects → Cloud data loads correctly

---

### 3. **Project Cloud Delete Implementation**

**Status:** 🔴 Not Implemented  
**Priority:** CRITICAL  
**Effort:** 2 hours

**What's missing:**

- Projects.tsx delete handler doesn't call cloud API
- Line reference: `client/pages/Projects.tsx` (handleDeleteProject)

**Required Changes:**

- Call `projectService.deleteProject(projectId)` when user confirms delete
- Handle Supabase errors gracefully
- Update UI after successful deletion

**Files to modify:**

- `client/pages/Projects.tsx` (delete handler)
- `client/lib/services/projectService.ts` (already has deleteProject method)

**Test case:**

- Delete a project → Should remove from Supabase
- Project list updates immediately
- Cannot re-access deleted project

---

### 4. **SendGrid Email Configuration**

**Status:** 🔴 Stubbed (0% Implementation)  
**Priority:** CRITICAL (Transactional emails required by law)  
**Effort:** 3 hours

**What's missing:**

- SendGrid integration is commented out
- Lines 141-156 in `server/routes/email-confirmation.ts`
- No production email provider configured
- Emails not sending to contractors/clients

**Required Changes:**

1. Get SendGrid API key from environment or configure AWS SES as alternative
2. Uncomment/implement sendEmail function in email-confirmation.ts
3. Add email templates (welcome, quote confirmation, project updates)
4. Test email delivery to real addresses

**Files to modify:**

- `server/routes/email-confirmation.ts` (uncomment SendGrid logic)
- `server/routes/email-templates.ts` (if exists, or create)
- `.env` / environment config (add SENDGRID_API_KEY)

**Environmental Config Needed:**

```
SENDGRID_API_KEY=SG.xxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@chargesource.com.au
```

**Test case:**

- Submit project → Confirmation email sent
- Check inbox → Email arrives with project details
- Email contains correct branding/templates

---

### 5. **Google Maps Geocoding Integration**

**Status:** 🔴 Not Implemented (API key present but unused)  
**Priority:** HIGH (Core feature for address mapping)  
**Effort:** 3 hours

**What's missing:**

- VITE_GOOGLE_MAPS_API_KEY exists in env, but not used
- No geocoding service implemented
- Address coordinates not populated for maps
- Map markers missing

**Required Changes:**

1. Create `client/lib/services/geocodingService.ts`
2. Implement Google Geocoding API calls
3. Integrate into ProjectWizard address field (auto-complete + coordinates)
4. Update Projects map display to show geocoded locations
5. Handle rate limits and errors gracefully

**Files to create/modify:**

- Create: `client/lib/services/geocodingService.ts`
- Modify: `client/pages/ProjectWizard.tsx` (address field)
- Modify: `client/pages/Projects.tsx` (map display)
- Modify: `client/components/ProjectMap.tsx` (if exists)

**Test case:**

- Enter address in wizard → Autocomplete suggestions appear
- Select address → Coordinates populated
- Map shows correct location marker
- Multiple addresses handled correctly

---

## 🟠 HIGH PRIORITY - Complete Within Week 1

### 6. **CRM Integration - HubSpot/Pipedrive**

**Status:** 🔴 Stubbed (0% Implementation)  
**Priority:** HIGH  
**Effort:** 8 hours

**What's missing:**

- `server/routes/crm-leads.ts` has placeholder code only
- No real API calls to HubSpot or Pipedrive
- Leads not syncing to external CRM
- No authentication with CRM providers

**Required Changes:**

1. Add CRM API keys to environment
2. Implement real HubSpot/Pipedrive API integration
3. Create contact/deal on project submission
4. Map ChargeSource fields to CRM fields
5. Handle CRM API errors gracefully

**Files to modify:**

- `server/routes/crm-leads.ts` (implement real API calls)
- Create: `server/lib/crm/hubspotClient.ts` (if using HubSpot)
- Create: `server/lib/crm/pipedriveClient.ts` (if using Pipedrive)

**Environmental Config Needed:**

```
HUBSPOT_API_KEY=pat-xxxxxxxxxxxx (if using HubSpot)
PIPEDRIVE_API_KEY=xxxxxxxxxxxx (if using Pipedrive)
PIPEDRIVE_COMPANY_DOMAIN=company.pipedrive.com (if using Pipedrive)
```

**Test case:**

- Submit project → Lead appears in CRM
- Contact info synced correctly
- Deal/opportunity created in CRM
- Updates flow both directions (optional)

---

### 7. **Edge Functions Deployment**

**Status:** 🔴 Not Deployed  
**Priority:** HIGH  
**Effort:** 4 hours

**What's missing:**

- Edge functions exist in code but not deployed to Supabase
- `secure-file-upload`, `list-files`, `delete-file` functions
- `generate-quote-pdf` function for PDF generation
- Fallback to Netlify functions not validated

**Required Changes:**

1. Deploy all Edge Functions to Supabase
2. Verify functions work in production environment
3. Configure proper authentication/JWT validation
4. Test error handling and timeouts
5. Set up fallback if Edge Functions fail

**Files involved:**

- `supabase/functions/secure-file-upload/index.ts`
- `supabase/functions/list-files/index.ts`
- `supabase/functions/delete-file/index.ts`
- `supabase/functions/generate-quote-pdf/index.ts`

**Deployment Command:**

```bash
supabase functions deploy secure-file-upload
supabase functions deploy list-files
supabase functions deploy delete-file
supabase functions deploy generate-quote-pdf
```

**Test case:**

- Upload file → Edge function processes
- Generate quote → PDF created and returned
- Delete file → Edge function removes from storage
- All functions return proper errors on failure

---

### 8. **Google OAuth Configuration Validation**

**Status:** ⚠️ 80% Complete (may have redirect URI issues)  
**Priority:** HIGH  
**Effort:** 2 hours

**What's missing:**

- OAuth might not work in all environments (dev/prod)
- Redirect URIs may not be configured for production domain
- Google credentials may need refresh
- Callback handling needs validation

**Required Changes:**

1. Verify Google OAuth credentials in Supabase
2. Add production domain to redirect URIs
3. Test OAuth flow in staging environment
4. Test OAuth flow in production environment
5. Document fallback to email/password if OAuth fails

**Files involved:**

- `client/lib/auth/authService.ts` (OAuth implementation)
- `server/routes/auth-callback.ts` (if needed)
- Supabase console: Authentication → Providers → Google

**Test case:**

- Click "Sign in with Google"
- OAuth popup appears
- Redirects back to app after auth
- User session created correctly
- Works in both dev and prod environments

---

### 9. **Database Migrations & Setup Scripts Validation**

**Status:** ⚠️ 85% Complete (scripts exist, need staging validation)  
**Priority:** HIGH  
**Effort:** 3 hours

**What's missing:**

- Setup scripts (`scripts/setup-supabase.js`, `create-buckets.js`) not validated in staging
- May have environment-specific issues
- Bucket creation script may fail silently
- Database schema consistency not verified across envs

**Required Changes:**

1. Run `npm run setup:supabase` in staging environment
2. Verify all tables created correctly
3. Verify all indexes exist
4. Verify RLS policies applied
5. Verify triggers working (updated_at auto-update)
6. Validate bucket creation script

**Scripts to validate:**

- `scripts/setup-supabase.js`
- `scripts/create-buckets.js`
- Migrations in `supabase/migrations/`

**Commands to run:**

```bash
# Test in staging/branch environment
npm run setup:supabase
npm run setup:buckets

# Verify in Supabase dashboard
# - Check Table Editor
# - Check Storage → Buckets
# - Check Functions
```

**Test case:**

- Fresh Supabase project → Run setup scripts
- All tables appear in dashboard
- All buckets created
- Can insert test data
- RLS policies work correctly

---

## 🟡 MEDIUM PRIORITY - Complete Within Month 1

### 10. **Accounting Integration Stubs - Xero/MYOB**

**Status:** 🔴 Stubbed  
**Priority:** MEDIUM  
**Effort:** 6 hours each

**What's missing:**

- Xero/MYOB integration stubbed in code
- No invoice creation in accounting software
- No financial data sync
- No tax calculation integration

**Files involved:**

- Identify accounting service files in `client/lib/services/` or `server/`
- May need: `accountingService.ts`, `xeroClient.ts`, `myobClient.ts`

**Implementation approach:**

- Get API keys from Xero/MYOB developer portal
- Implement invoice/bill creation on project completion
- Sync payment status
- Handle reconciliation

---

### 11. **TypeScript Strict Mode Migration**

**Status:** ⚠️ Framework ready, 30% migrated  
**Priority:** MEDIUM  
**Effort:** 8 hours

**What's missing:**

- Many files still use `any` types
- Strict mode not enabled across entire project
- Type safety gaps in service layer

**Files to migrate:**

- Focus on service layer first
- Then components
- Finally utilities

**Command to find issues:**

```bash
# Compile with strict mode
npx tsc --noImplicitAny --strictNullChecks
```

---

### 12. **Production Security Headers**

**Status:** 🔴 Not Implemented  
**Priority:** MEDIUM  
**Effort:** 2 hours

**What's missing:**

- No Content Security Policy (CSP)
- No HSTS headers
- No X-Frame-Options
- Vulnerable to XSS/clickjacking

**Required changes:**

- Add middleware in `server/main.ts` or Netlify redirects
- Configure CSP for Supabase, Google Maps, SendGrid domains
- Test header presence in production

---

### 13. **Testing Implementation - 60% Coverage**

**Status:** 🔴 Minimal coverage  
**Priority:** MEDIUM  
**Effort:** 16 hours

**What's missing:**

- No unit tests for services
- No integration tests for API routes
- No E2E tests for user workflows
- Vitest/Playwright not configured for CI/CD

**Files to create:**

- `client/lib/services/__tests__/` (service tests)
- `server/routes/__tests__/` (API tests)
- `playwright/` (E2E tests)

---

## 🟢 LOW PRIORITY - Nice to Have (Post-Launch)

### 14. **Monitoring & Error Tracking - Sentry Integration**

**Status:** 🔴 Not Configured  
**Priority:** LOW  
**Effort:** 3 hours

**Setup:**

- Create Sentry account
- Add Sentry SDK to React app
- Configure error reporting
- Set up alerts for production errors

---

### 15. **Performance Monitoring - Web Vitals**

**Status:** 🔴 Not Configured  
**Effort:** 2 hours

**Setup:**

- Implement Web Vitals tracking
- Set up dashboard to monitor CLS, LCP, FID
- Configure performance budgets

---

### 16. **SEO Optimization**

**Status:** 🔴 Minimal  
**Effort:** 4 hours

**Tasks:**

- Add meta tags for social sharing
- Create sitemap.xml
- Add robots.txt
- Configure Open Graph tags

---

### 17. **PDF Export Functionality**

**Status:** ⚠️ Edge Function ready, needs testing  
**Effort:** 2 hours

**Task:**

- Test `generate-quote-pdf` edge function
- Integrate quote download into UI
- Test PDF generation with various quote sizes

---

## 📋 Operational Readiness Scorecard

### Functional Features

| Feature                   | Status  | Blocker            | Owner    |
| ------------------------- | ------- | ------------------ | -------- |
| Project Creation (Wizard) | ⚠️ 50%  | Cloud save stub    | Backend  |
| Project Management        | ⚠️ 50%  | Cloud delete stub  | Backend  |
| Quote Generation          | ✅ 95%  | —                  | Frontend |
| Document Management       | ✅ 100% | —                  | Backend  |
| Email Notifications       | 🔴 0%   | SendGrid not impl. | Backend  |
| Geocoding/Maps            | 🔴 0%   | Service not impl.  | Frontend |
| CRM Integration           | 🔴 0%   | API not impl.      | Backend  |
| User Authentication       | ✅ 95%  | Minor edge cases   | Backend  |
| File Storage              | ✅ 100% | —                  | Backend  |

### Infrastructure

| Component          | Status  | Notes                              |
| ------------------ | ------- | ---------------------------------- |
| Supabase Database  | ✅ 100% | All tables created, RLS configured |
| Storage Buckets    | 🔴 0%   | 3 buckets need manual creation     |
| Edge Functions     | ⚠️ 50%  | Code ready, not deployed           |
| Netlify Hosting    | ✅ 100% | Configured, ready to deploy        |
| Environment Config | ⚠️ 80%  | Needs CRM/Email/Geocoding keys     |

### Quality & Security

| Aspect            | Status | Target        |
| ----------------- | ------ | ------------- |
| TypeScript Strict | ⚠️ 30% | 100%          |
| Test Coverage     | 🔴 5%  | 80%           |
| Security Headers  | 🔴 0%  | CSP + HSTS    |
| Error Handling    | ✅ 90% | Comprehensive |
| Performance       | ✅ 90% | 3s load time  |

---

## 🚀 Implementation Timeline

### Week 1: Critical Path

- [ ] Create storage buckets (5 min)
- [ ] Implement ProjectWizard cloud save (4 hrs)
- [ ] Implement project delete (2 hrs)
- [ ] Configure SendGrid (3 hrs)
- [ ] Validate OAuth config (2 hrs)
- [ ] Run staging database setup (1 hr)

**Total: 12 hours | Target: Launch with 80% features**

### Week 2: High Priority

- [ ] Implement geocoding service (3 hrs)
- [ ] Deploy Edge Functions (2 hrs)
- [ ] Implement CRM integration (8 hrs)
- [ ] Security headers (2 hrs)

**Total: 15 hours | Target: 100% critical features**

### Month 1: Medium Priority

- [ ] TypeScript migration (8 hrs)
- [ ] Basic test coverage (16 hrs)
- [ ] Accounting integration (6 hrs)

**Total: 30 hours**

### Post-Launch: Polish

- [ ] Sentry integration (3 hrs)
- [ ] Web Vitals monitoring (2 hrs)
- [ ] SEO optimization (4 hrs)
- [ ] Full test coverage (16 hrs)

---

## ✅ Production Launch Criteria

**MUST HAVE (Blocking Launch):**

- [x] Supabase database schema complete
- [ ] Storage buckets created
- [ ] ProjectWizard saves to cloud
- [ ] Project deletion works in cloud
- [ ] SendGrid emails configured and tested
- [ ] Google OAuth working in production
- [ ] Edge Functions deployed and tested
- [ ] Database setup scripts validated

**SHOULD HAVE (Highly Recommended):**

- [ ] Geocoding working for addresses
- [ ] CRM integration live
- [ ] Basic error monitoring (Sentry)
- [ ] Security headers configured

**NICE TO HAVE (Post-Launch):**

- [ ] 60%+ test coverage
- [ ] Performance monitoring
- [ ] Accounting integration
- [ ] SEO optimization

---

## 📞 Support & Escalation

**For questions on:**

- **Cloud Persistence**: See ProjectWizard/Projects TODOs + projectService.ts
- **Email**: See server/routes/email-confirmation.ts + SendGrid docs
- **Geocoding**: See client/lib/services/geocodingService.ts (to be created)
- **CRM**: See server/routes/crm-leads.ts + API provider docs
- **Storage**: See CHARGESOURCE_PRODUCTION_CHECKLIST.md

**Supabase Dashboard:** https://supabase.com/dashboard  
**Google Maps API:** https://console.cloud.google.com  
**SendGrid:** https://app.sendgrid.com  
**Netlify:** https://netlify.com

---

**Document Status:** Ready for Developer Handoff  
**Next Review:** After implementation of Week 1 items  
**Prepared by:** ChargeSource DevOps Team
