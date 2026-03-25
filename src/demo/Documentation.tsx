import { useState, useEffect } from "react";
import { 
    BookOpen, 
    Terminal, 
    Layers, 
    Settings, 
    ShieldCheck, 
    Zap, 
    Code2, 
    Blocks, 
    ArrowRight,
    Copy,
    Check,
    Cpu,
    ExternalLink,
    LayoutDashboard
} from "lucide-react";
import { cn } from "@/utils/cn";
import { Card, Badge, Separator } from "@/ui/Misc";
import { Button } from "@/ui/Button";

// ── Components ────────────────────────────────────────────────────────────────

const CodeBlock = ({ code, language = "tsx" }: { code: string; language?: string }) => {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group my-6">
            <div className="absolute right-4 top-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                    variant="secondary" 
                    size="icon" 
                    className="h-8 w-8 bg-slate-800/50 hover:bg-slate-700 border-slate-700 text-slate-300"
                    onClick={copyToClipboard}
                >
                    {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </Button>
            </div>
            <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
                <div className="flex items-center justify-between px-4 py-2 bg-slate-900/50 border-b border-slate-800">
                    <div className="flex gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-slate-700" />
                        <div className="h-2.5 w-2.5 rounded-full bg-slate-700" />
                        <div className="h-2.5 w-2.5 rounded-full bg-slate-700" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{language}</span>
                </div>
                <pre className="p-5 overflow-x-auto text-sm font-mono leading-relaxed selection:bg-indigo-500/30">
                    <code className="text-slate-300">
                        {code.split('\n').map((line, i) => (
                            <div key={i} className="table-row">
                                <span className="table-cell pr-4 text-slate-600 text-right select-none w-8">{i + 1}</span>
                                <span className="table-cell">{line || ' '}</span>
                            </div>
                        ))}
                    </code>
                </pre>
            </div>
        </div>
    );
};

const SECTIONS = [
    { id: "intro", title: "Introduction", icon: BookOpen },
    { id: "quickstart", title: "Quick Start", icon: Zap },
    { id: "concept", title: "Core Concept", icon: Layers },
    { id: "fields", title: "Field Schema", icon: Blocks },
    { id: "api", title: "API Configuration", icon: Settings },
    { id: "plugins", title: "Plugin System", icon: Code2 },
    { id: "playground", title: "DevPlayground", icon: Cpu },
];

const SectionHeader = ({ id, title, icon: Icon, description }: { id: string; title: string; icon: React.ComponentType<{ className?: string }>; description?: string }) => (
    <div id={id} className="scroll-mt-24 mb-8">
        <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                <Icon className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-black tracking-tight text-[hsl(var(--foreground))]">{title}</h2>
        </div>
        {description && <p className="text-lg text-[hsl(var(--muted-foreground))] leading-relaxed max-w-3xl">{description}</p>}
    </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

export function Documentation() {
    const [activeSection, setActiveSection] = useState("intro");

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { rootMargin: "-20% 0% -70% 0%" }
        );

        SECTIONS.forEach((s) => {
            const el = document.getElementById(s.id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    const scrollTo = (id: string) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <div className="flex h-full w-full bg-[hsl(var(--background))] overflow-hidden">
            {/* Left Sidebar (Desktop) */}
            <aside className="hidden lg:flex w-72 flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--card)/0.5)] p-6 shrink-0 z-10 overflow-y-auto">
                <div className="space-y-6">
                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))] mb-4 opacity-70">
                            Getting Started
                        </h4>
                        <nav className="space-y-1">
                            {SECTIONS.slice(0, 3).map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => scrollTo(s.id)}
                                    className={cn(
                                        "flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group",
                                        activeSection === s.id 
                                            ? "bg-indigo-500/10 text-indigo-500 shadow-sm" 
                                            : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
                                    )}
                                >
                                    <s.icon className={cn("h-4 w-4", activeSection === s.id ? "text-indigo-500" : "text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))]")} />
                                    {s.title}
                                    {activeSection === s.id && <div className="ml-auto w-1 h-4 bg-indigo-500 rounded-full" />}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))] mb-4 opacity-70">
                            Core API
                        </h4>
                        <nav className="space-y-1">
                            {SECTIONS.slice(3).map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => scrollTo(s.id)}
                                    className={cn(
                                        "flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group",
                                        activeSection === s.id 
                                            ? "bg-indigo-500/10 text-indigo-500 shadow-sm" 
                                            : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
                                    )}
                                >
                                    <s.icon className={cn("h-4 w-4", activeSection === s.id ? "text-indigo-500" : "text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))]")} />
                                    {s.title}
                                    {activeSection === s.id && <div className="ml-auto w-1 h-4 bg-indigo-500 rounded-full" />}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                <div className="mt-auto pt-8">
                    <Card className="p-4 bg-indigo-500/5 border-indigo-500/20">
                        <p className="text-[10px] font-bold text-indigo-500 uppercase mb-2">Beta Release</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))] leading-normal mb-3">
                            Working on something cool? Share your plugins on GitHub.
                        </p>
                        <Button variant="outline" size="sm" className="w-full text-[10px] h-8 font-bold border-indigo-500/20 hover:bg-indigo-500/10 text-indigo-500">
                            Open GitHub <ExternalLink className="ml-1.5 h-3 w-3" />
                        </Button>
                    </Card>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar">
                <div className="max-w-4xl mx-auto px-6 lg:px-12 py-16">
                    
                    {/* ── Section: Intro ────────────────────────────────────────── */}
                    <SectionHeader 
                        id="intro"
                        title="AutoAdmin"
                        icon={BookOpen}
                        description="AutoAdmin is a zero-config React library that turns any REST API into a production-ready admin panel instantly. No boilerplate, no tedious form wiring, just clean interfaces from a single config."
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                        {[
                            { title: "Zero Config", desc: "Auto-detects structure from JSON responses.", color: "indigo" },
                            { title: "Type Safe", desc: "First-class support for TypeScript and Zod validation.", color: "emerald" },
                            { title: "Themeable", desc: "Beautiful Dark Mode and custom Tailwind integration.", color: "purple" },
                            { title: "Extensible", desc: "Powerful plugin system to inject any React UI.", color: "orange" },
                        ].map((feat, i) => (
                            <Card key={i} className="p-5 hover:border-[hsl(var(--primary)/30%)] transition-colors group">
                                <h4 className="font-bold flex items-center gap-2 group-hover:text-indigo-500 transition-colors">
                                    <div className={cn("h-2 w-2 rounded-full", `bg-${feat.color}-500 shadow-[0_0_8px_rgba(var(--${feat.color}-500-rgb),0.5)]`)} />
                                    {feat.title}
                                </h4>
                                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1 leading-relaxed">{feat.desc}</p>
                            </Card>
                        ))}
                    </div>

                    <Separator className="my-16" />

                    {/* ── Section: Quickstart ────────────────────────────────────── */}
                    <SectionHeader 
                        id="quickstart"
                        title="Quick Start"
                        icon={Zap}
                        description="Get up and running in under 30 seconds. Connect your endpoint and let AutoAdmin do the heavy lifting."
                    />

                    <div className="space-y-6">
                        <div>
                            <p className="text-sm font-bold text-[hsl(var(--foreground))] mb-2 flex items-center gap-2">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-[10px] text-white">1</span>
                                Install the package
                            </p>
                            <CodeBlock language="bash" code="npm install auto-admin" />
                        </div>

                        <div>
                            <p className="text-sm font-bold text-[hsl(var(--foreground))] mb-2 flex items-center gap-2">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-[10px] text-white">2</span>
                                Initialize the Admin Panel
                            </p>
                            <CodeBlock code={`import { AdminPanel } from 'auto-admin';
import 'auto-admin/dist/index.css';

export default function App() {
  return (
    <div className="h-screen w-full">
      <AdminPanel 
        endpoint="/api/products" 
        title="Inventory Manager"
      />
    </div>
  );
}`} />
                        </div>
                    </div>

                    <Separator className="my-16" />

                    {/* ── Section: Concept ────────────────────────────────────────── */}
                    <SectionHeader 
                        id="concept"
                        title="Core Concept"
                        icon={Layers}
                        description="AutoAdmin is built around a ResourceDefinition — a simple config object that defines how your data should be perceived and manipulated."
                    />

                    <div className="relative p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 mb-8 flex flex-col items-center justify-center text-center">
                        <div className="flex items-center gap-6 z-10">
                            <div className="flex flex-col items-center gap-2">
                                <div className="h-12 w-12 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-lg"><Terminal className="h-6 w-6" /></div>
                                <span className="text-[10px] font-bold uppercase text-indigo-500">Your API</span>
                            </div>
                            <ArrowRight className="h-5 w-5 text-indigo-300" />
                            <div className="flex flex-col items-center gap-2">
                                <div className="h-12 w-12 rounded-xl bg-white border-2 border-indigo-500 text-indigo-500 flex items-center justify-center shadow-lg"><Code2 className="h-6 w-6" /></div>
                                <span className="text-[10px] font-bold uppercase text-indigo-500">Config</span>
                            </div>
                            <ArrowRight className="h-5 w-5 text-indigo-300" />
                            <div className="flex flex-col items-center gap-2">
                                <div className="h-12 w-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer"><Zap className="h-6 w-6 text-yellow-400" /></div>
                                <span className="text-[10px] font-bold uppercase text-indigo-500">Admin UI</span>
                            </div>
                        </div>
                        <div className="mt-6 text-xs text-[hsl(var(--muted-foreground))] italic max-w-sm">
                            The library maps endpoints to full-featured CRUD sections with smart defaults.
                        </div>
                    </div>

                    <Separator className="my-16" />

                    {/* ── Section: Fields ─────────────────────────────────────────── */}
                    <SectionHeader 
                        id="fields"
                        title="Field Schema"
                        icon={Blocks}
                        description="Configure exactly how each field behaves. AutoAdmin uses this to render tables, filters, and forms."
                    />

                    <div className="space-y-4">
                        <Card className="overflow-hidden border-slate-200 dark:border-slate-800">
                             <table className="w-full text-sm text-left">
                                <thead className="bg-[hsl(var(--muted)/0.5)] border-b border-[hsl(var(--border))]">
                                    <tr>
                                        <th className="px-4 py-3 font-bold">Type</th>
                                        <th className="px-4 py-3 font-bold">Component</th>
                                        <th className="px-4 py-3 font-bold">Best For</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[hsl(var(--border))]">
                                    {[
                                        { type: "text", comp: "TextInput", use: "Names, emails, descriptions" },
                                        { type: "number", comp: "NumberInput", use: "Prices, stock, ratings" },
                                        { type: "boolean", comp: "Toggle", use: "Status, flags, visibility" },
                                        { type: "select", comp: "Select", use: "Categories, roles, status" },
                                        { type: "image", comp: "ImageDrop", use: "Avatars, main images" },
                                        { type: "date", comp: "DatePicker", use: "Created at, deadlines" },
                                    ].map((row, i) => (
                                        <tr key={i} className="hover:bg-[hsl(var(--muted)/0.3)] transition-colors">
                                            <td className="px-4 py-3 font-mono text-[11px]"><Badge variant="outline">{row.type}</Badge></td>
                                            <td className="px-4 py-3 font-medium">{row.comp}</td>
                                            <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">{row.use}</td>
                                        </tr>
                                    ))}
                                </tbody>
                             </table>
                        </Card>

                        <div className="mt-6">
                            <p className="text-[hsl(var(--muted-foreground))] mb-4 leading-relaxed">
                                Define your fields as a typed array of <code>FieldDefinition</code>:
                            </p>
                            <CodeBlock code={`const productFields: FieldDefinition[] = [
  { name: 'name', type: 'text', required: true, searchable: true },
  { name: 'price', type: 'number', format: (v) => \`$\${v}\` },
  { name: 'status', type: 'select', options: [
    { label: 'Active', value: 'active' },
    { label: 'Draft', value: 'draft' }
  ]},
  { name: 'image', type: 'image', showInTable: true }
];`} />
                        </div>
                    </div>

                    <Separator className="my-16" />

                    {/* ── Section: API ────────────────────────────────────────────── */}
                    <SectionHeader 
                        id="api"
                        title="API Configuration"
                        icon={Settings}
                        description="Fine-tune how AutoAdmin communicates with your backend. Support for custom headers, interceptors, and response mapping."
                    />

                    <div className="space-y-4">
                        <Card className="p-6 border-amber-500/20 bg-amber-500/5">
                            <div className="flex items-start gap-4">
                                <div className="p-2 rounded-lg bg-amber-500 text-white shrink-0"><ShieldCheck className="h-5 w-5" /></div>
                                <div>
                                    <h4 className="font-bold text-amber-700 dark:text-amber-400 mb-1">Auth & Interceptors</h4>
                                    <p className="text-sm text-amber-800/70 dark:text-amber-300/60 leading-normal">
                                        Inject Bearer tokens or handle 401 Unauthorized errors globally. AutoAdmin provides a robust interceptor API that wraps every request.
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <CodeBlock code={`import { addRequestInterceptor } from 'auto-admin';

// Inject JWT from local storage
addRequestInterceptor((options) => ({
  ...options,
  headers: {
    ...options.headers,
    Authorization: \`Bearer \${localStorage.getItem('token')}\`
  }
}));`} />
                    </div>

                    <Separator className="my-16" />

                    {/* ── Section: Plugins ────────────────────────────────────────── */}
                    <SectionHeader 
                        id="plugins"
                        title="Plugin System"
                        icon={Code2}
                        description="Don't build from scratch. Extend the UI at key insertion points: Sidebar, Table Header, Row Actions, and more."
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {[
                            { name: "UI Injection", icon: LayoutDashboard, desc: "Inject custom widgets into the sidebar." },
                            { name: "Table Hooks", icon: Blocks, desc: "Add custom toolbars or footer stats." },
                            { name: "Event Hooks", icon: CheckCircle2, desc: "Run logic after every CRUD mutation." },
                        ].map((p, i) => (
                            <Card key={i} className="p-4 flex flex-col items-center text-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center text-[hsl(var(--primary))]">
                                    <p.icon className="h-5 w-5" />
                                </div>
                                <h5 className="font-bold text-xs uppercase tracking-wider">{p.name}</h5>
                                <p className="text-[10px] text-[hsl(var(--muted-foreground))]">{p.desc}</p>
                            </Card>
                        ))}
                    </div>

                    <Separator className="my-16" />

                    {/* ── Section: Playground ─────────────────────────────────────── */}
                    <SectionHeader 
                        id="playground"
                        title="DevPlayground"
                        icon={Cpu}
                        description="Our built-in interactive tool for developers. Prototyping schemas has never been this fast."
                    />

                    <div className="p-1 rounded-2xl bg-linear-to-tr from-slate-900 via-indigo-900 to-slate-900 shadow-2xl relative group overflow-hidden">
                        <div className="absolute inset-0 bg-indigo-500/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="bg-slate-950/40 backdrop-blur-sm p-8 rounded-[15px] relative z-10 text-center">
                            <h4 className="text-white text-xl font-bold mb-2 tracking-tight">Interactive Schema Builder</h4>
                            <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
                                Live edit JSON configs, see real-time previews, and export a ready-to-run React project.
                            </p>
                            <Button 
                                variant="default" 
                                className="bg-white text-slate-950 hover:bg-slate-200 h-10 px-6 font-bold tracking-tight rounded-full group/btn"
                                onClick={() => window.location.hash = "mode=playground"}
                            >
                                Try the Playground <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </div>

                    <Separator className="my-24" />

                    <footer className="flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))]">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                            System Operational
                        </div>
                        <div className="flex gap-4">
                            <a href="#" className="hover:text-[hsl(var(--foreground))] transition-colors">GitHub</a>
                            <a href="#" className="hover:text-[hsl(var(--foreground))] transition-colors">NPM</a>
                            <a href="#" className="hover:text-[hsl(var(--foreground))] transition-colors">Twitter</a>
                        </div>
                    </footer>
                </div>
            </main>

            {/* Right Sidebar (Toc) - Only for wider screens */}
            <aside className="hidden xl:flex w-64 flex-col p-6 pt-16 border-l border-[hsl(var(--border))] shrink-0">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))] mb-4 opacity-70">
                    On this page
                </h4>
                <nav className="space-y-3 relative">
                    <div 
                        className="absolute left-0 w-[2px] bg-indigo-500 transition-all duration-300 rounded-full" 
                        style={{ 
                            height: '16px', 
                            top: `${SECTIONS.findIndex(s => s.id === activeSection) * 28 + 4}px`,
                            opacity: SECTIONS.some(s => s.id === activeSection) ? 1 : 0
                        }}
                    />
                    {SECTIONS.map((s) => (
                        <button
                            key={s.id}
                            onClick={() => scrollTo(s.id)}
                            className={cn(
                                "flex w-full items-center pl-4 text-[11px] font-bold uppercase tracking-wider transition-colors text-left",
                                activeSection === s.id 
                                    ? "text-indigo-500" 
                                    : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                            )}
                        >
                            {s.title}
                        </button>
                    ))}
                </nav>
            </aside>
        </div>
    );
}

const CheckCircle2 = ({ className }: { className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);
