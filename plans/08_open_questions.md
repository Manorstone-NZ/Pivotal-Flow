# Pivotal Flow - Open Questions & Decisions Required

## 🚨 **Critical Decisions Required**

### **1. Node.js Version Selection**
**Question**: Which Node.js version should we target for production?

**Options**:
- **Node.js 20 LTS** (Recommended)
  - Support until April 2026
  - Excellent performance and stability
  - Full TypeScript 5+ support
  - Most package compatibility

- **Node.js 22 LTS** (Latest)
  - Support until April 2027
  - Latest V8 features and performance
  - Some packages may not be fully compatible yet
  - Future-proof but potential compatibility issues

- **Node.js 18 LTS** (Conservative)
  - Support until April 2025
  - Maximum package compatibility
  - Limited TypeScript 5+ features
  - Shorter support window

**Recommendation**: Node.js 20 LTS
**Rationale**: Best balance of performance, stability, and long-term support

**Decision Required**: ✅ **Damian must approve Node.js version**

---

### **2. Database ORM Selection**
**Question**: Should we use Prisma or Knex.js for database operations?

**Options**:
- **Prisma** (Recommended)
  - Excellent TypeScript integration
  - Auto-generated types
  - Built-in migrations
  - Modern developer experience
  - Strong community support

- **Knex.js**
  - More flexible SQL queries
  - Lighter weight
  - Manual type definitions
  - Traditional SQL approach

**Recommendation**: Prisma
**Rationale**: Superior TypeScript integration and developer experience

**Decision Required**: ✅ **Damian must approve ORM choice**

---

### **3. Authentication Strategy**
**Question**: Should we use JWT tokens or session-based authentication?

**Options**:
- **JWT Tokens** (Recommended)
  - Stateless authentication
  - Better for microservices
  - Scalable across multiple servers
  - Mobile app friendly

- **Session-based with Cookies**
  - Simpler implementation
  - Better security (can be revoked)
  - Traditional web approach
  - Requires session storage

**Recommendation**: JWT Tokens
**Rationale**: Better suited for microservices architecture and scalability

**Decision Required**: ✅ **Damian must approve authentication strategy**

---

### **4. Business Logic Implementation Location**
**Question**: Where should business calculations be implemented?

**Options**:
- **Database Functions** (Recommended)
  - Consistent across all applications
  - Better performance for complex calculations
  - Single source of truth
  - Easier to maintain

- **Backend Services**
  - More flexible and testable
  - Easier to debug
  - Can use external libraries
  - Better for business rule changes

- **Frontend Only** (Not Recommended)
  - Violates architectural principles
  - Security risks
  - Inconsistent calculations

**Recommendation**: Database Functions with Backend Services
**Rationale**: Database for core calculations, backend for business logic orchestration

**Decision Required**: ✅ **Damian must approve business logic approach**

---

## 🔧 **Technical Configuration Decisions**

### **5. File Size and Function Length Limits**
**Question**: What are the exact limits for file sizes and function lengths?

**Current Specs**:
- File length: ≤250 lines
- Function length: ≤50 lines

**Options**:
- **Strict Enforcement** (Recommended)
  - Hard limits with CI/CD blocking
  - Consistent code quality
  - May require more files

- **Guideline with Warnings**
  - Soft limits with warnings
  - More flexible development
  - Potential quality degradation

**Recommendation**: Strict Enforcement
**Rationale**: Ensures consistent code quality and maintainability

**Decision Required**: ✅ **Damian must approve enforcement strategy**

---

### **6. Testing Coverage Thresholds**
**Question**: What are the exact testing coverage requirements?

**Current Specs**:
- Unit tests: 90%+
- Integration tests: 80%+
- E2E tests: 70%+

**Options**:
- **Higher Thresholds**
  - Unit tests: 95%+
  - Integration tests: 90%+
  - E2E tests: 80%+
  - Better quality but slower development

- **Current Thresholds** (Recommended)
  - Balanced approach
  - Good quality without excessive overhead

- **Lower Thresholds**
  - Faster development
  - Potential quality issues

**Recommendation**: Current Thresholds
**Rationale**: Balanced approach between quality and development speed

**Decision Required**: ✅ **Damian must approve testing thresholds**

---

### **7. Database Migration Strategy**
**Question**: How should we handle database migrations during development?

**Options**:
- **Prisma Migrate** (Recommended)
  - Automatic migration generation
  - Version control for schema changes
  - Rollback capabilities
  - Team collaboration friendly

- **Manual SQL Scripts**
  - Full control over migrations
  - Custom rollback procedures
  - More complex team coordination

**Recommendation**: Prisma Migrate
**Rationale**: Better developer experience and team collaboration

**Decision Required**: ✅ **Damian must approve migration strategy**

---

## 💼 **Business Rule Decisions**

### **8. Tax Calculation Rules**
**Question**: What are the specific tax calculation rules and rounding policies?

**Areas Requiring Clarification**:
- Tax rate application (percentage vs. fixed amount)
- Rounding rules (up, down, nearest)
- Tax exemption handling
- Multi-currency tax calculations
- Tax reporting requirements

**Impact**: Affects pricing engine and invoice generation
**Decision Required**: ✅ **Damian must provide tax calculation rules**

---

### **9. Discount Application Rules**
**Question**: How should discounts be applied to quotes and invoices?

**Areas Requiring Clarification**:
- Discount application order (before/after tax)
- Maximum discount limits
- Discount types (percentage vs. fixed amount)
- Customer-specific discount rules
- Approval requirements for discounts

**Impact**: Affects pricing engine and business logic
**Decision Required**: ✅ **Damian must provide discount rules**

---

### **10. Time Tracking Approval Workflow**
**Question**: What is the approval workflow for time entries?

**Areas Requiring Clarification**:
- Who can approve time entries?
- Approval thresholds (daily, weekly, monthly)
- Escalation procedures
- Auto-approval rules
- Integration with project management

**Impact**: Affects time management system design
**Decision Required**: ✅ **Damian must provide approval workflow**

---

## 🚀 **Implementation Priority Decisions**

### **11. MVP Feature Scope**
**Question**: What features are essential for the first production release?

**Potential MVP Features**:
- User authentication and basic user management
- Customer management (CRUD operations)
- Basic quotation system
- Simple project management
- Basic time tracking

**Non-MVP Features**:
- Advanced reporting and analytics
- Third-party integrations
- Advanced workflow automation
- Mobile application

**Decision Required**: ✅ **Damian must define MVP scope**

---

### **12. Integration Priority**
**Question**: Which third-party integrations should be prioritized?

**Integration Options**:
- **Xero Accounting** (High Priority)
  - Essential for business operations
  - Invoice and payment processing

- **Email Systems** (Medium Priority)
  - Customer communication
  - Notification system

- **File Storage** (Medium Priority)
  - Document management
  - File sharing

- **Other Integrations** (Low Priority)
  - CRM systems
  - Project management tools

**Decision Required**: ✅ **Damian must prioritize integrations**

---

## 📊 **Decision Summary Matrix**

| Decision Category | Questions | Priority | Status |
|-------------------|-----------|----------|---------|
| **Critical Technical** | Node.js version, ORM choice, Auth strategy | High | Pending |
| **Technical Configuration** | File limits, Testing thresholds, Migration strategy | Medium | Pending |
| **Business Rules** | Tax calculations, Discounts, Approval workflows | High | Pending |
| **Implementation Scope** | MVP features, Integration priority | Medium | Pending |

**Total Decisions Required**: 12  
**High Priority**: 6  
**Medium Priority**: 6  
**Low Priority**: 0

---

## ⏰ **Decision Timeline**

### **Immediate Decisions (Before Repository Setup)**
- Node.js version selection
- ORM choice
- Authentication strategy
- Business logic approach

### **Week 1 Decisions**
- File size and function limits
- Testing coverage thresholds
- Database migration strategy
- MVP feature scope

### **Week 2 Decisions**
- Tax calculation rules
- Discount application rules
- Time tracking approval workflow
- Integration priorities

---

## 📋 **Action Items for Damian**

### **Required Actions**
1. **Review and approve Node.js version** (Critical)
2. **Choose database ORM** (Critical)
3. **Select authentication strategy** (Critical)
4. **Define business logic approach** (Critical)
5. **Approve technical configuration limits** (High)
6. **Define testing requirements** (High)
7. **Provide business rule specifications** (High)
8. **Define MVP scope** (Medium)
9. **Prioritize integrations** (Medium)

### **Expected Deliverables**
- Written approval for technical decisions
- Business rule documentation
- MVP feature list
- Integration priority list
- Any additional requirements or constraints

---

## 🎯 **Damian's Decisions & Approvals**

### **✅ Technical Decisions APPROVED**

| Decision | Status | Damian's Approval |
|----------|---------|-------------------|
| **Node.js Version** | ✅ **APPROVED** | Node.js 20 LTS selected |
| **Database ORM** | ✅ **APPROVED** | Prisma chosen |
| **Authentication Strategy** | ✅ **APPROVED** | JWT Tokens selected |
| **Business Logic Location** | ✅ **APPROVED** | Hybrid: Database Functions + Backend Orchestration |
| **File & Function Limits** | ✅ **APPROVED** | Strict Enforcement with CI/CD |
| **Testing Coverage** | ✅ **APPROVED** | Unit 90% / Integration 80% / E2E 70% |
| **DB Migration Strategy** | ✅ **APPROVED** | Prisma Migrate |

### **✅ Business Rules - APPROVED BY DAMIAN**

| Decision | Status | Damian's Approval |
|----------|---------|-------------------|
| **Tax Calculation Rules** | ✅ **APPROVED** | GST 15% NZ, 0% international, 2dp rounding, multi-currency support |
| **Discount Application Rules** | ✅ **APPROVED** | %/fixed amounts, before tax, approval workflows, customer-specific rules |
| **Time Tracking Approval Workflow** | ✅ **APPROVED** | 3-tier hierarchy, weekly cycles, escalation procedures, auto-approval rules |

### **✅ Implementation Scope APPROVED**

| Decision | Status | Damian's Approval |
|----------|---------|-------------------|
| **MVP Features** | ✅ **APPROVED** | Auth, Customer Mgmt, Quotes, Basic PM, Time Tracking |
| **Integration Priorities** | ✅ **APPROVED** | Xero (High), Email (Med), File Storage (Med), Others (Low) |

---

**Document Version**: 1.2  
**Last Updated**: January 2025  
**Next Review**: February 2025  
**Open Questions Version**: 1.2.0  
**Damian Approval Status**: 12/12 Decisions Approved (100%)
