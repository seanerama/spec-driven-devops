#!/usr/bin/env node

/**
 * sdd-statusline — Statusline hook for Claude Code
 *
 * Displays current SDD role and progress in the status bar.
 * Reads STATE.md frontmatter for current role/phase info.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Read stdin (Claude Code sends JSON with model, workspace, session_id, etc.)
let input = '';
process.stdin.setEncoding('utf-8');
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const cwd = data.cwd || process.cwd();
    const statePath = path.join(cwd, 'sdd-output', 'STATE.md');

    if (!fs.existsSync(statePath)) {
      // No SDD project — output empty
      process.stdout.write(JSON.stringify({}));
      return;
    }

    const content = fs.readFileSync(statePath, 'utf-8');

    // Extract fields from markdown body
    const extractField = (fieldName) => {
      const pattern = new RegExp(`\\*\\*${fieldName}:\\*\\*\\s*(.+)`, 'i');
      const match = content.match(pattern);
      return match ? match[1].trim() : null;
    };

    const phase = extractField('Current Phase') || 'Unknown';
    const status = extractField('Status') || 'Unknown';

    // Find active role
    const activeSection = content.match(/## Active Roles?\s*\n([\s\S]*?)(?=\n##|$)/i);
    let activeRole = null;
    if (activeSection) {
      const roleMatch = activeSection[1].match(/\*\*(.+?):\*\*/);
      if (roleMatch) activeRole = roleMatch[1];
    }

    // Calculate progress from checklist
    const total = (content.match(/- \[[ x]\]/gi) || []).length;
    const completed = (content.match(/- \[x\]/gi) || []).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    const barWidth = 10;
    const filled = Math.round(percent / 100 * barWidth);
    const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(barWidth - filled);

    // Build status line
    const parts = ['SDD'];
    if (activeRole) {
      parts.push(activeRole);
    } else {
      parts.push(phase);
    }

    const statusLine = parts.join(': ') + ` ${bar} ${percent}%`;

    // Write context metrics to bridge file for context monitor
    const bridgePath = path.join(os.tmpdir(), 'sdd-context-bridge.json');
    const contextData = {
      ...data,
      sdd_phase: phase,
      sdd_status: status,
      sdd_active_role: activeRole,
      sdd_progress: percent,
      timestamp: new Date().toISOString(),
    };
    fs.writeFileSync(bridgePath, JSON.stringify(contextData), 'utf-8');

    process.stdout.write(JSON.stringify({ statusline: statusLine }));
  } catch (err) {
    process.stdout.write(JSON.stringify({}));
  }
});
