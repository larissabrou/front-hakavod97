const fs = require('fs');
const path = 'src/pages/storefront/Account.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Replace the root div and the max-w-7xl wrapper
const oldRootWrapper = `<div className="w-full min-h-screen bg-neutral-50 text-neutral-900 pt-24 md:pt-24 pb-24 font-sans animate-fade-in">
      <div className="max-w-7xl mx-auto px-6">
        

        {!isAuthenticated ? (`;

const newRootWrapper = `<div className={\`w-full min-h-screen bg-neutral-50 text-neutral-900 \${isAuthenticated ? "pt-24 md:pt-32 pb-24" : "pt-[104px] pb-0"} font-sans animate-fade-in\`}>
        {!isAuthenticated ? (`;

content = content.replace(oldRootWrapper, newRootWrapper);

// 2. Fix the authenticated wrapper opening
const oldAuthOpen = `        ) : (
          /* ── AUTHENTICATED: Premium Luxury Dashboard ── */
          <div className="space-y-8">`;

const newAuthOpen = `        ) : (
          /* ── AUTHENTICATED: Premium Luxury Dashboard ── */
          <div className="max-w-7xl mx-auto px-6">
            <div className="space-y-8">`;

content = content.replace(oldAuthOpen, newAuthOpen);

// 3. Fix the authenticated wrapper closing at the very end
const oldAuthClose = `            </div>
          </div>
        )}
        {activeQuickAddProduct && createPortal(`;

const newAuthClose = `            </div>
            </div>
          </div>
        )}
        {activeQuickAddProduct && createPortal(`;

content = content.replace(oldAuthClose, newAuthClose);

// Also remove border-t and margins from the unauthenticated split layout container
const oldSplitLayout = `<div className="min-h-[calc(100vh-120px)] flex flex-col md:flex-row w-full max-w-[1920px] mx-auto bg-white mb-0 mt-0 border-t border-neutral-100">`;
const newSplitLayout = `<div className="min-h-[calc(100vh-104px)] flex flex-col md:flex-row w-full bg-white shadow-2xl">`;
content = content.replace(oldSplitLayout, newSplitLayout);

fs.writeFileSync(path, content, 'utf8');
console.log("Padding and layout fixed.");
