import jwt from 'jsonwebtoken';

// Create a simple test token
const payload = {
  sub: '2a870792-298d-41aa-b4ba-3349aebc749c',
  org: '6975c31b-a98d-491f-aed6-8792735aef02',
  roles: ['admin'],
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
};

const secret = 'super-secret-jwt-key-for-development-only-32-chars';
const token = jwt.sign(payload, secret);

console.log('Test JWT Token:');
console.log(token);
