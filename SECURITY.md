# Security Policy

## Supported Versions

We provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| < Latest| :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability, please follow these steps:

### 1. **Do NOT** open a public issue

Security vulnerabilities should be reported privately to protect users until a fix is available.

### 2. Report the vulnerability

Please email security concerns to: **contact@sacredvows.io**

Include the following information:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)
- Your contact information

### 3. Response timeline

- **Initial response**: Within 48 hours
- **Status update**: Within 7 days
- **Fix timeline**: Depends on severity and complexity

### 4. Disclosure

We will:
- Acknowledge receipt of your report
- Keep you informed of our progress
- Credit you in the security advisory (if desired)
- Coordinate public disclosure after a fix is available

## Security Best Practices

### For Users

- Keep dependencies up to date
- Use strong, unique passwords
- Enable two-factor authentication where available
- Review and rotate API keys regularly
- Follow the principle of least privilege

### For Developers

- Never commit secrets or credentials
- Use environment variables for sensitive configuration
- Validate and sanitize all user inputs
- Use parameterized queries to prevent SQL injection
- Implement proper authentication and authorization
- Keep dependencies updated
- Review security advisories for dependencies

## Security Checklist

When contributing code, ensure:

- [ ] No hardcoded secrets or credentials
- [ ] Input validation and sanitization
- [ ] Proper error handling (no sensitive info in errors)
- [ ] Authentication/authorization checks
- [ ] Dependencies are up to date
- [ ] Security headers are configured
- [ ] HTTPS is enforced in production
- [ ] Rate limiting is implemented where appropriate

## Known Security Considerations

### Authentication

- JWT tokens are used for authentication
- Refresh tokens are stored securely
- Password reset uses time-limited OTP codes
- See [Authentication Documentation](./docs/architecture/authentication/) for details

### Data Storage

- Sensitive data is encrypted at rest
- User passwords are hashed using secure algorithms
- API keys are stored securely

### Network

- All API communication uses HTTPS
- CORS is properly configured
- Rate limiting is implemented

## Security Updates

Security updates will be:
- Released as patches to supported versions
- Documented in release notes
- Listed in security advisories

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Go Security Best Practices](https://go.dev/doc/security/best-practices)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

## Contact

For security concerns, please contact: **contact@sacredvows.io**

For general questions, please open an issue on GitHub.

