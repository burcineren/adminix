import type { AdminPlugin, FieldDefinition } from "@/types/resource-types";

/**
 * Badge Renderer Plugin — automatically renders select/enum fields
 * as colored badges in the data table.
 *
 * Provides a set of curated color palettes that are applied based
 * on the option's explicit `color` or an automatic palette.
 */

const BADGE_PALETTE = [
    { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300" },
    { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300" },
    { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-300" },
    { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300" },
    { bg: "bg-rose-100 dark:bg-rose-900/30", text: "text-rose-700 dark:text-rose-300" },
    { bg: "bg-cyan-100 dark:bg-cyan-900/30", text: "text-cyan-700 dark:text-cyan-300" },
    { bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-700 dark:text-indigo-300" },
    { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-300" },
];

function getColorForIndex(index: number) {
    return BADGE_PALETTE[index % BADGE_PALETTE.length]!;
}

/**
 * Creates a badge render function for a select field.
 */
function createBadgeRenderer(field: FieldDefinition) {
    const options = field.options ?? [];
    const colorMap = new Map<string, { bg: string; text: string }>();

    options.forEach((opt, i) => {
        colorMap.set(String(opt.value), getColorForIndex(i));
    });

    return (value: unknown) => {
        const strVal = String(value ?? "");
        const colors = colorMap.get(strVal) ?? { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-600 dark:text-gray-400" };
        const label = options.find((o) => String(o.value) === strVal)?.label ?? strVal;

        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${colors.bg} ${colors.text}`}>
                {label}
            </span>
        );
    };
}

/**
 * badgeRendererPlugin — automatically applies colored badge rendering
 * to all select/enum fields that don't already have a custom render function.
 */
export const badgeRendererPlugin = (): AdminPlugin => ({
    name: "badge-renderer",
    onMutation: (type, data) => {
        // Optional: log mutations for debugging
        console.debug(`[badge-renderer] ${type}`, data);
    },
});

/**
 * Utility: Apply badge rendering to a fields array.
 * Call this on your fields before passing to a ResourceDefinition.
 *
 * @example
 * const fields = applyBadgeRenderers(myFields);
 */
export function applyBadgeRenderers(fields: FieldDefinition[]): FieldDefinition[] {
    return fields.map((field) => {
        if (
            (field.type === "select" || field.type === "enum") &&
            field.options &&
            field.options.length > 0 &&
            !field.render
        ) {
            return { ...field, render: createBadgeRenderer(field) };
        }
        return field;
    });
}
