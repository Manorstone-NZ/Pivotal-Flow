import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// Mock API handlers
export const handlers = [
  // Auth endpoints
  http.post('/api/v1/auth/login', () => {
    return HttpResponse.json({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
      },
    });
  }),

  http.post('/api/v1/auth/refresh', () => {
    return HttpResponse.json({
      accessToken: 'new-mock-access-token',
    });
  }),

  http.get('/api/v1/auth/me', () => {
    return HttpResponse.json({
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'admin',
      status: 'active',
    });
  }),

  // Users endpoints
  http.get('/api/v1/users', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';

    const users = Array.from({ length: 25 }, (_, i) => ({
      id: `user-${i + 1}`,
      email: `user${i + 1}@example.com`,
      name: `User ${i + 1}`,
      role: i % 3 === 0 ? 'admin' : i % 3 === 1 ? 'manager' : 'user',
      status: i % 4 === 0 ? 'pending' : i % 4 === 1 ? 'suspended' : 'active',
      createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    }));

    const filteredUsers = search
      ? users.filter(user => 
          user.name.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase())
        )
      : users;

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    return HttpResponse.json({
      data: paginatedUsers,
      pagination: {
        page,
        limit,
        total: filteredUsers.length,
        totalPages: Math.ceil(filteredUsers.length / limit),
      },
    });
  }),

  http.post('/api/v1/users', () => {
    return HttpResponse.json({
      id: 'new-user-id',
      email: 'newuser@example.com',
      name: 'New User',
      role: 'user',
      status: 'pending',
      createdAt: new Date().toISOString(),
    }, { status: 201 });
  }),

  // Quotes endpoints
  http.get('/api/v1/quotes', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status');

    const quotes = Array.from({ length: 50 }, (_, i) => ({
      id: `quote-${i + 1}`,
      quoteNumber: `Q-${String(i + 1).padStart(4, '0')}`,
      title: `Project Quote ${i + 1}`,
      customerName: `Customer ${i + 1}`,
      total: Math.floor(Math.random() * 100000) + 10000,
      subtotal: Math.floor(Math.random() * 90000) + 10000,
      tax: Math.floor(Math.random() * 9000) + 1000,
      discount: Math.floor(Math.random() * 5000),
      status: ['draft', 'pending', 'approved', 'sent', 'accepted', 'rejected'][i % 6],
      createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    }));

    let filteredQuotes = quotes;
    if (search) {
      filteredQuotes = quotes.filter(quote => 
        quote.title.toLowerCase().includes(search.toLowerCase()) ||
        quote.customerName.toLowerCase().includes(search.toLowerCase()) ||
        quote.quoteNumber.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (status && status !== 'all') {
      filteredQuotes = filteredQuotes.filter(quote => quote.status === status);
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedQuotes = filteredQuotes.slice(startIndex, endIndex);

    return HttpResponse.json({
      data: paginatedQuotes,
      pagination: {
        page,
        limit,
        total: filteredQuotes.length,
        totalPages: Math.ceil(filteredQuotes.length / limit),
      },
    });
  }),

  http.get('/api/v1/quotes/:id', ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      id,
      quoteNumber: `Q-${String(id).padStart(4, '0')}`,
      title: `Project Quote ${id}`,
      description: 'Detailed project description',
      customerName: `Customer ${id}`,
      status: 'pending',
      validFrom: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      lineItems: [
        {
          id: 'item-1',
          description: 'Development Services',
          quantity: 40,
          unitPrice: 150,
          total: 6000,
        },
        {
          id: 'item-2',
          description: 'Design Services',
          quantity: 20,
          unitPrice: 100,
          total: 2000,
        },
      ],
      subtotal: 8000,
      tax: 800,
      discount: 0,
      total: 8800,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }),

  http.post('/api/v1/quotes', () => {
    return HttpResponse.json({
      id: 'new-quote-id',
      quoteNumber: 'Q-0001',
      title: 'New Quote',
      customerName: 'New Customer',
      status: 'draft',
      createdAt: new Date().toISOString(),
    }, { status: 201 });
  }),

  // Health check
  http.get('/api/v1/health', () => {
    return HttpResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    });
  }),
];

// Setup MSW server
export const server = setupServer(...handlers);

