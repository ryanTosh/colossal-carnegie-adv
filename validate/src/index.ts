import { promises as fs } from "fs";

import type { Prog } from "../../ciff-types/prog.js";
import { Room } from "../../ciff-types/room.js";
import { Item } from "../../ciff-types/item.js";

if (process.argv.length < 3) {
    console.error("ciff-validate: missing prog operand");

    process.exit(1);
}

const progDir = process.argv[2];

const prog = JSON.parse(await fs.readFile(progDir + ".ciff.json", "utf-8")) as Prog;

// run validation