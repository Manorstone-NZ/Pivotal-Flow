# Security Policy Update - PASETO Implementation

## Overview

The Pivotal Flow security policy has been updated to reflect the implementation of PASETO (Platform-Agnostic Security Tokens) v4 public for signed links and service-to-service authentication, alongside opaque tokens for user sessions.

## Key Changes

### PASETO Token Usage

**PASETO v4 Public:**
- Used for signed public links (quotes, delivery approvals)
- Used for service-to-service authentication
- Ed25519 signatures only
- Short-lived tokens (5-15 minutes)
- One-time use enforced via jti checking in Redis
- No database lookup required for verification

**PASETO v4 Local:**
- Not used for cross-service scenarios
- Only for single-service contexts where symmetric keys can be safely contained
- 256-bit random keys from CSPRNG

### Opaque Token Enhancements

**Session Management:**
- 15-minute access token lifetime with sliding renewal
- Optional refresh tokens that rotate on every use (stored server-side)
- Instant revocation capability
- Zero information leakage

### Password Policy Updates

**Length-First Approach:**
- Minimum 14 characters (increased from 12)
- Allow passphrases and long passwords
- Removed complexity requirements and 90-day expiry
- Added breach protection via compromised password lists
- Progressive backoff instead of hard lockout (prevents DoS)

### Enhanced Security Controls

**Proof of Possession:**
- DPoP (Demonstrating Proof-of-Possession) for browser and mobile clients
- mTLS for machine-to-machine communication
- HttpOnly SameSite cookies with CSRF tokens for unsafe methods

**Tenant Isolation:**
- Mandatory Postgres Row Level Security (RLS) on all multi-tenant tables
- Contract tests that verify cross-tenant access attempts fail
- Required tenant ID in all repository calls with enforcement

**Audit and Logging:**
- Append-only storage for security audit logs
- Tamper-evident logging with signatures
- Log token jti for issued/used/revoked tokens (never full tokens)

### Infrastructure Security

**Redis Requirements:**
- TLS encryption mandatory
- Access Control Lists (ACLs)
- Regular key rotation
- Health checks and circuit breaker patterns
- Fail-closed behavior if Redis unavailable

### Compliance Updates

**New Zealand Context:**
- NZ Privacy Act 2020 compliance
- Information Privacy Principles (IPPs)
- NZISM alignment for public sector clients

**Enhanced Standards:**
- ISO 27001: Added ISMS scope, Statement of Applicability, risk treatment plan
- SOC 2 Type II: Continuous evidence collection and control ownership
- Updated cryptographic standards (removed quantum-resistant claims)

### Key Management

**PASETO v4 Public:**
- Ed25519 keys only (RSA removed)
- Multiple active key IDs supported
- Emergency rotation procedures

**Key Storage:**
- KMS or HSM required
- Secure key backup and recovery
- Documented rotation cadence

### Incident Response

**Service-Specific Objectives:**
- Identity Services RTO: 15 minutes
- Session Services RPO: 5 minutes
- Authentication System RTO: 10 minutes

**Key Compromise Playbook:**
1. Revoke all opaque sessions via Redis pattern delete
2. Immediate PASETO key rotation
3. Maintain grace set of previous public keys
4. Service notification and monitoring

### Security Testing

**Required Tests:**
- Opaque session revocation verification
- PASETO link one-time use enforcement
- Cross-tenant access prevention (must return forbidden)
- DPoP/mTLS enforcement verification
- Key rotation with multiple active key IDs

## Implementation Impact

This updated security policy provides:

1. **Strong Tenant Protection**: Mandatory RLS and contract testing
2. **Fast Revocation**: Opaque sessions with sliding renewal
3. **Clear Audit**: Comprehensive logging without token exposure
4. **Secure Service Communication**: PASETO v4 public with short expiry
5. **Enhanced Compliance**: NZ Privacy Act and strengthened international standards

## Next Steps

1. Review implementation against updated policy requirements
2. Implement missing security controls as identified
3. Update testing procedures to include new security validation requirements
4. Schedule policy review and update cycle

---

*Document Updated: September 2025*
*Related Policy: Security Policy (docs/07-policies/SECURITY_POLICY.md)*
