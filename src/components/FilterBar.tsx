import { Filter, X } from "lucide-react";
import type { FieldDefinition } from "@/types/resource-types";
import { Input } from "@/ui/Input";
import { Select } from "@/ui/Select";
import { Switch } from "@/ui/Misc";
import { Button } from "@/ui/Button";
import type { FilterState } from "@/hooks/useFilters";
import { getFieldLabel } from "@/utils/schema-utils";
import { cn } from "@/utils/cn";

interface FilterBarProps {
    fields: FieldDefinition[];
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
    const filterableFields = fields.filter(
        (f) => f.filterable !== false && !f.hidden
    );

    if (filterableFields.length === 0) return null;

    return (
        <div className={cn(
            "flex flex-wrap items-end gap-3 rounded-lg border border-[hsl(var(--border))]",
            "bg-[hsl(var(--muted)/0.3)] p-4 animate-slide-in"
        )}>
            <div className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--muted-foreground))] shrink-0">
                <Filter className="h-4 w-4" />
                Filters
            </div>
            {filterableFields.map((field) => (
                <FilterField
                    key={field.name}
                    field={field}
                    value={filters[field.name]}
                    onChange={(val) => onFilterChange(field.name, val)}
                />
            ))}
            {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={onClear} className="gap-1.5 text-[hsl(var(--muted-foreground))] ml-auto">
                    <X className="h-3.5 w-3.5" />
                    Clear filters
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
    field: FieldDefinition;
    value: unknown;
    onChange: (val: unknown) => void;
}) {
    const label = getFieldLabel(field);

    switch (field.type) {
        case "select":
            return (
                <div className="min-w-[160px]">
                    <Select
                        options={[{ label: `All ${label}`, value: "__all__" }, ...(field.options ?? [])]}
                        value={value ? String(value) : "__all__"}
                        onChange={(v) => onChange(v === "__all__" ? undefined : v)}
                        label={label}
                    />
                </div>
            );


        case "boolean":
            return (
                <div className="flex items-center gap-2">
                    <span className="text-sm text-[hsl(var(--muted-foreground))]">{label}:</span>
                    <Switch
                        checked={value as boolean ?? false}
                        onCheckedChange={(v) => onChange(v ? true : undefined)}
                        label={value ? "Yes" : "Any"}
                    />
                </div>
            );

        case "number":
            return (
                <div className="flex items-end gap-2">
                    <div className="w-28">
                        <Input
                            type="number"
                            label={`${label} min`}
                            value={((value as { min?: number })?.min ?? "") as string}
                            onChange={(e) =>
                                onChange({ ...(value as object ?? {}), min: e.target.value || undefined })
                            }
                            placeholder="Min"
                        />
                    </div>
                    <div className="w-28">
                        <Input
                            type="number"
                            label={`${label} max`}
                            value={((value as { max?: number })?.max ?? "") as string}
                            onChange={(e) =>
                                onChange({ ...(value as object ?? {}), max: e.target.value || undefined })
                            }
                            placeholder="Max"
                        />
                    </div>
                </div>
            );

        case "date":
        case "datetime":
            return (
                <div className="flex items-end gap-2">
                    <div className="w-40">
                        <Input
                            type="date"
                            label={`${label} from`}
                            value={((value as { from?: string })?.from ?? "") as string}
                            onChange={(e) =>
                                onChange({ ...(value as object ?? {}), from: e.target.value || undefined })
                            }
                        />
                    </div>
                    <div className="w-40">
                        <Input
                            type="date"
                            label={`${label} to`}
                            value={((value as { to?: string })?.to ?? "") as string}
                            onChange={(e) =>
                                onChange({ ...(value as object ?? {}), to: e.target.value || undefined })
                            }
                        />
                    </div>
                </div>
            );

        default:
            return (
                <div className="min-w-[160px]">
                    <Input
                        label={label}
                        value={value as string ?? ""}
                        onChange={(e) => onChange(e.target.value || undefined)}
                        placeholder={`Filter by ${label.toLowerCase()}…`}
                    />
                </div>
            );
    }
}
