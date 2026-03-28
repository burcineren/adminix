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
    Sparkles
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
    { id: "playground", title: "Dashboard Designer", icon: Cpu },
    { id: "export", title: "Project Export", icon: ExternalLink },
    { id: "plugins", title: "Plugin System", icon: Blocks },
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
    const [activeSection, setActiveSectionState] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("zeroadmin_docs_section") || "intro";
        }
        return "intro";
    });

    const setActiveSection = (section: string) => {
        setActiveSectionState(section);
        localStorage.setItem("zeroadmin_docs_section", section);
    };

    const scrollTo = (id: string) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        // Initial scroll to persisted section
        const saved = localStorage.getItem("zeroadmin_docs_section");
        if (saved && saved !== "intro") {
            setTimeout(() => scrollTo(saved), 100);
        }

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
                        title="ZeroAdmin"
                        icon={BookOpen}
                        description="ZeroAdmin is a zero-config React library that turns any REST API into a production-ready admin panel instantly. No boilerplate, no tedious form wiring, just clean interfaces from a single config."
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
                        description="Get up and running in under 30 seconds. Connect your endpoint and let ZeroAdmin do the heavy lifting."
                    />

                    <div className="space-y-6">
                        <div>
                            <p className="text-sm font-bold text-[hsl(var(--foreground))] mb-2 flex items-center gap-2">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-[10px] text-white">1</span>
                                Install the package
                            </p>
                            <CodeBlock language="bash" code="npm install zeroadmin" />
                        </div>

                        <div>
                            <p className="text-sm font-bold text-[hsl(var(--foreground))] mb-2 flex items-center gap-2">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-[10px] text-white">2</span>
                                Initialize the Admin Panel
                            </p>
                            <CodeBlock code={`import { ZeroAdmin } from 'zeroadmin';
import 'zeroadmin/dist/index.css';

export default function App() {
  return (
    <div className="h-screen w-full">
      <ZeroAdmin 
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
                        description="ZeroAdmin is built around a ResourceDefinition — a simple config object that defines how your data should be perceived and manipulated."
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
                        description="Configure exactly how each field behaves. ZeroAdmin uses this to render tables, filters, and forms."
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
                        description="Fine-tune how ZeroAdmin communicates with your backend. Support for custom headers, interceptors, and response mapping."
                    />

                    <div className="space-y-4">
                        <Card className="p-6 border-amber-500/20 bg-amber-500/5">
                            <div className="flex items-start gap-4">
                                <div className="p-2 rounded-lg bg-amber-500 text-white shrink-0"><ShieldCheck className="h-5 w-5" /></div>
                                <div>
                                    <h4 className="font-bold text-amber-700 dark:text-amber-400 mb-1">Auth & Interceptors</h4>
                                    <p className="text-sm text-amber-800/70 dark:text-amber-300/60 leading-normal">
                                        Inject Bearer tokens or handle 401 Unauthorized errors globally. ZeroAdmin provides a robust interceptor API that wraps every request.
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <CodeBlock code={`import { addRequestInterceptor } from 'zeroadmin';

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

                    {/* ── Section: Dashboard Designer ──────────────────────────────── */}
                    <SectionHeader 
                        id="playground"
                        title="Dashboard Designer"
                        icon={Cpu}
                        description="ZeroAdmin ships with a powerful builder that lets you prototype and test your admin panel in real-time. It's the ultimate tool for rapid development."
                    />

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="p-5 border-indigo-500/10 bg-indigo-500/5">
                                <h4 className="font-bold mb-2 flex items-center gap-2">
                                    <Code2 className="h-4 w-4 text-indigo-500" />
                                    Dual-Mode Editing
                                </h4>
                                <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">
                                    Switch between a visual drag-and-drop style editor and raw JSON. They stay synchronized 1:1, giving you the best of both worlds.
                                </p>
                            </Card>
                            <Card className="p-5 border-emerald-500/10 bg-emerald-500/5">
                                <h4 className="font-bold mb-2 flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-emerald-500" />
                                    Instant Preview
                                </h4>
                                <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">
                                    Any change in the schema is instantly reflected in the live preview panel without page reloads, using our reactive rendering engine.
                                </p>
                            </Card>
                        </div>
                        
                        <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center gap-4 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-xl shadow-indigo-500/20">
                                <Sparkles className="h-6 w-6" />
                            </div>
                            <h4 className="text-white font-bold tracking-tight">Zero-Config Mode in Designer</h4>
                            <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
                                Paste a raw API response and ZeroAdmin will automatically infer the entire schema, generating fields, types, and labels for you.
                            </p>
                        </div>
                    </div>

                    <Separator className="my-16" />

                    {/* ── Section: Export ─────────────────────────────────────────── */}
                    <SectionHeader 
                        id="export"
                        title="Project Export"
                        icon={ExternalLink}
                        description="Download your entire admin panel as a standalone, production-ready React project with one click."
                    />

                    <div className="space-y-6">
                        <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">
                            The export system generates a clean, optimized Vite project that you can host anywhere. It includes:
                        </p>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                                "Standalone API Layer (React Query)",
                                "Pre-configured Vite & Tailwind",
                                "Type-safe Resource Definitions",
                                "Ready-to-deploy structure",
                                "Customizable src/ folder",
                                "Clean TSConfig & ESLint rules"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-[hsl(var(--foreground))]">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    {item}
                                </li>
                            ))}
                        </ul>

                        <div className="mt-6">
                            <h4 className="text-sm font-bold uppercase tracking-wider mb-2">How to use exported project:</h4>
                            <CodeBlock language="bash" code={`# 1. Unzip the downloaded file
# 2. Enter directory and install
npm install

# 3. Start development
npm run dev`} />
                        </div>
                    </div>

                    <Separator className="my-16" />

                    {/* ── Section: Plugins ────────────────────────────────────────── */}
                    <SectionHeader 
                        id="plugins"
                        title="Plugin System"
                        icon={Blocks}
                        description="ZeroAdmin is designed for extensibility. Use plugins to modify the schema at runtime or inject custom React components."
                    />

                    <div className="space-y-8">
                        <div>
                            <h4 className="text-[11px] font-black uppercase tracking-widest text-[hsl(var(--primary))] mb-3">Schema Plugins</h4>
                            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4 leading-relaxed">
                                Schema plugins can intercept the inference process. For example, you can force all fields ending with <code>_id</code> to be hidden:
                            </p>
                            <CodeBlock code={`import { registerSchemaPlugin } from 'zeroadmin';

registerSchemaPlugin({
  name: 'hide-internal-ids',
  transformFields: (fields) => {
    return fields.map(f => ({
      ...f,
      hidden: f.name.endsWith('_id') ? true : f.hidden
    }));
  }
});`} />
                        </div>

                        <div className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
                            <h4 className="font-bold flex items-center gap-2 mb-3">
                                <Layers className="h-4 w-4 text-orange-500" />
                                Component Overrides
                            </h4>
                            <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed mb-4">
                                You can register custom React components to handle specific data types globally:
                            </p>
                            <CodeBlock code={`import { registerComponentMapper } from 'zeroadmin';
import MyRichTextEditor from './MyRichTextEditor';

registerComponentMapper('RichText', (props) => (
  <MyRichTextEditor {...props} />
));`} />
                        </div>
                    </div>

                    <Separator className="my-24" />

                    <footer className="flex flex-col sm:flex-row items-center justify-between text-xs text-[hsl(var(--muted-foreground))] gap-4">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            ZeroAdmin Engine 1.0.0-beta
                        </div>
                        <div className="flex gap-6">
                            <a href="#" className="hover:text-[hsl(var(--foreground))] transition-colors flex items-center gap-1.5"><Code2 className="h-3 w-3" /> GitHub</a>
                            <a href="#" className="hover:text-[hsl(var(--foreground))] transition-colors flex items-center gap-1.5"><Layers className="h-3 w-3" /> NPM</a>
                            <a href="#" className="hover:text-[hsl(var(--foreground))] transition-colors flex items-center gap-1.5"><Settings className="h-3 w-3" /> Twitter</a>
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

