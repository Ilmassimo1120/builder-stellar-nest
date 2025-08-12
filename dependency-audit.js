// dependency-audit.js
import fs from "fs";
import glob from "glob";
import { execSync } from "child_process";
import readline from "readline";

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const declaredDeps = new Set([
  ...Object.keys(packageJson.dependencies || {}),
  ...Object.keys(packageJson.devDependencies || {}),
]);

// Regex for imports and requires
const importRegex =
  /(?:import\s+.*?from\s+['"]([^'"]+)['"])|(?:require\(['"]([^'"]+)['"]\))/g;

// Find all code files
const files = glob.sync("**/*.{js,ts,jsx,tsx}", {
  ignore: ["node_modules/**", "dist/**", "build/**"],
});

const usedDeps = new Set();

for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const pkg = match[1] || match[2];
    if (!pkg.startsWith(".") && !pkg.startsWith("/")) {
      usedDeps.add(
        pkg.split("/")[0].startsWith("@")
          ? pkg.split("/").slice(0, 2).join("/")
          : pkg.split("/")[0],
      );
    }
  }
}

const missingDeps = [...usedDeps].filter((dep) => !declaredDeps.has(dep));

if (missingDeps.length === 0) {
  console.log("✅ No missing dependencies found.");
  process.exit(0);
}

console.log("❌ Missing dependencies:");
missingDeps.forEach((dep) => console.log(`  - ${dep}`));

// Ask to install
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question(`\nInstall now? (y/N): `, (answer) => {
  if (answer.toLowerCase() === "y") {
    try {
      console.log(`\n📦 Installing: ${missingDeps.join(" ")}\n`);
      execSync(`npm install ${missingDeps.join(" ")}`, { stdio: "inherit" });
      console.log("\n✅ Missing dependencies installed successfully!");
    } catch (error) {
      console.error("❌ Error installing dependencies:", error.message);
    }
  } else {
    console.log("\n⚠️ Skipped installation.");
  }
  rl.close();
});
