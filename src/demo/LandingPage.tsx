import { useState, useEffect } from "react";
import {
    Boxes,
    Zap,
    Database,
    Code2,
    Layers,
    Shield,
    Sparkles,
    ArrowRight,
    Terminal,
    ChevronRight,
    PlayCircle,
    Github,
} from "lucide-react";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Misc";
import { cn } from "@/utils/cn";

interface LandingPageProps {
    onNavigate: (mode: string) => void;
}

// ── Animated typing effect ─────────────────────────────────────────────────

function useTypingEffect(text: string, speed = 40) {
    const [displayed, setDisplayed] = useState("");
    const [done, setDone] = useState(false);

    useEffect(() => {
        setDisplayed("");
        setDone(false);
        let i = 0;
        const interval = setInterval(() => {
            i++;
            setDisplayed(text.slice(0, i));
            if (i >= text.length) {
                clearInterval(interval);
                setDone(true);
            }
        }, speed);
        return () => clearInterval(interval);
    }, [text, speed]);

    return { displayed, done };
}

// ── Component ─────────────────────────────────────────────────────────────────

const CODE_EXAMPLE = `import { AdminPanel } from 'auto-admin';

export default function App() {
  return (
    <AdminPanel
      endpoint="/api/products"
      title="My Store"
    />
  );
}`;

const FEATURES = [
    {
        icon: Zap,
        title: "Zero Config",
        description: "Point to any REST endpoint. AutoAdmin infers the schema and renders a full CRUD interface.",
        color: "text-yellow-500",
        bg: "bg-yellow-500/10",
    },
    {
        icon: Database,
        title: "Full CRUD",
        description: "Create, read, update, delete — with pagination, search, sort, and filters out of the box.",
        color: "text-blue-500",
        bg: "bg-blue-500/10",
    },
    {
        icon: Layers,
        title: "Schema Driven",
        description: "Define fields with types, validation, and custom renderers. Full TypeScript support.",
        color: "text-purple-500",
        bg: "bg-purple-500/10",
    },
    {
        icon: Code2,
        title: "Plugin System",
        description: "Extend the UI with custom widgets, field types, and mutation hooks. Fully composable.",
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
    },
    {
        icon: Shield,
        title: "Permissions",
        description: "Control create, edit, delete, and export actions per resource with a simple config.",
        color: "text-rose-500",
        bg: "bg-rose-500/10",
    },
    {
        icon: Sparkles,
        title: "Dark Mode",
        description: "Beautiful, consistent theming with automatic dark mode support via CSS variables.",
        color: "text-indigo-500",
        bg: "bg-indigo-500/10",
    },
];

export function LandingPage({ onNavigate }: LandingPageProps) {
    const { displayed, done } = useTypingEffect(CODE_EXAMPLE, 25);

    return (
        <div className="h-full overflow-y-auto scroll-smooth bg-[hsl(var(--background))]">
            {/* ── Hero Section ─────────────────────────────────────────────── */}
            <section className="relative flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 overflow-hidden">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_70%)]" />

                <div className="relative z-10 max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] mb-6">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Open Source · MIT License · v0.1.0
                    </div>

                    <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-[1.1] text-[hsl(var(--foreground))] mb-6">
                        Turn your API into a full{" "}
                        <span className="bg-clip-text text-transparent bg-linear-to-r from-[hsl(var(--primary))] to-indigo-400">
                            Admin Panel
                        </span>{" "}
                        instantly.
                    </h1>

                    <p className="text-lg text-[hsl(var(--muted-foreground))] max-w-xl mx-auto mb-10 leading-relaxed">
                        AutoAdmin is a React library that generates production-ready admin interfaces from your REST API.
                        Zero boilerplate, full TypeScript, endlessly extensible.
                    </p>

                    <div className="flex items-center justify-center gap-4">
                        <Button
                            size="lg"
                            className="h-12 px-8 text-sm font-bold rounded-xl shadow-lg shadow-[hsl(var(--primary)/0.3)] group"
                            onClick={() => onNavigate("playground")}
                        >
                            <PlayCircle className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                            Try the Playground
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="h-12 px-8 text-sm font-bold rounded-xl"
                            onClick={() => onNavigate("docs")}
                        >
                            <Terminal className="h-5 w-5 mr-2" />
                            Read the Docs
                        </Button>
                    </div>
                </div>
            </section>

            {/* ── Code Preview ──────────────────────────────────────────── */}
            <section className="relative max-w-3xl mx-auto px-6 -mt-4 mb-20">
                <Card className="overflow-hidden bg-slate-950 border-slate-800 shadow-2xl">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/50 border-b border-slate-800">
                        <div className="flex gap-1.5">
                            <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                            <div className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
                            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">App.tsx</span>
                    </div>
                    <pre className="p-6 font-mono text-sm text-slate-300 leading-relaxed overflow-x-auto min-h-[220px]">
                        <code>{displayed}<span className={cn("inline-block w-[2px] h-[1em] bg-indigo-400 ml-[1px] align-text-bottom", done && "animate-pulse")} /></code>
                    </pre>
                </Card>
                <div className="flex justify-center mt-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest">
                        <ChevronRight className="h-3 w-3" />
                        That&#39;s it. No boilerplate needed.
                    </div>
                </div>
            </section>

            {/* ── Quick Install ─────────────────────────────────────────── */}
            <section className="max-w-xl mx-auto px-6 mb-20">
                <Card className="flex items-center justify-between p-4 bg-[hsl(var(--card))] border-[hsl(var(--border))]">
                    <div className="flex items-center gap-3">
                        <Terminal className="h-5 w-5 text-[hsl(var(--primary))]" />
                        <code className="text-sm font-mono text-[hsl(var(--foreground))]">npm install auto-admin</code>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-[10px] font-bold uppercase tracking-wider"
                        onClick={() => navigator.clipboard.writeText("npm install auto-admin")}
                    >
                        Copy
                    </Button>
                </Card>
            </section>

            {/* ── Features Grid ────────────────────────────────────────── */}
            <section className="max-w-5xl mx-auto px-6 mb-24">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-black tracking-tight text-[hsl(var(--foreground))] mb-3">
                        Everything you need, nothing you don&#39;t.
                    </h2>
                    <p className="text-[hsl(var(--muted-foreground))] max-w-lg mx-auto">
                        AutoAdmin handles the repetitive stuff so you can focus on what makes your product unique.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {FEATURES.map((feat) => (
                        <Card key={feat.title} className="p-5 group hover:border-[hsl(var(--primary)/0.3)] transition-all hover:shadow-md">
                            <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl mb-4", feat.bg)}>
                                <feat.icon className={cn("h-5 w-5", feat.color)} />
                            </div>
                            <h3 className="font-bold text-sm mb-1 group-hover:text-[hsl(var(--primary))] transition-colors">
                                {feat.title}
                            </h3>
                            <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">
                                {feat.description}
                            </p>
                        </Card>
                    ))}
                </div>
            </section>

            {/* ── Try It Now CTA ───────────────────────────────────────── */}
            <section className="max-w-3xl mx-auto px-6 mb-24">
                <Card className="p-10 text-center bg-linear-to-br from-[hsl(var(--primary)/0.05)] to-[hsl(var(--card))] border-[hsl(var(--primary)/0.15)]">
                    <div className="flex justify-center mb-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--primary))] text-white shadow-lg shadow-[hsl(var(--primary)/0.3)]">
                            <Boxes className="h-8 w-8" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-black tracking-tight mb-3 text-[hsl(var(--foreground))]">
                        Ready to build?
                    </h2>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-md mx-auto mb-6">
                        Open the interactive playground, define your schema, and export a production-ready React project in seconds.
                    </p>
                    <div className="flex items-center justify-center gap-3">
                        <Button
                            size="lg"
                            className="h-11 px-6 font-bold rounded-xl group"
                            onClick={() => onNavigate("playground")}
                        >
                            Open Playground <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="h-11 px-6 font-bold rounded-xl"
                            onClick={() => window.open("https://github.com/burcineren/auto-admin", "_blank")}
                        >
                            <Github className="h-4 w-4 mr-2" /> Star on GitHub
                        </Button>
                    </div>
                </Card>
            </section>

            {/* ── Footer ───────────────────────────────────────────────── */}
            <footer className="border-t border-[hsl(var(--border))] py-8 px-6">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-bold text-[hsl(var(--muted-foreground))]">
                        <Boxes className="h-4 w-4 text-[hsl(var(--primary))]" />
                        AutoAdmin
                    </div>
                    <div className="flex items-center gap-6 text-xs text-[hsl(var(--muted-foreground))]">
                        <button onClick={() => onNavigate("docs")} className="hover:text-[hsl(var(--foreground))] transition-colors">Documentation</button>
                        <a href="https://github.com/burcineren/auto-admin" target="_blank" rel="noopener noreferrer" className="hover:text-[hsl(var(--foreground))] transition-colors">GitHub</a>
                        <span>MIT License</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
