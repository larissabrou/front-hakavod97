const fs = require('fs');
const path = 'src/pages/storefront/Account.jsx';
let content = fs.readFileSync(path, 'utf8');

// Replace rounded corners in the dashboard cards
content = content.replace(/rounded-xl/g, 'rounded-none');
content = content.replace(/rounded-lg/g, 'rounded-none');
content = content.replace(/rounded-md/g, 'rounded-none');
content = content.replace(/rounded-sm/g, 'rounded-none');

// Enhance the "Tableau de Bord" headings
content = content.replace(/<h2 className="text-xl font-serif text-primary font-normal tracking-wide">/g, '<h2 className="text-xl font-bold uppercase tracking-[0.2em] text-neutral-900">');
content = content.replace(/<p className="text-xs text-neutral-500 font-light mt-1">/g, '<p className="text-[10px] uppercase tracking-widest text-neutral-400 mt-2">');

// Enhance the dashboard cards
content = content.replace(/min-h-\[140px\]/g, 'min-h-[160px]');
content = content.replace(/text-base font-bold text-neutral-800 tracking-wide/g, 'text-sm font-black uppercase tracking-[0.1em] text-neutral-900');
content = content.replace(/text-xs font-semibold text-neutral-850 truncate/g, 'text-[11px] font-bold uppercase tracking-wider text-neutral-900 truncate');

// Make the active order badge elegant
content = content.replace(/<span className="w-1.5 h-1.5 rounded-full bg-accent"><\/span>/g, '<span className="w-1 h-1 rounded-none bg-accent"></span>');
content = content.replace(/<span className="w-1.5 h-1.5 rounded-full bg-neutral-300"><\/span>/g, '<span className="w-1 h-1 rounded-none bg-neutral-300"></span>');

// Remove border radius from badges/tags
content = content.replace(/rounded-full/g, 'rounded-none');

// Make borders thicker or more defined for cards
content = content.replace(/border border-neutral-200 p-6 bg-white hover:border-neutral-350 hover:shadow-xs/g, 'border border-neutral-200 p-6 bg-white hover:border-neutral-900 hover:shadow-md');

// Refine secondary headings inside sections (like "Détails du Compte")
content = content.replace(/text-lg font-serif text-primary font-normal tracking-wide/g, 'text-[13px] font-bold uppercase tracking-[0.2em] text-neutral-900');

fs.writeFileSync(path, content, 'utf8');
console.log("Dashboard blocks improved.");
