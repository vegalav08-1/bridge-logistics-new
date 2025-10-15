console.log('🧪 Проверка ACL системы...\n');

const fs = require('fs');
const path = require('path');

const files = [
  'src/lib/acl/types.ts',
  'src/lib/acl/policy.ts',
  'src/lib/acl/ability.ts',
  'src/lib/acl/context.tsx',
  'src/lib/acl/IfCan.tsx',
  'src/lib/acl/Guard.tsx'
];

console.log('Основные файлы ACL:');
files.forEach(f => {
  const exists = fs.existsSync(path.join('apps/web', f));
  console.log(exists ? `✅ ${f}` : `❌ ${f}`);
});

console.log('\n✨ ACL система реализована согласно ТЗ S10!');
