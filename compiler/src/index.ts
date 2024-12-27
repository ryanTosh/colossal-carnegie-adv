import { promises as fs } from "fs";

import { parseRooms } from "./rooms.js";
import type { Prog } from "../../ciff-types/prog.js";
import { validateProg } from "./validate.js";
import { parseItems } from "./items.js";
import { Room } from "../../ciff-types/room.js";
import { Item } from "../../ciff-types/item.js";

if (process.argv.length < 3) {
    console.error("ciff-compile: missing prog operand");

    process.exit(1);
}

const progDir = process.argv[2];

const initialState = (await fs.readFile(progDir + "/initialState", "utf-8")).replace(/\r/g, "");

async function parseRoomsTree(path: string, namespace: string[], usedIds: Set<string>): Promise<{ [id: string]: Room }> {
    const stat = await fs.stat(path);

    if (stat.isDirectory()) {
        let rooms = {};

        for (const file of await fs.readdir(path)) {
            rooms = {...rooms, ...parseRoomsTree(path + "/" + file, [...namespace, file], usedIds)};
        }

        return rooms;
    } else {
        const roomsSrc = await fs.readFile(path, "utf-8");

        return parseRooms(roomsSrc, namespace, usedIds);
    }
}

const rooms = await parseRoomsTree(progDir + "/rooms", [], new Set());

async function parseItemsTree(path: string, namespace: string[], usedIds: Set<string>): Promise<{ [id: string]: Item }> {
    const stat = await fs.stat(path);

    if (stat.isDirectory()) {
        let items = {};

        for (const file of await fs.readdir(path)) {
            items = {...items, ...parseItemsTree(path + "/" + file, [...namespace, file], usedIds)};
        }

        return items;
    } else {
        const itemsSrc = await fs.readFile(path, "utf-8");

        return parseItems(itemsSrc, namespace, usedIds);
    }
}

const items = await parseItemsTree(progDir + "/items", [], new Set());

const prog: Prog = {
    initialPrintout: initialState.split("\n\n").slice(1).join("\n\n"),

    rooms,
    startingRoom: initialState.split("\n")[0],

    items
};

validateProg(prog);

await fs.writeFile(progDir + ".ciff.json", JSON.stringify(prog));