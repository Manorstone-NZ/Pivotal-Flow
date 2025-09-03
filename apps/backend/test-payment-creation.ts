import { initializeDatabase, getDatabase } from './src/lib/db.js';
import { PaymentRepository } from '@pivotal-flow/shared';

async function testPaymentCreation() {
  try {
    await initializeDatabase();
    const db = getDatabase();
    
    console.log('🧪 Testing payment creation...');
    
    const paymentRepo = new PaymentRepository(db, {
      organizationId: '6975c31b-a98d-491f-aed6-8792735aef02',
      userId: '2a870792-298d-41aa-b4ba-3349aebc749c'
    });
    
    // Test invoice ID from our test data
    const invoiceId = '381b4f3b-b343-4922-abba-306f9fc0417d';
    
    // Test payment data
    const paymentData = {
      organizationId: '6975c31b-a98d-491f-aed6-8792735aef02',
      invoiceId: invoiceId,
      amount: 1000.00,
      currency: 'NZD',
      method: 'bank_transfer',
      reference: 'TEST-001',
      paidAt: new Date(),
      createdBy: '2a870792-298d-41aa-b4ba-3349aebc749c',
      idempotencyKey: undefined,
      gatewayPayload: undefined,
    };
    
    console.log('Creating payment with data:', paymentData);
    
    // Validate payment data
    const validation = paymentRepo.validatePaymentData(paymentData);
    console.log('Validation result:', validation);
    
    if (!validation.isValid) {
      console.error('❌ Payment validation failed:', validation.errors);
      return;
    }
    
    // Create payment
    const payment = await paymentRepo.createPayment(paymentData);
    console.log('✅ Payment created successfully:', payment);
    
    // Get invoice with payments
    const result = await paymentRepo.getInvoiceWithPayments(invoiceId);
    console.log('📋 Invoice with payments:', result);
    
  } catch (error) {
    console.error('❌ Error testing payment creation:', error);
  }
}

testPaymentCreation();
