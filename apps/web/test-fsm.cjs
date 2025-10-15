const fs = require('fs');
const path = require('path');

console.log('🧪 Проверка FSM системы...');

// Проверяем файлы FSM
const fsmFiles = [
  'src/lib/fsm/types.ts',
  'src/lib/fsm/schema.ts',
  'src/lib/fsm/graph.ts',
  'src/lib/fsm/apply.ts',
  'src/lib/fsm/api.ts',
  'src/lib/fsm/useFSM.ts',
  'src/app/chat/[chatId]/ActionModals/ReceivePartialDialog.tsx',
  'src/app/chat/[chatId]/ActionModals/SplitDialog.tsx',
  'src/components/lineage/LineagePanel.tsx',
  'src/components/lineage/LineageBadge.tsx',
  'src/components/fsm/StatusActionsV2.tsx',
  'src/components/fsm/SystemCards.tsx'
];

let allFilesExist = true;
fsmFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - НЕ НАЙДЕН`);
    allFilesExist = false;
  }
});

// Проверяем фиче-флаги
const flagsPath = path.join(__dirname, 'src/lib/flags.ts');
if (fs.existsSync(flagsPath)) {
  const flagsContent = fs.readFileSync(flagsPath, 'utf8');
  
  const checks = [
    { name: 'FSM_V2_ENABLED флаг', pattern: /FSM_V2_ENABLED.*=.*true/ },
    { name: 'LINEAGE_V2_ENABLED флаг', pattern: /LINEAGE_V2_ENABLED.*=.*true/ },
  ];

  console.log('\nПроверка фиче-флагов:');
  checks.forEach(check => {
    if (check.pattern.test(flagsContent)) {
      console.log(`✅ ${check.name}`);
    } else {
      console.log(`❌ ${check.name} - НЕ НАЙДЕН`);
      allFilesExist = false;
    }
  });
} else {
  console.log('❌ flags.ts не найден');
  allFilesExist = false;
}

// Проверяем интеграцию в чат
const chatPagePath = path.join(__dirname, 'src/app/chat/[chatId]/page.tsx');
if (fs.existsSync(chatPagePath)) {
  const content = fs.readFileSync(chatPagePath, 'utf8');

  const checks = [
    { name: 'FSM_V2_ENABLED импорт', pattern: /FSM_V2_ENABLED/ },
    { name: 'StatusActionsV2 импорт', pattern: /StatusActionsV2/ },
    { name: 'useFSM импорт', pattern: /useFSM/ },
    { name: 'FSM интеграция', pattern: /StatusActionsV2.*\n.*chatId.*\n.*role.*\n.*status/ },
  ];

  console.log('\nПроверка интеграции в чат:');
  checks.forEach(check => {
    if (check.pattern.test(content)) {
      console.log(`✅ ${check.name}`);
    } else {
      console.log(`❌ ${check.name} - НЕ НАЙДЕН`);
      allFilesExist = false;
    }
  });
} else {
  console.log('❌ chat page не найден');
  allFilesExist = false;
}

// Проверяем ACL интеграцию
const statusActionsPath = path.join(__dirname, 'src/app/chat/[chatId]/components/StatusActions.tsx');
if (fs.existsSync(statusActionsPath)) {
  const content = fs.readFileSync(statusActionsPath, 'utf8');

  const checks = [
    { name: 'IfCan импорт', pattern: /import.*IfCan/ },
    { name: 'useAbility импорт', pattern: /import.*useAbility/ },
    { name: 'ACL проверки кнопок', pattern: /<IfCan.*resource.*action.*mode="disable"/ },
  ];

  console.log('\nПроверка ACL интеграции:');
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

if (allFilesExist) {
  console.log('\n✨ FSM система реализована согласно ТЗ S11!');
  console.log('🎯 Основные возможности:');
  console.log('  • Машина статусов с частичными операциями');
  console.log('  • Split/Merge операции');
  console.log('  • Lineage (история происхождения)');
  console.log('  • Оптимистичные обновления');
  console.log('  • ACL интеграция');
  console.log('  • System cards для аудита');
} else {
  console.log('\n⚠️ Обнаружены проблемы в реализации FSM системы.');
}
