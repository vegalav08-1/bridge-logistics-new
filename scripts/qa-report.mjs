import { promises as fs } from 'fs';

const md = `# QA Summary

- Unit: artifacts/junit-unit.xml, coverage in artifacts/coverage-unit/
- Integration: artifacts/junit-int.xml
- E2E: artifacts/junit-e2e.xml, report in artifacts/playwright-report/
- Perf: k6 run — check console output
- Security: semgrep/osv outputs in terminal
- Mutation: artifacts/stryker/

`;

await fs.mkdir('artifacts', { recursive: true });
await fs.writeFile('artifacts/QA_SUMMARY.md', md);
console.log('Wrote artifacts/QA_SUMMARY.md');




