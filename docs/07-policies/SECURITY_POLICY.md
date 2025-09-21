# Pivotal Flow Security Policy

## Overview

This document outlines the comprehensive security policy for Pivotal Flow, a multi-tenant SaaS platform that uses Opaque access tokens and PASETO (Platform-Agnostic Security Tokens) for enterprise-grade authentication and authorization.

**Implementation Status**: ✅ CONFIRMED - This security model is currently implemented and operational in the Pivotal Flow platform as of January 2025.

## Security Architecture

### Authentication & Authorization

#### Token-Based Security

##### Opaque Tokens
- **Primary Use Case**: End-user sessions in the SaaS portal
- **Features**: 
  - Short-lived (15 minutes) tokens with no readable payload
  - Sliding renewal on activity
  - Zero information leakage - tokens reveal no sensitive data
  - Instant revocation capability for compromised tokens
  - Full audit trail for customer protection
  - Session management with revocation support
  - Optional refresh token that rotates on every use and is stored server-side

##### PASETO Tokens
- **Primary Use Cases**: 
  - Signed public links (quotes, delivery approvals)
  - Service-to-service authentication calls
- **Features**:
  - v4 public with Ed25519 signatures
  - Short-lived by default (5-15 minutes)
  - Include jti (JWT ID) and narrow scope
  - One-time use enforced by checking jti in Redis
  - No database lookup required for verification
  - Self-contained with embedded verification data

#### Cryptographic Standards
- **Password Hashing**: Argon2id with configurable parameters
- **Token Signing**: PASETO v4 public using Ed25519 signatures
- **Token Encryption**: XChaCha20-Poly1305 for v4 local (single service context only)
- **Key Management**: Secure key generation, storage, and rotation
- **Session Binding**: Optional IP binding (prefer device binding via DPoP or mTLS)

### Multi-Tenant Security

#### Tenant Isolation
- **Data Segregation**: ✅ Complete tenant data isolation at database level
- **Postgres Row Level Security**: ✅ Mandatory RLS on all multi-tenant tables with tenant context per request
- **Token Binding**: ✅ Access tokens bound to specific tenant context
- **Cross-Tenant Prevention**: ✅ Impossible to access data from wrong tenant
- **Contract Testing**: ✅ Automated tests that attempt cross-tenant reads and writes (must fail)
- **Repository Enforcement**: ✅ Tenant ID required in all repository calls with lints/helpers to enforce
- **Audit per Tenant**: ✅ Complete token usage tracking per organization

#### Access Control
- **Role-Based Access Control (RBAC)**: ✅ Granular permissions system with three-tier hierarchy
  - **Super Admin**: Cross-tenant platform management (`system.super_admin` permission)
  - **Tenant Admin**: Single organization administration (`tenant.admin` permission)
  - **Regular Users**: Feature-based permissions within their organization
- **Resource-Level Permissions**: ✅ Fine-grained access control with route-level permissions
- **API Rate Limiting**: ✅ Per-tenant and per-user rate limits implemented
- **Session Management**: ✅ Active session monitoring and control with Redis storage

## Security Requirements

### Authentication Requirements

#### Password Security
- **Minimum Length**: 14 characters
- **Password Composition**: Allow passphrases and long passwords
- **Breach Protection**: Block known compromised passwords via breach list
- **Password History**: Prevent reuse of last 5 passwords
- **Rate Limiting**: Progressive backoff and rate limiting
- **Account Protection**: Avoid hard lockout (prevents denial of service)
- **Password Rotation**: Only on compromise or privilege change

#### Token Security
- **Access Token Expiry**: 15 minutes maximum with sliding renewal
- **Refresh Token Expiry**: Up to 30 days maximum (only if needed, with rotation on each use)
- **Token Binding**: Optional IP binding (prefer device binding via DPoP or mTLS)
- **Secure Storage**: Tokens stored securely in Redis and database
- **HTTPS Only**: All token transmission over HTTPS
- **PASETO Links**: 5-15 minutes expiry with jti-based one-time use

### Authorization Requirements

#### Permission Model
- **Principle of Least Privilege**: Users granted minimum necessary permissions
- **Resource-Based Permissions**: Granular control over specific resources
- **Hierarchical Roles**: Role inheritance with permission aggregation
- **Dynamic Permissions**: Real-time permission evaluation

#### Access Control
- **Multi-Factor Authentication**: Required for administrative access
- **Session Timeout**: Automatic logout after inactivity
- **Device Management**: Track and control active sessions
- **Audit Logging**: Complete access and permission change logging

## Security Controls

### Technical Controls

#### Network Security
- **TLS 1.3**: All communications encrypted in transit
- **CORS Configuration**: Strict origin validation
- **Rate Limiting**: API and authentication rate limits
- **DDoS Protection**: Distributed denial-of-service mitigation

#### Application Security
- **Input Validation**: TypeBox schema validation for all inputs
- **SQL Injection Prevention**: Parameterized queries with Drizzle ORM
- **XSS Protection**: Content Security Policy and input sanitization
- **CSRF Protection**: HttpOnly SameSite cookies and CSRF tokens for unsafe methods
- **Proof of Possession**: 
  - DPoP (Demonstrating Proof-of-Possession) for browser and mobile clients
  - mTLS for machine-to-machine communication where both ends are controlled
- **Secure Headers**:
  - Strict-Transport-Security with preload
  - Referrer-Policy
  - X-Frame-Options (deny or same-origin as required)

#### Infrastructure Security
- **Container Security**: Docker images scanned for vulnerabilities
- **Database Security**: Encrypted at rest with access controls
- **Redis Security**: 
  - TLS encryption for all connections
  - Access Control Lists (ACLs) for user permissions
  - Regular key rotation for authentication
  - Network isolation and proper eviction policies
  - Health checks and circuit breaker patterns
  - Fail-closed for new sessions if Redis unavailable
  - Short-term session cache continuation for existing sessions
- **Key Management**: Secure storage and rotation of cryptographic keys

### Administrative Controls

#### Access Management
- **User Provisioning**: Automated user creation and deactivation
- **Role Management**: Centralized role assignment and updates
- **Privilege Escalation**: Approval workflow for elevated permissions
- **Offboarding**: Immediate access revocation on termination

#### Monitoring & Auditing
- **Security Event Monitoring**: Real-time threat detection
- **Audit Logging**: Comprehensive activity logging
- **Append-Only Storage**: Security and access audit stored in append-only storage (object storage with write-once lock)
- **Tamper-Evident Logging**: Signed logs or tamper-evident logging service
- **Token Audit**: Log token jti for issued, used, revoked (never log full tokens)
- **Compliance Reporting**: Automated compliance status reports
- **Incident Response**: Documented incident response procedures

## Compliance Requirements

### Data Protection

#### GDPR Compliance
- **Data Minimization**: Collect only necessary personal data
- **Right to be Forgotten**: Complete data deletion capability
- **Data Portability**: Export user data in standard formats
- **Consent Management**: Granular consent tracking and management

#### NZ Privacy Act 2020
- **Information Privacy Principles**: Compliance with all 13 IPPs
- **Privacy by Design**: Embed privacy considerations in system design
- **Data Breach Notification**: Mandatory notification for eligible data breaches
- **Individual Rights**: Access, correction, and deletion rights for personal information

#### SOX Compliance
- **Financial Data Protection**: Enhanced security for financial information
- **Audit Trail**: Immutable audit logs for financial transactions
- **Access Controls**: Strict controls on financial data access
- **Segregation of Duties**: Separation of financial responsibilities

### Industry Standards

#### ISO 27001
- **Information Security Management System (ISMS)**: Comprehensive security framework
- **ISMS Scope**: Clearly defined scope of the management system
- **Statement of Applicability**: Documented control selection and justification
- **Risk Treatment Plan**: Systematic approach to security risk management
- **Internal Audit**: Regular internal security audits
- **Management Review**: Periodic review and improvement of ISMS
- **Risk Assessment**: Regular security risk evaluations
- **Security Policies**: Documented and regularly updated policies
- **Training & Awareness**: Security awareness programs for staff

#### SOC 2 Type II
- **Continuous Evidence Collection**: Ongoing documentation of control effectiveness
- **Control Owners**: Designated owners for each security control
- **Security**: Protection against unauthorized access
- **Availability**: System operational availability
- **Processing Integrity**: Complete and accurate processing
- **Confidentiality**: Protection of confidential information
- **Privacy**: Protection of personal information

#### NZISM Alignment (Public Sector Clients)
- **Cryptographic Standards**: Alignment with NZISM crypto requirements
- **Hosting Requirements**: Compliance with data sovereignty requirements
- **Security Controls**: Implementation of NZISM security controls framework
- **Risk Management**: NZISM-aligned risk assessment and treatment

## Security Procedures

### Incident Response

#### Security Incident Classification
1. **Critical**: Active data breach or system compromise
2. **High**: Potential security vulnerability or unauthorized access
3. **Medium**: Security policy violation or suspicious activity
4. **Low**: Minor security configuration issues

#### Response Procedures
1. **Detection**: Automated monitoring and manual reporting
2. **Assessment**: Impact and scope evaluation
3. **Containment**: Immediate threat mitigation
4. **Investigation**: Root cause analysis
5. **Recovery**: System restoration and hardening
6. **Lessons Learned**: Process improvement

#### Service-Specific Recovery Objectives
- **Identity Services RTO**: 15 minutes maximum downtime
- **Session Services RPO**: 5 minutes maximum data loss
- **Authentication System RTO**: 10 minutes maximum recovery time

#### Key Compromise Playbook
**Immediate Steps:**
1. Revoke all opaque sessions by Redis pattern delete
2. Rotate PASETO keys immediately
3. Maintain grace set of previous public keys for safe sunset
4. Notify all affected services of key rotation
5. Monitor for continued unauthorized access attempts

### Security Testing

#### Regular Testing
- **Penetration Testing**: Quarterly third-party security assessments
- **Vulnerability Scanning**: Weekly automated vulnerability scans
- **Code Security Review**: Security review of all code changes
- **Red Team Exercises**: Annual simulated attack exercises

#### Security Validation
- **Token Security Testing**: Validation of token generation and validation
- **Multi-Tenant Isolation**: Testing tenant data segregation
- **Access Control Testing**: Permission and role validation
- **Encryption Testing**: Cryptographic implementation validation

#### Explicit Security Tests
- **Opaque Session Revocation**: Verify revoked sessions are denied on next request
- **PASETO Link One-Time Use**: Confirm PASETO links cannot be used twice once jti seen
- **Cross-Tenant Access**: Attempts return forbidden with zero rows changed
- **DPoP/mTLS Enforcement**: Verify proof-of-possession checks are enforced
- **Key Rotation**: Test multiple active key IDs and rotation procedures

## Security Monitoring

### Continuous Monitoring

#### Real-Time Monitoring
- **Authentication Failures**: Monitor failed login attempts
- **Token Anomalies**: Detect unusual token usage patterns
- **Permission Changes**: Track authorization modifications
- **Data Access**: Monitor sensitive data access patterns

#### Alerting
- **Security Alerts**: Immediate notification of security events
- **Threshold Monitoring**: Automated alerts for suspicious activity
- **Compliance Alerts**: Notification of compliance violations
- **Performance Alerts**: Security impact on system performance

### Reporting

#### Security Metrics
- **Authentication Success Rate**: Track login success/failure rates
- **Token Revocation Rate**: Monitor token security incidents
- **Permission Violations**: Track unauthorized access attempts
- **Compliance Status**: Regular compliance assessment reports

#### Dashboard
- **Security Overview**: Real-time security status dashboard
- **Tenant Security**: Per-tenant security metrics
- **User Activity**: Individual user security activity
- **System Health**: Overall security system status

## Key Management

### PASETO Key Management

#### Key Generation
- **Cryptographically Secure**: Use secure random number generation
- **PASETO v4 Public**: Ed25519 keys only
- **PASETO v4 Local**: 256-bit random keys from CSPRNG (avoid PBKDF derivation unless passphrase required)
- **Key Derivation**: Argon2 for key derivation only when accepting passphrases (should be avoided)

#### Key Storage
- **Hardware Security Module**: Use HSM for production keys
- **Key Vault**: Secure key storage service
- **Environment Separation**: Different keys for each environment
- **Backup & Recovery**: Secure key backup procedures

#### Key Rotation
- **Regular Rotation**: Quarterly key rotation schedule
- **Emergency Rotation**: Immediate rotation for compromised keys
- **Version Management**: Support for multiple key versions
- **Graceful Transition**: Seamless key rotation without downtime

## Security Training

### Staff Training

#### Security Awareness
- **General Security**: Basic security principles and practices
- **Phishing Prevention**: Recognition and reporting of phishing attempts
- **Password Security**: Strong password creation and management
- **Incident Reporting**: How to report security incidents

#### Technical Training
- **Secure Development**: Security best practices for developers
- **Token Security**: Understanding of Opaque and PASETO tokens
- **Multi-Tenant Security**: Tenant isolation and data protection
- **Incident Response**: Technical response procedures

### Documentation

#### Security Documentation
- **Security Policies**: Comprehensive policy documentation
- **Technical Procedures**: Detailed security implementation guides
- **Incident Response**: Step-by-step response procedures
- **Training Materials**: Security awareness and training resources

## Risk Management

### Risk Assessment

#### Risk Identification
- **Threat Modeling**: Systematic threat identification
- **Vulnerability Assessment**: Regular vulnerability evaluations
- **Business Impact**: Assessment of security impact on business
- **Compliance Risk**: Evaluation of regulatory compliance risks

#### Risk Mitigation
- **Security Controls**: Implementation of appropriate controls
- **Risk Transfer**: Insurance and third-party risk management
- **Risk Acceptance**: Documented acceptance of residual risks
- **Continuous Improvement**: Regular risk assessment updates

### Business Continuity

#### Disaster Recovery
- **Backup Procedures**: Regular data and system backups
- **Recovery Testing**: Regular disaster recovery testing
- **RTO/RPO**: Defined recovery time and point objectives
- **Communication Plans**: Incident communication procedures

## Security Governance

### Security Committee

#### Responsibilities
- **Policy Development**: Security policy creation and updates
- **Risk Management**: Security risk oversight and management
- **Incident Oversight**: Security incident response oversight
- **Compliance Monitoring**: Regulatory compliance monitoring

#### Membership
- **Chief Security Officer**: Security leadership and oversight
- **Technical Lead**: Technical security implementation
- **Legal Counsel**: Compliance and legal requirements
- **Business Stakeholders**: Business impact and requirements

### Regular Reviews

#### Security Reviews
- **Quarterly Reviews**: Regular security posture assessments
- **Annual Assessments**: Comprehensive security evaluations
- **Compliance Audits**: Regular compliance verification
- **Third-Party Reviews**: External security assessments

#### Policy Updates
- **Annual Updates**: Regular policy review and updates
- **Incident-Driven Updates**: Policy updates based on incidents
- **Regulatory Updates**: Updates for new compliance requirements
- **Technology Updates**: Updates for new security technologies

---

## Conclusion

This security policy establishes a comprehensive framework for protecting Pivotal Flow's multi-tenant SaaS platform. The combination of opaque access tokens for user sessions and PASETO v4 public for signed links and service-to-service authentication provides enterprise-grade security while maintaining excellent user experience and system performance.

Key security benefits:
- **Zero Information Leakage**: Opaque tokens reveal no sensitive data
- **Instant Revocation**: Immediate response to security incidents with sliding renewal
- **Strong Cryptography**: Ed25519 signatures and XChaCha20-Poly1305 encryption
- **Complete Audit Trail**: Comprehensive security monitoring with tamper-evident logging
- **Multi-Tenant Isolation**: Secure tenant data segregation with mandatory RLS
- **Clear Audit**: Fast revocation and clear audit while avoiding exposure of claims in browser-facing flows

This design provides strong tenant protection, fast revocation, and clear audit while avoiding exposure of claims in browser-facing flows.

## Current Implementation Status

### ✅ Implemented Security Features (January 2025)

#### Authentication & Authorization
- **Hybrid Token System**: Opaque access tokens + PASETO v4 public tokens operational
- **Multi-Tenant RBAC**: Three-tier role hierarchy (Super Admin, Tenant Admin, Regular Users)
- **Session Management**: Redis-based session storage with revocation capabilities
- **Password Security**: Argon2id hashing with configurable parameters
- **Token Security**: 15-minute access tokens with sliding renewal

#### Database Security
- **Row Level Security**: Enabled on all multi-tenant tables
- **Tenant Isolation**: Complete data segregation with tenant context enforcement
- **Audit Logging**: Comprehensive activity tracking with tamper-evident storage
- **Encryption**: Data encrypted at rest and in transit

#### Infrastructure Security
- **Container Security**: Docker containers with non-root execution and read-only filesystems
- **Network Security**: TLS 1.3, CORS configuration, VPC isolation
- **Input Validation**: TypeBox schema validation for all API inputs
- **Rate Limiting**: Per-tenant and per-user rate limits on all endpoints

#### Compliance Implementation
- **GDPR**: Data minimization, right to be forgotten, data portability features
- **NZ Privacy Act 2020**: All 13 Information Privacy Principles implemented
- **SOX**: Financial data protection with immutable audit trails
- **ISO 27001**: Information Security Management System framework
- **SOC 2 Type II**: Security, availability, and processing integrity controls

### 🔄 In Progress
- **Advanced MFA**: Additional multi-factor authentication methods
- **Enhanced Monitoring**: Real-time security event monitoring improvements
- **Automated Security Testing**: Continuous security validation pipeline

### 📋 Planned Enhancements
- **Zero Trust Architecture**: Additional zero-trust security controls
- **Advanced Threat Detection**: AI-powered security monitoring
- **Compliance Automation**: Automated compliance reporting and validation

Regular review and updates of this policy ensure continued protection against evolving security threats and compliance requirements.

---

*Last Updated: January 2025*
*Next Review: April 2025*
*Document Owner: Security Team*
*Implementation Status: Confirmed Operational*
