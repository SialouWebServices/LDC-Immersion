import fs from 'fs';
import path from 'path';

const mainJsPath = path.resolve('src/main.js');
let code = fs.readFileSync(mainJsPath, 'utf8');

const themeCode = `
// ===== THEME LOGIC =====
function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const target = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', target);
    localStorage.setItem('ldc-theme', target);
    document.getElementById('theme-toggle').innerText = target === 'dark' ? '☀️' : '🌙';
}

// Init theme on load
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('ldc-theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        const btn = document.getElementById('theme-toggle');
        if (btn) btn.innerText = '☀️';
    }
});
`;

// Insert the themeCode right after the window bindings or at the end
code = code.replace('showToast', 'showToast, toggleTheme'); // Update the window assignment
code += '\\n\\n' + themeCode;

fs.writeFileSync(mainJsPath, code);
console.log('Appended Theme toggle functionality.');
