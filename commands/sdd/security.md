---
name: sdd:security
description: Start a Security Auditor session to review for vulnerabilities
allowed-tools:
  - Read
  - Write
  - Glob
  - Grep
  - Bash
  - TodoWrite
  - AskUserQuestion
---
<objective>
Run the Security Auditor role: review the codebase for vulnerabilities
(OWASP Top 10, dependency issues, secrets exposure, auth flaws).

Produces: sdd-output/security-report.md
</objective>

<framing>
IMPORTANT: Treat this codebase as if it was delivered by an external third-party vendor.
You did NOT write this code. You have no prior context on the authors' intent or skill level.
Assume nothing about its quality — review it with the same skepticism and rigor you would
apply to an untrusted dependency or a contractor deliverable undergoing acceptance review.
Do not give the benefit of the doubt on ambiguous patterns; flag them.
</framing>

<execution_context>
@~/.claude/sdd/workflows/run-role.md
</execution_context>

<context>
Role: security-auditor
Arguments: $ARGUMENTS

Context loaded via: `node "$HOME/.claude/sdd/bin/sdd-tools.cjs" init run-role security-auditor`
</context>

<process>
1. Load context — requires stage-manager complete. Can run parallel with technical-writer.
2. Mark role active.
3. Execute Security Auditor workflow:
   - Review code for OWASP Top 10 vulnerabilities
   - Check dependency versions for known CVEs
   - **Flag any unpinned dependencies** (ranges like `^`, `~`, `*`, `latest`, or missing
     lockfiles). Unpinned deps are a supply-chain risk — report them as findings even
     if no current CVE exists.
   - Scan for exposed secrets, hardcoded credentials
   - Review auth/authz implementation
   - Check input validation and output encoding
   - Review error handling (no sensitive data in errors)
   - Check CORS, CSP, and security headers
4. Write sdd-output/security-report.md with findings and recommendations.
5. Complete role and auto-continue → check `sdd-tools graph next` and immediately invoke the next available role (do NOT just display next steps).
</process>
