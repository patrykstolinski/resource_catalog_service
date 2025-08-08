import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, "..", "data");


// export read
export async function loadData(filePath) {
  const jsonString = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(jsonString);
}
// export write
export async function writeData(filePath, data) {
  const jsonString = JSON.stringify(data, null, 2);
  await fs.writeFile(filePath, jsonString, "utf-8");
}

