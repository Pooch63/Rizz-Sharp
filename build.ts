import { type Process, run_process } from "@pooch63/build-tool-helper";
import promptSync from "prompt-sync";

const prompt = promptSync();

import path from "path";
import fs from "fs";

function move_files(srcdir: string, destdir: string) {
  const files = fs.readdirSync(srcdir);
  for (let file of files) {
    const srcPath = path.join(srcdir, file);
    const destPath = path.join(destdir, file);
    // Move the file or folder
    fs.renameSync(srcPath, destPath);
  }
}
function empty_folder(src: string) {
  try {
    // Read all files and subdirectories in the folder
    const items = fs.readdirSync(src);

    items.forEach((item) => {
      const item_path = path.join(src, item);
      const stats = fs.statSync(item_path);

      if (stats.isDirectory()) {
        // If it's a directory, recurse and delete everything inside it
        empty_folder(item_path);
        console.log(`Deleting directory: ${item_path}`);
        // After all files in the directory are deleted, remove the directory itself
        fs.rmdirSync(item_path);
      } else {
        // If it's a file, delete it
        fs.unlinkSync(item_path);
        console.log(`Deleted file: ${item_path}`);
      }
    });
  } catch (error) {
    console.error(`Error emptying folder ${src}:`, error);
  }
}

const commands: Process[] = [
  {
    name: "lib",
    commands: [
      // Compile everything
      "npx tsc",
      // Delete unnecessary .d.ts files
      // For now, I actually want to keep all these .d.ts files
      //   (os: NodeJS.Platform) => {
      //     let dir = path.resolve(__dirname, "lib");

      //     if (!fs.existsSync(dir)) {
      //       fs.mkdirSync(dir, { recursive: true });
      //       return;
      //     }

      //     const files = fs.readdirSync(dir);
      //     for (const file of files) {
      //       const full = path.join(dir, file);

      //       if (
      //         file.endsWith(".d.ts") &&
      //         file !== "index.d.ts" &&
      //         fs.statSync(full).isFile()
      //       ) {
      //         fs.unlinkSync(full);
      //       }
      //     }
      //   },
    ],
  },
  {
    name: "docs",
    commands: [
      // Compile docs
      { command: "npm run build", cwd: "./docs-src" },
      // Clear previous build
      () => {
        // empty_folder("./docs");
      },
    ],
  },
];

if (process.argv.length == 2) {
  const docs = prompt(
    "No build was specified. Do you want to build all? (y/n) "
  );
  if (docs == "y") {
    for (const command of commands) {
      console.log(`Building ${command.name}...`);
      run_process(command);
    }
  }
}
const command = process.argv[2];

for (let cmd of commands) {
  if (cmd.name == command) {
    console.log(`Building ${command}...`);
    run_process(cmd);
    break;
  }
}
