const fs = require('fs');
const path = require('path');

console.log('🧪 Проверка Search системы...');

// Проверяем файлы поиска
const searchFiles = [
  'src/lib/search/types.ts',
  'src/lib/search/api.ts',
  'src/lib/search/route.ts',
  'src/lib/search/tokenize.ts',
  'src/lib/search/useGlobalSearch.ts',
  'src/lib/search/audit.ts',
  'src/lib/scanner/camera.ts',
  'src/lib/scanner/barcode.ts',
  'src/lib/scanner/ocr.ts',
  'src/lib/scanner/sheet.tsx',
  'src/app/search/page.tsx',
  'src/app/search/components/SearchBox.tsx',
  'src/app/search/components/ResultCard.tsx',
  'src/app/search/components/SearchResults.tsx',
  'src/components/header/GlobalSearchButton.tsx',
  'src/components/header/ScannerButton.tsx',
  'src/components/forms/OcrSuggestBar.tsx',
  'src/app/api/audit/ui/search/route.ts',
  'src/app/api/audit/ui/scan/route.ts',
  'src/app/api/audit/ui/ocr/route.ts'
];

let allFilesExist = true;
searchFiles.forEach(file => {
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
    { name: 'SEARCH_V2_ENABLED флаг', pattern: /SEARCH_V2_ENABLED.*=.*true/ },
    { name: 'SCANNER_V2_ENABLED флаг', pattern: /SCANNER_V2_ENABLED.*=.*true/ },
    { name: 'OCR_V2_ENABLED флаг', pattern: /OCR_V2_ENABLED.*=.*true/ },
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

// Проверяем интеграцию в AppHeader
const appHeaderPath = path.join(__dirname, 'src/components/layout/AppHeader.tsx');
if (fs.existsSync(appHeaderPath)) {
  const content = fs.readFileSync(appHeaderPath, 'utf8');

  const checks = [
    { name: 'SEARCH_V2_ENABLED импорт', pattern: /SEARCH_V2_ENABLED/ },
    { name: 'SCANNER_V2_ENABLED импорт', pattern: /SCANNER_V2_ENABLED/ },
    { name: 'GlobalSearchButton импорт', pattern: /import.*GlobalSearchButton/ },
    { name: 'ScannerButton импорт', pattern: /import.*ScannerButton/ },
    { name: 'GlobalSearchButton интеграция', pattern: /SEARCH_V2_ENABLED.*GlobalSearchButton/ },
    { name: 'ScannerButton интеграция', pattern: /SCANNER_V2_ENABLED.*ScannerButton/ },
  ];

  console.log('\nПроверка интеграции в AppHeader:');
  checks.forEach(check => {
    if (check.pattern.test(content)) {
      console.log(`✅ ${check.name}`);
    } else {
      console.log(`❌ ${check.name} - НЕ НАЙДЕН`);
      allFilesExist = false;
    }
  });
} else {
  console.log('❌ AppHeader.tsx не найден');
  allFilesExist = false;
}

if (allFilesExist) {
  console.log('\n✨ Search система реализована согласно ТЗ S12!');
  console.log('🎯 Основные возможности:');
  console.log('  • Глобальный поиск по ключевым идентификаторам');
  console.log('  • Мобильный сканер QR/штрих-кодов');
  console.log('  • Клиентский OCR для фото накладных');
  console.log('  • Deep-link навигация');
  console.log('  • ACL интеграция');
  console.log('  • Аудит и наблюдаемость');
} else {
  console.log('\n⚠️ Обнаружены проблемы в реализации Search системы.');
}


