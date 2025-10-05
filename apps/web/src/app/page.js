'use client';
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { Container } from '@yp/ui';
export default function HomePage() {
  return _jsx(Container, {
    children: _jsxs('div', {
      className: 'py-10',
      children: [
        _jsx('h1', {
          className: 'text-2xl font-bold text-brand',
          children:
            'YP ERP \u2014 \u0421\u043A\u0435\u043B\u0435\u0442 \u043F\u0440\u043E\u0435\u043A\u0442\u0430 (S0)',
        }),
        _jsx('p', {
          className: 'mt-2 text-slate-600',
          children:
            '\u041A\u0430\u0440\u043A\u0430\u0441 \u0433\u043E\u0442\u043E\u0432. \u0414\u0430\u043B\u044C\u0448\u0435 \u0438\u0434\u0451\u043C \u043F\u043E \u0441\u043F\u0440\u0438\u043D\u0442\u0430\u043C S1 \u2192 S13.',
        }),
      ],
    }),
  });
}
