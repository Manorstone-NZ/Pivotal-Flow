#!/usr/bin/env node

import express from 'express';
import { performance } from 'perf_hooks';

const app = express();
app.use(express.json());

// Simple in-memory storage for testing
const quotes = new Map();
const users = new Map();
const authTokens = new Map();

// Initialize test data
users.set('admin@pivotalflow.com', {
  id: 'test-user-123',
  email: 'admin@pivotalflow.com',
  password: 'admin123456789', // In real app, this would be hashed
  organizationId: 'test-org-123'
});

// Simple metrics tracking
const metrics = {
  quoteCreated: 0,
  quoteUpdated: 0,
  quoteListed: 0,
  durations: {
    create: [],
    update: [],
    list: []
  }
};

// Health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Test server is healthy',
    version: '0.1.0'
  });
});

// Login endpoint
app.post('/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = users.get(email);
  if (user && user.password === password) {
    const token = `test-token-${Date.now()}`;
    authTokens.set(token, user);
    
    res.json({
      accessToken: token,
      refreshToken: `refresh-${token}`,
      user: {
        id: user.id,
        email: user.email,
        organizationId: user.organizationId
      }
    });
  } else {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid email or password',
      code: 'INVALID_CREDENTIALS'
    });
  }
});

// Simple auth middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const user = authTokens.get(token);
  
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  req.user = user;
  next();
};

// Create quote endpoint
app.post('/v1/quotes', authMiddleware, (req, res) => {
  const start = performance.now();
  
  try {
    const quoteId = `quote-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const quote = {
      id: quoteId,
      ...req.body,
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      organizationId: req.user.organizationId,
      createdBy: req.user.id
    };
    
    quotes.set(quoteId, quote);
    metrics.quoteCreated++;
    
    const duration = performance.now() - start;
    metrics.durations.create.push(duration);
    
    res.status(201).json(quote);
  } catch (error) {
    const duration = performance.now() - start;
    metrics.durations.create.push(duration);
    res.status(500).json({ error: 'Failed to create quote' });
  }
});

// Update quote endpoint
app.put('/v1/quotes/:id', authMiddleware, (req, res) => {
  const start = performance.now();
  
  try {
    const quoteId = req.params.id;
    const quote = quotes.get(quoteId);
    
    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }
    
    const updatedQuote = {
      ...quote,
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    quotes.set(quoteId, updatedQuote);
    metrics.quoteUpdated++;
    
    const duration = performance.now() - start;
    metrics.durations.update.push(duration);
    
    res.json(updatedQuote);
  } catch (error) {
    const duration = performance.now() - start;
    metrics.durations.update.push(duration);
    res.status(500).json({ error: 'Failed to update quote' });
  }
});

// List quotes endpoint
app.get('/v1/quotes', authMiddleware, (req, res) => {
  const start = performance.now();
  
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const offset = (page - 1) * limit;
    
    const userQuotes = Array.from(quotes.values())
      .filter(quote => quote.organizationId === req.user.organizationId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    const paginatedQuotes = userQuotes.slice(offset, offset + limit);
    
    metrics.quoteListed++;
    
    const duration = performance.now() - start;
    metrics.durations.list.push(duration);
    
    res.json({
      data: paginatedQuotes,
      pagination: {
        page,
        limit,
        total: userQuotes.length,
        totalPages: Math.ceil(userQuotes.length / limit)
      }
    });
  } catch (error) {
    const duration = performance.now() - start;
    metrics.durations.list.push(duration);
    res.status(500).json({ error: 'Failed to list quotes' });
  }
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  const calculateStats = (durations) => {
    if (durations.length === 0) return { median: 0, p95: 0, p99: 0, min: 0, max: 0 };
    
    const sorted = [...durations].sort((a, b) => a - b);
    return {
      median: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
      min: sorted[0],
      max: sorted[sorted.length - 1]
    };
  };
  
  res.json({
    counters: {
      quoteCreated: metrics.quoteCreated,
      quoteUpdated: metrics.quoteUpdated,
      quoteListed: metrics.quoteListed
    },
    durations: {
      create: calculateStats(metrics.durations.create),
      update: calculateStats(metrics.durations.update),
      list: calculateStats(metrics.durations.list)
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`📊 Metrics available at http://localhost:${PORT}/metrics`);
  console.log(`🔐 Login with admin@pivotalflow.com / admin123456789`);
});
