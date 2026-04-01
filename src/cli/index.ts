import { Command } from "commander";
import { initCommand } from "./commands";
import pc from "picocolors";

const program = new Command();

program
  .name("adminix")
  .description("Adminix CLI tool for rapid admin panel development")
  .version("0.0.7");

program
  .command("init")
  .description("Initialize Adminix in your project")
  .action(() => {
    initCommand().catch((err) => {
      console.error(pc.red("\n✖ Critical Error:\n"), err);
      process.exit(1);
    });
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
