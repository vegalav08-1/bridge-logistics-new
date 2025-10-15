module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // новая функциональность
        'fix',      // исправление бага
        'docs',     // изменения в документации
        'style',    // форматирование, отсутствующие точки с запятой и т.д.
        'refactor', // рефакторинг кода
        'perf',     // изменения, улучшающие производительность
        'test',     // добавление тестов
        'chore',    // изменения в процессе сборки или вспомогательных инструментах
        'ci',       // изменения в CI/CD
        'build',    // изменения в системе сборки
        'revert'    // откат изменений
      ]
    ],
    'subject-case': [2, 'never', ['start-case', 'pascal-case', 'upper-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100]
  }
};
