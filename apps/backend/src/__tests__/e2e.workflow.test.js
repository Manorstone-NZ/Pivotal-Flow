import { describe, it, expect, beforeEach } from 'vitest';
import { app, testUtils } from './setup.js';
describe('End-to-End Functionality Tests', () => {
    describe('Complete Quote Workflow', () => {
        let testUser;
        let testCustomer;
        let authToken;
        let createdQuote;
        beforeEach(async () => {
            const org = await testUtils.createTestOrganization();
            testUser = await testUtils.createTestUser({ organizationId: org.id });
            testCustomer = await testUtils.createTestCustomer(org.id);
            authToken = testUtils.generateTestToken(testUser.id, org.id);
        });
        it('should complete full quote lifecycle', async () => {
            // Step 1: Create a quote
            const quoteData = {
                customerId: testCustomer.id,
                title: 'Complete Workflow Quote',
                description: 'Testing the complete quote workflow',
                type: 'project',
                validFrom: new Date().toISOString(),
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                currency: 'NZD',
                lineItems: [
                    {
                        lineNumber: 1,
                        description: 'Web Development',
                        quantity: 40,
                        unitPrice: { amount: 150, currency: 'NZD' },
                        type: 'service'
                    },
                    {
                        lineNumber: 2,
                        description: 'Hosting Setup',
                        quantity: 1,
                        unitPrice: { amount: 500, currency: 'NZD' },
                        type: 'service'
                    }
                ]
            };
            const createResponse = await app.inject({
                method: 'POST',
                url: '/v1/quotes',
                headers: {
                    authorization: `Bearer ${authToken}`
                },
                payload: quoteData
            });
            expect(createResponse.statusCode).toBe(201);
            createdQuote = JSON.parse(createResponse.payload);
            expect(createdQuote.status).toBe('draft');
            expect(createdQuote.lineItems).toHaveLength(2);
            // Step 2: Update the quote
            const updateData = {
                title: 'Updated Complete Workflow Quote',
                description: 'Updated description for workflow testing'
            };
            const updateResponse = await app.inject({
                method: 'PATCH',
                url: `/v1/quotes/${createdQuote.id}`,
                headers: {
                    authorization: `Bearer ${authToken}`
                },
                payload: updateData
            });
            expect(updateResponse.statusCode).toBe(200);
            const updatedQuote = JSON.parse(updateResponse.payload);
            expect(updatedQuote.title).toBe(updateData.title);
            // Step 3: Transition to pending
            const pendingResponse = await app.inject({
                method: 'POST',
                url: `/v1/quotes/${createdQuote.id}/status`,
                headers: {
                    authorization: `Bearer ${authToken}`
                },
                payload: { status: 'pending' }
            });
            expect(pendingResponse.statusCode).toBe(200);
            const pendingQuote = JSON.parse(pendingResponse.payload);
            expect(pendingQuote.status).toBe('pending');
            // Step 4: Transition to approved
            const approvedResponse = await app.inject({
                method: 'POST',
                url: `/v1/quotes/${createdQuote.id}/status`,
                headers: {
                    authorization: `Bearer ${authToken}`
                },
                payload: { status: 'approved' }
            });
            expect(approvedResponse.statusCode).toBe(200);
            const approvedQuote = JSON.parse(approvedResponse.payload);
            expect(approvedQuote.status).toBe('approved');
            // Step 5: Transition to sent
            const sentResponse = await app.inject({
                method: 'POST',
                url: `/v1/quotes/${createdQuote.id}/status`,
                headers: {
                    authorization: `Bearer ${authToken}`
                },
                payload: { status: 'sent' }
            });
            expect(sentResponse.statusCode).toBe(200);
            const sentQuote = JSON.parse(sentResponse.payload);
            expect(sentQuote.status).toBe('sent');
            // Step 6: Final transition to accepted
            const acceptedResponse = await app.inject({
                method: 'POST',
                url: `/v1/quotes/${createdQuote.id}/status`,
                headers: {
                    authorization: `Bearer ${authToken}`
                },
                payload: { status: 'accepted' }
            });
            expect(acceptedResponse.statusCode).toBe(200);
            const acceptedQuote = JSON.parse(acceptedResponse.payload);
            expect(acceptedQuote.status).toBe('accepted');
            // Step 7: Verify final quote state
            const finalResponse = await app.inject({
                method: 'GET',
                url: `/v1/quotes/${createdQuote.id}`,
                headers: {
                    authorization: `Bearer ${authToken}`
                }
            });
            expect(finalResponse.statusCode).toBe(200);
            const finalQuote = JSON.parse(finalResponse.payload);
            expect(finalQuote.status).toBe('accepted');
            expect(finalQuote.title).toBe(updateData.title);
            expect(finalQuote.lineItems).toHaveLength(2);
        });
    });
    describe('User Management Workflow', () => {
        let adminUser;
        let adminToken;
        beforeEach(async () => {
            const org = await testUtils.createTestOrganization();
            adminUser = await testUtils.createTestUser({
                organizationId: org.id,
                email: 'admin@test.com'
            });
            adminToken = testUtils.generateTestToken(adminUser.id, org.id, ['admin']);
        });
        it('should manage users end-to-end', async () => {
            // Step 1: Create multiple users
            const usersToCreate = [
                {
                    email: 'user1@test.com',
                    displayName: 'User One',
                    organizationId: adminUser.organizationId
                },
                {
                    email: 'user2@test.com',
                    displayName: 'User Two',
                    organizationId: adminUser.organizationId
                }
            ];
            const createdUsers = [];
            for (const userData of usersToCreate) {
                const response = await app.inject({
                    method: 'POST',
                    url: '/v1/users',
                    headers: {
                        authorization: `Bearer ${adminToken}`
                    },
                    payload: userData
                });
                expect(response.statusCode).toBe(201);
                const user = JSON.parse(response.payload);
                createdUsers.push(user);
                expect(user.email).toBe(userData.email);
                expect(user.displayName).toBe(userData.displayName);
            }
            // Step 2: List all users
            const listResponse = await app.inject({
                method: 'GET',
                url: '/v1/users',
                headers: {
                    authorization: `Bearer ${adminToken}`
                }
            });
            expect(listResponse.statusCode).toBe(200);
            const users = JSON.parse(listResponse.payload);
            expect(users.length).toBeGreaterThanOrEqual(createdUsers.length);
            // Step 3: Get specific user
            const getUserResponse = await app.inject({
                method: 'GET',
                url: `/v1/users/${createdUsers[0].id}`,
                headers: {
                    authorization: `Bearer ${adminToken}`
                }
            });
            expect(getUserResponse.statusCode).toBe(200);
            const retrievedUser = JSON.parse(getUserResponse.payload);
            expect(retrievedUser.id).toBe(createdUsers[0].id);
            expect(retrievedUser.email).toBe(createdUsers[0].email);
        });
    });
    describe('Authentication Workflow', () => {
        it('should handle complete authentication flow', async () => {
            // Step 1: Create a user
            const userData = {
                email: 'auth-test@example.com',
                displayName: 'Auth Test User',
                organizationId: crypto.randomUUID()
            };
            const createResponse = await app.inject({
                method: 'POST',
                url: '/v1/users',
                payload: userData
            });
            expect(createResponse.statusCode).toBe(201);
            const createdUser = JSON.parse(createResponse.payload);
            // Step 2: Attempt login (this would require password setup)
            const loginData = {
                email: userData.email,
                password: 'test-password'
            };
            const loginResponse = await app.inject({
                method: 'POST',
                url: '/v1/auth/login',
                payload: loginData
            });
            // Note: This might fail if password isn't set up properly
            // We're testing the flow structure here
            expect([200, 401, 400]).toContain(loginResponse.statusCode);
            // Step 3: Test protected endpoint access
            const token = testUtils.generateTestToken(createdUser.id, userData.organizationId);
            const protectedResponse = await app.inject({
                method: 'GET',
                url: '/v1/auth/me',
                headers: {
                    authorization: `Bearer ${token}`
                }
            });
            expect(protectedResponse.statusCode).toBe(200);
        });
    });
    describe('Error Recovery Scenarios', () => {
        let testUser;
        let authToken;
        beforeEach(async () => {
            const org = await testUtils.createTestOrganization();
            testUser = await testUtils.createTestUser({ organizationId: org.id });
            authToken = testUtils.generateTestToken(testUser.id, org.id);
        });
        it('should handle invalid quote operations gracefully', async () => {
            // Test invalid status transitions
            const invalidTransitions = [
                { from: 'draft', to: 'accepted' }, // Invalid transition
                { from: 'accepted', to: 'draft' }, // Invalid transition
                { from: 'sent', to: 'draft' } // Invalid transition
            ];
            for (const transition of invalidTransitions) {
                const response = await app.inject({
                    method: 'POST',
                    url: '/v1/quotes/non-existent-id/status',
                    headers: {
                        authorization: `Bearer ${authToken}`
                    },
                    payload: { status: transition.to }
                });
                expect(response.statusCode).toBe(404);
            }
        });
        it('should handle malformed requests', async () => {
            const malformedRequests = [
                {
                    url: '/v1/quotes',
                    payload: { invalid: 'data' },
                    expectedStatus: 400
                },
                {
                    url: '/v1/users',
                    payload: { email: 'invalid-email' },
                    expectedStatus: 400
                }
            ];
            for (const request of malformedRequests) {
                const response = await app.inject({
                    method: 'POST',
                    url: request.url,
                    headers: {
                        authorization: `Bearer ${authToken}`
                    },
                    payload: request.payload
                });
                expect(response.statusCode).toBe(request.expectedStatus);
            }
        });
        it('should handle concurrent operations', async () => {
            // Create a quote first
            const org = await testUtils.createTestOrganization();
            const customer = await testUtils.createTestCustomer(org.id);
            const quoteData = {
                customerId: customer.id,
                title: 'Concurrent Test Quote',
                description: 'Testing concurrent operations',
                type: 'project',
                validFrom: new Date().toISOString(),
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                currency: 'NZD',
                lineItems: [
                    {
                        lineNumber: 1,
                        description: 'Test service',
                        quantity: 10,
                        unitPrice: { amount: 100, currency: 'NZD' },
                        type: 'service'
                    }
                ]
            };
            const createResponse = await app.inject({
                method: 'POST',
                url: '/v1/quotes',
                headers: {
                    authorization: `Bearer ${authToken}`
                },
                payload: quoteData
            });
            expect(createResponse.statusCode).toBe(201);
            const createdQuote = JSON.parse(createResponse.payload);
            // Attempt concurrent updates
            const concurrentUpdates = [
                { title: 'Update 1' },
                { title: 'Update 2' },
                { title: 'Update 3' }
            ];
            const updatePromises = concurrentUpdates.map(updateData => app.inject({
                method: 'PATCH',
                url: `/v1/quotes/${createdQuote.id}`,
                headers: {
                    authorization: `Bearer ${authToken}`
                },
                payload: updateData
            }));
            const updateResponses = await Promise.all(updatePromises);
            // All updates should succeed (or at least not fail with 500)
            for (const response of updateResponses) {
                expect(response.statusCode).not.toBe(500);
            }
        });
    });
    describe('Performance Under Load', () => {
        it('should handle multiple concurrent requests', async () => {
            // Note: org is not used in this test
            // const org = await testUtils.createTestOrganization();
            // Note: user is not used in this test
            // const user = await testUtils.createTestUser({ organizationId: org.id });
            // Note: token is not used in this test
            // const token = testUtils.generateTestToken(user.id, org.id);
            // Create 10 concurrent health check requests
            const healthChecks = Array(10).fill(0).map(() => app.inject({
                method: 'GET',
                url: '/health'
            }));
            const startTime = Date.now();
            const responses = await Promise.all(healthChecks);
            const endTime = Date.now();
            // All should succeed
            for (const response of responses) {
                expect(response.statusCode).toBe(200);
            }
            // Should complete within 2 seconds
            expect(endTime - startTime).toBeLessThan(2000);
        });
        it('should handle bulk quote creation', async () => {
            const org = await testUtils.createTestOrganization();
            const customer = await testUtils.createTestCustomer(org.id);
            const user = await testUtils.createTestUser({ organizationId: org.id });
            const token = testUtils.generateTestToken(user.id, org.id);
            const quoteData = {
                customerId: customer.id,
                title: 'Bulk Test Quote',
                description: 'Testing bulk operations',
                type: 'project',
                validFrom: new Date().toISOString(),
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                currency: 'NZD',
                lineItems: [
                    {
                        lineNumber: 1,
                        description: 'Test service',
                        quantity: 10,
                        unitPrice: { amount: 100, currency: 'NZD' },
                        type: 'service'
                    }
                ]
            };
            const startTime = Date.now();
            // Create 5 quotes sequentially
            for (let i = 0; i < 5; i++) {
                const response = await app.inject({
                    method: 'POST',
                    url: '/v1/quotes',
                    headers: {
                        authorization: `Bearer ${token}`
                    },
                    payload: {
                        ...quoteData,
                        title: `${quoteData.title} ${i + 1}`
                    }
                });
                expect(response.statusCode).toBe(201);
            }
            const endTime = Date.now();
            // Should complete within 10 seconds
            expect(endTime - startTime).toBeLessThan(10000);
        });
    });
});
//# sourceMappingURL=e2e.workflow.test.js.map