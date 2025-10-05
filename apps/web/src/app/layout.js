import { jsx as _jsx } from 'react/jsx-runtime';
import './styles/globals.css';
export const metadata = {
  title: 'YP ERP',
  description: 'ERP with chat-journals (skeleton)',
};
export default function RootLayout({ children }) {
  return _jsx('html', { lang: 'ru', children: _jsx('body', { children: children }) });
}
