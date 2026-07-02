const fs = require('fs');
const path = 'src/pages/storefront/Account.jsx';
let content = fs.readFileSync(path, 'utf8');

const oldHeader = `            {/* Header Profil */}
            <div className="bg-white border border-neutral-200 p-4 md:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-sm rounded-xl">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-[9px] uppercase tracking-[0.25em] text-accent font-semibold px-2.5 py-1 border border-accent/20 bg-accent/5 rounded-full">{c.privileged_member_tag}</span>
                </div>
                <h1 className="text-2xl font-serif text-primary font-normal tracking-wide">{getGreeting(c)}, {customerUser?.name?.split(' ')[0] || 'Client'}</h1>
                <p className="text-xs text-neutral-500 font-light flex items-center gap-4">
                  <span>{customerUser?.email}</span>
                  {customerUser?.phone && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-neutral-300"></span>
                      <span>{customerUser?.phone}</span>
                    </>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/services-de-conciergerie')}
                  className="border border-accent/40 text-accent hover:bg-accent/5 py-2.5 px-5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all cursor-pointer bg-white shadow-2xs"
                >
                  {c.contact_concierge}
                </button>
                <button
                  onClick={handleLogoutClick}
                  className="border border-neutral-200 hover:border-danger hover:text-danger text-neutral-500 py-2.5 px-5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all flex items-center gap-2 cursor-pointer bg-white shadow-2xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  {c.logout_btn}
                </button>
              </div>
            </div>`;

const newHeader = `            {/* Header Profil */}
            <div className="bg-white border border-neutral-200 p-8 md:p-12 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-sm rounded-none">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-[9px] uppercase tracking-[0.25em] text-accent font-bold px-3 py-1.5 border border-accent/20 bg-accent/5 rounded-none">{c.privileged_member_tag}</span>
                </div>
                <h1 className="text-3xl font-extrabold uppercase tracking-[0.2em] text-neutral-900">{getGreeting(c)}, {customerUser?.name?.split(' ')[0] || 'Client'}</h1>
                <p className="text-xs text-neutral-500 font-light tracking-wider flex items-center gap-4">
                  <span>{customerUser?.email}</span>
                  {customerUser?.phone && (
                    <>
                      <span className="w-1 h-1 rounded-none bg-neutral-300"></span>
                      <span>{customerUser?.phone}</span>
                    </>
                  )}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button
                  onClick={() => navigate('/services-de-conciergerie')}
                  className="w-full sm:w-auto border border-accent text-accent hover:bg-accent hover:text-white py-3.5 px-6 text-[10px] font-bold uppercase tracking-[0.2em] rounded-none transition-all cursor-pointer bg-white"
                >
                  {c.contact_concierge}
                </button>
                <button
                  onClick={handleLogoutClick}
                  className="w-full sm:w-auto border border-neutral-900 hover:bg-neutral-900 hover:text-white text-neutral-900 py-3.5 px-6 text-[10px] font-bold uppercase tracking-[0.2em] rounded-none transition-all flex items-center justify-center gap-2 cursor-pointer bg-transparent"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  {c.logout_btn}
                </button>
              </div>
            </div>`;

content = content.replace(oldHeader, newHeader);

// Now for the sidebar tabs wrapper
const oldSidebar = `              {/* Sidebar tabs navigation */}
              <div className="flex flex-row overflow-x-auto lg:flex-col border border-neutral-200 bg-white p-2 md:p-3 rounded-xl h-fit gap-1 lg:gap-0 lg:space-y-1 shadow-3xs scrollbar-none snap-x snap-mandatory shrink-0 w-full">`;

const newSidebar = `              {/* Sidebar tabs navigation */}
              <div className="flex flex-row overflow-x-auto lg:flex-col border border-neutral-200 bg-white p-6 lg:p-8 rounded-none h-fit gap-4 lg:gap-2 shadow-sm scrollbar-none snap-x snap-mandatory shrink-0 w-full lg:min-w-[280px]">
                <h3 className="hidden lg:block text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] mb-4 pb-4 border-b border-neutral-100">{c.personal_space || "Espace Personnel"}</h3>`;

content = content.replace(oldSidebar, newSidebar);

// Regular expressions to fix the sidebar buttons dynamically:
// We want to replace the `w-auto lg:w-full flex items-center gap-2 lg:gap-3 py-2.5 lg:py-3 px-3 lg:px-4 text-[10px] lg:text-xs font-bold uppercase tracking-wider transition-all text-left rounded-lg shrink-0 snap-start whitespace-nowrap`
// with `w-auto lg:w-full flex items-center gap-3 py-3 lg:py-4 px-4 text-[10px] font-bold uppercase tracking-[0.15em] transition-all text-left rounded-none shrink-0 snap-start whitespace-nowrap border-b lg:border-b-0 lg:border-l-2`

content = content.replace(/className={\`w-auto lg:w-full flex items-center gap-2 lg:gap-3 py-2.5 lg:py-3 px-3 lg:px-4 text-\[10px\] lg:text-xs font-bold uppercase tracking-wider transition-all text-left rounded-lg shrink-0 snap-start whitespace-nowrap \$\{([^}]+)\}\`/g, (match, p1) => {
    // p1 contains the active/inactive logic
    // We rewrite the active logic
    let newLogic = p1;
    // Replace 'bg-primary text-white font-extrabold shadow-sm' with 'border-primary text-neutral-900 bg-neutral-50 lg:bg-transparent lg:border-l-primary font-black'
    newLogic = newLogic.replace(/'bg-primary text-white font-extrabold shadow-sm'/g, "'border-primary text-neutral-900 lg:bg-transparent lg:border-l-primary font-black'");
    // Replace inactive state
    newLogic = newLogic.replace(/'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'/g, "'border-transparent text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50 lg:border-l-transparent'");
    
    return `className={\`w-auto lg:w-full flex items-center gap-3 py-3 lg:py-4 px-4 text-[10px] font-bold uppercase tracking-[0.15em] transition-all text-left rounded-none shrink-0 snap-start whitespace-nowrap border-b-2 lg:border-b-0 lg:border-l-2 \${${newLogic}}\``;
});

// Remove the text-white transition from icons in sidebar
content = content.replace(/className={\`w-4 h-4 transition-colors \$\{activeTab === '([^']+)' \? 'text-white' : 'text-neutral-400'\}\`\}/g, "className={`w-4 h-4 transition-colors ${activeTab === '$1' ? 'text-primary' : 'text-neutral-400'}`}");

// Remove rounded-xl from main content areas
content = content.replace(/border border-neutral-200 bg-white p-6 md:p-8 rounded-xl/g, "border border-neutral-200 bg-white p-8 md:p-12 rounded-none shadow-sm");

// Make input fields square and more elegant
content = content.replace(/rounded-lg/g, "rounded-none");

fs.writeFileSync(path, content, 'utf8');
console.log("Account dashboard layout successfully improved.");
