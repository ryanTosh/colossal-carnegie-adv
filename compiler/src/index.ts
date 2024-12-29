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

const initialState = (await fs.readFile(progDir + "/initialState.ciff", "utf-8")).replace(/\r/g, "");

async function parseRoomsTree(path: string, namespace: string[], usedIds: Set<string>): Promise<{ [id: string]: Room }> {
    const stat = await fs.stat(path);

    if (stat.isDirectory() && !path.toLowerCase().endsWith(".ciff")) {
        let rooms = {};

        for (const file of await fs.readdir(path)) {
            rooms = {...rooms, ...await parseRoomsTree(path + "/" + file, [...namespace, file], usedIds)};
        }

        return rooms;
    } else if (stat.isFile() && path.toLowerCase().endsWith(".ciff")) {
        const roomsSrc = await fs.readFile(path, "utf-8");

        if (namespace.length != 0) {
            namespace[namespace.length - 1] = namespace[namespace.length - 1].replace(/\.ciff$/i, "");
        }

        return parseRooms(roomsSrc, namespace, usedIds);
    } else {
        console.warn("Unusual file or directory: " + path);

        return {};
    }
}

async function parseRoomsRoot(path: string): Promise<{ [id: string]: Room }> {
    let rooms = {};
    const namespace: string[] = [];
    const usedIds: Set<string> = new Set();

    if ((await fs.readdir(path)).includes("rooms")) {
        rooms = {...rooms, ...await parseRoomsTree(path + "/rooms", namespace, usedIds)};
    }
    if ((await fs.readdir(path)).includes("rooms.ciff")) {
        rooms = {...rooms, ...await parseRoomsTree(path + "/rooms.ciff", namespace, usedIds)};
    }

    return rooms;
}

const rooms = await parseRoomsRoot(progDir);

async function parseItemsTree(path: string, namespace: string[], usedIds: Set<string>): Promise<{ [id: string]: Item }> {
    const stat = await fs.stat(path);

    if (stat.isDirectory() && !path.toLowerCase().endsWith(".ciff")) {
        let items = {};

        for (const file of await fs.readdir(path)) {
            items = {...items, ...await parseItemsTree(path + "/" + file, namespace, usedIds)};
        }

        return items;
    } else if (stat.isFile() && path.toLowerCase().endsWith(".ciff")) {
        const itemsSrc = await fs.readFile(path, "utf-8");

        if (namespace.length != 0) {
            namespace[namespace.length - 1] = namespace[namespace.length - 1].replace(/\.ciff$/i, "");
        }

        return parseItems(itemsSrc, namespace, usedIds);
    } else {
        console.warn("Unusual file or directory: " + path);

        return {};
    }
}

async function parseItemsRoot(path: string): Promise<{ [id: string]: Item }> {
    let items = {};
    const namespace: string[] = [];
    const usedIds: Set<string> = new Set();

    if ((await fs.readdir(path)).includes("items")) {
        items = {...items, ...await parseItemsTree(path + "/items", namespace, usedIds)};
    }
    if ((await fs.readdir(path)).includes("items.ciff")) {
        items = {...items, ...await parseItemsTree(path + "/items.ciff", namespace, usedIds)};
    }

    return items;
}

const items = await parseItemsRoot(progDir);

const prog: Prog = {
    initialPrintout: initialState.split("\n\n").slice(1).join("\n\n"),

    rooms,
    startingRoom: initialState.split("\n")[0],

    items
};

validateProg(prog);

await fs.writeFile(progDir + ".ciff.json", JSON.stringify(prog));