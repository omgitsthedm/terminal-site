import { execSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";

const input = process.env.INPUT || "public/models/input.glb";
const output = process.env.OUTPUT || "public/models/output.draco.glb";

if (!existsSync("public/models")) {
  mkdirSync("public/models", { recursive: true });
}

if (!existsSync(input)) {
  console.error(`Missing model at ${input}`);
  console.error(
    "Place a GLB at public/models/input.glb or pass INPUT=/path/to/model.glb",
  );
  process.exit(1);
}

const cmd = `npx gltf-pipeline -i ${input} -o ${output} --draco.compressionLevel=10`;
execSync(cmd, { stdio: "inherit" });
console.log(`Optimized model written to ${output}`);
