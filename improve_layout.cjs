const fs = require('fs');
const path = 'src/pages/storefront/Account.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Import hero image if not already there
if (!content.includes("import heroImg")) {
  const lastImportIndex = content.lastIndexOf("import ");
  const endOfLastImport = content.indexOf("\n", lastImportIndex) + 1;
  content = content.substring(0, endOfLastImport) + 
            "import heroImg from '../../assets/hero.png';\n" + 
            content.substring(endOfLastImport);
}

// 2. Replace the unauthenticated wrapper
const searchTag = '{!isAuthenticated ? (\n          /* ── NOT AUTHENTICATED: Centered Form with Tabs ── */\n          <div className="max-w-md mx-auto bg-transparent mb-20 mt-10">';

const replaceTag = `{!isAuthenticated ? (
          /* ── NOT AUTHENTICATED: Split Layout for well-occupied space ── */
          <div className="min-h-[calc(100vh-120px)] flex flex-col md:flex-row w-full max-w-[1920px] mx-auto bg-white mb-0 mt-0 border-t border-neutral-100">
            {/* LEFT SIDE: Luxury Image Banner */}
            <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-neutral-900 group">
              <img 
                src={heroImg} 
                alt="Maison Hakavod" 
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-16 pb-24 text-white">
                <h2 className="text-4xl lg:text-5xl font-extrabold uppercase tracking-[0.2em] mb-4 drop-shadow-lg">
                  Maison<br/>Ha-Kavod 97
                </h2>
                <div className="w-12 h-1 bg-primary mb-6"></div>
                <p className="text-sm lg:text-base tracking-widest font-light max-w-md leading-relaxed drop-shadow-md text-neutral-200">
                  {locale === 'en' 
                    ? 'Discover our exclusive collections and access your private space.' 
                    : 'Découvrez nos collections exclusives et accédez à votre espace privé.'}
                </p>
              </div>
            </div>

            {/* RIGHT SIDE: Centered Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-20 bg-neutral-50">
              <div className="w-full max-w-md animate-fade-in-up">`;

content = content.replace(searchTag, replaceTag);

// Now close the divs at the end of unauthenticated section
const endSearchTag = `              </div>
            )}
          </div>
        ) : (
          /* ── AUTHENTICATED: Premium Luxury Dashboard ── */`;

const endReplaceTag = `              </div>
            )}
              </div>
            </div>
          </div>
        ) : (
          /* ── AUTHENTICATED: Premium Luxury Dashboard ── */`;

content = content.replace(endSearchTag, endReplaceTag);

fs.writeFileSync(path, content, 'utf8');
console.log("Layout improved.");
