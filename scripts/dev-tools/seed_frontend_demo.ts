#!/usr/bin/env tsx

/**
 * Frontend Demo Seeding Script for E7 E2E & Contract Safety
 * Creates demo data specifically for frontend E2E testing
 */

import { execSync } from 'child_process';
import { z } from 'zod';

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://pivotal:pivotal@localhost:5433/pivotal_e2e';

// Demo data schemas
const DemoUserSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  password: z.string(),
  role: z.enum(['admin', 'manager', 'user', 'customer']),
});

const DemoRateCardSchema = z.object({
  name: z.string(),
  description: z.string(),
  effectiveFrom: z.string(),
});

const DemoQuoteSchema = z.object({
  customerId: z.string().uuid(),
  projectId: z.string().uuid().optional(),
  validUntil: z.string().datetime().optional(),
  notes: z.string(),
  lineItems: z.array(z.object({
    description: z.string(),
    quantity: z.number().positive(),
    unitPrice: z.number().positive(),
    serviceCategoryId: z.string().uuid().optional(),
  })),
});

// Demo data
const DEMO_DATA = {
  users: [
    {
      email: 'admin@pivotalflow.com',
      name: 'Admin User',
      password: 'password123',
      role: 'admin' as const,
    },
    {
      email: 'user@pivotalflow.com',
      name: 'Regular User',
      password: 'password123',
      role: 'user' as const,
    },
  ],
  
  rateCard: {
    name: 'Standard Rate Card',
    description: 'Standard rates for E2E testing',
    effectiveFrom: '2024-01-01T00:00:00Z',
  },
  
  quotes: [
    {
      customerId: '123e4567-e89b-12d3-a456-426614174000', // Will be replaced with actual customer ID
      projectId: '123e4567-e89b-12d3-a456-426614174001', // Will be replaced with actual project ID
      validUntil: '2024-12-31T23:59:59Z',
      notes: 'E2E Test Quote 1 - Website Development',
      lineItems: [
        {
          description: 'Frontend Development',
          quantity: 40,
          unitPrice: 150,
          serviceCategoryId: '123e4567-e89b-12d3-a456-426614174002', // Will be replaced with actual category ID
        },
        {
          description: 'Backend Development',
          quantity: 30,
          unitPrice: 175,
          serviceCategoryId: '123e4567-e89b-12d3-a456-426614174002',
        },
        {
          description: 'Testing & QA',
          quantity: 20,
          unitPrice: 125,
          serviceCategoryId: '123e4567-e89b-12d3-a456-426614174002',
        },
      ],
    },
    {
      customerId: '123e4567-e89b-12d3-a456-426614174000',
      projectId: '123e4567-e89b-12d3-a456-426614174001',
      validUntil: '2024-12-31T23:59:59Z',
      notes: 'E2E Test Quote 2 - Mobile App Development',
      lineItems: [
        {
          description: 'Mobile App Development',
          quantity: 60,
          unitPrice: 200,
          serviceCategoryId: '123e4567-e89b-12d3-a456-426614174002',
        },
        {
          description: 'UI/UX Design',
          quantity: 25,
          unitPrice: 150,
          serviceCategoryId: '123e4567-e89b-12d3-a456-426614174002',
        },
      ],
    },
    {
      customerId: '123e4567-e89b-12d3-a456-426614174000',
      projectId: '123e4567-e89b-12d3-a456-426614174001',
      validUntil: '2024-12-31T23:59:59Z',
      notes: 'E2E Test Quote 3 - Consulting Services',
      lineItems: [
        {
          description: 'Business Analysis',
          quantity: 15,
          unitPrice: 250,
          serviceCategoryId: '123e4567-e89b-12d3-a456-426614174002',
        },
        {
          description: 'Project Management',
          quantity: 20,
          unitPrice: 180,
          serviceCategoryId: '123e4567-e89b-12d3-a456-426614174002',
        },
      ],
    },
  ],
};

// Utility functions
const logInfo = (message: string) => {
  console.log(`ℹ️  ${message}`);
};

const logSuccess = (message: string) => {
  console.log(`✅ ${message}`);
};

const logError = (message: string) => {
  console.error(`❌ ${message}`);
};

const logWarning = (message: string) => {
  console.warn(`⚠️  ${message}`);
};

// Check if API is available
const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Make API request with error handling
const makeApiRequest = async (url: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    logError(`API request failed: ${error}`);
    throw error;
  }
};

// Get or create customer
const getOrCreateCustomer = async (): Promise<string> => {
  logInfo('Getting or creating customer...');
  
  try {
    // Try to get existing customers
    const customers = await makeApiRequest('/api/v1/customers');
    
    if (customers.data && customers.data.length > 0) {
      logSuccess(`Using existing customer: ${customers.data[0].id}`);
      return customers.data[0].id;
    }
  } catch (error) {
    logWarning('Could not fetch customers, creating new one...');
  }
  
  // Create new customer
  const customerData = {
    name: 'E2E Test Customer',
    email: 'customer@e2etest.com',
    phone: '+1234567890',
    address: {
      street: '123 Test Street',
      city: 'Test City',
      state: 'TS',
      zipCode: '12345',
      country: 'US',
    },
  };
  
  const customer = await makeApiRequest('/api/v1/customers', {
    method: 'POST',
    body: JSON.stringify(customerData),
  });
  
  logSuccess(`Created customer: ${customer.id}`);
  return customer.id;
};

// Get or create project
const getOrCreateProject = async (customerId: string): Promise<string> => {
  logInfo('Getting or creating project...');
  
  try {
    // Try to get existing projects
    const projects = await makeApiRequest('/api/v1/projects');
    
    if (projects.data && projects.data.length > 0) {
      logSuccess(`Using existing project: ${projects.data[0].id}`);
      return projects.data[0].id;
    }
  } catch (error) {
    logWarning('Could not fetch projects, creating new one...');
  }
  
  // Create new project
  const projectData = {
    name: 'E2E Test Project',
    description: 'Project for E2E testing',
    customerId,
    status: 'active',
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-12-31T23:59:59Z',
  };
  
  const project = await makeApiRequest('/api/v1/projects', {
    method: 'POST',
    body: JSON.stringify(projectData),
  });
  
  logSuccess(`Created project: ${project.id}`);
  return project.id;
};

// Get or create service category
const getOrCreateServiceCategory = async (): Promise<string> => {
  logInfo('Getting or creating service category...');
  
  try {
    // Try to get existing service categories
    const categories = await makeApiRequest('/api/v1/service-categories');
    
    if (categories.data && categories.data.length > 0) {
      logSuccess(`Using existing service category: ${categories.data[0].id}`);
      return categories.data[0].id;
    }
  } catch (error) {
    logWarning('Could not fetch service categories, creating new one...');
  }
  
  // Create new service category
  const categoryData = {
    name: 'E2E Test Services',
    description: 'Service category for E2E testing',
  };
  
  const category = await makeApiRequest('/api/v1/service-categories', {
    method: 'POST',
    body: JSON.stringify(categoryData),
  });
  
  logSuccess(`Created service category: ${category.id}`);
  return category.id;
};

// Create users
const createUsers = async (): Promise<void> => {
  logInfo('Creating demo users...');
  
  for (const userData of DEMO_DATA.users) {
    try {
      // Validate user data
      const validatedUser = DemoUserSchema.parse(userData);
      
      // Check if user already exists
      try {
        await makeApiRequest(`/api/v1/users?email=${encodeURIComponent(validatedUser.email)}`);
        logWarning(`User ${validatedUser.email} already exists, skipping...`);
        continue;
      } catch (error) {
        // User doesn't exist, create it
      }
      
      // Create user
      await makeApiRequest('/api/v1/users', {
        method: 'POST',
        body: JSON.stringify(validatedUser),
      });
      
      logSuccess(`Created user: ${validatedUser.email}`);
    } catch (error) {
      logError(`Failed to create user ${userData.email}: ${error}`);
    }
  }
};

// Create rate card
const createRateCard = async (): Promise<void> => {
  logInfo('Creating demo rate card...');
  
  try {
    // Validate rate card data
    const validatedRateCard = DemoRateCardSchema.parse(DEMO_DATA.rateCard);
    
    // Check if rate card already exists
    try {
      const existingRateCards = await makeApiRequest('/api/v1/rate-cards');
      if (existingRateCards.data && existingRateCards.data.length > 0) {
        logWarning('Rate card already exists, skipping...');
        return;
      }
    } catch (error) {
      // Rate card doesn't exist, create it
    }
    
    // Create rate card
    await makeApiRequest('/api/v1/rate-cards', {
      method: 'POST',
      body: JSON.stringify(validatedRateCard),
    });
    
    logSuccess('Created rate card');
  } catch (error) {
    logError(`Failed to create rate card: ${error}`);
  }
};

// Create quotes
const createQuotes = async (): Promise<void> => {
  logInfo('Creating demo quotes...');
  
  // Get required IDs
  const customerId = await getOrCreateCustomer();
  const projectId = await getOrCreateProject(customerId);
  const serviceCategoryId = await getOrCreateServiceCategory();
  
  for (const quoteData of DEMO_DATA.quotes) {
    try {
      // Update quote data with actual IDs
      const updatedQuoteData = {
        ...quoteData,
        customerId,
        projectId,
        lineItems: quoteData.lineItems.map(item => ({
          ...item,
          serviceCategoryId,
        })),
      };
      
      // Validate quote data
      const validatedQuote = DemoQuoteSchema.parse(updatedQuoteData);
      
      // Create quote
      await makeApiRequest('/api/v1/quotes', {
        method: 'POST',
        body: JSON.stringify(validatedQuote),
      });
      
      logSuccess(`Created quote: ${validatedQuote.notes}`);
    } catch (error) {
      logError(`Failed to create quote: ${error}`);
    }
  }
};

// Main seeding function
const seedFrontendDemo = async (): Promise<void> => {
  logInfo('Starting frontend demo seeding...');
  
  // Check API health
  const isHealthy = await checkApiHealth();
  if (!isHealthy) {
    logError(`API is not healthy at ${API_BASE_URL}`);
    logInfo('Make sure the backend is running and accessible');
    process.exit(1);
  }
  
  logSuccess('API is healthy');
  
  // Create demo data
  await createUsers();
  await createRateCard();
  await createQuotes();
  
  logSuccess('Frontend demo seeding completed!');
  logInfo('Demo data created:');
  logInfo('  • 2 users (admin@pivotalflow.com, user@pivotalflow.com)');
  logInfo('  • 1 rate card (Standard Rate Card)');
  logInfo('  • 3 quotes with line items');
  logInfo('  • 1 customer and 1 project');
  logInfo('  • 1 service category');
};

// Run seeding if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedFrontendDemo().catch((error) => {
    logError(`Seeding failed: ${error}`);
    process.exit(1);
  });
}

export { seedFrontendDemo };
