import { promises as fs } from "fs";

import { parseRooms } from "./rooms.js";
import { Prog } from "./common/prog.js";
import { validateProg } from "./validate.js";

if (process.argv.length < 3) {
    console.error("ciff-compile: missing prog operand");

    process.exit(1);
}

const progDir = process.argv[2];

const initialPrintout = (await fs.readFile(progDir + "/initialPrintout", "utf-8")).replace(/\r/g, "").replace(/\n+$/g, "");

const roomsSrc = await fs.readFile(progDir + "/rooms", "utf-8");

const rooms = parseRooms(roomsSrc);

const prog: Prog = {
    initialPrintout,

    rooms,
    startingRoom: roomsSrc.split("\n")[0].split(" ")[0]
};

validateProg(prog);

await fs.writeFile(progDir + ".ciff.json", JSON.stringify(prog));