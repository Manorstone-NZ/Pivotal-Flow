# E9 Rate Cards UI - Technical Analysis

## 🎯 **EPIC OVERVIEW**
Build a rate cards management interface with list view and side drawer editing for rate card items. Focus on currency formatting, item editing UX, and pagination.

---

## 🔗 **BACKEND API CONTRACTS**

### **Available Endpoints:**
```typescript
// Rate Cards
GET    /api/v1/rate-cards           → RateCardResponse[]
POST   /api/v1/rate-cards           → RateCardResponse  
PUT    /api/v1/rate-cards/:id       → RateCardResponse
GET    /api/v1/rate-cards/:id       → RateCardResponse

// Rate Card Items  
GET    /api/v1/rate-cards/:id/items → RateCardItemResponse[]
POST   /api/v1/rate-cards/:id/items → RateCardItemResponse
PUT    /api/v1/rate-card-items/:id  → RateCardItemResponse
```

### **Data Structures:**
```typescript
interface RateCardResponse {
  id: string;
  organizationId: string;
  name: string;
  version: string;
  description?: string;
  currency: string;           // ISO 4217 (NZD, USD, EUR, etc.)
  effectiveFrom: string;      // ISO date
  effectiveUntil?: string;    // ISO date
  isDefault: boolean;
  isActive: boolean;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface RateCardItemResponse {
  id: string;
  rateCardId: string;
  organizationId: string;
  serviceCategoryId?: string;
  roleId?: string;
  itemCode: string;
  unit: string;               // "hour", "day", "fixed", etc.
  baseRate: string;           // Stored as string for precision
  currency: string;           // ISO 4217
  taxClass: string;           // "standard", "exempt", etc.
  effectiveFrom: string;
  effectiveUntil?: string;
  isActive: boolean;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}
```

---

## 📊 **PAGINATION REQUIREMENTS**

### **List Pagination:**
- **Default page size**: 25 rate cards
- **Max page size**: 100 rate cards  
- **Query params**: `?page=1&limit=25&search=&status=active`
- **Response format**: `{ data: RateCard[], pagination: { page, limit, total, pages } }`

### **Items Pagination:**
- **Default page size**: 50 items per rate card
- **Max page size**: 200 items
- **Query params**: `?page=1&limit=50&search=&category=`
- **In-drawer scrolling** for large item lists

---

## 🎨 **ITEM EDITING UX PATTERNS**

### **Side Drawer Design:**
```
┌─────────────────┬─────────────────────────┐
│                 │ ✏️ Edit Rate Card        │
│   Rate Cards    │ ─────────────────────── │
│   List          │ 📋 Basic Info           │
│                 │ Name: [____________]    │
│   [Card 1]      │ Currency: [NZD ▼]      │
│ → [Card 2] ←────│ Effective: [Date]       │
│   [Card 3]      │                        │
│                 │ 📊 Rate Items (127)     │
│                 │ ┌─────────────────────┐ │
│                 │ │ Code  │ Rate │ Unit │ │
│                 │ │ DEV01 │ $120 │ hour │ │
│                 │ │ PM02  │ $150 │ hour │ │
│                 │ │ ...   │ ...  │ ...  │ │
│                 │ └─────────────────────┘ │
│                 │ [+ Add Item]            │
└─────────────────┴─────────────────────────┘
```

### **Inline Editing:**
- **Click to edit** rate values in drawer table
- **Auto-save** on blur/Enter with optimistic updates
- **Validation feedback** for invalid rates
- **Currency formatting** applied immediately

### **Item Actions:**
- ✏️ **Edit inline** - Click rate cell to edit
- 🗑️ **Soft delete** - Mark as inactive
- 📋 **Duplicate** - Copy item with new code
- 📈 **History** - View rate changes over time

---

## 💰 **CURRENCY DISPLAY RULES**

### **Formatting Standards:**
```typescript
interface CurrencyConfig {
  NZD: { symbol: '$', decimals: 2, position: 'before' };
  USD: { symbol: '$', decimals: 2, position: 'before' };
  EUR: { symbol: '€', decimals: 2, position: 'before' };
  GBP: { symbol: '£', decimals: 2, position: 'before' };
  JPY: { symbol: '¥', decimals: 0, position: 'before' };
  AUD: { symbol: '$', decimals: 2, position: 'before' };
}
```

### **Display Examples:**
- **NZD**: `$120.00` (New Zealand Dollar)
- **USD**: `$120.00` (US Dollar)  
- **EUR**: `€120.00` (Euro)
- **GBP**: `£120.00` (British Pound)
- **JPY**: `¥12000` (Japanese Yen - no decimals)

### **Input Validation:**
- **Numeric only** with currency symbol optional
- **Max precision**: 4 decimal places for storage
- **Display precision**: Based on currency rules
- **Range validation**: 0.01 to 999,999.99

---

## 🏗️ **COMPONENT ARCHITECTURE**

### **Page Structure:**
```
/rate-cards
├── RateCardsListPage.tsx          # Main container
├── components/
│   ├── RateCardList.tsx           # Left panel list
│   ├── RateCardDrawer.tsx         # Right panel editor
│   ├── RateCardItemRow.tsx        # Editable item row
│   ├── RateCardItemTable.tsx      # Items table
│   └── Money.tsx                  # Currency formatter
└── hooks/
    ├── useRateCards.ts            # List & CRUD
    ├── useRateCardItems.ts        # Items CRUD
    └── useCurrencyFormatter.ts    # Formatting logic
```

### **State Management:**
- **React Query** for server state
- **Local state** for drawer open/closed
- **Form state** with react-hook-form
- **Optimistic updates** for inline editing

---

## 🔧 **TECHNICAL POLICIES**

### **Data Storage:**
- ❌ **No totals in JSONB** - Calculate dynamically
- ❌ **No prices in JSONB** - Use typed numeric columns
- ✅ **Numeric columns** for baseRate (stored as string)
- ✅ **Server truth** - Reflect backend after save

### **Performance:**
- **Route chunk** ≤ 50KB gzipped
- **Lazy loading** for drawer components
- **Virtual scrolling** for large item lists
- **Debounced search** with 300ms delay

### **Validation:**
- **Zod schemas** for all API calls
- **Client-side** validation for UX
- **Server-side** validation for security
- **Currency precision** validation

---

## 🧪 **TESTING STRATEGY**

### **Unit Tests (RTL):**
```typescript
// Components to test
- RateCardList.test.tsx
- RateCardItemRow.test.tsx  
- Money.test.tsx
- useRateCards.test.tsx
- useCurrencyFormatter.test.tsx
```

### **E2E Tests (Playwright):**
```typescript
// e2e/rate_cards.smoke.spec.ts
test('Rate Cards Workflow', async ({ page }) => {
  // 1. Navigate to rate cards
  await page.goto('/rate-cards');
  
  // 2. Open rate card drawer
  await page.click('[data-testid="rate-card-item"]');
  
  // 3. Edit an item rate
  await page.click('[data-testid="rate-input"]');
  await page.fill('[data-testid="rate-input"]', '150.00');
  
  // 4. Save and verify
  await page.press('[data-testid="rate-input"]', 'Enter');
  await expect(page.locator('[data-testid="rate-display"]')).toHaveText('$150.00');
});
```

### **Contract Tests:**
- **API response** validation with Zod
- **Currency formatting** edge cases
- **Pagination** boundary conditions

---

## 🎯 **ACCEPTANCE CRITERIA**

### **Functional:**
- ✅ Rate cards list loads with pagination
- ✅ Side drawer opens with rate card details
- ✅ Items display with correct currency formatting
- ✅ Inline editing saves optimistically
- ✅ Currency decimals follow locale rules

### **Technical:**
- ✅ Route chunk ≤ 50KB gzipped
- ✅ All API calls use Zod validation
- ✅ Currency formatting handles edge cases
- ✅ Contract tests pass for all endpoints

### **UX:**
- ✅ Smooth drawer animations
- ✅ Loading states for all actions  
- ✅ Error handling with user feedback
- ✅ Keyboard navigation support

---

## 🚀 **IMPLEMENTATION PHASES**

### **Phase 1: Core Structure**
1. Create page routing and layout
2. Build RateCardList component
3. Add basic API hooks

### **Phase 2: Item Management**  
1. Build RateCardDrawer component
2. Create RateCardItemRow with inline editing
3. Implement Money component

### **Phase 3: Polish**
1. Add comprehensive testing
2. Performance optimization
3. Accessibility improvements

### **Phase 4: Validation**
1. Browser visibility testing
2. Performance budget validation
3. E2E smoke test coverage

---

This analysis provides the foundation for implementing a production-ready rate cards interface that meets all technical and UX requirements.
