import { Filter, X, ArrowRight, Calendar, Hash } from "lucide-react";
import type { UISchemaField } from "@/core/schema/types";
import { Input } from "@/ui/Input";
import { Select } from "@/ui/Select";
import { Switch } from "@/ui/Misc";
import { Button } from "@/ui/Button";
import type { FilterState } from "@/hooks/useFilters";
import { cn } from "@/utils/cn";
import { useI18n } from "@/core/i18n";

interface FilterBarProps {
    fields: UISchemaField[];
    filters: FilterState;
    onFilterChange: (name: string, value: unknown) => void;
    onClear: () => void;
    hasActiveFilters: boolean;
}

export function FilterBar({
    fields,
    filters,
    onFilterChange,
    onClear,
    hasActiveFilters,
}: FilterBarProps) {
    const { t } = useI18n();
    const filterableFields = fields.filter(
        (f) => f.filter !== "none" && !f.hidden
    );

    if (filterableFields.length === 0) return null;

    return (
        <div className={cn(
            "flex flex-wrap items-center gap-4 rounded-xl border border-[hsl(var(--border))]",
            "bg-[hsl(var(--muted)/0.2)] p-4 animate-slide-in shadow-sm"
        )}>
            <div className="flex items-center gap-2 text-sm font-semibold text-[hsl(var(--foreground))] shrink-0 border-r border-[hsl(var(--border))] pr-4 mr-1">
                <Filter className="h-4 w-4 text-[hsl(var(--primary))]" />
                {t.common.filters}
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
                {filterableFields.map((field) => (
                    <FilterField
                        key={field.name}
                        field={field}
                        value={filters[field.name]}
                        onChange={(val) => onFilterChange(field.name, val)}
                    />
                ))}
            </div>

            {hasActiveFilters && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClear}
                    className="h-8 gap-1.5 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))] ml-auto"
                >
                    <X className="h-3 w-3" />
                    {t.common.reset}
                </Button>
            )}
        </div>
    );
}

function FilterField({
    field,
    value,
    onChange,
}: {
    field: UISchemaField;
    value: unknown;
    onChange: (val: unknown) => void;
}) {
    const label = field.label;
    const { t } = useI18n();

    switch (field.filter) {
        case "select":
            return (
                <div className="min-w-[140px]">
                    <Select
                        options={[{ label: `${t.common.all} ${label}`, value: "__all__" }, ...(field.options ?? [])]}
                        value={value ? String(value) : "__all__"}
                        onChange={(v) => onChange(v === "__all__" ? undefined : v)}
                        label={label}
                        className="h-9"
                    />
                </div>
            );

        case "boolean":
            return (
                <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">{label}</span>
                    <div className="flex items-center h-9 px-3 border border-[hsl(var(--input))] rounded-md bg-[hsl(var(--background))] gap-3">
                        <Switch
                            checked={value as boolean ?? false}
                            onCheckedChange={(v) => onChange(v ? true : undefined)}
                        />
                        <span className="text-sm font-medium">
                            {value === true ? t.common.yes : t.common.any}
                        </span>
                    </div>
                </div>
            );

        case "range":
            return (
                <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-[hsl(var(--muted-foreground))] flex items-center gap-1">
                        <Hash className="h-3 w-3" />
                        {label} {t.common.range}
                    </span>
                    <div className="flex items-center gap-2">
                        <Input
                            type="number"
                            value={((value as Record<string, unknown>)?.min ?? "") as string}
                            onChange={(e) =>
                                onChange({ ...(value as object ?? {}), min: e.target.value || undefined })
                            }
                            placeholder={t.common.min}
                            className="w-20 h-9"
                        />
                        <ArrowRight className="h-3 w-3 text-[hsl(var(--muted-foreground))]" />
                        <Input
                            type="number"
                            value={((value as Record<string, unknown>)?.max ?? "") as string}
                            onChange={(e) =>
                                onChange({ ...(value as object ?? {}), max: e.target.value || undefined })
                            }
                            placeholder={t.common.max}
                            className="w-20 h-9"
                        />
                    </div>
                </div>
            );

        case "date-range":
            return (
                <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-[hsl(var(--muted-foreground))] flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {label} {t.common.period}
                    </span>
                    <div className="flex items-center gap-2">
                        <Input
                            type="date"
                            value={((value as Record<string, unknown>)?.from ?? "") as string}
                            onChange={(e) =>
                                onChange({ ...(value as object ?? {}), from: e.target.value || undefined })
                            }
                            className="w-36 h-9"
                        />
                        <ArrowRight className="h-3 w-3 text-[hsl(var(--muted-foreground))]" />
                        <Input
                            type="date"
                            value={((value as Record<string, unknown>)?.to ?? "") as string}
                            onChange={(e) =>
                                onChange({ ...(value as object ?? {}), to: e.target.value || undefined })
                            }
                            className="w-36 h-9"
                        />
                    </div>
                </div>
            );

        case "search":
        default:
            return (
                <div className="min-w-[180px]">
                    <Input
                        label={label}
                        value={value as string ?? ""}
                        onChange={(e) => onChange(e.target.value || undefined)}
                        placeholder={`${t.common.search} (${label.toLowerCase()})`}
                        className="h-9"
                    />
                </div>
            );
    }
}

