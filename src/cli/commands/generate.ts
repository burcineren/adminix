import prompts from "prompts";
import pc from "picocolors";
import fs from "fs-extra";
import path from "path";

/**
 * CLI command to generate a new resource configuration.
 * usage: npx adminix generate resource
 */
export async function generateCommand() {
  console.log(pc.cyan("\n🛠️  Adminix Resource Generator\n"));

  const responses = await prompts([
    {
      type: "text",
      name: "name",
      message: "Resource name (e.g., 'Product', 'User'):",
      validate: (value: string) => (value.length > 0 ? true : "Please enter a name"),
    },
    {
      type: "text",
      name: "endpoint",
      message: "API endpoint (e.g., '/api/products'):",
      initial: (prev: string) => `/api/${prev.toLowerCase()}s`,
    },
    {
      type: "toggle",
      name: "autoSchema",
      message: "Use Auto-Schema Detection (Zero Config)?",
      initial: true,
      active: "Yes",
      inactive: "No",
    },
  ]);

  if (!responses.name) {
    console.log(pc.yellow("\n⚠ Generation cancelled."));
    return;
  }

  const { name, endpoint, autoSchema } = responses;
  const resourceName = name.charAt(0).toUpperCase() + name.slice(1);
  const fileName = `${resourceName}Page.tsx`;
  
  // Try to find the admin directory
  let targetDir = path.join(process.cwd(), "src/admin");
  if (!(await fs.pathExists(targetDir))) {
    targetDir = path.join(process.cwd(), "app/admin"); // Next.js
  }
  
  if (!(await fs.pathExists(targetDir))) {
     // Default to current directory if structure is unknown
     targetDir = path.join(process.cwd(), "admin");
  }

  await fs.ensureDir(targetDir);
  const targetPath = path.join(targetDir, fileName);

  const content = `
import { Adminix } from "adminix";

/**
 * Generated ${resourceName} Admin Page
 * Using ${autoSchema ? "Zero-Config (Auto-Schema)" : "Manual Schema"}
 */
export default function ${resourceName}Page() {
  return (
    <Adminix
      name="${resourceName}"
      endpoint="${endpoint}"
      autoSchema={${autoSchema}}
      // Add custom fields here if needed
      // fields={[
      //   { name: "id", type: "number", primaryKey: true },
      // ]}
    />
  );
}
`;

  await fs.writeFile(targetPath, content.trim());
  console.log(pc.green(`\n✔ Resource page created successfully: ${pc.white(targetPath)}`));
  console.log(pc.white("\nNext steps:"));
  console.log(pc.gray(`1. Import and use this component in your router.`));
  console.log(pc.gray(`2. Customize permissions or layouts in the file.`));
}
