import { Decimal } from 'decimal.js';
import { calculateQuote } from './dist/pricing/index.js';

console.log('Testing Pricing Calculations...\n');

// Test Example 1: Web Development
console.log('Example 1: Web Development');
const input1 = {
  lineItems: [{
    description: 'Web Development',
    quantity: 40,
    unitPrice: { amount: new Decimal(150), currency: 'NZD' },
    unit: 'hours'
  }],
  currency: 'NZD'
};

try {
  const result1 = calculateQuote(input1);
  console.log('✅ Line Total:', result1.lineCalculations[0].subtotal.amount.toNumber());
  console.log('✅ Tax Amount:', result1.lineCalculations[0].taxAmount.amount.toNumber());
  console.log('✅ Final Total:', result1.lineCalculations[0].totalAmount.amount.toNumber());
  console.log('✅ Expected: 6000, 900, 6900');
  console.log('✅ Test PASSED\n');
} catch (error) {
  console.log('❌ Test FAILED:', error.message);
}

// Test Example 2: Design Services with 10% Discount
console.log('Example 2: Design Services with 10% Discount');
const input2 = {
  lineItems: [{
    description: 'Design Services',
    quantity: 20,
    unitPrice: { amount: new Decimal(120), currency: 'NZD' },
    unit: 'hours',
    discountType: 'percentage',
    discountValue: 10
  }],
  currency: 'NZD'
};

try {
  const result2 = calculateQuote(input2);
  console.log('✅ Line Total:', result2.lineCalculations[0].subtotal.amount.toNumber());
  console.log('✅ Discount:', result2.lineCalculations[0].discountAmount.amount.toNumber());
  console.log('✅ Tax Amount:', result2.lineCalculations[0].taxAmount.amount.toNumber());
  console.log('✅ Final Total:', result2.lineCalculations[0].totalAmount.amount.toNumber());
  console.log('✅ Expected: 2400, 240, 324, 2484');
  console.log('✅ Test PASSED\n');
} catch (error) {
  console.log('❌ Test FAILED:', error.message);
}

// Test Example 5: Travel Expenses (Tax Exempt)
console.log('Example 5: Travel Expenses (Tax Exempt)');
const input5 = {
  lineItems: [{
    description: 'Travel Expenses',
    quantity: 100,
    unitPrice: { amount: new Decimal(0.85), currency: 'NZD' },
    unit: 'km',
    serviceType: 'travel',
    isTaxExempt: true
  }],
  currency: 'NZD'
};

try {
  const result5 = calculateQuote(input5);
  console.log('✅ Line Total:', result5.lineCalculations[0].subtotal.amount.toNumber());
  console.log('✅ Tax Amount:', result5.lineCalculations[0].taxAmount.amount.toNumber());
  console.log('✅ Final Total:', result5.lineCalculations[0].totalAmount.amount.toNumber());
  console.log('✅ Expected: 85, 0, 85');
  console.log('✅ Test PASSED\n');
} catch (error) {
  console.log('❌ Test FAILED:', error.message);
}

console.log('All tests completed!');
