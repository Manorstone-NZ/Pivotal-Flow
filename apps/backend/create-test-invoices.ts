import { initializeDatabase, getDatabase } from './src/lib/db.js';
import { invoices, customers, organizations, users } from './src/lib/schema.js';
import crypto from 'crypto';

async function createTestInvoices() {
  try {
    // Initialize database
    await initializeDatabase();
    const db = getDatabase();
    
    console.log('🌱 Creating test invoices for payment testing...');
    
    // Get the first organization and user
    const orgs = await db.select().from(organizations).limit(1);
    const usersList = await db.select().from(users).limit(1);
    
    if (orgs.length === 0 || usersList.length === 0) {
      console.error('❌ No organizations or users found. Please run create-test-user-simple.ts first.');
      return;
    }
    
    const org = orgs[0];
    const user = usersList[0];
    
    console.log(`Using organization: ${org.id} (${org.name})`);
    console.log(`Using user: ${user.id} (${user.email})`);
    
    // Create a test customer
    const customerId = crypto.randomUUID();
    await db.insert(customers).values({
      id: customerId,
      organizationId: org.id,
      customerNumber: `CUST-${Date.now()}`,
      companyName: 'Test Customer Company',
      legalName: 'Test Customer Company Ltd',
      email: 'customer@test.com',
      phone: '+1234567890',
      street: '123 Test St',
      city: 'Test City',
      region: 'Test State',
      postcode: '12345',
      country: 'Test Country',
      status: 'active',
      customerType: 'business',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log(`Created customer: ${customerId}`);
    
    // Create test invoices
    const invoice1Id = crypto.randomUUID();
    const invoice2Id = crypto.randomUUID();
    const invoice3Id = crypto.randomUUID();
    
    await db.insert(invoices).values([
      {
        id: invoice1Id,
        organizationId: org.id,
        invoiceNumber: `INV-${Date.now()}-001`,
        customerId: customerId,
        title: 'Web Development Services',
        currency: 'NZD',
        subtotal: 5000.00,
        taxAmount: 750.00,
        totalAmount: 5750.00,
        paidAmount: 0.00,
        balanceAmount: 5750.00,
        status: 'sent',
        issuedAt: new Date(),
        dueAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        createdBy: user.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: invoice2Id,
        organizationId: org.id,
        invoiceNumber: `INV-${Date.now()}-002`,
        customerId: customerId,
        title: 'Consulting Services',
        currency: 'AUD',
        subtotal: 3000.00,
        taxAmount: 450.00,
        totalAmount: 3450.00,
        paidAmount: 1000.00,
        balanceAmount: 2450.00,
        status: 'part_paid',
        issuedAt: new Date(),
        dueAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        createdBy: user.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: invoice3Id,
        organizationId: org.id,
        invoiceNumber: `INV-${Date.now()}-003`,
        customerId: customerId,
        title: 'Design Services',
        currency: 'USD',
        subtotal: 2000.00,
        taxAmount: 300.00,
        totalAmount: 2300.00,
        paidAmount: 2300.00,
        balanceAmount: 0.00,
        status: 'paid',
        issuedAt: new Date(),
        paidAt: new Date(),
        createdBy: user.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    
    console.log('✅ Test invoices created successfully!');
    console.log(`Invoice 1 (NZD): ${invoice1Id} - Status: sent - Balance: $5750.00`);
    console.log(`Invoice 2 (AUD): ${invoice2Id} - Status: part_paid - Balance: $2450.00`);
    console.log(`Invoice 3 (USD): ${invoice3Id} - Status: paid - Balance: $0.00`);
    console.log('🎉 Test invoice creation complete!');
    
  } catch (error) {
    console.error('❌ Error creating test invoices:', error);
  }
}

createTestInvoices();
