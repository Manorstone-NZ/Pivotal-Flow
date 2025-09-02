import axios from 'axios';

const BASE_URL = 'http://localhost:3000/v1';

async function testRateCards() {
  console.log('🧪 Testing Rate Card Functionality');
  console.log('=====================================\n');

  try {
    // Test 1: Get all rate cards
    console.log('1. Testing GET /rate-cards');
    const rateCardsResponse = await axios.get(`${BASE_URL}/rate-cards`);
    console.log('✅ Rate cards retrieved:', rateCardsResponse.data.length, 'cards found');
    console.log('   Sample rate card:', rateCardsResponse.data[0]?.name || 'None');
    console.log('');

    // Test 2: Get active rate card
    console.log('2. Testing GET /rate-cards/active');
    const activeRateCardResponse = await axios.get(`${BASE_URL}/rate-cards/active`);
    console.log('✅ Active rate card retrieved:', activeRateCardResponse.data?.name || 'None');
    console.log('');

    // Test 3: Test pricing resolution
    console.log('3. Testing POST /rate-cards/resolve-pricing');
    const pricingData = {
      lineItems: [
        {
          lineNumber: 1,
          description: 'Development work',
          itemCode: 'DEV-HOURLY',
          quantity: 10
        },
        {
          lineNumber: 2,
          description: 'Design work',
          itemCode: 'DESIGN-HOURLY',
          quantity: 5
        }
      ],
      effectiveDate: '2025-01-15',
      userHasOverridePermission: false
    };

    const pricingResponse = await axios.post(`${BASE_URL}/rate-cards/resolve-pricing`, pricingData);
    console.log('✅ Pricing resolution successful');
    console.log('   Results:', pricingResponse.data.results?.length || 0, 'items resolved');
    console.log('   Sample result:', pricingResponse.data.results?.[0] || 'None');
    console.log('');

    // Test 4: Test with explicit pricing (should fail without permission)
    console.log('4. Testing pricing resolution with explicit price (no permission)');
    const explicitPricingData = {
      lineItems: [
        {
          lineNumber: 1,
          description: 'Development work',
          unitPrice: { amount: 200, currency: 'NZD' },
          itemCode: 'DEV-HOURLY',
          quantity: 10
        }
      ],
      effectiveDate: '2025-01-15',
      userHasOverridePermission: false
    };

    try {
      const explicitResponse = await axios.post(`${BASE_URL}/rate-cards/resolve-pricing`, explicitPricingData);
      console.log('✅ Explicit pricing resolved (using rate card price)');
      console.log('   Unit price used:', explicitResponse.data.results?.[0]?.unitPrice || 'None');
    } catch (error) {
      console.log('❌ Explicit pricing failed:', error.response?.data?.message || error.message);
    }
    console.log('');

    // Test 5: Test cache functionality
    console.log('5. Testing cache functionality');
    const startTime = Date.now();
    const cacheResponse1 = await axios.get(`${BASE_URL}/rate-cards/active`);
    const time1 = Date.now() - startTime;
    
    const startTime2 = Date.now();
    const cacheResponse2 = await axios.get(`${BASE_URL}/rate-cards/active`);
    const time2 = Date.now() - startTime2;
    
    console.log(`✅ Cache test - First call: ${time1}ms, Second call: ${time2}ms`);
    console.log('   Cache hit improvement:', time1 > time2 ? 'Yes' : 'No');
    console.log('');

    console.log('🎉 All rate card tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    console.error('Headers:', error.response?.headers);
  }
}

// Run the tests
testRateCards().catch(console.error);
