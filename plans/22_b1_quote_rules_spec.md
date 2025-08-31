# B1 Quote Rules Specification

## 🎯 **Domain Glossary**

### **Core Entities**
- **Customer**: Organization or individual purchasing services/products
- **Project**: Specific work engagement with defined scope and timeline
- **Quote**: Formal pricing proposal with line items and terms
- **Line Item**: Individual service/product with quantity, rate, and total
- **Rate Card**: Pricing structure for services by role/category
- **Taxes**: GST (15% NZ) applied to taxable amounts
- **Discounts**: Percentage or fixed amount reductions applied before tax

## 📊 **Status Model**

### **Quote Status Flow**
```
DRAFT → PENDING → APPROVED → SENT → VIEWED → ACCEPTED/REJECTED
  ↓        ↓         ↓        ↓       ↓           ↓
Created  Submitted  Approved  Sent   Opened    Completed
```

### **Status Definitions**
- **DRAFT**: Initial quote creation, editable
- **PENDING**: Submitted for internal approval
- **APPROVED**: Internal approval granted, ready to send
- **SENT**: Delivered to customer
- **VIEWED**: Customer has opened/accessed quote
- **ACCEPTED**: Customer approved quote
- **REJECTED**: Customer declined quote
- **CANCELLED**: Quote withdrawn or expired

## 💰 **Calculation Rules**

### **Source of Truth**
- **Currency**: NZD (New Zealand Dollar)
- **Precision**: Two decimal places (0.00)
- **Rounding**: Standard half-up rounding at each calculation step
- **Tax Rate**: 15% GST (Goods and Services Tax)

### **Tax Treatment**
- **Tax Exclusive**: Line item prices exclude tax, tax calculated on subtotal
- **Tax Inclusive**: Line item prices include tax, tax extracted from total
- **Default**: Tax exclusive pricing model

### **Discount Precedence**
1. **Percentage Discounts**: Applied first to line items
2. **Fixed Amount Discounts**: Applied after percentage discounts
3. **Order**: Line level → Quote level → Final total

### **Rounding Rules**
1. **Per Line**: Round each line item total to 2 decimal places
2. **Subtotal**: Sum of rounded line items
3. **Tax**: Round tax amount to 2 decimal places
4. **Grand Total**: Final rounded total

### **Numeric Types**
- **Currency**: Prisma Decimal with 2 decimal places
- **Percentages**: Prisma Decimal with 4 decimal places
- **Quantities**: Prisma Decimal with 2 decimal places
- **Rates**: Prisma Decimal with 2 decimal places

## 📋 **Examples Table**

| Input | Description | Quantity | Unit Rate | Line Total | Tax Rate | Tax Amount | Discount % | Discount Amount | Final Total |
|-------|-------------|----------|-----------|------------|----------|------------|-------------|----------------|-------------|
| Web Development | Senior Developer | 40.00 | 150.00 | 6,000.00 | 15% | 900.00 | 0% | 0.00 | 6,900.00 |
| Design Services | Creative Director | 20.00 | 120.00 | 2,400.00 | 15% | 360.00 | 10% | 240.00 | 2,520.00 |
| Project Management | PM | 15.00 | 100.00 | 1,500.00 | 15% | 225.00 | 5% | 75.00 | 1,650.00 |
| Content Creation | Copywriter | 8.00 | 80.00 | 640.00 | 15% | 96.00 | 0% | 0.00 | 736.00 |
| Travel Expenses | Mileage | 100.00 | 0.85 | 85.00 | 0% | 0.00 | 0% | 0.00 | 85.00 |
| Fixed Discount | Quote Level | 1.00 | -500.00 | -500.00 | 0% | 0.00 | 0% | 0.00 | -500.00 |

### **Calculation Details**

#### **Example 1: Web Development**
- Line Total: 40 × $150 = $6,000.00
- Tax: $6,000 × 15% = $900.00
- Final: $6,000 + $900 = $6,900.00

#### **Example 2: Design Services**
- Line Total: 20 × $120 = $2,400.00
- Discount: $2,400 × 10% = $240.00
- Subtotal: $2,400 - $240 = $2,160.00
- Tax: $2,160 × 15% = $324.00
- Final: $2,160 + $324 = $2,484.00

#### **Example 3: Project Management**
- Line Total: 15 × $100 = $1,500.00
- Discount: $1,500 × 5% = $75.00
- Subtotal: $1,500 - $75 = $1,425.00
- Tax: $1,425 × 15% = $213.75
- Final: $1,425 + $213.75 = $1,638.75

#### **Example 4: Content Creation**
- Line Total: 8 × $80 = $640.00
- Tax: $640 × 15% = $96.00
- Final: $640 + $96 = $736.00

#### **Example 5: Travel Expenses**
- Line Total: 100 × $0.85 = $85.00
- Tax: $0.00 (tax exempt)
- Final: $85.00

#### **Example 6: Fixed Discount**
- Line Total: 1 × -$500 = -$500.00
- Tax: $0.00 (negative amount)
- Final: -$500.00

## 🔧 **Implementation Notes**

### **Future Considerations**
- **Variable Tax Rates**: Support for different tax rates by service type
- **Tax Exemptions**: Non-profit organizations, government entities
- **Multi-Currency**: Support for international customers
- **Exchange Rates**: Real-time currency conversion
- **Volume Discounts**: Tiered pricing based on project size
- **Customer-Specific Rates**: VIP customer pricing

### **Edge Cases**
- **Zero Amounts**: Handle $0.00 line items correctly
- **Negative Amounts**: Support for credits and adjustments
- **Very Small Amounts**: Ensure precision for fractional cents
- **Large Numbers**: Handle amounts over $1,000,000
- **Rounding Accumulation**: Prevent rounding errors in totals

### **Validation Rules**
- **Positive Quantities**: All quantities must be > 0
- **Valid Rates**: Hourly rates must be reasonable (> $0, < $1000)
- **Discount Limits**: Percentage discounts ≤ 100%
- **Tax Compliance**: Ensure tax calculations meet NZ requirements
- **Currency Format**: All amounts in NZD format (0.00)
