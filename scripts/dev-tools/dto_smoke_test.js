#!/usr/bin/env node
"use strict";
/**
 * Smoke Test: Customer and User DTOs
 *
 * This script tests that the customer and user repositories return DTOs
 * with the expected fields (id, email, displayName, isActive, organizationId).
 */
Object.defineProperty(exports, "__esModule", { value: true });
const { CustomerRepository } = require('../../apps/backend/src/lib/repo.customers');
const { UserRepository } = require('../../apps/backend/src/lib/repo.users');
async function testCustomerDTOs() {
    console.log('🧪 Testing Customer DTOs...');
    try {
        const customerRepo = new CustomerRepository('org_test');
        // Test list customers
        const customers = await customerRepo.listCustomers({
            page: 1,
            pageSize: 5
        });
        console.log(`✅ Found ${customers.customers.length} customers`);
        // Verify DTO structure
        if (customers.customers.length > 0) {
            const customer = customers.customers[0];
            const expectedFields = ['id', 'email', 'displayName', 'isActive', 'organizationId'];
            const actualFields = Object.keys(customer);
            const missingFields = expectedFields.filter(field => !actualFields.includes(field));
            const extraFields = actualFields.filter(field => !expectedFields.includes(field));
            if (missingFields.length > 0) {
                console.error(`❌ Missing fields: ${missingFields.join(', ')}`);
                return false;
            }
            if (extraFields.length > 0) {
                console.error(`❌ Extra fields: ${extraFields.join(', ')}`);
                return false;
            }
            console.log('✅ Customer DTO structure is correct');
            console.log('📋 Sample customer:', {
                id: customer.id,
                email: customer.email,
                displayName: customer.displayName,
                isActive: customer.isActive,
                organizationId: customer.organizationId
            });
        }
        return true;
    }
    catch (error) {
        console.error('❌ Customer DTO test failed:', error);
        return false;
    }
}
async function testUserDTOs() {
    console.log('🧪 Testing User DTOs...');
    try {
        const userRepo = new UserRepository('org_test');
        // Test list users
        const users = await userRepo.listUsers({
            page: 1,
            pageSize: 5
        });
        console.log(`✅ Found ${users.users.length} users`);
        // Verify DTO structure
        if (users.users.length > 0) {
            const user = users.users[0];
            const expectedFields = ['id', 'email', 'displayName', 'isActive', 'organizationId', 'roles'];
            const actualFields = Object.keys(user);
            const missingFields = expectedFields.filter(field => !actualFields.includes(field));
            const extraFields = actualFields.filter(field => !expectedFields.includes(field));
            if (missingFields.length > 0) {
                console.error(`❌ Missing fields: ${missingFields.join(', ')}`);
                return false;
            }
            if (extraFields.length > 0) {
                console.error(`❌ Extra fields: ${extraFields.join(', ')}`);
                return false;
            }
            console.log('✅ User DTO structure is correct');
            console.log('📋 Sample user:', {
                id: user.id,
                email: user.email,
                displayName: user.displayName,
                isActive: user.isActive,
                organizationId: user.organizationId,
                roles: user.roles
            });
        }
        return true;
    }
    catch (error) {
        console.error('❌ User DTO test failed:', error);
        return false;
    }
}
async function main() {
    console.log('🚀 Starting DTO smoke tests...\n');
    const customerResult = await testCustomerDTOs();
    console.log('');
    const userResult = await testUserDTOs();
    console.log('');
    if (customerResult && userResult) {
        console.log('✅ All DTO tests passed!');
        process.exit(0);
    }
    else {
        console.log('❌ Some DTO tests failed!');
        process.exit(1);
    }
}
main().catch((error) => {
    console.error('Error running DTO tests:', error);
    process.exit(1);
});
//# sourceMappingURL=dto_smoke_test.js.map