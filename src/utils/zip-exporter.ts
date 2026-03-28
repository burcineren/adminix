import JSZip from "jszip";
import { CodeGenerator } from "./code-generator";
import type { ResourceDefinition } from "@/types/resource-types";

/**
 * Orchestrates technical project export as a ZIP archive.
 */
export async function exportProjectZip(
    resources: ResourceDefinition[], 
    projectName: string = "zeroadmin-project"
) {
    const zip = new JSZip();

    // 1. Root Files
    zip.file("package.json", CodeGenerator.generatePackageJson(projectName));
    zip.file("vite.config.ts", CodeGenerator.generateViteConfig());
    zip.file("tsconfig.json", CodeGenerator.generateTsConfig());
    zip.file("index.html", CodeGenerator.generateIndexHtml(resources[0]?.name ?? "Admin"));
    zip.file("README.md", CodeGenerator.generateReadme(projectName));
    zip.file(".gitignore", "node_modules\ndist\n.DS_Store\n.env.local");

    // 2. Src Folder
    const src = zip.folder("src")!;
    src.file("adminConfig.ts", CodeGenerator.generateConfigCode(resources));
    src.file("apiHooks.ts", CodeGenerator.generateApiHooks(resources));
    src.file("App.tsx", CodeGenerator.generateAppCode(resources[0]?.label ?? "Admin Panel"));
    src.file("main.tsx", CodeGenerator.generateMainTsx());
    src.file("index.css", `
@import "tailwindcss";

:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  color-scheme: light dark;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}
`);

    // 3. Generate the ZIP blob
    const content = await zip.generateAsync({ type: "blob" });

    // 4. Trigger download
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectName}.zip`;
    a.click();
    URL.revokeObjectURL(url);
}
