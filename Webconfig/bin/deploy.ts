/* Modular Music Controller - Web Configuration Portal
 * (C) 2025 Dennis Schulmeister-Zimolong <dennis@windows3.de>
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 */

import { promises as fs } from "node:fs";
import * as path from "node:path";
import { brotliCompress } from "node:zlib";
import { promisify } from "node:util";
import glob from "fast-glob";

// Compress all static files with the Brotli algorithm and copy the
// compressed files into the firmware data directory.
const brotliCompressAsync = promisify(brotliCompress);
const [srcDir, outDir] = process.argv.slice(2);

if (!srcDir || !outDir) {
    console.error("Usage: tsx deploy.ts <source-dir> <output-dir>");
    process.exit(1);
}

const srcGlob = path.join(srcDir, "**");
const files = await glob(srcGlob, { dot: true, onlyFiles: true, absolute: true });

for (const file of files) {
    if (file.endsWith(".map")) continue;    // Skip rather large code maps

    const relPath = path.relative(srcDir, file);
    const outPath = path.join(outDir, relPath);

    await fs.mkdir(path.dirname(outPath), { recursive: true });

    const data = await fs.readFile(file);
    const compressed = await brotliCompressAsync(data);

    await fs.writeFile(outPath, compressed);
    console.log(`Compressed: ${relPath} -> ${outPath}`);
}

