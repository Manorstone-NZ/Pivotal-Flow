# Pivotal Flow - Business Rules & Calculations

## 🎯 **Business Rules Overview - How the System Actually Works**

### **Core Business Logic**
Pivotal Flow operates on **real business rules** that service companies use every day. The system doesn't just store data - it applies business logic to calculate costs, track profitability, and make business decisions.

### **Key Business Rules**
1. **Time is Money**: Every hour tracked affects project costs and profitability
2. **Budget Management**: Real-time tracking of planned vs. actual costs
3. **Rate Management**: Different rates for different services, customers, and team members
4. **Profitability Tracking**: Automatic calculation of margins and project success
5. **Workflow Automation**: Business processes that trigger based on data changes

---

## 💰 **Pricing & Rate Management Rules**

### **1. Rate Card Structure**

#### **Base Rate Configuration:**
```
Service Category: Web Development
├── Junior Developer: $75/hour
├── Senior Developer: $150/hour
├── Lead Developer: $200/hour
└── Project Manager: $125/hour

Service Category: Design
├── Junior Designer: $60/hour
├── Senior Designer: $100/hour
├── Creative Director: $150/hour
└── UX Specialist: $120/hour

Service Category: Consulting
├── Business Analyst: $120/hour
├── Strategy Consultant: $200/hour
├── Implementation Specialist: $150/hour
└── Project Manager: $125/hour
```

#### **Rate Application Rules:**
1. **Default Rate**: System uses base rate for service category
2. **Customer-Specific Rates**: Override base rates for VIP customers
3. **Project-Specific Rates**: Special rates for large or strategic projects
4. **Team Member Rates**: Individual rates based on experience and role
5. **Volume Discounts**: Reduced rates for projects over certain thresholds

### **2. Quote Calculation Engine**

#### **Line Item Calculation:**
```
Line Item Cost = Estimated Hours × Hourly Rate
```

**Example Calculation:**
```
Service: Frontend Development
Estimated Hours: 60
Hourly Rate: $150
Line Item Cost: 60 × $150 = $9,000
```

#### **Quote Total Calculation:**
```
Subtotal = Sum of all line items
Tax Amount = Subtotal × Tax Rate
Discount Amount = Subtotal × Discount Percentage
Total = Subtotal + Tax - Discount
```

**Complete Example:**
```
Line Items:
├── Design: 20 hours × $100 = $2,000
├── Frontend Development: 60 hours × $150 = $9,000
├── Backend Development: 40 hours × $150 = $6,000
├── Content Creation: 10 hours × $75 = $750
└── Project Management: 15 hours × $125 = $1,875

Subtotal: $19,625
Tax (8.5%): $19,625 × 0.085 = $1,668.13
Discount (5%): $19,625 × 0.05 = $981.25
Total: $19,625 + $1,668.13 - $981.25 = $20,311.88
```

#### **Tax Calculation Rules:**
1. **Tax Rate by Location**: Different rates for different states/countries
2. **Tax Exemptions**: Non-profit organizations, government entities
3. **Service Taxability**: Some services may be tax-exempt
4. **Tax Registration**: Automatic validation of tax numbers

---

## ⏰ **Time Tracking Business Rules**

### **1. Billable vs. Non-Billable Time**

#### **Billable Time Rules:**
- **Client Work**: Time spent on client projects
- **Project Meetings**: Client-facing meetings and presentations
- **Research**: Project-specific research and planning
- **Travel**: Client site visits and meetings

#### **Non-Billable Time Rules:**
- **Internal Meetings**: Team meetings, company updates
- **Training**: Professional development and skill building
- **Administration**: Time tracking, reporting, general admin
- **Breaks**: Lunch breaks, coffee breaks, personal time

#### **Time Entry Validation:**
```
Valid Time Entry = {
  Start Time < End Time
  Duration ≤ 24 hours
  Project exists and is active
  Task is assigned to user
  No overlapping time entries
  Break time ≤ 2 hours per day
}
```

### **2. Time Calculation Rules**

#### **Duration Calculation:**
```
Duration = End Time - Start Time
Billable Hours = Duration - Break Time
Daily Total = Sum of all billable hours
Weekly Total = Sum of daily totals
Monthly Total = Sum of weekly totals
```

**Example Day:**
```
Time Entries:
├── 9:00 AM - 12:00 PM: Frontend Development (3 hours)
├── 12:00 PM - 12:30 PM: Lunch Break (0.5 hours)
├── 12:30 PM - 3:30 PM: Frontend Development (3 hours)
└── 3:30 PM - 4:00 PM: Project Meeting (0.5 hours)

Total Duration: 7 hours
Break Time: 0.5 hours
Billable Hours: 6.5 hours
```

#### **Overtime Rules:**
1. **Standard Day**: 8 hours
2. **Overtime Threshold**: Hours > 8 per day
3. **Overtime Rate**: 1.5x normal rate
4. **Weekly Overtime**: Hours > 40 per week
5. **Holiday Pay**: 2x normal rate for holidays

---

## 📊 **Project Cost & Profitability Rules**

### **1. Project Cost Calculation**

#### **Actual Cost Calculation:**
```
Actual Cost = Sum of (Hours × Hourly Rate) for all time entries
```

**Example Project:**
```
Time Entries:
├── Sarah (Designer): 20 hours × $100 = $2,000
├── Mike (Developer): 65 hours × $150 = $9,750
├── Lisa (Content): 8 hours × $75 = $600
└── John (PM): 15 hours × $125 = $1,875

Total Actual Cost: $14,225
```

#### **Budget Variance Calculation:**
```
Budget Variance = Actual Cost - Budget
Variance Percentage = (Budget Variance / Budget) × 100
```

**Example:**
```
Budget: $15,000
Actual Cost: $14,225
Budget Variance: $14,225 - $15,000 = -$775 (under budget)
Variance Percentage: (-$775 / $15,000) × 100 = -5.17%
```

### **2. Profitability Analysis**

#### **Gross Profit Calculation:**
```
Gross Profit = Invoice Amount - Actual Cost
Gross Profit Margin = (Gross Profit / Invoice Amount) × 100
```

**Example:**
```
Invoice Amount: $20,000
Actual Cost: $14,225
Gross Profit: $20,000 - $14,225 = $5,775
Gross Profit Margin: ($5,775 / $20,000) × 100 = 28.88%
```

#### **Profitability Thresholds:**
1. **High Profit**: > 30% margin
2. **Good Profit**: 20-30% margin
3. **Acceptable Profit**: 10-20% margin
4. **Low Profit**: 5-10% margin
5. **At Risk**: < 5% margin

### **3. Project Status Rules**

#### **Status Transition Rules:**
```
Project Status Flow:
Planning → Active → On Hold → Active → Completed
    ↓         ↓        ↓        ↓         ↓
   Quote   Started   Paused   Resumed   Delivered
  Created
```

#### **Status Change Triggers:**
- **Planning → Active**: Customer approves quote
- **Active → On Hold**: Customer requests pause or issues arise
- **On Hold → Active**: Issues resolved, project resumed
- **Active → Completed**: All deliverables completed and approved

---

## 🔄 **Workflow Automation Rules**

### **1. Quote Approval Workflow**

#### **Automatic Triggers:**
```
Quote Status Changes:
Draft → Sent: Sales team sends to customer
Sent → Viewed: Customer opens quote (tracked via email)
Viewed → Approved: Customer clicks approval button
Approved → Project: System automatically creates project
```

#### **Approval Rules:**
1. **Auto-Approval**: Quotes under $5,000 for existing customers
2. **Manager Approval**: Quotes $5,000-$25,000
3. **Executive Approval**: Quotes over $25,000
4. **Customer Approval**: All quotes require customer approval

### **2. Project Creation Rules**

#### **Automatic Project Setup:**
```
When Quote is Approved:
1. Create project record
2. Copy customer information
3. Copy project scope and timeline
4. Set initial budget from quote
5. Assign project manager
6. Create project tasks from quote line items
7. Send notification to project team
8. Update customer record with project status
```

#### **Task Creation Rules:**
```
Task Creation Logic:
For each quote line item:
├── Create task with same name
├── Set estimated hours from quote
├── Assign to appropriate team member
├── Set due date based on project timeline
└── Link to project milestone
```

### **3. Time Approval Workflow**

#### **Approval Rules:**
1. **Auto-Approval**: Time entries under 2 hours
2. **Project Manager Approval**: Time entries 2-8 hours
3. **Manager Approval**: Time entries over 8 hours
4. **Flag for Review**: Unusual patterns or high hours

#### **Time Validation Rules:**
```
Time Entry Validation:
├── Hours ≤ 12 per day (flag if exceeded)
├── No overlapping time entries
├── Project is active and not on hold
├── Task is assigned to user
├── Break time is reasonable
└── Description is provided for entries > 1 hour
```

---

## 📈 **Business Intelligence Rules**

### **1. Revenue Recognition Rules**

#### **Revenue Calculation:**
```
Monthly Revenue = Sum of all invoices sent in month
Outstanding Revenue = Sum of all unpaid invoices
Realized Revenue = Sum of all paid invoices
```

#### **Revenue Recognition Timing:**
1. **Invoice Sent**: Revenue recognized when invoice is sent
2. **Payment Received**: Cash flow updated when payment received
3. **Overdue Revenue**: Revenue > 30 days old flagged as overdue
4. **Write-off Rules**: Revenue > 90 days old considered for write-off

### **2. Customer Lifetime Value (CLV)**

#### **CLV Calculation:**
```
CLV = (Average Project Value × Projects per Year × Customer Lifespan) - Acquisition Cost
```

**Example:**
```
Restaurant ABC:
├── Average Project: $15,000
├── Projects per Year: 2
├── Customer Lifespan: 3 years
└── Acquisition Cost: $2,000

CLV = ($15,000 × 2 × 3) - $2,000 = $88,000
```

#### **Customer Segmentation Rules:**
1. **VIP Customers**: CLV > $100,000
2. **High Value**: CLV $50,000-$100,000
3. **Medium Value**: CLV $20,000-$50,000
4. **Low Value**: CLV < $20,000

### **3. Team Utilization Rules**

#### **Utilization Calculation:**
```
Daily Utilization = (Billable Hours / 8) × 100
Weekly Utilization = (Weekly Billable Hours / 40) × 100
Monthly Utilization = (Monthly Billable Hours / 160) × 100
```

#### **Utilization Targets:**
1. **Target Utilization**: 80% (32 billable hours per week)
2. **High Utilization**: > 90% (may indicate burnout risk)
3. **Low Utilization**: < 70% (may indicate underutilization)
4. **Optimal Range**: 75-85% (balanced productivity and sustainability)

---

## 🔒 **Business Security Rules**

### **1. Data Access Rules**

#### **Role-Based Access:**
```
Access Levels:
├── Executive: All data, financial reports, team performance
├── Manager: Team data, project details, customer information
├── Team Member: Assigned projects, own time entries, customer context
├── Sales: Customer information, quotes, project status
└── Finance: Invoices, payments, financial reports
```

#### **Data Visibility Rules:**
1. **Customer Data**: Visible to sales, project managers, and assigned team
2. **Financial Data**: Visible to finance team and executives only
3. **Time Data**: Visible to individual, project manager, and managers
4. **Project Data**: Visible to project team and stakeholders

### **2. Approval Workflow Security**

#### **Approval Authority Rules:**
```
Approval Hierarchy:
├── Time Entries: Project Manager → Department Manager
├── Quotes: Sales Manager → Executive (if > $25,000)
├── Project Changes: Project Manager → Customer
├── Invoice Adjustments: Finance Manager → Executive
└── Customer Credits: Sales Manager → Finance Manager
```

#### **Change Audit Rules:**
1. **All Changes Logged**: Who, what, when, why
2. **Approval Required**: Significant changes need approval
3. **Rollback Capability**: Changes can be reversed if needed
4. **Notification System**: Relevant parties notified of changes

---

## 📋 **Business Rule Implementation Examples**

### **Example 1: Website Redesign Project**

#### **Initial Setup:**
```
Quote Approved → Project Created
├── Budget: $20,000
├── Timeline: 8 weeks
├── Team: Designer, Developer, PM
└── Tasks: Design, Development, Testing, Launch
```

#### **Cost Tracking:**
```
Week 1-2 (Design):
├── Sarah: 20 hours × $100 = $2,000
├── John: 5 hours × $125 = $625
└── Total: $2,625

Week 3-6 (Development):
├── Mike: 80 hours × $150 = $12,000
├── John: 20 hours × $125 = $2,500
└── Total: $14,500

Week 7-8 (Testing & Launch):
├── Mike: 20 hours × $150 = $3,000
├── John: 15 hours × $125 = $1,875
└── Total: $4,875

Total Actual Cost: $22,000
Budget Variance: +$2,000 (10% over budget)
```

#### **Business Rule Application:**
1. **Budget Alert**: System flags 10% over budget
2. **Approval Required**: Additional hours need manager approval
3. **Customer Notification**: Change order required for additional work
4. **Profitability Impact**: Reduced margin from 30% to 20%

### **Example 2: Consulting Project**

#### **Rate Application:**
```
Customer: Tech Startup (VIP Customer)
Standard Rate: $200/hour
VIP Discount: 15%
Effective Rate: $200 × 0.85 = $170/hour

Project: Business Process Optimization
├── Analysis Phase: 40 hours × $170 = $6,800
├── Implementation: 60 hours × $170 = $10,200
└── Total: $17,000
```

#### **Time Tracking Rules:**
1. **Travel Time**: 2 hours travel to client site = billable
2. **Research**: 5 hours industry research = billable
3. **Internal Prep**: 3 hours meeting preparation = non-billable
4. **Client Meetings**: 8 hours client meetings = billable

#### **Profitability Calculation:**
```
Invoice Amount: $17,000
Actual Cost: $12,000 (team time at internal rates)
Gross Profit: $5,000
Profit Margin: 29.4%
```

---

## 📊 **Business Rule Monitoring & Alerts**

### **1. Automated Alerts**

#### **Budget Alerts:**
```
Budget Threshold Rules:
├── Warning: 80% of budget spent
├── Alert: 90% of budget spent
├── Critical: 100% of budget reached
└── Emergency: 110% of budget exceeded
```

#### **Timeline Alerts:**
```
Timeline Rules:
├── Warning: 75% of timeline elapsed
├── Alert: 90% of timeline elapsed
├── Critical: 100% of timeline reached
└── Emergency: 110% of timeline exceeded
```

#### **Utilization Alerts:**
```
Utilization Rules:
├── Low: < 70% for 2 consecutive weeks
├── High: > 90% for 2 consecutive weeks
├── Burnout Risk: > 95% for 3 consecutive weeks
└── Optimal: 75-85% consistently
```

### **2. Business Intelligence Dashboards**

#### **Executive Dashboard Rules:**
```
KPI Calculation Rules:
├── Revenue Growth: (Current Month - Previous Month) / Previous Month × 100
├── Project Success Rate: Completed Projects / Total Projects × 100
├── Customer Retention: Repeat Customers / Total Customers × 100
├── Team Utilization: Average utilization across all team members
└── Profitability Trend: Monthly profit margin over last 12 months
```

#### **Manager Dashboard Rules:**
```
Team Performance Rules:
├── Individual Utilization: Personal billable hours / 40 × 100
├── Project Contribution: Hours on project / Total project hours × 100
├── Quality Score: Based on client feedback and project success
├── Efficiency Rating: Estimated vs. actual hours ratio
└── Skill Development: Training hours and certification progress
```

---

## 📋 **Implementation Priority - Business Rules First**

### **Phase 1: Core Business Logic (Weeks 1-4)**
1. **Rate Management**: Service categories and hourly rates
2. **Quote Calculations**: Automatic pricing and totals
3. **Time Tracking Rules**: Billable vs. non-billable logic
4. **Basic Cost Tracking**: Project budget vs. actual

### **Phase 2: Advanced Business Rules (Weeks 5-8)**
1. **Workflow Automation**: Quote approval and project creation
2. **Profitability Analysis**: Margin calculations and reporting
3. **Customer Management**: CLV and segmentation rules
4. **Team Utilization**: Productivity tracking and targets

### **Phase 3: Business Intelligence (Weeks 9-12)**
1. **Advanced Analytics**: Trend analysis and forecasting
2. **Automated Alerts**: Budget and timeline notifications
3. **Performance Metrics**: KPI calculations and dashboards
4. **Business Insights**: Actionable recommendations

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Next Review**: February 2025  
**Business Rules & Calculations Version**: 1.0.0
