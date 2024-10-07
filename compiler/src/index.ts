import { promises as fs } from "fs";

import { parseRooms } from "./rooms.js";
import type { Prog } from "../../ciff-types/prog.js";
import { validateProg } from "./validate.js";
import { parseItems } from "./items.js";

if (process.argv.length < 3) {
    console.error("ciff-compile: missing prog operand");

    process.exit(1);
}

const progDir = process.argv[2];

const initialPrintout = (await fs.readFile(progDir + "/initialPrintout", "utf-8")).replace(/\r/g, "").replace(/\n+$/g, "");

const roomsSrc = await fs.readFile(progDir + "/rooms", "utf-8");

const rooms = parseRooms(roomsSrc);

const itemsSrc = await fs.readFile(progDir + "/items", "utf-8");

const items = parseItems(itemsSrc);

const prog: Prog = {
    initialPrintout,

    rooms,
    startingRoom: roomsSrc.split("\n")[0].split(" ")[0],

    items
};

validateProg(prog);

await fs.writeFile(progDir + ".ciff.json", JSON.stringify(prog));