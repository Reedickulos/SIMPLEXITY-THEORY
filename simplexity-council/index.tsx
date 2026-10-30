import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Could not find root element to mount to");

let root = (rootElement as any)._reactRoot as Root | undefined;
if (!root) {
  root = createRoot(rootElement);
  (rootElement as any)._reactRoot = root;
}

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
