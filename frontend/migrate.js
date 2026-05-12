import fs from 'fs';
import path from 'path';

const searchDir = './src';

// Map of old class names to new ones.
const classMap = {
  // 1. Dark colors to remove
  'dark:text-dark-text-primary': '',
  'dark:text-dark-text-secondary': '',
  'dark:text-dark-text-tertiary': '',
  'dark:text-dark-text-inverse': '',
  'dark:bg-dark-bg-primary': '',
  'dark:bg-dark-bg-secondary': '',
  'dark:bg-dark-bg-tertiary': '',
  'dark:bg-dark-bg-hover': '',
  'dark:border-dark-border': '',
  'dark:border-dark-border-strong': '',
  'dark:text-accent-primary-light': '',
  'dark:bg-accent-primary-light': '',
  'dark:hover:bg-dark-bg-hover': '',
  'dark:hover:text-dark-text-secondary': '',
  'dark:hover:border-accent-primary-light': '',

  // 2. Map Light Tokens to New Semantic Tokens
  'text-light-text-primary': 'text-text-primary',
  'text-light-text-secondary': 'text-text-secondary',
  'text-light-text-tertiary': 'text-text-muted',
  'text-light-text-inverse': 'text-text-inverse',
  'bg-light-bg-primary': 'bg-bg-canvas',
  'bg-light-bg-secondary': 'bg-bg-surface',
  'bg-light-bg-tertiary': 'bg-bg-elevated',
  'bg-light-bg-hover': 'bg-bg-hover',
  'hover:bg-light-bg-hover': 'hover:bg-bg-hover',
  'border-light-border-strong': 'border-border-strong',
  'border-light-border': 'border-border',

  // 3. Accents
  'text-accent-primary': 'text-primary',
  'bg-accent-primary': 'bg-primary',
  'border-accent-primary': 'border-primary',
  'hover:border-accent-primary': 'hover:border-primary',
  'ring-accent-primary': 'ring-primary',
  'text-accent-success': 'text-success',
  'bg-accent-success': 'bg-success',
  'text-accent-danger': 'text-danger',
  'bg-accent-danger': 'bg-danger',
  'border-accent-danger': 'border-danger',
  'ring-accent-danger': 'ring-danger',
  'hover:bg-accent-danger': 'hover:bg-danger',
  'text-accent-warning': 'text-warning',
  'bg-accent-warning': 'bg-warning',
  'text-accent-info': 'text-info',
  'bg-accent-info': 'bg-info',

  // 4. Custom Components
  'btn-primary': 'bg-primary hover:bg-primary/90 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer',
  'btn-secondary': 'bg-bg-surface hover:bg-bg-hover text-text-primary border border-border shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer',
  'btn-danger': 'bg-danger hover:bg-danger/90 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-danger/50 transition-all cursor-pointer',
  'btn-ghost': 'bg-transparent hover:bg-bg-hover text-text-secondary focus:outline-none transition-all cursor-pointer',
  'input-field': 'w-full px-4 py-3 bg-bg-surface text-text-primary border border-border rounded-lg placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all',
  'card-interactive': 'p-6 bg-bg-surface border border-border rounded-xl shadow-sm hover:shadow-md hover:border-primary/40 transition-all cursor-pointer',
  'task-card': 'p-4 bg-bg-surface border border-border rounded-xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer',
  'auth-card': 'p-8 bg-bg-canvas border border-border rounded-2xl shadow-lg',
  'focus-visible-ring': 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
  'card': 'p-6 bg-bg-surface border border-border rounded-xl shadow-sm',
  'badge-status-todo': 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-task-status-todo/10 text-task-status-todo',
  'badge-status-progress': 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-task-status-progress/10 text-task-status-progress',
  'badge-status-review': 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-task-status-review/10 text-task-status-review',
  'badge-status-done': 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-task-status-done/10 text-task-status-done',
  'badge-priority-urgent': 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-task-priority-urgent/10 text-task-priority-urgent',
  'badge-priority-high': 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-task-priority-high/10 text-task-priority-high',
  'badge-priority-medium': 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-task-priority-medium/10 text-task-priority-medium',
  'badge-priority-low': 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-task-priority-low/10 text-task-priority-low',
  'shimmer': 'animate-pulse bg-bg-hover'
};

function processClassString(classStr) {
  let classes = classStr.split(/\s+/);
  let newClasses = [];
  
  for (let c of classes) {
    if (classMap.hasOwnProperty(c)) {
      if (classMap[c] !== '') {
        newClasses.push(classMap[c]);
      }
    } else {
      newClasses.push(c);
    }
  }
  
  return newClasses.join(' ').trim();
}

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      
      // Process className="..."
      content = content.replace(/className="([^"]*)"/g, (match, classStr) => {
        return `className="${processClassString(classStr)}"`;
      });
      
      // Process className={`...`}
      content = content.replace(/className=\{`([^`]*)`\}/g, (match, classStr) => {
        // We only want to process the text parts, but to be safe, if there are ${} vars,
        // we can just run it on the whole thing and hope for the best, or process it carefully.
        // Usually, variables don't exactly match our classMap keys unless it's just plain text.
        // But doing processClassString on the whole thing is safe because split(/\s+/)
        // will keep ${var} as its own chunk or attached to something, and our keys are exact strings.
        return `className={\`${processClassString(classStr)}\`}`;
      });
      
      if (original !== content) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

console.log('Starting migration...');
processDirectory(searchDir);
console.log('Migration complete!');
