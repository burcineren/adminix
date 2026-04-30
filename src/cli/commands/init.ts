import prompts from "prompts";
import pc from "picocolors";
import fs from "fs-extra";
import path from "path";
import { execSync } from "child_process";

interface Config {
  framework: "react" | "next" | "vue" | "nuxt" | "angular";
  styling: "tailwind" | "modules" | "none";
  dataFetching: "query" | "axios" | "fetch";
  ui: "shadcn" | "headless" | "custom";
  typescript: boolean;
  mocks: boolean;
  apiEndpoint: string;
  enableAuth: boolean;
  authType?: "jwt" | "custom";
}

export async function initCommand() {
  console.log(pc.cyan("\n🚀 Welcome to Adminix Let's set up your admin panel.\n"));

  const pkgPath = path.join(process.cwd(), "package.json");
  const hasPkg = await fs.pathExists(pkgPath);

  if (!hasPkg) {
    console.warn(pc.yellow("⚠️  No package.json found. Creating a new project..."));
    try {
      execSync("npm init -y", { stdio: "inherit" });
    } catch {
      // Ignore if it fails
    }
  }

  const pkg = await fs.readJson(pkgPath);
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };

  // 1. Detect Framework
  let detectedFramework: Config["framework"] | undefined;
  if (deps.next) detectedFramework = "next";
  else if (deps["@angular/core"]) detectedFramework = "angular";
  else if (deps.nuxt || deps["@nuxt/kit"]) detectedFramework = "nuxt";
  else if (deps.vue) detectedFramework = "vue";
  else if (deps.react) detectedFramework = "react";

  const responses = await prompts([
    {
      type: detectedFramework ? null : "select",
      name: "framework",
      message: "Select your framework:",
      choices: [
        { title: "React", value: "react" },
        { title: "Next.js", value: "next" },
        { title: "Vue", value: "vue" },
        { title: "Nuxt", value: "nuxt" },
        { title: "Angular", value: "angular" },
      ],
      initial: detectedFramework === "next" ? 1 : 0,
    },
    {
      type: "select",
      name: "styling",
      message: "Which styling system do you use?",
      choices: [
        { title: "TailwindCSS", value: "tailwind" },
        { title: "CSS Modules", value: "modules" },
        { title: "None (Standard CSS)", value: "none" },
      ],
      initial: deps.tailwindcss ? 0 : 1,
    },
    {
      type: "select",
      name: "dataFetching",
      message: "How would you like to fetch data?",
      choices: [
        { title: "TanStack Query (Recommended)", value: "query" },
        { title: "Axios", value: "axios" },
        { title: "Fetch API", value: "fetch" },
      ],
      initial: deps["@tanstack/react-query"] ? 0 : 1,
    },
    {
      type: "select",
      name: "ui",
      message: "Select your UI system preference:",
      choices: [
        { title: "shadcn/ui", value: "shadcn" },
        { title: "Headless UI", value: "headless" },
        { title: "Custom", value: "custom" },
      ],
      initial: 0,
    },
    {
      type: "text",
      name: "apiEndpoint",
      message: "Your backend API endpoint:",
      initial: "/api",
    },
    {
      type: "toggle",
      name: "mocks",
      message: "Do you want to generate a mock API for local development?",
      initial: true,
      active: "Yes",
      inactive: "No",
    },
    {
      type: "toggle",
      name: "typescript",
      message: "Are you using TypeScript?",
      initial: true,
      active: "Yes",
      inactive: "No",
    },
    {
      type: "toggle",
      name: "enableAuth",
      message: "Enable authentication?",
      initial: true,
      active: "Yes",
      inactive: "No",
    },
    {
      type: prev => prev ? 'select' : null,
      name: "authType",
      message: "Select Auth type:",
      choices: [
        { title: "JWT", value: "jwt" },
        { title: "Custom", value: "custom" },
      ],
      initial: 0,
    },
  ]);

  const framework = detectedFramework || responses.framework;
  if (!framework) {
    console.error(pc.red("\n✖ Initialization cancelled."));
    return;
  }

  const config: Config = {
    ...responses,
    framework,
  };

  if (detectedFramework) {
    console.log(pc.green(`✔ Detected ${detectedFramework} project.`));
  }

  await setupProject(config);
}

async function setupProject(config: Config) {
  console.log(pc.blue("\n⚙️  Applying configuration..."));

  // 1. Install dependencies
  const toInstall = ["adminix", "lucide-react"]; // Using the rebranded name
  if (config.dataFetching === "query") toInstall.push("@tanstack/react-query");
  if (config.dataFetching === "axios") toInstall.push("axios");
  if (config.styling === "tailwind") {
    toInstall.push("tailwindcss", "autoprefixer", "postcss");
  }

  if (config.framework !== "react" && config.framework !== "next") {
    toInstall.push("react", "react-dom");
  }

  if (config.mocks) {
    toInstall.push("miragejs");
  }

  console.log(pc.gray(`📦 Installing dependencies: ${toInstall.join(", ")}...`));

  // Create directories
  const targetDir = path.join(process.cwd(), config.framework === "next" ? "app/admin" : "src/admin");
  await fs.ensureDir(targetDir);

  if (config.mocks) {
    const mockDir = path.join(process.cwd(), "mocks");
    await fs.ensureDir(mockDir);
    // Write a sample mock
    let mockContent = "// MirageJS Server Setup\nimport { createServer } from 'miragejs';\nexport function makeServer() {\n  return createServer({ routes() { this.namespace = 'api'; this.get('/products', () => []); ";
    if (config.enableAuth) {
        mockContent += "this.post('/login', () => ({ token: 'mock-jwt-token', user: { id: 1, email: 'admin@example.com', roles: ['admin'] } })); ";
    }
    mockContent += "} });\n}";
    await fs.writeFile(path.join(mockDir, "server.js"), mockContent);
  }

  if (config.enableAuth) {
      const authConfigExample = `
// auth-config.${config.typescript ? "ts" : "js"}
export const authConfig = {
  loginEndpoint: "/api/login",
  userEndpoint: "/api/me",
  tokenField: "token",
  userField: "user"
};
`;
      await fs.writeFile(path.join(targetDir, `auth-config.${config.typescript ? "ts" : "js"}`), authConfigExample.trim());
      console.log(pc.gray(`✔ Generated auth configuration in ${targetDir}`));
  }

  // Final UI feedback
  console.log(pc.green("\n✔ Project ready! AdminPanels integrated successfully."));
  console.log(pc.white("\nNext steps:"));
  console.log(pc.gray(`1. Run: ${pc.cyan("npm install")}`));
  console.log(pc.gray(`2. Start dev server: ${pc.cyan("npm run dev")}`));
  console.log(pc.gray(`3. Explore: ${pc.cyan(config.framework === "next" ? "/admin" : "/src/admin")}`));
}
