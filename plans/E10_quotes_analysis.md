# E10 Quotes UI - Analysis and Design Document

## 🎯 **EPIC GOAL**
To enhance and complete the existing Quotes UI with a comprehensive quote builder, line item management, pricing calculations, and approval workflows.

---

## 📋 **REQUIREMENTS ANALYSIS**

### **1. Routes & Page Structure:**
- **Route**: `/quotes` (List view with filters and search)
- **Route**: `/quotes/:id` (Details view with builder UI)
- **Page**: Enhance existing `src/pages/QuotesPage.tsx` and `QuotesListScreen.tsx`
- **Page**: Create comprehensive `src/pages/Quotes/Details.tsx` with builder UX

### **2. Existing Backend API (Already Implemented):**
Based on backend analysis, we have:
- **File**: `apps/backend/src/modules/quotes/`
- **Endpoints**:
  - `GET /api/v1/quotes` - List quotes with filtering
  - `POST /api/v1/quotes` - Create new quote
  - `GET /api/v1/quotes/:id` - Get quote details
  - `PUT /api/v1/quotes/:id` - Update quote
  - `POST /api/v1/quotes/:id/status` - Update quote status
- **Validation**: Backend uses TypeBox schemas for API validation

### **3. Frontend API Hooks Enhancement:**
- **File**: `src/features/quotes/api.ts` (new dedicated module)
- **Hooks Needed**:
  - `useQuotes`: List quotes with pagination, filtering, sorting
  - `useQuote`: Get single quote by ID
  - `useCreateQuote`: Create new quote
  - `useUpdateQuote`: Update quote details
  - `useAddLineItem`: Add line item to quote
  - `useUpdateLineItem`: Update existing line item
  - `useDeleteLineItem`: Remove line item
  - `useSetDiscount`: Apply discount to quote
  - `useSubmitQuote`: Submit quote for approval
  - `useUpdateQuoteStatus`: Change quote status
- **Validation**: Backend uses TypeBox schemas, frontend uses TypeScript types (project standard)

### **4. UI Components & Builder UX:**
- **`QuoteLineTable.tsx`**: Inline editable table for line items
- **`QuoteSummaryCard.tsx`**: Display server-calculated totals
- **`DiscountEditor.tsx`**: Percentage/fixed discount management
- **`CustomerSelector.tsx`**: Customer selection with search
- **Builder Features**:
  - Inline validation for line items
  - Keyboard editing (Enter to save)
  - Live regions for total changes (aria-live="polite")
  - No optimistic updates for money - echo server truth

### **5. Database Schema (Already Implemented):**
```sql
quotes table:
- id, organization_id, quote_number, customer_id, project_id
- title, description, status, type
- valid_from, valid_until, currency, exchange_rate
- subtotal, tax_rate, tax_amount
- discount_type, discount_value, discount_amount
- total_amount (server-calculated)
- terms_conditions, notes, internal_notes
- created_by, approved_by, approved_at, sent_at, accepted_at
- metadata (JSONB), created_at, updated_at, deleted_at

quote_line_items table:
- id, quote_id, organization_id
- service_category_id, role_id, rate_card_item_id
- description, quantity, unit_price, line_total
- tax_rate, tax_amount, discount_rate, discount_amount
- metadata, created_at, updated_at
```

---

## 🎯 **TECHNICAL ARCHITECTURE**

### **Frontend (React/TypeScript):**
- **State Management**: React Query for server state, Zustand for UI state
- **Routing**: React Router for `/quotes` and `/quotes/:id`
- **Forms**: Controlled components with Zod validation
- **Real-time Updates**: Server-side calculations only
- **Accessibility**: ARIA live regions, keyboard navigation

### **Backend (Fastify/Drizzle/PostgreSQL):**
- **API Endpoints**: RESTful with TypeBox validation
- **Database**: Existing quotes and quote_line_items tables
- **Service Layer**: QuoteService with business logic
- **Calculations**: Server-side totals, tax, discounts

---

## 🎨 **UX & ACCESSIBILITY REQUIREMENTS**

### **Builder UX:**
- **Inline Editing**: Click-to-edit line items
- **Keyboard Shortcuts**: Enter to save, Esc to cancel
- **Live Updates**: Totals update immediately (from server)
- **Visual Feedback**: Loading states, success/error indicators

### **Accessibility:**
- **ARIA Live Regions**: `aria-live="polite"` for total changes
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader**: Proper labels and descriptions
- **Focus Management**: Logical tab order

### **Error Handling:**
- **Inline Validation**: Real-time field validation
- **Error Envelopes**: Structured error responses
- **User Feedback**: Clear error messages and recovery paths

---

## 🧪 **TESTING STRATEGY**

### **Unit Tests (Vitest/RTL):**
- **`QuoteLineTable.test.tsx`**: Line item add/edit/delete operations
- **`QuoteSummaryCard.test.tsx`**: Server total display and formatting
- **`DiscountEditor.test.tsx`**: Discount rule variations (percentage/fixed)
- **`CustomerSelector.test.tsx`**: Customer search and selection

### **E2E Tests (Playwright):**
- **`e2e/quotes.smoke.spec.ts`**: Complete workflow
  - Create new quote
  - Add line items
  - Apply discounts
  - Save changes
  - Reopen and verify totals
  - Submit for approval

### **Storybook:**
- **Price Calculation Visuals**: Server responses via MSW
- **Component States**: Loading, error, success states
- **Accessibility**: Focus states, keyboard navigation

---

## 🎯 **ACCEPTANCE CRITERIA**

### **Functional:**
- ✅ User can view list of quotes with filtering/sorting
- ✅ User can create new quotes with customer selection
- ✅ User can add/edit/delete line items with inline editing
- ✅ User can apply percentage or fixed discounts
- ✅ All totals calculated server-side (no client calculation)
- ✅ User can submit quotes for approval workflow
- ✅ Keyboard navigation works throughout builder

### **Technical:**
- ✅ No deviation from pricing contracts (server truth)
- ✅ CSP (Content Security Policy) intact
- ✅ Accessibility clean (WCAG compliance)
- ✅ TypeBox backend validation + TypeScript frontend types
- ✅ Performance budget maintained

### **UX:**
- ✅ Intuitive quote builder with clear workflow
- ✅ Real-time feedback without optimistic updates
- ✅ Error states handled gracefully
- ✅ Mobile-responsive design

---

## 📊 **EXISTING IMPLEMENTATION STATUS**

### **✅ Already Implemented:**
- **Backend API**: Complete quotes module with TypeBox validation
- **Database Schema**: Quotes and quote_line_items tables
- **Basic Frontend**: QuotesListScreen with filtering and pagination
- **API Queries**: Basic useQuotesList, useCreateQuote hooks
- **Route Structure**: Basic routing in AppRouter

### **🔧 Needs Enhancement/Implementation:**
- **Quote Details Page**: Comprehensive builder UI
- **Line Item Management**: Inline editing table
- **Discount Management**: DiscountEditor component
- **Customer Selection**: Enhanced CustomerSelector
- **API Hooks**: Complete CRUD operations with Zod
- **Testing**: Comprehensive RTL and E2E coverage
- **Accessibility**: ARIA live regions and keyboard support

---

## 🚀 **IMPLEMENTATION PLAN**

### **Phase 1: API Layer Enhancement**
1. Create dedicated `src/features/quotes/api.ts` with Zod validation
2. Implement all required hooks (addLineItem, updateLineItem, etc.)
3. Add proper error handling and type safety

### **Phase 2: Quote Builder UI**
1. Create QuoteLineTable with inline editing
2. Implement QuoteSummaryCard with server totals
3. Build DiscountEditor for percentage/fixed discounts
4. Enhance CustomerSelector with search

### **Phase 3: Details Page**
1. Create comprehensive quote details page
2. Integrate all components into builder UX
3. Add keyboard navigation and accessibility

### **Phase 4: Testing & Polish**
1. Comprehensive unit tests for all components
2. E2E smoke tests for complete workflow
3. Storybook stories with MSW integration
4. Accessibility audit and compliance

---

## 🏁 **REPORTING**
- **File**: `plans/E10_quotes_report.md`
- **Content**: Detailed status, completed tasks, performance metrics, and acceptance verification

---

## 📈 **SUCCESS METRICS**

### **Performance:**
- Quote details page load ≤ 50KB gzipped
- Line item operations ≤ 200ms response time
- Smooth 60fps interactions

### **Accessibility:**
- WCAG 2.1 AA compliance
- Screen reader compatibility
- Keyboard-only navigation

### **Functionality:**
- 100% server-calculated totals accuracy
- Zero pricing contract deviations
- Complete approval workflow support
