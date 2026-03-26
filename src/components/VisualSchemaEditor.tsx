import { Plus, Trash2, GripVertical } from "lucide-react";
import type { ResourceDefinition, FieldDefinition } from "@/types/resource-types";
import { Input } from "@/ui/Input";
import { Select } from "@/ui/Select";
import { Switch, Card } from "@/ui/Misc";
import { Button } from "@/ui/Button";
import { INFERRED_TYPES } from "@/core/schema/types";
import React from "react";

interface VisualSchemaEditorProps {
    resource: ResourceDefinition;
    onChange: (updated: ResourceDefinition) => void;
}

const SchemaFieldRow = React.memo(({ 
    field, 
    index, 
    handleFieldChange, 
    removeField,
    typeOptions 
}: { 
    field: FieldDefinition; 
    index: number; 
    handleFieldChange: (index: number, updates: Partial<FieldDefinition>) => void;
    removeField: (index: number) => void;
    typeOptions: { label: string; value: string }[];
}) => (
    <Card className="p-3 group relative hover:border-[hsl(var(--primary)/0.3)] transition-all overflow-visible">
        <div className="flex items-start gap-4">
            <div className="mt-2 text-[hsl(var(--muted-foreground)/0.5)] cursor-grab">
                <GripVertical className="h-4 w-4" />
            </div>
            <div className="flex-1 grid grid-cols-2 gap-3">
                <div className="space-y-3">
                    <Input 
                        label="Field Name"
                        value={field.name}
                        onChange={(e) => handleFieldChange(index, { name: e.target.value })}
                        className="text-xs h-8"
                    />
                    <Select 
                        label="Data Type"
                        value={field.type}
                        onChange={(val) => handleFieldChange(index, { type: val as any })}
                        options={typeOptions}
                        className="text-xs h-8"
                    />
                </div>
                <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between py-1">
                        <span className="text-[10px] font-bold uppercase text-[hsl(var(--muted-foreground))]">Required</span>
                        <Switch 
                            checked={!!field.required}
                            onCheckedChange={(val) => handleFieldChange(index, { required: val })}
                        />
                    </div>
                    <div className="flex items-center justify-between py-1">
                        <span className="text-[10px] font-bold uppercase text-[hsl(var(--muted-foreground))]">Sortable</span>
                        <Switch 
                            checked={field.sortable !== false}
                            onCheckedChange={(val) => handleFieldChange(index, { sortable: val })}
                        />
                    </div>
                    <div className="flex items-center justify-between py-1">
                        <span className="text-[10px] font-bold uppercase text-[hsl(var(--muted-foreground))]">Searchable</span>
                        <Switch 
                            checked={!!field.searchable}
                            onCheckedChange={(val) => handleFieldChange(index, { searchable: val })}
                        />
                    </div>
                </div>
            </div>
            <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-[hsl(var(--destructive)/0.5)] hover:text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive)/0.1)] opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeField(index)}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    </Card>
));

SchemaFieldRow.displayName = "SchemaFieldRow";

export const VisualSchemaEditor = React.memo(({ resource, onChange }: VisualSchemaEditorProps) => {
    const fields = resource.fields || [];

    const handleFieldChange = React.useCallback((index: number, updates: Partial<FieldDefinition>) => {
        const newFields = [...fields];
        newFields[index] = { ...newFields[index], ...updates };
        onChange({ ...resource, fields: newFields });
    }, [fields, onChange, resource]);

    const addField = React.useCallback(() => {
        const newField: FieldDefinition = {
            name: `field_${fields.length + 1}`,
            type: "string",
            sortable: true
        };
        onChange({ ...resource, fields: [...fields, newField] });
    }, [fields.length, onChange, resource]);

    const removeField = React.useCallback((index: number) => {
        const newFields = fields.filter((_, i) => i !== index);
        onChange({ ...resource, fields: newFields });
    }, [fields, onChange, resource]);

    const typeOptions = React.useMemo(() => 
        INFERRED_TYPES.map(t => ({ label: t.toUpperCase(), value: t })),
        []
    );

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-6 animate-fade-in">
            {/* Resource Meta Section */}
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <Input 
                        label="Internal Name"
                        value={resource.name}
                        onChange={(e) => onChange({ ...resource, name: e.target.value })}
                        className="text-xs"
                    />
                    <Input 
                        label="Friendly Label"
                        value={resource.label || ""}
                        onChange={(e) => onChange({ ...resource, label: e.target.value })}
                        className="text-xs"
                    />
                </div>
                <Input 
                    label="API Endpoint"
                    value={resource.endpoint}
                    onChange={(e) => onChange({ ...resource, endpoint: e.target.value })}
                    className="text-xs font-mono"
                    placeholder="/api/resource"
                />
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[hsl(var(--border))]">
                    <span className="text-xs font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Fields & Attributes</span>
                    <Button variant="ghost" size="sm" onClick={addField} className="h-7 text-[10px] uppercase font-bold text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.05)]">
                        <Plus className="h-3 w-3 mr-1" />
                        Add Field
                    </Button>
                </div>

                <div className="space-y-2">
                    {fields.map((field, index) => (
                        <SchemaFieldRow 
                            key={`${field.name}_${index}`}
                            field={field}
                            index={index}
                            handleFieldChange={handleFieldChange}
                            removeField={removeField}
                            typeOptions={typeOptions}
                        />
                    ))}

                    {fields.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-[hsl(var(--border))] rounded-xl text-[hsl(var(--muted-foreground))]">
                            <p className="text-xs font-medium italic">No fields defined yet.</p>
                            <Button variant="outline" size="sm" onClick={addField} className="mt-3 h-7 text-[10px] uppercase font-bold">
                                Initial Setup
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

VisualSchemaEditor.displayName = "VisualSchemaEditor";
