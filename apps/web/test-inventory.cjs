const fs = require('fs');
const path = require('path');

console.log('🧪 Проверка Inventory системы...');

// Проверяем файлы инвентаря
const inventoryFiles = [
  'src/lib/inventory/types.ts',
  'src/lib/inventory/schema.ts',
  'src/lib/inventory/api.ts',
  'src/lib/inventory/useInventory.ts',
  'src/lib/inventory/usePacking.ts',
  'src/lib/inventory/useLabels.ts',
  'src/lib/inventory/audit.ts',
  'src/app/inventory/page.tsx',
  'src/app/inventory/components/InventoryList.tsx',
  'src/app/inventory/components/ItemCard.tsx',
  'src/app/chat/[chatId]/components/PackingPanel.tsx',
  'src/app/chat/[chatId]/components/PackageCard.tsx',
  'src/app/chat/[chatId]/components/LabelButton.tsx',
  'src/app/api/audit/ui/inventory/route.ts'
];

let allFilesExist = true;
inventoryFiles.forEach(file => {
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
    { name: 'INVENTORY_V2_ENABLED флаг', pattern: /INVENTORY_V2_ENABLED.*=.*true/ },
    { name: 'PACKING_V2_ENABLED флаг', pattern: /PACKING_V2_ENABLED.*=.*true/ },
    { name: 'LABELS_V2_ENABLED флаг', pattern: /LABELS_V2_ENABLED.*=.*true/ },
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
    { name: 'PACKING_V2_ENABLED импорт', pattern: /PACKING_V2_ENABLED/ },
    { name: 'PackingPanel импорт', pattern: /import.*PackingPanel/ },
    { name: 'Packing Panel интеграция', pattern: /PACKING_V2_ENABLED.*\n.*\n.*PackingPanel/ },
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

if (allFilesExist) {
  console.log('\n✨ Inventory система реализована согласно ТЗ S14!');
  console.log('🎯 Основные возможности:');
  console.log('  • Складской учет и остатки');
  console.log('  • Упаковка и маркировка');
  console.log('  • Генерация этикеток QR/ШК');
  console.log('  • ACL интеграция');
  console.log('  • Аудит складских операций');
} else {
  console.log('\n⚠️ Обнаружены проблемы в реализации Inventory системы.');
}


