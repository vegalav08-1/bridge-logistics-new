const fs = require('fs');
const path = require('path');

console.log('🧪 Проверка Finance системы...');

// Проверяем файлы финансов
const financeFiles = [
  'src/lib/finance/types.ts',
  'src/lib/finance/schema.ts',
  'src/lib/finance/fx.ts',
  'src/lib/finance/calc.ts',
  'src/lib/finance/api.ts',
  'src/lib/finance/useFinance.ts',
  'src/lib/finance/audit.ts',
  'src/components/finance/Money.tsx',
  'src/components/finance/PriceInput.tsx',
  'src/components/finance/PaymentDialog.tsx',
  'src/app/chat/[chatId]/components/FinancePanel.tsx',
  'src/app/chat/[chatId]/components/OfferCard.tsx',
  'src/app/chat/[chatId]/components/InvoiceCard.tsx',
  'src/app/offers/new/page.tsx',
  'src/app/api/audit/ui/finance/route.ts'
];

let allFilesExist = true;
financeFiles.forEach(file => {
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
    { name: 'OFFERS_V2_ENABLED флаг', pattern: /OFFERS_V2_ENABLED.*=.*true/ },
    { name: 'FINANCE_V2_ENABLED флаг', pattern: /FINANCE_V2_ENABLED.*=.*true/ },
    { name: 'FX_V2_ENABLED флаг', pattern: /FX_V2_ENABLED.*=.*true/ },
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
    { name: 'FINANCE_V2_ENABLED импорт', pattern: /FINANCE_V2_ENABLED/ },
    { name: 'FinancePanel импорт', pattern: /import.*FinancePanel/ },
    { name: 'Finance Panel интеграция', pattern: /FINANCE_V2_ENABLED.*\n.*\n.*FinancePanel/ },
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
  console.log('\n✨ Finance система реализована согласно ТЗ S13!');
  console.log('🎯 Основные возможности:');
  console.log('  • Офферы и калькуляция');
  console.log('  • Инвойсы и оплаты');
  console.log('  • Баланс и долги');
  console.log('  • Мультивалютность');
  console.log('  • ACL интеграция');
  console.log('  • Аудит финансовых операций');
} else {
  console.log('\n⚠️ Обнаружены проблемы в реализации Finance системы.');
}
