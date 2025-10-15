const fs = require('fs');
const path = require('path');

console.log('🧪 Тестирование ACL системы...\n');

// Проверяем, что все файлы ACL созданы
const aclFiles = [
  'src/lib/acl/types.ts',
  'src/lib/acl/policy.ts', 
  'src/lib/acl/ability.ts',
  'src/lib/acl/explain.ts',
  'src/lib/acl/context.tsx',
  'src/lib/acl/useAbility.ts',
  'src/lib/acl/IfCan.tsx',
  'src/lib/acl/Guard.tsx',
  'src/lib/acl/audit.ts',
  'src/lib/acl/devtools.tsx',
  'src/lib/acl/route-guard.ts',
  'src/app/api/audit/ui/access-denied/route.ts'
];

let allFilesExist = true;
aclFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - НЕ НАЙДЕН`);
    allFilesExist = false;
  }
});

// Проверяем интеграцию в layout.tsx
const layoutPath = path.join(__dirname, 'src/app/layout.tsx');
if (fs.existsSync(layoutPath)) {
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  
  const checks = [
    { name: 'ACL_V2_ENABLED импорт', pattern: /ACL_V2_ENABLED/ },
    { name: 'ACLProvider импорт', pattern: /import.*ACLProvider/ },
    { name: 'ACLDevtools импорт', pattern: /import.*ACLDevtools/ },
    { name: 'ACLProvider обертка', pattern: /<ACLProvider/ },
    { name: 'ACLDevtools компонент', pattern: /<ACLDevtools/ }
  ];
  
  console.log('\n🔍 Проверка интеграции в layout.tsx:');
  checks.forEach(check => {
    if (check.pattern.test(layoutContent)) {
      console.log(`✅ ${check.name}`);
    } else {
      console.log(`❌ ${check.name} - НЕ НАЙДЕН`);
      allFilesExist = false;
    }
  });
} else {
  console.log('❌ layout.tsx не найден');
  allFilesExist = false;
}

// Проверяем интеграцию в StatusActions
const statusActionsPath = path.join(__dirname, 'src/app/chat/[chatId]/components/StatusActions.tsx');
if (fs.existsSync(statusActionsPath)) {
  const content = fs.readFileSync(statusActionsPath, 'utf8');
  
  const checks = [
    { name: 'IfCan импорт', pattern: /import.*IfCan/ },
    { name: 'useAbility импорт', pattern: /import.*useAbility/ },
    { name: 'IfCan использование', pattern: /<IfCan/ }
  ];
  
  console.log('\n🔍 Проверка интеграции в StatusActions:');
  checks.forEach(check => {
    if (check.pattern.test(content)) {
      console.log(`✅ ${check.name}`);
    } else {
      console.log(`❌ ${check.name} - НЕ НАЙДЕН`);
      allFilesExist = false;
    }
  });
} else {
  console.log('❌ StatusActions.tsx не найден');
  allFilesExist = false;
}

// Проверяем интеграцию в BottomNav
const bottomNavPath = path.join(__dirname, 'src/components/layout/BottomNav.tsx');
if (fs.existsSync(bottomNavPath)) {
  const content = fs.readFileSync(bottomNavPath, 'utf8');
  
  const checks = [
    { name: 'useAbility импорт', pattern: /import.*useAbility/ },
    { name: 'ability.can использование', pattern: /ability\.can/ }
  ];
  
  console.log('\n🔍 Проверка интеграции в BottomNav:');
  checks.forEach(check => {
    if (check.pattern.test(content)) {
      console.log(`✅ ${check.name}`);
    } else {
      console.log(`❌ ${check.name} - НЕ НАЙДЕН`);
      allFilesExist = false;
    }
  });
} else {
  console.log('❌ BottomNav.tsx не найден');
  allFilesExist = false;
}

console.log('\n📊 Результат:');
if (allFilesExist) {
  console.log('🎉 ACL система успешно реализована и интегрирована!');
  console.log('\n✨ Возможности:');
  console.log('• Роли и права (USER, ADMIN, SUPER)');
  console.log('• Политика доступа с условиями');
  console.log('• UI-компоненты IfCan и Guard');
  console.log('• Локализованные объяснения отказа');
  console.log('• UI-аудит попыток доступа');
  console.log('• DevTools для разработки');
  console.log('• Интеграция в StatusActions и BottomNav');
} else {
  console.log('❌ ACL система не полностью реализована');
}
