-- Add customer contacts table
CREATE TABLE IF NOT EXISTS "customer_contacts" (
  "id" text PRIMARY KEY NOT NULL,
  "customer_id" text NOT NULL,
  "organization_id" text NOT NULL,
  "first_name" varchar(100) NOT NULL,
  "last_name" varchar(100) NOT NULL,
  "email" varchar(255),
  "phone" varchar(20),
  "position" varchar(100),
  "department" varchar(100),
  "is_primary" boolean DEFAULT false NOT NULL,
  "notes" text,
  "contact_extras" jsonb,
  "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp(3) with time zone
);

-- Add foreign key constraints
DO $$ BEGIN
 ALTER TABLE "customer_contacts" ADD CONSTRAINT "customer_contacts_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "customer_contacts" ADD CONSTRAINT "customer_contacts_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS "idx_customer_contacts_customer_id" ON "customer_contacts" ("customer_id");
CREATE INDEX IF NOT EXISTS "idx_customer_contacts_organization_id" ON "customer_contacts" ("organization_id");
CREATE INDEX IF NOT EXISTS "idx_customer_contacts_primary" ON "customer_contacts" ("customer_id","is_primary");
CREATE INDEX IF NOT EXISTS "idx_customer_contacts_email" ON "customer_contacts" ("email");
