/**
 * Customer Module Integration Tests
 * Test customer and contact API endpoints
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { generateId } from '@pivotal-flow/shared';
const baseUrl = 'http://localhost:3000';
describe('Customer Module Integration Tests', () => {
    let authToken;
    let testCustomerId;
    let testContactId;
    beforeAll(async () => {
        // Get authentication token
        const authResponse = await fetch(`${baseUrl}/api/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@pivotalflow.com',
                password: 'password123!extra'
            })
        });
        const authData = await authResponse.json();
        authToken = authData.accessToken;
        expect(authToken).toBeTruthy();
    });
    describe('Customer CRUD Operations', () => {
        it('should create a new customer', async () => {
            const customerData = {
                companyName: 'Test Integration Company',
                email: 'integration@test.com',
                phone: '+64211234567',
                city: 'Auckland',
                country: 'New Zealand',
                customerType: 'business'
            };
            const response = await fetch(`${baseUrl}/api/v1/customers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(customerData)
            });
            expect(response.status).toBe(201);
            const result = await response.json();
            expect(result.success).toBe(true);
            expect(result.data.companyName).toBe(customerData.companyName);
            expect(result.data.id).toBeTruthy();
            expect(result.data.customerNumber).toMatch(/^CUST-/);
            testCustomerId = result.data.id;
        });
        it('should list customers with pagination', async () => {
            const response = await fetch(`${baseUrl}/api/v1/customers?limit=10&page=1`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            expect(response.status).toBe(200);
            const result = await response.json();
            expect(result.success).toBe(true);
            expect(Array.isArray(result.data)).toBe(true);
            expect(result.pagination).toHaveProperty('page');
            expect(result.pagination).toHaveProperty('limit');
            expect(result.pagination).toHaveProperty('total');
        });
        it('should get customer by ID', async () => {
            const response = await fetch(`${baseUrl}/api/v1/customers/${testCustomerId}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            expect(response.status).toBe(200);
            const result = await response.json();
            expect(result.success).toBe(true);
            expect(result.data.id).toBe(testCustomerId);
            expect(result.data.companyName).toBe('Test Integration Company');
        });
        it('should update customer', async () => {
            const updateData = {
                description: 'Updated description for integration test',
                industry: 'Technology'
            };
            const response = await fetch(`${baseUrl}/api/v1/customers/${testCustomerId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(updateData)
            });
            expect(response.status).toBe(200);
            const result = await response.json();
            expect(result.success).toBe(true);
            expect(result.data.description).toBe(updateData.description);
            expect(result.data.industry).toBe(updateData.industry);
        });
        it('should search customers', async () => {
            const response = await fetch(`${baseUrl}/api/v1/customers?search=Integration&limit=5`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            expect(response.status).toBe(200);
            const result = await response.json();
            expect(result.success).toBe(true);
            expect(result.data.length).toBeGreaterThan(0);
            expect(result.data[0].companyName).toContain('Integration');
        });
    });
    describe('Contact CRUD Operations', () => {
        it('should create a contact for customer', async () => {
            const contactData = {
                firstName: 'John',
                lastName: 'Integration',
                email: 'john.integration@test.com',
                position: 'Test Manager',
                isPrimary: true
            };
            const response = await fetch(`${baseUrl}/api/v1/customers/${testCustomerId}/contacts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(contactData)
            });
            expect(response.status).toBe(201);
            const result = await response.json();
            expect(result.success).toBe(true);
            expect(result.data.firstName).toBe(contactData.firstName);
            expect(result.data.lastName).toBe(contactData.lastName);
            expect(result.data.isPrimary).toBe(true);
            testContactId = result.data.id;
        });
        it('should list customer contacts', async () => {
            const response = await fetch(`${baseUrl}/api/v1/customers/${testCustomerId}/contacts`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            expect(response.status).toBe(200);
            const result = await response.json();
            expect(result.success).toBe(true);
            expect(Array.isArray(result.data)).toBe(true);
            expect(result.data.length).toBeGreaterThan(0);
            expect(result.data[0].firstName).toBe('John');
        });
        it('should get contact by ID', async () => {
            const response = await fetch(`${baseUrl}/api/v1/customers/${testCustomerId}/contacts/${testContactId}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            expect(response.status).toBe(200);
            const result = await response.json();
            expect(result.success).toBe(true);
            expect(result.data.id).toBe(testContactId);
            expect(result.data.firstName).toBe('John');
        });
        it('should update contact', async () => {
            const updateData = {
                position: 'Senior Test Manager',
                department: 'Quality Assurance'
            };
            const response = await fetch(`${baseUrl}/api/v1/customers/${testCustomerId}/contacts/${testContactId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(updateData)
            });
            expect(response.status).toBe(200);
            const result = await response.json();
            expect(result.success).toBe(true);
            expect(result.data.position).toBe(updateData.position);
            expect(result.data.department).toBe(updateData.department);
        });
        it('should handle primary contact management', async () => {
            // Create second contact
            const secondContactData = {
                firstName: 'Jane',
                lastName: 'Secondary',
                email: 'jane.secondary@test.com',
                isPrimary: true // This should make the first contact non-primary
            };
            const response = await fetch(`${baseUrl}/api/v1/customers/${testCustomerId}/contacts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(secondContactData)
            });
            expect(response.status).toBe(201);
            // Check that only one contact is primary
            const contactsResponse = await fetch(`${baseUrl}/api/v1/customers/${testCustomerId}/contacts`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const contactsResult = await contactsResponse.json();
            const primaryContacts = contactsResult.data.filter((contact) => contact.isPrimary);
            expect(primaryContacts.length).toBe(1);
            expect(primaryContacts[0].firstName).toBe('Jane');
        });
    });
    describe('Error Handling', () => {
        it('should return 404 for non-existent customer', async () => {
            const fakeId = `customer-${generateId()}`;
            const response = await fetch(`${baseUrl}/api/v1/customers/${fakeId}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            expect(response.status).toBe(404);
            const result = await response.json();
            expect(result.success).toBe(false);
            expect(result.error).toBe('Not Found');
        });
        it('should return 401 without authentication', async () => {
            const response = await fetch(`${baseUrl}/api/v1/customers`);
            expect(response.status).toBe(401);
        });
        it('should validate required fields', async () => {
            const invalidData = {
                // Missing required companyName
                email: 'invalid@test.com'
            };
            const response = await fetch(`${baseUrl}/api/v1/customers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(invalidData)
            });
            expect(response.status).toBe(400);
        });
    });
    describe('Security & Authorization', () => {
        it('should enforce organization isolation', async () => {
            // This test would require a different organization user
            // For now, just verify that user context is properly applied
            const response = await fetch(`${baseUrl}/api/v1/customers`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            expect(response.status).toBe(200);
            const result = await response.json();
            // All customers should belong to the same organization
            result.data.forEach((customer) => {
                expect(customer.organizationId).toBe('org-pivotal-flow');
            });
        });
    });
    // Cleanup
    afterAll(async () => {
        // Clean up test data
        if (testCustomerId) {
            await fetch(`${baseUrl}/api/v1/customers/${testCustomerId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
        }
    });
});
//# sourceMappingURL=integration.test.js.map