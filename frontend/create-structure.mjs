
import { mkdir } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("src");

const directories = [
    // Players module
    "modules/players/components",
    "modules/players/pages",
    "modules/players/services",
    "modules/players/types",

    // Dashboard module
    "modules/dashboard/components",
    "modules/dashboard/pages",
    "modules/dashboard/services",
    "modules/dashboard/types",

    // Settings module
    "modules/settings/components",
    "modules/settings/pages",
    "modules/settings/services",
    "modules/settings/types",

    // Shared
    "shared/components",
    "shared/services",
    "shared/types",
    "shared/styles",
];

async function createStructure() {
    for (const directory of directories) {
        const fullPath = path.join(root, directory);

        await mkdir(fullPath, { recursive: true });

        console.log(`Created: ${directory}`);
    }

    console.log("\nFrontend structure created successfully!");
}

createStructure().catch((error) => {
    console.error("Failed to create structure:", error);
    process.exitCode = 1;
});
