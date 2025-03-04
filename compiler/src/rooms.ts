import type { Dir, Room } from "../../ciff-types/room.d.ts";

export function parseRooms(roomsSrc: string, namespace: string[], usedIds: Set<string>): { [id: string]: Room } {
    const nsString = namespace.map(n => n + ".").join("");
    const rooms: { [id: string]: Room } = {};

    for (const roomSrc of roomsSrc.replace(/\r/g, "").split("\n\n")) {
        const rows = roomSrc.split("\n");

        const id = nsString + rows[0].split(" ")[0];
        const short = rows[0].split(" ").slice(1).join(" ");
        const printout = rows[1];

        if (id in rooms || usedIds.has(id)) {
            throw "Duplicate room ID '" + id + "'";
        }

        const dirs: Room['dirs'] = {};
        let facing: Dir | undefined = undefined;

        const items: Room['items'] = [];
        const itemBriefings: Room['itemBriefings'] = {};

        for (let propRow of rows.slice(2)) {
            propRow = propRow.replace(/\s+/g, " ").trim();

            const noteIndex = propRow.indexOf("NOTE");

            if (noteIndex != -1) {
                console.warn(propRow.slice(noteIndex));

                propRow = propRow.slice(0, noteIndex).trim();
            }

            if (propRow == "") continue;

            const words = propRow.split(" ");

            switch (words[0]) {
                case "north":
                case "east":
                case "south":
                case "west":
                case "northeast":
                case "northwest":
                case "southeast":
                case "southwest":
                    case "up":
                    case "down":
                {
                    if (words[0] in dirs) {
                        throw "Duplicate dir '" + words[0] + "' in room '" + id + "'";
                    }

                    const parsed = propRow.match(/^\w+(?: ([\w.]+))?(?: ("(?:[^"\n]|"")*"))?$/);

                    if (parsed == null) {
                        throw "Invalid '" + words[0] + "' prop format in room '" + id + "': " + propRow;
                    }

                    dirs[words[0]] = {
                        goto: parsed[1],
                        say: parsed[2] ? parsed[2].slice(1, -1).replace(/""/g, "\"") : undefined,

                        nouns: [words[0]],

                        isDoor: false
                    };

                    break;
                }
                case "door":
                {
                    const parsed = propRow.match(/^\w+ (north|east|south|west|northeast|northwest|southeast|southwest|up|down)(?: ([\w.]+))?(?: ("(?:[^"\n]|"")*"))?$/);

                    if (parsed == null) {
                        throw "Invalid '" + words[0] + "' prop format in room '" + id + "': " + propRow;
                    }

                    if (words[1] in dirs) {
                        throw "Duplicate dir '" + words[0] + "' for door in room '" + id + "'";
                    }

                    dirs[parsed[1] as Dir] = {
                        goto: parsed[2] ?? null,
                        say: parsed[3] ? parsed[3].slice(1, -1).replace(/""/g, "\"") : undefined,

                        nouns: ["door", parsed[1]],

                        isDoor: true,
                        keyItem: null
                    };

                    break;
                }
                case "door_alias":
                {
                    const parsed = propRow.match(/^\w+ (north|east|south|west|northeast|northwest|southeast|southwest|up|down) (north|east|south|west|northeast|northwest|southeast|southwest|up|down)$/);

                    if (parsed == null) {
                        throw "Invalid '" + words[0] + "' prop format in room '" + id + "': " + propRow;
                    }

                    if (words[1] in dirs) {
                        throw "Duplicate dir '" + words[0] + "' for door alias in room '" + id + "'";
                    }

                    if (!(words[2] in dirs) || !dirs[words[2] as Dir]!.isDoor) {
                        throw "Door alias to non-door in '" + words[0] + "' prop format in room '" + id + "': " + propRow;
                    }

                    dirs[parsed[1] as Dir] = {
                        goto: parsed[2] ?? null,
                        say: parsed[3] ? parsed[3].slice(1, -1).replace(/""/g, "\"") : undefined,

                        nouns: ["door", parsed[1]],

                        isDoor: true,
                        doorAliasOf: words[2] as Dir
                    };

                    break;
                }
                case "doorkeyitem":
                {
                    const parsed = propRow.match(/^\w+ (north|east|south|west|northeast|northwest|southeast|southwest|up|down) ([\w.]+)$/);

                    if (parsed == null) {
                        throw "Invalid 'doorkeyitem' prop format in room '" + id + "': " + propRow;
                    }

                    if (!(parsed[1] in dirs) || !dirs[parsed[1] as Dir]!.isDoor) {
                        throw "No known door in dir '" + parsed[1] + "' in room '" + id + "'";
                    }

                    dirs[parsed[1] as Dir]!.keyItem = parsed[2];

                    break;
                }
                case "doorsay":
                {
                    const parsed = propRow.match(/^\w+ (IfClosed|OnOpen|OnNoItem|OnWrongItem|OnAlreadyOpen|OnClose) (north|east|south|west|northeast|northwest|southeast|southwest|up|down) ("(?:[^"\n]|"")*")$/);

                    if (parsed == null) {
                        throw "Invalid 'doorsay' prop format in room '" + id + "': " + propRow;
                    }

                    if (!(parsed[2] in dirs) || !dirs[parsed[2] as Dir]!.isDoor) {
                        throw "No known door in dir '" + parsed[2] + "' in room '" + id + "'";
                    }

                    dirs[parsed[2] as Dir]![("say" + parsed[1]) as "sayIfClosed" | "sayOnOpen" | "sayOnNoItem" | "sayOnWrongItem" | "sayOnClose"] = parsed[3].slice(1, -1).replace(/""/g, "\"");

                    break;
                }
                case "dirnouns":
                {
                    if (!(words[1] in dirs)) {
                        throw "No known roomdir in direction '" + words[1] + "' in dirnouns prop in room '" + id + "'";
                    }

                    dirs[words[1] as Dir]!.nouns = words.slice(2).join(" ").split(",").map(n => n.trim());

                    break;
                }
                case "facing":
                {
                    if (words.length != 2) {
                        throw "Invalid '" + words[0] + "' prop format in room '" + id + "': " + propRow;
                    }

                    if (!["north", "east", "south", "west"].includes(words[1] as Dir)) {
                        throw "Invalid direction '" + words[1] + "' in facing prop in room '" + id + "'";
                    }

                    facing = words[1] as Dir;

                    break;
                }
                case "item":
                {
                    if (words.length != 2) {
                        throw "Invalid 'item' prop format in room '" + id + "': " + propRow;
                    }

                    items.push({
                        itemId: words[1],
                        dropped: false
                    });

                    break;
                }
                case "itembrief":
                {
                    if (words.length < 2) {
                        throw "Missing item ID in itembrief prop in room '" + id + "'";
                    }

                    const itemId = words[1];

                    if (itemId in itemBriefings) {
                        if ("undropped" in itemBriefings[itemId]) {
                            itemBriefings[itemId].undropped += "\n" + words.slice(2).join(" ");
                        } else {
                            itemBriefings[itemId].undropped = words.slice(2).join(" ");
                        }
                    } else {
                        itemBriefings[itemId] = {
                            undropped: words.slice(2).join(" ")
                        };
                    }

                    break;
                }
                case "droppeditembrief":
                {
                    if (words.length < 2) {
                        throw "Missing item ID in itembrief prop in room '" + id + "'";
                    }

                    const itemId = words[1];

                    if (itemId in itemBriefings) {
                        if ("dropped" in itemBriefings[itemId]) {
                            itemBriefings[itemId].dropped += "\n" + words.slice(2).join(" ");
                        } else {
                            itemBriefings[itemId].dropped = words.slice(2).join(" ");
                        }
                    } else {
                        itemBriefings[itemId] = {
                            dropped: words.slice(2).join(" ")
                        };
                    }

                    break;
                }
                default:
                {
                    throw "Unknown prop '" + words[0] + "'";
                }
            }
        }

        rooms[id] = {
            short,
            printout,

            dirs,
            facing,

            items,
            itemBriefings
        };
    }

    return rooms;
}