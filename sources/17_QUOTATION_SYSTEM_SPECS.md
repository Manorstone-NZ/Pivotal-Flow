# Pivotal Flow - Quotation System Specifications

## 💰 **Quotation System Overview**

### **System Purpose**
The Quotation System manages the complete lifecycle of business quotations, from initial creation through approval, customer acceptance, and conversion to projects. It provides a comprehensive pricing engine, approval workflows, and professional document generation.

### **Key Features**
- Quote creation and management
- Advanced pricing engine with rate cards
- Multi-level approval workflows
- Professional PDF generation
- Customer acceptance tracking
- Integration with project management
- Comprehensive reporting and analytics

---

## 🏗️ **System Architecture**

### **Core Components**

#### **1. Quote Management Engine**
```typescript
interface IQuoteManagementEngine {
  // Quote lifecycle management
  createQuote(quoteData: ICreateQuoteRequest): Promise<IQuote>;
  updateQuote(quoteId: string, updates: IUpdateQuoteRequest): Promise<IQuote>;
  deleteQuote(quoteId: string): Promise<void>;
  duplicateQuote(quoteId: string): Promise<IQuote>;
  
  // Quote status management
  submitForApproval(quoteId: string): Promise<IWorkflowResult>;
  approveQuote(quoteId: string, approverId: string): Promise<IWorkflowResult>;
  rejectQuote(quoteId: string, approverId: string, reason: string): Promise<IWorkflowResult>;
  sendToCustomer(quoteId: string): Promise<IWorkflowResult>;
  markAsViewed(quoteId: string, customerId: string): Promise<void>;
  acceptQuote(quoteId: string, customerId: string): Promise<IWorkflowResult>;
  rejectQuoteByCustomer(quoteId: string, customerId: string, reason: string): Promise<IWorkflowResult>;
  
  // Quote conversion
  convertToProject(quoteId: string): Promise<IProject>;
  convertToInvoice(quoteId: string): Promise<IInvoice>;
}
```

#### **2. Pricing Engine**
```typescript
interface IPricingEngine {
  // Core pricing calculations
  calculateQuotePricing(quoteId: string): Promise<IQuotePricing>;
  calculateLineItemPricing(lineItem: IQuoteLineItem): Promise<ILineItemPricing>;
  applyDiscounts(quoteId: string, discounts: IDiscount[]): Promise<IQuotePricing>;
  calculateTaxes(quoteId: string, taxRules: ITaxRule[]): Promise<IQuotePricing>;
  
  // Rate card management
  getApplicableRateCard(
    serviceCategoryId: string,
    roleId: string,
    locationFactorId: string,
    effectiveDate: Date
  ): Promise<IRateCardItem>;
  
  // Pricing adjustments
  applyMarkup(quoteId: string, markupPercentage: number): Promise<IQuotePricing>;
  applyVolumeDiscount(quoteId: string, discountTiers: IDiscountTier[]): Promise<IQuotePricing>;
  applyCustomerDiscount(quoteId: string, customerDiscount: ICustomerDiscount): Promise<IQuotePricing>;
}
```

#### **3. Approval Workflow Engine**
```typescript
interface IApprovalWorkflowEngine {
  // Workflow management
  createWorkflow(workflowConfig: IWorkflowConfig): Promise<IWorkflow>;
  startWorkflow(quoteId: string, workflowId: string): Promise<IWorkflowInstance>;
  processApproval(workflowInstanceId: string, approverId: string, decision: 'approve' | 'reject'): Promise<IWorkflowResult>;
  
  // Workflow configuration
  getWorkflowConfig(organizationId: string): Promise<IWorkflowConfig>;
  updateWorkflowConfig(organizationId: string, config: IWorkflowConfig): Promise<IWorkflowConfig>;
  
  // Approval routing
  getNextApprover(workflowInstanceId: string): Promise<IUser>;
  escalateWorkflow(workflowInstanceId: string, reason: string): Promise<void>;
  autoApprove(workflowInstanceIdId: string): Promise<IWorkflowResult>;
}
```

---

## 📊 **Data Models**

### **Quote Entity**
```typescript
interface IQuote {
  id: string;
  quote_number: string;
  organization_id: string;
  customer_id: string;
  project_id?: string;
  quote_id?: string;
  
  // Basic information
  title: string;
  description?: string;
  status: QuoteStatus;
  type: QuoteType;
  
  // Validity and dates
  valid_from: Date;
  valid_until: Date;
  sent_at?: Date;
  viewed_at?: Date;
  accepted_at?: Date;
  expires_at?: Date;
  
  // Financial information
  currency: string;
  exchange_rate: number;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_type: DiscountType;
  discount_value: number;
  discount_amount: number;
  total_amount: number;
  
  // Workflow information
  created_by: string;
  approved_by?: string;
  approved_at?: Date;
  
  // Additional information
  terms_conditions?: string;
  notes?: string;
  internal_notes?: string;
  
  // Metadata
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

enum QuoteStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  SENT = 'sent',
  VIEWED = 'viewed',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  CONVERTED_TO_PROJECT = 'converted_to_project',
  CONVERTED_TO_INVOICE = 'converted_to_invoice'
}

enum QuoteType {
  PROJECT = 'project',
  SERVICE = 'service',
  PRODUCT = 'product',
  RECURRING = 'recurring',
  ONE_TIME = 'one_time'
}

enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
  PER_UNIT = 'per_unit'
}
```

### **Quote Line Items**
```typescript
interface IQuoteLineItem {
  id: string;
  quote_id: string;
  line_number: number;
  
  // Item information
  type: LineItemType;
  description: string;
  quantity: number;
  unit: string;
  
  // Pricing information
  unit_price: number;
  unit_cost?: number;
  tax_rate: number;
  tax_amount: number;
  discount_type: DiscountType;
  discount_value: number;
  discount_amount: number;
  subtotal: number;
  total_amount: number;
  
  // Service information
  service_category_id?: string;
  rate_card_id?: string;
  role_id?: string;
  location_factor_id?: string;
  
  // Additional information
  notes?: string;
  metadata: Record<string, any>;
  
  // Timestamps
  created_at: Date;
  updated_at: Date;
}

enum LineItemType {
  SERVICE = 'service',
  PRODUCT = 'product',
  MATERIAL = 'material',
  TRAVEL = 'travel',
  EXPENSE = 'expense',
  DISCOUNT = 'discount',
  TAX = 'tax'
}
```

### **Rate Cards**
```typescript
interface IRateCard {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  
  // Pricing information
  currency: string;
  effective_from: Date;
  effective_until?: Date;
  
  // Configuration
  is_default: boolean;
  is_active: boolean;
  
  // Metadata
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

interface IRateCardItem {
  id: string;
  rate_card_id: string;
  service_category_id: string;
  role_id?: string;
  location_factor_id?: string;
  
  // Rate information
  base_rate: number;
  currency: string;
  effective_from: Date;
  effective_until?: Date;
  
  // Configuration
  is_active: boolean;
  
  // Metadata
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}
```

---

## 💡 **Pricing Engine**

### **Pricing Calculation Flow**

#### **1. Base Rate Calculation**
```typescript
class PricingEngine {
  async calculateQuotePricing(quoteId: string): Promise<IQuotePricing> {
    try {
      // Get quote with line items
      const quote = await this.quoteRepository.findByIdWithLineItems(quoteId);
      if (!quote) {
        throw new NotFoundError('Quote not found');
      }

      // Calculate pricing for each line item
      const lineItemPricing = await Promise.all(
        quote.lineItems.map(lineItem => this.calculateLineItemPricing(lineItem))
      );

      // Calculate subtotal
      const subtotal = lineItemPricing.reduce((sum, item) => sum + item.subtotal, 0);

      // Apply discounts
      const discountAmount = this.calculateDiscounts(subtotal, quote.discount_type, quote.discount_value);

      // Calculate taxes
      const taxAmount = this.calculateTaxes(subtotal - discountAmount, quote.tax_rate);

      // Calculate total
      const total = subtotal - discountAmount + taxAmount;

      // Update quote with calculated amounts
      const pricing: IQuotePricing = {
        subtotal,
        discount_amount: discountAmount,
        tax_amount: taxAmount,
        total_amount: total
      };

      await this.quoteRepository.updatePricing(quoteId, pricing);

      // Publish event
      await this.eventBus.publish(new QuotePricingCalculatedEvent(quoteId, pricing));

      return pricing;
    } catch (error) {
      this.logger.error('Failed to calculate quote pricing', { error, quoteId });
      throw error;
    }
  }

  private async calculateLineItemPricing(lineItem: IQuoteLineItem): Promise<ILineItemPricing> {
    // Get applicable rate card
    const rateCardItem = await this.getApplicableRateCard(
      lineItem.service_category_id!,
      lineItem.role_id,
      lineItem.location_factor_id,
      new Date()
    );

    // Calculate base price
    const basePrice = rateCardItem ? rateCardItem.base_rate : lineItem.unit_price;

    // Apply quantity
    const quantityPrice = basePrice * lineItem.quantity;

    // Apply line item discounts
    const lineItemDiscount = this.calculateLineItemDiscount(quantityPrice, lineItem.discount_type, lineItem.discount_value);

    // Calculate subtotal
    const subtotal = quantityPrice - lineItemDiscount;

    // Calculate taxes
    const taxAmount = subtotal * (lineItem.tax_rate / 100);

    // Calculate total
    const total = subtotal + taxAmount;

    return {
      subtotal,
      discount_amount: lineItemDiscount,
      tax_amount: taxAmount,
      total_amount: total
    };
  }

  private calculateDiscounts(subtotal: number, discountType: DiscountType, discountValue: number): number {
    switch (discountType) {
      case DiscountType.PERCENTAGE:
        return subtotal * (discountValue / 100);
      case DiscountType.FIXED_AMOUNT:
        return Math.min(discountValue, subtotal);
      case DiscountType.PER_UNIT:
        return discountValue; // This would need quantity context
      default:
        return 0;
    }
  }

  private calculateTaxes(subtotal: number, taxRate: number): number {
    return subtotal * (taxRate / 100);
  }
}
```

#### **2. Rate Card Selection**
```typescript
class RateCardService {
  async getApplicableRateCard(
    serviceCategoryId: string,
    roleId: string,
    locationFactorId: string,
    effectiveDate: Date
  ): Promise<IRateCardItem | null> {
    try {
      // Find applicable rate card items
      const rateCardItems = await this.rateCardItemRepository.find({
        where: {
          service_category_id: serviceCategoryId,
          role_id: roleId || null,
          location_factor_id: locationFactorId || null,
          effective_from: LessThanOrEqual(effectiveDate),
          effective_until: MoreThanOrEqual(effectiveDate) || IsNull(),
          is_active: true
        },
        relations: ['rateCard'],
        order: {
          effective_from: 'DESC'
        }
      });

      if (rateCardItems.length === 0) {
        // Try to find default rate card
        return await this.getDefaultRateCard(serviceCategoryId, effectiveDate);
      }

      // Return the most recent applicable rate card item
      return rateCardItems[0];
    } catch (error) {
      this.logger.error('Failed to get applicable rate card', { error, serviceCategoryId, roleId, locationFactorId });
      return null;
    }
  }

  private async getDefaultRateCard(
    serviceCategoryId: string,
    effectiveDate: Date
  ): Promise<IRateCardItem | null> {
    try {
      const defaultRateCard = await this.rateCardRepository.findOne({
        where: {
          is_default: true,
          is_active: true,
          effective_from: LessThanOrEqual(effectiveDate),
          effective_until: MoreThanOrEqual(effectiveDate) || IsNull()
        }
      });

      if (!defaultRateCard) {
        return null;
      }

      return await this.rateCardItemRepository.findOne({
        where: {
          rate_card_id: defaultRateCard.id,
          service_category_id: serviceCategoryId,
          effective_from: LessThanOrEqual(effectiveDate),
          effective_until: MoreThanOrEqual(effectiveDate) || IsNull(),
          is_active: true
        }
      });
    } catch (error) {
      this.logger.error('Failed to get default rate card', { error, serviceCategoryId });
      return null;
    }
  }
}
```

---

## 🔄 **Approval Workflow**

### **Workflow Configuration**

#### **1. Workflow Definition**
```typescript
interface IWorkflowConfig {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  
  // Workflow structure
  steps: IWorkflowStep[];
  auto_approval_threshold?: number;
  escalation_rules?: IEscalationRule[];
  
  // Configuration
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface IWorkflowStep {
  id: string;
  name: string;
  description?: string;
  order: number;
  
  // Approval configuration
  approver_type: ApproverType;
  approver_id?: string;
  role_id?: string;
  department_id?: string;
  
  // Business rules
  min_approval_amount?: number;
  max_approval_amount?: number;
  required: boolean;
  can_delegate: boolean;
  
  // Notifications
  notify_on_pending: boolean;
  notify_on_complete: boolean;
  escalation_hours: number;
}

enum ApproverType {
  SPECIFIC_USER = 'specific_user',
  ROLE_BASED = 'role_based',
  DEPARTMENT_HEAD = 'department_head',
  ORGANIZATION_ADMIN = 'organization_admin',
  AUTO_APPROVE = 'auto_approve'
}
```

#### **2. Workflow Execution**
```typescript
class WorkflowEngine {
  async startWorkflow(quoteId: string, workflowId: string): Promise<IWorkflowInstance> {
    try {
      // Get workflow configuration
      const workflowConfig = await this.workflowConfigRepository.findById(workflowId);
      if (!workflowConfig) {
        throw new NotFoundError('Workflow configuration not found');
      }

      // Get quote information
      const quote = await this.quoteRepository.findById(quoteId);
      if (!quote) {
        throw new NotFoundError('Quote not found');
      }

      // Create workflow instance
      const workflowInstance = this.workflowInstanceRepository.create({
        workflow_config_id: workflowId,
        quote_id: quoteId,
        organization_id: quote.organization_id,
        current_step: 0,
        status: WorkflowStatus.IN_PROGRESS,
        started_at: new Date()
      });

      const savedInstance = await this.workflowInstanceRepository.save(workflowInstance);

      // Start first step
      await this.processWorkflowStep(savedInstance.id, 0);

      // Publish event
      await this.eventBus.publish(new WorkflowStartedEvent(savedInstance.id, quoteId));

      return savedInstance;
    } catch (error) {
      this.logger.error('Failed to start workflow', { error, quoteId, workflowId });
      throw error;
    }
  }

  async processWorkflowStep(workflowInstanceId: string, stepIndex: number): Promise<void> {
    try {
      const workflowInstance = await this.workflowInstanceRepository.findById(workflowInstanceId);
      if (!workflowInstance) {
        throw new NotFoundError('Workflow instance not found');
      }

      const workflowConfig = await this.workflowConfigRepository.findById(workflowInstance.workflow_config_id);
      if (!workflowConfig) {
        throw new NotFoundError('Workflow configuration not found');
      }

      const currentStep = workflowConfig.steps[stepIndex];
      if (!currentStep) {
        throw new Error('Invalid workflow step');
      }

      // Check if auto-approval applies
      if (currentStep.approver_type === ApproverType.AUTO_APPROVE) {
        await this.autoApproveStep(workflowInstanceId, stepIndex);
        return;
      }

      // Find approver
      const approver = await this.findApprover(currentStep, workflowInstance.organization_id);
      if (!approver) {
        throw new Error('No approver found for workflow step');
      }

      // Create approval request
      await this.createApprovalRequest(workflowInstanceId, stepIndex, approver.id);

      // Send notifications
      if (currentStep.notify_on_pending) {
        await this.notificationService.notifyApprovalPending(approver.id, workflowInstanceId);
      }

      // Set escalation timer
      if (currentStep.escalation_hours > 0) {
        await this.setEscalationTimer(workflowInstanceId, stepIndex, currentStep.escalation_hours);
      }
    } catch (error) {
      this.logger.error('Failed to process workflow step', { error, workflowInstanceId, stepIndex });
      throw error;
    }
  }

  async processApproval(
    workflowInstanceId: string,
    stepIndex: number,
    approverId: string,
    decision: 'approve' | 'reject',
    comments?: string
  ): Promise<IWorkflowResult> {
    try {
      const workflowInstance = await this.workflowInstanceRepository.findById(workflowInstanceId);
      if (!workflowInstance) {
        throw new NotFoundError('Workflow instance not found');
      }

      // Validate approver
      const approvalRequest = await this.approvalRequestRepository.findByWorkflowAndStep(
        workflowInstanceId,
        stepIndex
      );
      if (!approvalRequest || approvalRequest.approver_id !== approverId) {
        throw new ForbiddenError('Not authorized to approve this step');
      }

      // Record approval decision
      await this.recordApprovalDecision(workflowInstanceId, stepIndex, approverId, decision, comments);

      if (decision === 'reject') {
        // Workflow rejected
        await this.completeWorkflow(workflowInstanceId, WorkflowStatus.REJECTED);
        return { status: 'rejected', message: 'Workflow rejected by approver' };
      }

      // Check if this was the last step
      const workflowConfig = await this.workflowConfigRepository.findById(workflowInstance.workflow_config_id);
      if (stepIndex === workflowConfig.steps.length - 1) {
        // Workflow completed
        await this.completeWorkflow(workflowInstanceId, WorkflowStatus.APPROVED);
        return { status: 'approved', message: 'Workflow approved' };
      }

      // Move to next step
      await this.processWorkflowStep(workflowInstanceId, stepIndex + 1);
      return { status: 'in_progress', message: 'Moved to next approval step' };
    } catch (error) {
      this.logger.error('Failed to process approval', { error, workflowInstanceId, stepIndex, decision });
      throw error;
    }
  }
}
```

---

## 📄 **PDF Generation**

### **Template System**

#### **1. Template Definition**
```typescript
interface ITemplate {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  
  // Template configuration
  template_type: TemplateType;
  is_default: boolean;
  is_active: boolean;
  
  // Content
  header_template?: string;
  footer_template?: string;
  styles: ITemplateStyles;
  
  // Metadata
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

interface ITemplateStyles {
  font_family: string;
  font_size: number;
  primary_color: string;
  secondary_color: string;
  logo_url?: string;
  header_background?: string;
  footer_background?: string;
}

enum TemplateType {
  STANDARD = 'standard',
  PREMIUM = 'premium',
  CUSTOM = 'custom',
  BRANDED = 'branded'
}
```

#### **2. PDF Generation Service**
```typescript
class PDFGenerationService {
  async generateQuotePDF(quoteId: string, templateId: string): Promise<Buffer> {
    try {
      // Get quote data
      const quote = await this.quoteRepository.findByIdWithDetails(quoteId);
      if (!quote) {
        throw new NotFoundError('Quote not found');
      }

      // Get template
      const template = await this.templateRepository.findById(templateId);
      if (!template) {
        throw new NotFoundError('Template not found');
      }

      // Generate PDF content
      const pdfContent = await this.generatePDFContent(quote, template);

      // Create PDF document
      const pdfBuffer = await this.createPDFDocument(pdfContent);

      // Log generation
      await this.logPDFGeneration(quoteId, templateId, pdfBuffer.length);

      return pdfBuffer;
    } catch (error) {
      this.logger.error('Failed to generate quote PDF', { error, quoteId, templateId });
      throw error;
    }
  }

  private async generatePDFContent(quote: IQuote, template: ITemplate): Promise<IPDFContent> {
    const content: IPDFContent = {
      header: await this.processTemplate(template.header_template, quote),
      body: await this.generateQuoteBody(quote),
      footer: await this.processTemplate(template.footer_template, quote),
      styles: template.styles
    };

    return content;
  }

  private async generateQuoteBody(quote: IQuote): Promise<string> {
    let body = '';

    // Quote header
    body += `<h1>Quote: ${quote.quote_number}</h1>`;
    body += `<p><strong>Customer:</strong> ${quote.customer.company_name}</p>`;
    body += `<p><strong>Date:</strong> ${format(quote.created_at, 'MMMM dd, yyyy')}</p>`;
    body += `<p><strong>Valid Until:</strong> ${format(quote.valid_until, 'MMMM dd, yyyy')}</p>`;

    // Quote description
    if (quote.description) {
      body += `<h2>Description</h2>`;
      body += `<p>${quote.description}</p>`;
    }

    // Line items table
    body += `<h2>Services</h2>`;
    body += `<table border="1" cellpadding="5" cellspacing="0">`;
    body += `<tr><th>Description</th><th>Quantity</th><th>Unit Price</th><th>Amount</th></tr>`;
    
    quote.lineItems.forEach(item => {
      body += `<tr>`;
      body += `<td>${item.description}</td>`;
      body += `<td>${item.quantity} ${item.unit}</td>`;
      body += `<td>${formatCurrency(item.unit_price, quote.currency)}</td>`;
      body += `<td>${formatCurrency(item.subtotal, quote.currency)}</td>`;
      body += `</tr>`;
    });
    
    body += `</table>`;

    // Summary
    body += `<h2>Summary</h2>`;
    body += `<table border="0" cellpadding="5">`;
    body += `<tr><td><strong>Subtotal:</strong></td><td>${formatCurrency(quote.subtotal, quote.currency)}</td></tr>`;
    
    if (quote.discount_amount > 0) {
      body += `<tr><td><strong>Discount:</strong></td><td>-${formatCurrency(quote.discount_amount, quote.currency)}</td></tr>`;
    }
    
    if (quote.tax_amount > 0) {
      body += `<tr><td><strong>Tax:</strong></td><td>${formatCurrency(quote.tax_amount, quote.currency)}</td></tr>`;
    }
    
    body += `<tr><td><strong>Total:</strong></td><td><strong>${formatCurrency(quote.total_amount, quote.currency)}</strong></td></tr>`;
    body += `</table>`;

    // Terms and conditions
    if (quote.terms_conditions) {
      body += `<h2>Terms and Conditions</h2>`;
      body += `<p>${quote.terms_conditions}</p>`;
    }

    return body;
  }

  private async processTemplate(template: string | undefined, quote: IQuote): Promise<string> {
    if (!template) return '';

    // Replace placeholders with actual values
    return template
      .replace(/\{\{quote_number\}\}/g, quote.quote_number)
      .replace(/\{\{customer_name\}\}/g, quote.customer.company_name)
      .replace(/\{\{quote_date\}\}/g, format(quote.created_at, 'MMMM dd, yyyy'))
      .replace(/\{\{total_amount\}\}/g, formatCurrency(quote.total_amount, quote.currency))
      .replace(/\{\{organization_name\}\}/g, quote.organization.name);
  }
}
```

---

## 📊 **Reporting & Analytics**

### **Quote Analytics**

#### **1. Performance Metrics**
```typescript
interface IQuoteAnalytics {
  organization_id: string;
  period: string;
  
  // Volume metrics
  total_quotes: number;
  quotes_created: number;
  quotes_sent: number;
  quotes_viewed: number;
  quotes_accepted: number;
  quotes_rejected: number;
  quotes_expired: number;
  
  // Financial metrics
  total_quote_value: number;
  average_quote_value: number;
  total_accepted_value: number;
  acceptance_rate: number;
  conversion_rate: number;
  
  // Time metrics
  average_approval_time: number;
  average_customer_response_time: number;
  average_quote_lifecycle: number;
  
  // Quality metrics
  revision_rate: number;
  customer_satisfaction_score: number;
  win_rate: number;
}

interface IQuoteAnalyticsService {
  getQuoteAnalytics(
    organizationId: string,
    dateRange: IDateRange,
    filters?: IQuoteAnalyticsFilters
  ): Promise<IQuoteAnalytics>;
  
  getQuoteTrends(
    organizationId: string,
    dateRange: IDateRange,
    granularity: 'daily' | 'weekly' | 'monthly'
  ): Promise<IQuoteTrends[]>;
  
  getTopPerformers(
    organizationId: string,
    dateRange: IDateRange,
    metric: 'volume' | 'value' | 'acceptance_rate'
  ): Promise<ITopPerformer[]>;
  
  generateQuoteReport(
    organizationId: string,
    reportType: string,
    dateRange: IDateRange,
    format: 'pdf' | 'excel' | 'csv'
  ): Promise<Buffer>;
}
```

#### **2. Quote Performance Dashboard**
```typescript
class QuoteAnalyticsService {
  async getQuoteAnalytics(
    organizationId: string,
    dateRange: IDateRange,
    filters?: IQuoteAnalyticsFilters
  ): Promise<IQuoteAnalytics> {
    try {
      // Build query with filters
      const query = this.buildAnalyticsQuery(organizationId, dateRange, filters);
      
      // Execute queries for different metrics
      const [
        volumeMetrics,
        financialMetrics,
        timeMetrics,
        qualityMetrics
      ] = await Promise.all([
        this.getVolumeMetrics(query),
        this.getFinancialMetrics(query),
        this.getTimeMetrics(query),
        this.getQualityMetrics(query)
      ]);

      // Calculate derived metrics
      const acceptanceRate = volumeMetrics.quotes_sent > 0 
        ? (volumeMetrics.quotes_accepted / volumeMetrics.quotes_sent) * 100 
        : 0;

      const conversionRate = volumeMetrics.total_quotes > 0 
        ? (volumeMetrics.quotes_accepted / volumeMetrics.total_quotes) * 100 
        : 0;

      const winRate = volumeMetrics.quotes_sent > 0 
        ? (volumeMetrics.quotes_accepted / volumeMetrics.quotes_sent) * 100 
        : 0;

      return {
        organization_id: organizationId,
        period: `${format(dateRange.start, 'yyyy-MM-dd')} to ${format(dateRange.end, 'yyyy-MM-dd')}`,
        ...volumeMetrics,
        ...financialMetrics,
        ...timeMetrics,
        ...qualityMetrics,
        acceptance_rate: acceptanceRate,
        conversion_rate: conversionRate,
        win_rate: winRate
      };
    } catch (error) {
      this.logger.error('Failed to get quote analytics', { error, organizationId, dateRange });
      throw error;
    }
  }

  private async getVolumeMetrics(query: any): Promise<Partial<IQuoteAnalytics>> {
    const result = await this.quoteRepository
      .createQueryBuilder('quote')
      .select([
        'COUNT(*) as total_quotes',
        'SUM(CASE WHEN quote.status = :draft THEN 1 ELSE 0 END) as quotes_created',
        'SUM(CASE WHEN quote.status = :sent THEN 1 ELSE 0 END) as quotes_sent',
        'SUM(CASE WHEN quote.status = :viewed THEN 1 ELSE 0 END) as quotes_viewed',
        'SUM(CASE WHEN quote.status = :accepted THEN 1 ELSE 0 END) as quotes_accepted',
        'SUM(CASE WHEN quote.status = :rejected THEN 1 ELSE 0 END) as quotes_rejected',
        'SUM(CASE WHEN quote.status = :expired THEN 1 ELSE 0 END) as quotes_expired'
      ])
      .setParameters({
        draft: QuoteStatus.DRAFT,
        sent: QuoteStatus.SENT,
        viewed: QuoteStatus.VIEWED,
        accepted: QuoteStatus.ACCEPTED,
        rejected: QuoteStatus.REJECTED,
        expired: QuoteStatus.EXPIRED
      })
      .where(query)
      .getRawOne();

    return {
      total_quotes: parseInt(result.total_quotes) || 0,
      quotes_created: parseInt(result.quotes_created) || 0,
      quotes_sent: parseInt(result.quotes_sent) || 0,
      quotes_viewed: parseInt(result.quotes_viewed) || 0,
      quotes_accepted: parseInt(result.quotes_accepted) || 0,
      quotes_rejected: parseInt(result.quotes_rejected) || 0,
      quotes_expired: parseInt(result.quotes_expired) || 0
    };
  }

  private async getFinancialMetrics(query: any): Promise<Partial<IQuoteAnalytics>> {
    const result = await this.quoteRepository
      .createQueryBuilder('quote')
      .select([
        'SUM(quote.total_amount) as total_quote_value',
        'AVG(quote.total_amount) as average_quote_value',
        'SUM(CASE WHEN quote.status = :accepted THEN quote.total_amount ELSE 0 END) as total_accepted_value'
      ])
      .setParameters({ accepted: QuoteStatus.ACCEPTED })
      .where(query)
      .getRawOne();

    return {
      total_quote_value: parseFloat(result.total_quote_value) || 0,
      average_quote_value: parseFloat(result.average_quote_value) || 0,
      total_accepted_value: parseFloat(result.total_accepted_value) || 0
    };
  }
}
```

---

## 🚀 **API Endpoints**

### **Quote Management Endpoints**
```typescript
// GET /api/v1/quotes
interface IGetQuotesEndpoint {
  query: {
    page?: number;
    limit?: number;
    search?: string;
    status?: QuoteStatus;
    customer_id?: string;
    project_id?: string;
    created_by?: string;
    valid_from?: string;
    valid_until?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  };
  response: {
    data: IQuote[];
    pagination: IPagination;
    meta: {
      total_count: number;
      total_amount: number;
      currency: string;
      organization_id: string;
    };
  };
}

// POST /api/v1/quotes
interface ICreateQuoteEndpoint {
  request: {
    title: string;
    description?: string;
    customer_id: string;
    project_id?: string;
    valid_from: string;
    valid_until: string;
    currency: string;
    line_items: IQuoteLineItemRequest[];
    terms_conditions?: string;
    notes?: string;
    internal_notes?: string;
  };
  response: {
    quote: IQuote;
    message: string;
  };
}

// GET /api/v1/quotes/{id}
interface IGetQuoteEndpoint {
  params: {
    id: string;
  };
  response: {
    quote: IQuoteDetail;
    line_items: IQuoteLineItem[];
    customer: ICustomer;
    project?: IProject;
    created_by: IPublicUser;
    approved_by?: IPublicUser;
    history: IQuoteHistory[];
  };
}

// PUT /api/v1/quotes/{id}
interface IUpdateQuoteEndpoint {
  params: {
    id: string;
  };
  request: {
    title?: string;
    description?: string;
    valid_from?: string;
    valid_until?: string;
    line_items?: IQuoteLineItemRequest[];
    terms_conditions?: string;
    notes?: string;
    internal_notes?: string;
  };
  response: {
    quote: IQuote;
    message: string;
  };
}
```

### **Workflow Endpoints**
```typescript
// POST /api/v1/quotes/{id}/submit-for-approval
interface ISubmitForApprovalEndpoint {
  params: {
    id: string;
  };
  response: {
    workflow_instance: IWorkflowInstance;
    message: string;
  };
}

// POST /api/v1/quotes/{id}/approve
interface IApproveQuoteEndpoint {
  params: {
    id: string;
  };
  request: {
    comments?: string;
  };
  response: {
    workflow_result: IWorkflowResult;
    message: string;
  };
}

// POST /api/v1/quotes/{id}/reject
interface IRejectQuoteEndpoint {
  params: {
    id: string;
  };
  request: {
    reason: string;
    comments?: string;
  };
  response: {
    workflow_result: IWorkflowResult;
    message: string;
  };
}

// POST /api/v1/quotes/{id}/send-to-customer
interface ISendToCustomerEndpoint {
  params: {
    id: string;
  };
  request: {
    email_template_id?: string;
    additional_recipients?: string[];
    message?: string;
  };
  response: {
    result: IWorkflowResult;
    message: string;
  };
}
```

---

## 🧪 **Testing Requirements**

### **Unit Testing**
```typescript
describe('PricingEngine', () => {
  let pricingEngine: PricingEngine;
  let mockQuoteRepository: jest.Mocked<IQuoteRepository>;
  let mockRateCardService: jest.Mocked<IRateCardService>;

  beforeEach(() => {
    mockQuoteRepository = createMockQuoteRepository();
    mockRateCardService = createMockRateCardService();
    pricingEngine = new PricingEngine(
      mockQuoteRepository,
      mockRateCardService,
      mockEventBus,
      mockLogger
    );
  });

  describe('calculateQuotePricing', () => {
    it('should calculate pricing correctly for quote with line items', async () => {
      const mockQuote = createMockQuote();
      const mockLineItems = createMockLineItems();
      
      mockQuoteRepository.findByIdWithLineItems.mockResolvedValue({
        ...mockQuote,
        lineItems: mockLineItems
      });

      const result = await pricingEngine.calculateQuotePricing('quote-123');

      expect(result.subtotal).toBe(1000);
      expect(result.total_amount).toBe(1080); // 1000 + 80 tax
      expect(mockQuoteRepository.updatePricing).toHaveBeenCalledWith('quote-123', result);
    });

    it('should apply discounts correctly', async () => {
      const mockQuote = createMockQuoteWithDiscount();
      const mockLineItems = createMockLineItems();
      
      mockQuoteRepository.findByIdWithLineItems.mockResolvedValue({
        ...mockQuote,
        lineItems: mockLineItems
      });

      const result = await pricingEngine.calculateQuotePricing('quote-123');

      expect(result.discount_amount).toBe(100); // 10% of 1000
      expect(result.subtotal).toBe(900);
      expect(result.total_amount).toBe(972); // 900 + 72 tax
    });
  });
});
```

---

## 📋 **Implementation Checklist**

### **Phase 1: Core Quote Management**
- [ ] Quote CRUD operations
- [ ] Line item management
- [ ] Basic pricing calculations
- [ ] Quote status management
- [ ] Database schema implementation

### **Phase 2: Pricing Engine**
- [ ] Rate card system
- [ ] Advanced pricing calculations
- [ ] Discount and tax handling
- [ ] Pricing validation
- [ ] Performance optimization

### **Phase 3: Approval Workflow**
- [ ] Workflow configuration
- [ ] Multi-step approval process
- [ ] Escalation handling
- [ ] Approval notifications
- [ ] Workflow analytics

### **Phase 4: PDF Generation**
- [ ] Template system
- [ ] PDF generation service
- [ ] Custom branding
- [ ] Multiple output formats
- [ ] Template management

### **Phase 5: Analytics & Reporting**
- [ ] Quote analytics
- [ ] Performance dashboards
- [ ] Custom reports
- [ ] Data export
- [ ] Real-time metrics

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Next Review**: February 2025  
**Quotation System Version**: 1.0.0
