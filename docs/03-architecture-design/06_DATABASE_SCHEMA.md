# Pivotal Flow - Complete Database Schema Design

## 🗄️ **Database Architecture Overview**

### **Technology Stack**
- **Primary Database**: PostgreSQL 16+ with advanced features
- **ORM**: Prisma with type-safe database operations
- **Migration Tool**: Prisma Migrate with version control
- **Connection Pooling**: PgBouncer for production environments
- **Backup Strategy**: Automated daily backups with point-in-time recovery

### **Design Principles**
- **Normalized design** for data integrity
- **Performance optimization** with strategic denormalization
- **Audit trails** for all critical data changes
- **Multi-tenant architecture** with organization isolation
- **Soft deletes** for data preservation
- **Comprehensive indexing** for query performance

---

## 🏗️ **Core Database Schema**

### **1. Organization & Multi-Tenancy**

#### **Organizations Table**
```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  domain VARCHAR(255),
  industry VARCHAR(100),
  size VARCHAR(50),
  timezone VARCHAR(50) DEFAULT 'UTC',
  currency VARCHAR(3) DEFAULT 'USD',
  tax_id VARCHAR(100),
  address JSONB,
  contact_info JSONB,
  settings JSONB DEFAULT '{}',
  subscription_plan VARCHAR(50) DEFAULT 'basic',
  subscription_status VARCHAR(20) DEFAULT 'active',
  trial_ends_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  
  CONSTRAINT organizations_name_length CHECK (char_length(name) >= 2),
  CONSTRAINT organizations_slug_format CHECK (slug ~ '^[a-z0-9-]+$')
);

-- Indexes for performance
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_domain ON organizations(domain);
CREATE INDEX idx_organizations_subscription_status ON organizations(subscription_status);
CREATE INDEX idx_organizations_deleted_at ON organizations(deleted_at);
```

#### **Organization Settings Table**
```sql
CREATE TABLE organization_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  key VARCHAR(255) NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(organization_id, category, key)
);

CREATE INDEX idx_organization_settings_lookup ON organization_settings(organization_id, category);
```

### **2. User Management & Authentication**

#### **Users Table**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  username VARCHAR(100) UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  display_name VARCHAR(200),
  avatar_url TEXT,
  phone VARCHAR(20),
  timezone VARCHAR(50) DEFAULT 'UTC',
  locale VARCHAR(10) DEFAULT 'en-US',
  status VARCHAR(20) DEFAULT 'active',
  email_verified BOOLEAN DEFAULT false,
  email_verified_at TIMESTAMP,
  last_login_at TIMESTAMP,
  login_count INTEGER DEFAULT 0,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP,
  password_hash VARCHAR(255),
  mfa_enabled BOOLEAN DEFAULT false,
  mfa_secret VARCHAR(255),
  preferences JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  
  CONSTRAINT users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT users_status_valid CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
  CONSTRAINT users_failed_logins_limit CHECK (failed_login_attempts >= 0 AND failed_login_attempts <= 10)
);

-- Indexes
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);
CREATE UNIQUE INDEX idx_users_org_email ON users(organization_id, email) WHERE deleted_at IS NULL;
```

#### **User Roles Table**
```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES users(id),
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  
  UNIQUE(user_id, role_id, organization_id)
);

CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);
CREATE INDEX idx_user_roles_organization ON user_roles(organization_id);
```

#### **Roles Table**
```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '[]',
  is_system BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(organization_id, name),
  CONSTRAINT roles_name_length CHECK (char_length(name) >= 2)
);

CREATE INDEX idx_roles_organization ON roles(organization_id);
CREATE INDEX idx_roles_is_system ON roles(is_system);
```

#### **Permissions Table**
```sql
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  action VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(category, resource, action)
);

CREATE INDEX idx_permissions_category ON permissions(category);
CREATE INDEX idx_permissions_resource ON permissions(resource);
```

### **3. Customer Management System**

#### **Customers Table**
```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  customer_number VARCHAR(50) UNIQUE NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  legal_name VARCHAR(255),
  industry VARCHAR(100),
  website VARCHAR(255),
  description TEXT,
  status VARCHAR(20) DEFAULT 'active',
  customer_type VARCHAR(50) DEFAULT 'business',
  source VARCHAR(50),
  tags TEXT[],
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  credit_limit DECIMAL(15,2),
  payment_terms INTEGER DEFAULT 30,
  tax_exempt BOOLEAN DEFAULT false,
  tax_id VARCHAR(100),
  address JSONB,
  contact_info JSONB,
  billing_info JSONB,
  preferences JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  
  CONSTRAINT customers_company_name_length CHECK (char_length(company_name) >= 2),
  CONSTRAINT customers_status_valid CHECK (status IN ('active', 'inactive', 'prospect', 'lead')),
  CONSTRAINT customers_customer_type_valid CHECK (customer_type IN ('business', 'individual', 'government'))
);

-- Indexes
CREATE INDEX idx_customers_organization ON customers(organization_id);
CREATE INDEX idx_customers_customer_number ON customers(customer_number);
CREATE INDEX idx_customers_company_name ON customers(company_name);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_customers_industry ON customers(industry);
CREATE INDEX idx_customers_deleted_at ON customers(deleted_at);
CREATE INDEX idx_customers_tags ON customers USING GIN(tags);
```

#### **Customer Contacts Table**
```sql
CREATE TABLE customer_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  title VARCHAR(200),
  email VARCHAR(255),
  phone VARCHAR(20),
  mobile VARCHAR(20),
  is_primary BOOLEAN DEFAULT false,
  is_billing_contact BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  
  CONSTRAINT customer_contacts_name_length CHECK (char_length(first_name) >= 1 AND char_length(last_name) >= 1)
);

CREATE INDEX idx_customer_contacts_customer ON customer_contacts(customer_id);
CREATE INDEX idx_customer_contacts_email ON customer_contacts(email);
CREATE INDEX idx_customer_contacts_is_primary ON customer_contacts(is_primary);
```

### **4. Quotation System**

#### **Quotes Table**
```sql
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  quote_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  type VARCHAR(50) DEFAULT 'project',
  valid_from DATE NOT NULL,
  valid_until DATE NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  exchange_rate DECIMAL(10,6) DEFAULT 1.000000,
  subtotal DECIMAL(15,2) DEFAULT 0.00,
  tax_rate DECIMAL(5,4) DEFAULT 0.0000,
  tax_amount DECIMAL(15,2) DEFAULT 0.00,
  discount_type VARCHAR(20) DEFAULT 'percentage',
  discount_value DECIMAL(10,4) DEFAULT 0.0000,
  discount_amount DECIMAL(15,2) DEFAULT 0.00,
  total_amount DECIMAL(15,2) DEFAULT 0.00,
  terms_conditions TEXT,
  notes TEXT,
  internal_notes TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  sent_at TIMESTAMP,
  accepted_at TIMESTAMP,
  expires_at TIMESTAMP,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  
  CONSTRAINT quotes_title_length CHECK (char_length(title) >= 3),
  CONSTRAINT quotes_status_valid CHECK (status IN ('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired', 'cancelled')),
  CONSTRAINT quotes_valid_dates CHECK (valid_from <= valid_until),
  CONSTRAINT quotes_amounts_positive CHECK (subtotal >= 0 AND tax_amount >= 0 AND discount_amount >= 0 AND total_amount >= 0)
);

-- Indexes
CREATE INDEX idx_quotes_organization ON quotes(organization_id);
CREATE INDEX idx_quotes_quote_number ON quotes(quote_number);
CREATE INDEX idx_quotes_customer ON quotes(customer_id);
CREATE INDEX idx_quotes_project ON quotes(project_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_created_by ON quotes(created_by);
CREATE INDEX idx_quotes_valid_until ON quotes(valid_until);
CREATE INDEX idx_quotes_deleted_at ON quotes(deleted_at);
```

#### **Quote Line Items Table**
```sql
CREATE TABLE quote_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  line_number INTEGER NOT NULL,
  type VARCHAR(50) DEFAULT 'service',
  description TEXT NOT NULL,
  quantity DECIMAL(10,4) NOT NULL DEFAULT 1.0000,
  unit_price DECIMAL(15,4) NOT NULL,
  unit_cost DECIMAL(15,4),
  tax_rate DECIMAL(5,4) DEFAULT 0.0000,
  tax_amount DECIMAL(15,2) DEFAULT 0.00,
  discount_type VARCHAR(20) DEFAULT 'percentage',
  discount_value DECIMAL(10,4) DEFAULT 0.0000,
  discount_amount DECIMAL(15,2) DEFAULT 0.00,
  subtotal DECIMAL(15,2) NOT NULL,
  total_amount DECIMAL(15,2) NOT NULL,
  service_category_id UUID REFERENCES service_categories(id),
  rate_card_id UUID REFERENCES rate_cards(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(quote_id, line_number),
  CONSTRAINT quote_line_items_quantity_positive CHECK (quantity > 0),
  CONSTRAINT quote_line_items_unit_price_positive CHECK (unit_price >= 0),
  CONSTRAINT quote_line_items_amounts_positive CHECK (subtotal >= 0 AND total_amount >= 0)
);

CREATE INDEX idx_quote_line_items_quote ON quote_line_items(quote_id);
CREATE INDEX idx_quote_line_items_service_category ON quote_line_items(service_category_id);
CREATE INDEX idx_quote_line_items_rate_card ON quote_line_items(rate_card_id);
```

#### **Service Categories Table**
```sql
CREATE TABLE service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES service_categories(id),
  color VARCHAR(7),
  icon VARCHAR(100),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(organization_id, name),
  CONSTRAINT service_categories_name_length CHECK (char_length(name) >= 2)
);

CREATE INDEX idx_service_categories_organization ON service_categories(organization_id);
CREATE INDEX idx_service_categories_parent ON service_categories(parent_id);
CREATE INDEX idx_service_categories_sort_order ON service_categories(sort_order);
```

#### **Rate Cards Table**
```sql
CREATE TABLE rate_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  currency VARCHAR(3) DEFAULT 'USD',
  effective_from DATE NOT NULL,
  effective_until DATE,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT rate_cards_name_length CHECK (char_length(name) >= 2),
  CONSTRAINT rate_cards_effective_dates CHECK (effective_from <= effective_until OR effective_until IS NULL)
);

CREATE INDEX idx_rate_cards_organization ON rate_cards(organization_id);
CREATE INDEX idx_rate_cards_effective_from ON rate_cards(effective_from);
CREATE INDEX idx_rate_cards_is_default ON rate_cards(is_default);
```

#### **Rate Card Items Table**
```sql
CREATE TABLE rate_card_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rate_card_id UUID NOT NULL REFERENCES rate_cards(id) ON DELETE CASCADE,
  service_category_id UUID NOT NULL REFERENCES service_categories(id),
  role_id UUID REFERENCES roles(id),
  location_factor_id UUID REFERENCES location_factors(id),
  base_rate DECIMAL(15,4) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  effective_from DATE NOT NULL,
  effective_until DATE,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(rate_card_id, service_category_id, role_id, location_factor_id, effective_from),
  CONSTRAINT rate_card_items_base_rate_positive CHECK (base_rate >= 0),
  CONSTRAINT rate_card_items_effective_dates CHECK (effective_from <= effective_until OR effective_until IS NULL)
);

CREATE INDEX idx_rate_card_items_rate_card ON rate_card_items(rate_card_id);
CREATE INDEX idx_rate_card_items_service_category ON rate_card_items(service_category_id);
CREATE INDEX idx_rate_card_items_role ON rate_card_items(role_id);
CREATE INDEX idx_rate_card_items_location_factor ON rate_card_items(location_factor_id);
CREATE INDEX idx_rate_card_items_effective_from ON rate_card_items(effective_from);
```

### **5. Project Management System**

#### **Projects Table**
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_number VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  quote_id UUID REFERENCES quotes(id),
  status VARCHAR(50) DEFAULT 'planning',
  priority VARCHAR(20) DEFAULT 'medium',
  start_date DATE,
  end_date DATE,
  actual_start_date DATE,
  actual_end_date DATE,
  estimated_hours DECIMAL(10,2),
  actual_hours DECIMAL(10,2) DEFAULT 0.00,
  estimated_cost DECIMAL(15,2),
  actual_cost DECIMAL(15,2) DEFAULT 0.00,
  budget DECIMAL(15,2),
  currency VARCHAR(3) DEFAULT 'USD',
  project_manager_id UUID REFERENCES users(id),
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  
  CONSTRAINT projects_name_length CHECK (char_length(name) >= 3),
  CONSTRAINT projects_status_valid CHECK (status IN ('planning', 'active', 'on-hold', 'completed', 'cancelled')),
  CONSTRAINT projects_priority_valid CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  CONSTRAINT projects_dates_valid CHECK (start_date <= end_date OR end_date IS NULL),
  CONSTRAINT projects_hours_positive CHECK (estimated_hours >= 0 AND actual_hours >= 0),
  CONSTRAINT projects_costs_positive CHECK (estimated_cost >= 0 AND actual_cost >= 0 AND budget >= 0)
);

-- Indexes
CREATE INDEX idx_projects_organization ON projects(organization_id);
CREATE INDEX idx_projects_project_number ON projects(project_number);
CREATE INDEX idx_projects_customer ON projects(customer_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_project_manager ON projects(project_manager_id);
CREATE INDEX idx_projects_start_date ON projects(start_date);
CREATE INDEX idx_projects_end_date ON projects(end_date);
CREATE INDEX idx_projects_deleted_at ON projects(deleted_at);
CREATE INDEX idx_projects_tags ON projects USING GIN(tags);
```

#### **Project Tasks Table**
```sql
CREATE TABLE project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  parent_task_id UUID REFERENCES project_tasks(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'todo',
  priority VARCHAR(20) DEFAULT 'medium',
  type VARCHAR(50) DEFAULT 'task',
  estimated_hours DECIMAL(10,2),
  actual_hours DECIMAL(10,2) DEFAULT 0.00,
  estimated_cost DECIMAL(15,2),
  actual_cost DECIMAL(15,2) DEFAULT 0.00,
  start_date DATE,
  due_date DATE,
  completed_at TIMESTAMP,
  assigned_to UUID REFERENCES users(id),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  dependencies TEXT[],
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  
  CONSTRAINT project_tasks_name_length CHECK (char_length(name) >= 3),
  CONSTRAINT project_tasks_status_valid CHECK (status IN ('todo', 'in-progress', 'review', 'completed', 'cancelled')),
  CONSTRAINT project_tasks_priority_valid CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  CONSTRAINT project_tasks_hours_positive CHECK (estimated_hours >= 0 AND actual_hours >= 0),
  CONSTRAINT project_tasks_costs_positive CHECK (estimated_cost >= 0 AND actual_cost >= 0)
);

CREATE INDEX idx_project_tasks_project ON project_tasks(project_id);
CREATE INDEX idx_project_tasks_parent ON project_tasks(parent_task_id);
CREATE INDEX idx_project_tasks_status ON project_tasks(status);
CREATE INDEX idx_project_tasks_assigned_to ON project_tasks(assigned_to);
CREATE INDEX idx_project_tasks_due_date ON project_tasks(due_date);
CREATE INDEX idx_project_tasks_deleted_at ON project_tasks(deleted_at);
CREATE INDEX idx_project_tasks_tags ON project_tasks USING GIN(tags);
```

### **6. Time Management System**

#### **Time Entries Table**
```sql
CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES project_tasks(id),
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  duration_hours DECIMAL(10,4) NOT NULL,
  description TEXT NOT NULL,
  billable BOOLEAN DEFAULT true,
  hourly_rate DECIMAL(15,4),
  total_amount DECIMAL(15,2),
  status VARCHAR(50) DEFAULT 'pending',
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  rejected_reason TEXT,
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  
  CONSTRAINT time_entries_duration_positive CHECK (duration_hours > 0),
  CONSTRAINT time_entries_date_not_future CHECK (date <= CURRENT_DATE),
  CONSTRAINT time_entries_status_valid CHECK (status IN ('pending', 'approved', 'rejected', 'invoiced')),
  CONSTRAINT time_entries_time_validation CHECK (
    (start_time IS NULL AND end_time IS NULL) OR
    (start_time IS NOT NULL AND end_time IS NOT NULL AND start_time < end_time)
  )
);

-- Indexes
CREATE INDEX idx_time_entries_organization ON time_entries(organization_id);
CREATE INDEX idx_time_entries_user ON time_entries(user_id);
CREATE INDEX idx_time_entries_project ON time_entries(project_id);
CREATE INDEX idx_time_entries_task ON time_entries(task_id);
CREATE INDEX idx_time_entries_date ON time_entries(date);
CREATE INDEX idx_time_entries_status ON time_entries(status);
CREATE INDEX idx_time_entries_deleted_at ON time_entries(deleted_at);
CREATE INDEX idx_time_entries_tags ON time_entries USING GIN(tags);
```

### **7. Invoice & Billing System**

#### **Invoices Table**
```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id),
  quote_id UUID REFERENCES quotes(id),
  type VARCHAR(50) DEFAULT 'standard',
  status VARCHAR(50) DEFAULT 'draft',
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  exchange_rate DECIMAL(10,6) DEFAULT 1.000000,
  subtotal DECIMAL(15,2) DEFAULT 0.00,
  tax_rate DECIMAL(5,4) DEFAULT 0.0000,
  tax_amount DECIMAL(15,2) DEFAULT 0.00,
  discount_type VARCHAR(20) DEFAULT 'percentage',
  discount_value DECIMAL(10,4) DEFAULT 0.0000,
  discount_amount DECIMAL(15,2) DEFAULT 0.00,
  total_amount DECIMAL(15,2) DEFAULT 0.00,
  paid_amount DECIMAL(15,2) DEFAULT 0.00,
  balance_amount DECIMAL(15,2) DEFAULT 0.00,
  terms_conditions TEXT,
  notes TEXT,
  internal_notes TEXT,
  sent_at TIMESTAMP,
  viewed_at TIMESTAMP,
  paid_at TIMESTAMP,
  overdue_at TIMESTAMP,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  
  CONSTRAINT invoices_invoice_number_length CHECK (char_length(invoice_number) >= 3),
  CONSTRAINT invoices_status_valid CHECK (status IN ('draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled', 'partially_paid')),
  CONSTRAINT invoices_dates_valid CHECK (issue_date <= due_date),
  CONSTRAINT invoices_amounts_positive CHECK (subtotal >= 0 AND tax_amount >= 0 AND discount_amount >= 0 AND total_amount >= 0)
);

-- Indexes
CREATE INDEX idx_invoices_organization ON invoices(organization_id);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_project ON invoices(project_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_issue_date ON invoices(issue_date);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_deleted_at ON invoices(deleted_at);
```

#### **Invoice Line Items Table**
```sql
CREATE TABLE invoice_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  line_number INTEGER NOT NULL,
  type VARCHAR(50) DEFAULT 'service',
  description TEXT NOT NULL,
  quantity DECIMAL(10,4) NOT NULL DEFAULT 1.0000,
  unit_price DECIMAL(15,4) NOT NULL,
  unit_cost DECIMAL(15,4),
  tax_rate DECIMAL(5,4) DEFAULT 0.0000,
  tax_amount DECIMAL(15,2) DEFAULT 0.00,
  discount_type VARCHAR(20) DEFAULT 'percentage',
  discount_value DECIMAL(10,4) DEFAULT 0.0000,
  discount_amount DECIMAL(15,2) DEFAULT 0.00,
  subtotal DECIMAL(15,2) NOT NULL,
  total_amount DECIMAL(15,2) NOT NULL,
  time_entry_ids UUID[],
  quote_line_item_id UUID REFERENCES quote_line_items(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(invoice_id, line_number),
  CONSTRAINT invoice_line_items_quantity_positive CHECK (quantity > 0),
  CONSTRAINT invoice_line_items_unit_price_positive CHECK (unit_price >= 0),
  CONSTRAINT invoice_line_items_amounts_positive CHECK (subtotal >= 0 AND total_amount >= 0)
);

CREATE INDEX idx_invoice_line_items_invoice ON invoice_line_items(invoice_id);
CREATE INDEX idx_invoice_line_items_quote_line_item ON invoice_line_items(quote_line_item_id);
CREATE INDEX idx_invoice_line_items_time_entries ON invoice_line_items USING GIN(time_entry_ids);
```

### **8. Audit & Compliance System**

#### **Audit Logs Table**
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT audit_logs_action_length CHECK (char_length(action) >= 2),
  CONSTRAINT audit_logs_entity_type_length CHECK (char_length(entity_type) >= 2)
);

-- Indexes
CREATE INDEX idx_audit_logs_organization ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

---

## 🔗 **Database Relationships & Constraints**

### **Foreign Key Relationships**

#### **Core Relationships**
```sql
-- Organizations are the root entity
-- Users belong to organizations
-- Customers belong to organizations
-- Projects belong to customers and organizations
-- Quotes belong to customers and organizations
-- Invoices belong to customers and organizations
-- Time entries belong to users, projects, and organizations

-- Cascade delete relationships
ALTER TABLE users ADD CONSTRAINT fk_users_organization 
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

ALTER TABLE customers ADD CONSTRAINT fk_customers_organization 
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

ALTER TABLE projects ADD CONSTRAINT fk_projects_organization 
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

ALTER TABLE quotes ADD CONSTRAINT fk_quotes_organization 
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

ALTER TABLE invoices ADD CONSTRAINT fk_invoices_organization 
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

ALTER TABLE time_entries ADD CONSTRAINT fk_time_entries_organization 
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
```

#### **Business Logic Relationships**
```sql
-- Projects can have multiple quotes
ALTER TABLE quotes ADD CONSTRAINT fk_quotes_project 
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;

-- Quotes can become invoices
ALTER TABLE invoices ADD CONSTRAINT fk_invoices_quote 
  FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE SET NULL;

-- Time entries are linked to projects and tasks
ALTER TABLE time_entries ADD CONSTRAINT fk_time_entries_project 
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

ALTER TABLE time_entries ADD CONSTRAINT fk_time_entries_task 
  FOREIGN KEY (task_id) REFERENCES project_tasks(id) ON DELETE SET NULL;
```

### **Check Constraints**

#### **Data Validation**
```sql
-- Ensure positive amounts
ALTER TABLE quotes ADD CONSTRAINT chk_quotes_amounts_positive 
  CHECK (subtotal >= 0 AND tax_amount >= 0 AND discount_amount >= 0 AND total_amount >= 0);

-- Ensure valid dates
ALTER TABLE projects ADD CONSTRAINT chk_projects_dates_valid 
  CHECK (start_date <= end_date OR end_date IS NULL);

-- Ensure valid status transitions
ALTER TABLE quotes ADD CONSTRAINT chk_quotes_status_valid 
  CHECK (status IN ('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired', 'cancelled'));
```

---

## 📊 **Performance Optimization**

### **Strategic Indexing**

#### **Primary Indexes**
```sql
-- Organization-based queries (most common)
CREATE INDEX CONCURRENTLY idx_quotes_org_status ON quotes(organization_id, status);
CREATE INDEX CONCURRENTLY idx_projects_org_status ON projects(organization_id, status);
CREATE INDEX CONCURRENTLY idx_invoices_org_status ON invoices(organization_id, status);

-- Date-based queries
CREATE INDEX CONCURRENTLY idx_quotes_valid_until ON quotes(valid_until) WHERE status = 'sent';
CREATE INDEX CONCURRENTLY idx_invoices_due_date ON invoices(due_date) WHERE status IN ('sent', 'overdue');

-- Customer-based queries
CREATE INDEX CONCURRENTLY idx_quotes_customer_status ON quotes(customer_id, status);
CREATE INDEX CONCURRENTLY idx_projects_customer_status ON projects(customer_id, status);
```

#### **Composite Indexes**
```sql
-- Multi-column queries
CREATE INDEX CONCURRENTLY idx_time_entries_user_date ON time_entries(user_id, date);
CREATE INDEX CONCURRENTLY idx_projects_manager_status ON projects(project_manager_id, status);
CREATE INDEX CONCURRENTLY idx_quotes_customer_project ON quotes(customer_id, project_id);
```

### **Partitioning Strategy**

#### **Time-Based Partitioning**
```sql
-- Partition time entries by month for large datasets
CREATE TABLE time_entries_2025_01 PARTITION OF time_entries
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE time_entries_2025_02 PARTITION OF time_entries
  FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
```

---

## 🔒 **Security & Access Control**

### **Row-Level Security (RLS)**

#### **Organization Isolation**
```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for organization isolation
CREATE POLICY users_organization_isolation ON users
  FOR ALL USING (organization_id = current_setting('app.current_organization_id')::UUID);

CREATE POLICY customers_organization_isolation ON customers
  FOR ALL USING (organization_id = current_setting('app.current_organization_id')::UUID);
```

### **Data Encryption**

#### **Sensitive Data Encryption**
```sql
-- Encrypt sensitive fields
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Update users table to encrypt sensitive data
ALTER TABLE users ADD COLUMN encrypted_phone BYTEA;
ALTER TABLE users ADD COLUMN encrypted_tax_id BYTEA;

-- Create function to encrypt data
CREATE OR REPLACE FUNCTION encrypt_sensitive_data(data TEXT, key TEXT)
RETURNS BYTEA AS $$
BEGIN
  RETURN pgp_sym_encrypt(data, key);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 📈 **Monitoring & Maintenance**

### **Performance Monitoring**

#### **Query Performance Views**
```sql
-- Create view for slow queries
CREATE VIEW slow_queries AS
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC;

-- Create view for table statistics
CREATE VIEW table_stats AS
SELECT 
  schemaname,
  tablename,
  n_tup_ins,
  n_tup_upd,
  n_tup_del,
  n_live_tup,
  n_dead_tup
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;
```

### **Maintenance Procedures**

#### **Automated Maintenance**
```sql
-- Create maintenance function
CREATE OR REPLACE FUNCTION perform_maintenance()
RETURNS VOID AS $$
BEGIN
  -- Update statistics
  ANALYZE;
  
  -- Vacuum tables
  VACUUM ANALYZE;
  
  -- Reindex if needed
  REINDEX DATABASE pivotalflow;
END;
$$ LANGUAGE plpgsql;

-- Schedule maintenance (using pg_cron extension)
SELECT cron.schedule('daily-maintenance', '0 2 * * *', 'SELECT perform_maintenance();');
```

---

## 📋 **Migration & Deployment**

### **Database Migration Strategy**

#### **Version Control**
```sql
-- Create migration tracking table
CREATE TABLE schema_migrations (
  id SERIAL PRIMARY KEY,
  version VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  checksum VARCHAR(64),
  execution_time_ms INTEGER
);

-- Insert initial migration
INSERT INTO schema_migrations (version, name) 
VALUES ('001', 'Initial schema creation');
```

#### **Rollback Procedures**
```sql
-- Create rollback function
CREATE OR REPLACE FUNCTION rollback_migration(version_to_rollback VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  migration_record RECORD;
BEGIN
  -- Get migration details
  SELECT * INTO migration_record 
  FROM schema_migrations 
  WHERE version = version_to_rollback;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Migration % not found', version_to_rollback;
  END IF;
  
  -- Execute rollback logic based on migration name
  -- This would be implemented based on specific migration requirements
  
  -- Remove migration record
  DELETE FROM schema_migrations WHERE version = version_to_rollback;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
```

---

## 🎯 **Next Steps & Implementation**

### **Immediate Actions**

1. **Database Setup**
   - Install PostgreSQL 16+ with required extensions
   - Configure connection pooling and performance tuning
   - Set up backup and recovery procedures

2. **Schema Implementation**
   - Execute schema creation scripts
   - Set up initial data and seed records
   - Configure row-level security policies

3. **Performance Optimization**
   - Create strategic indexes
   - Set up partitioning for large tables
   - Configure monitoring and alerting

4. **Security Implementation**
   - Enable row-level security
   - Implement data encryption for sensitive fields
   - Set up audit logging and compliance monitoring

### **Long-term Considerations**

1. **Scalability Planning**
   - Monitor table growth and performance
   - Implement additional partitioning as needed
   - Plan for read replicas and sharding

2. **Compliance & Auditing**
   - Regular security audits and penetration testing
   - Compliance monitoring and reporting
   - Data retention and cleanup procedures

3. **Performance Monitoring**
   - Continuous performance monitoring and optimization
   - Query performance analysis and optimization
   - Capacity planning and resource allocation

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Next Review**: February 2025  
**Database Version**: PostgreSQL 16+  
**Schema Version**: 1.0.0
