import type { Dir, Room } from "../../ciff-types/room.d.ts";

export function parseRooms(roomsSrc: string): { [id: string]: Room } {
    const rooms: { [id: string]: Room } = {};

    for (const roomSrc of roomsSrc.replace(/\r/g, "").split("\n\n")) {
        const rows = roomSrc.split("\n");

        const id = rows[0].split(" ")[0];
        const short = rows[0].split(" ").slice(1).join(" ");
        const printout = rows[1];

        if (id in rooms) {
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
                case "up":
                case "down":
                {
                    if (words[0] in dirs) {
                        throw "Duplicate dir '" + words[0] + "' in room '" + id + "'";
                    }

                    const parsed = propRow.match(/^\w+(?: (\w+))?(?: ("(?:[^"\n]|"")*"))?$/);

                    if (parsed == null) {
                        throw "Invalid '" + words[0] + "' prop format in room '" + id + "': " + propRow;
                    }

                    dirs[words[0]] = {
                        goto: parsed[1] ?? null,
                        say: parsed[2] ? JSON.parse(parsed[2]) : undefined
                    };

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