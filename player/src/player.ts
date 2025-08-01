import type { Prog } from "../../ciff-types/prog";
import type { Dir, Room } from "../../ciff-types/room";

export class Player {
    private prog: Prog;

    private inv: string[];
    private room: Room;

    constructor(prog: Prog) {
        this.prog = prog;

        this.inv = [];
        this.room = this.prog.rooms[this.prog.startingRoom]!;
    }

    public initialPrintout(): string {
        return this.prog.initialPrintout + "\n\n" + this.roomPrintout(this.room);
    }

    public runUserInput(input: string): string {
        if (input[0] == "~") {
            return this.runCommand(input.slice(1));
        }

        const words = input.replace(/\s+/g, " ").trim().split(" ");

        if (words.length == 0 || words[0] == "") {
            return "Huh?";
        }

        const tryMoveInput = this.tryRunMoveInput(words);

        if (tryMoveInput !== null) return tryMoveInput;

        switch (words[0].toLowerCase()) {
            case "move":
            case "go":
            {
                if (words[1] == "to") {
                    throw "TODO"; // TODO
                }

                const tryMoveInput = this.tryRunMoveInput(words.slice(1));

                if (tryMoveInput !== null) return tryMoveInput;

                return "I don't know how to do that. Did you want to move in a direction? Try 'north', 'east', 'south', 'west', 'up', or 'down' ('n'/'e'/'s'/'w'/'u'/'d' for short).";
            }
            case "inventory":
            case "inv":
            case "i":
            case "carrying":
            case "holding":
            case "items":
            {
                if (words.length > 1) {
                    return "I don't know how to do that. Did you want to say 'inventory' ('inv'/'i' for short)?";
                }

                return this.inv.length == 0 ? "You're not holding anything." : "You're holding the following items:\n" + this.inv.map(id => "- " + uppercase(this.prog.items[id].short)).join("\n");
            }
            case "take":
            case "get":
            case "grab":
            case "hold":
            case "collect":
            case "fetch":
            {
                return this.tryPickUp(words.slice(1), words[0]);
            }
            // case "look at":
            case "inspect":
            case "examine":
            {
                const noun = words.slice(1).join(" ");
                    
                if (noun == "") {
                    return "What should I " + words[0].toLowerCase() + "?";
                }

                for (const itemId of this.inv) {
                    const item = this.prog.items[itemId];

                    if (item.nouns.includes(noun)) {
                        return item.inspect;
                    }
                }

                for (const roomItme of this.room.items) {
                    const itemId = roomItme.itemId;
                    const item = this.prog.items[itemId];

                    if (item.nouns.includes(noun)) {
                        return item.inspect;
                    }
                }

                return "I can't find any '" + noun + "'.";
            }
            case "look":
            case "l":
            {
                if (words.length > 1) {
                    return "I don't know how to do that. Did you want to say 'look' ('l' for short)?";
                }

                return this.roomPrintout(this.room);
            }
            case "read":
            {
                const noun = words.slice(1).join(" ");
                
                if (noun == "") {
                    let readableItem = null;

                    for (const itemId of this.inv) {
                        const item = this.prog.items[itemId];

                        if (item.actions.read !== undefined) {
                            if (readableItem === null) {
                                readableItem = item;
                            } else {
                                return "What do you want to " + words[0].toLowerCase() + "?";
                            }
                        }
                    }

                    if (readableItem !== null) {
                        return readableItem.actions.read!;
                    } else {
                        return "Nothing you're holding can be read.";
                    }
                }

                for (const itemId of this.inv) {
                    const item = this.prog.items[itemId];

                    if (item.nouns.includes(noun)) {
                        if (item.actions.read !== undefined) {
                            return item.actions.read;
                        } else {
                            return "You can't read the " + item.short;
                        }
                    }
                }

                for (const roomItme of this.room.items) {
                    const itemId = roomItme.itemId;
                    const item = this.prog.items[itemId];

                    if (item.nouns.includes(noun)) {
                        // TODO: first picking up, ...

                        if (item.actions.read !== undefined) {
                            return item.actions.read;
                        } else {
                            return "You can't read the " + item.short;
                        }
                    }
                }

                return "I can't find any '" + noun + "'.";
            }
            case "pick":
            {
                if (words[1] == "up") {
                    return this.tryPickUp(words.slice(2), words.slice(0, 2).join(" "));
                } else {
                    return "I don't know how to 'pick'. Did you want to say 'pick up' ('get' for short)?";
                }
            }
            case "drop":
            {
                const noun = words.slice(1).join(" ");
                
                if (noun == "") {
                    return "What should I drop?";
                }

                for (let i = 0; i < this.inv.length; i++) {
                    const itemId = this.inv[i];
                    const item = this.prog.items[itemId];

                    if (item.nouns.includes(noun)) {
                        this.room.items.push({
                            itemId,
                            dropped: true
                        });
                        this.inv.splice(i, 1);

                        return "Dropped " + noun + ".";
                    }
                }

                return "I can't find any '" + noun + "'.";
            }
            case "open":
            {
                const noun = words.slice(1).join(" ");

                let targetDir;

                for (const dir in this.room.dirs) {
                    const roomDir = this.room.dirs[dir as Dir]!;

                    if (roomDir.nouns.includes(noun) || noun == "") {
                        if (targetDir !== undefined) {
                            return (noun == "" ? "What" : "Which " + noun) + " do you want to open?";
                        }

                        targetDir = roomDir;
                    }
                }

                if (targetDir !== undefined) {
                    while (targetDir.doorAliasOf !== undefined) targetDir = this.room.dirs[targetDir.doorAliasOf]!;

                    if (targetDir.isOpen) {
                        return targetDir.sayOnAlreadyOpen ?? "It's already open.";
                    }

                    if (targetDir.keyItem !== null && targetDir.keyItem !== undefined && !this.inv.includes(targetDir.keyItem!)) {
                        return targetDir.sayOnNoItem ?? "You don't have the right item to open it.";
                    }

                    targetDir.isOpen = true;

                    return targetDir.sayOnOpen ?? "You open it.";
                }

                return "I can't find any '" + noun + "'.";
            }
            default:
            {
                return "I don't know how to '" + words[0] + "'.";
            }
        }
    }

    private runCommand(command: string): string {
        const words = command.match(/\S+|"([^"]|"")+"/g) || [];

        switch (words[0]) {
            case "goto":
            {
                this.room = this.prog.rooms[words[1]];

                return this.roomPrintout(this.room);
            }
            case "pickup":
            {
                this.inv.push(words[1]);

                return "Picked up " + this.prog.items[words[1]].short;
            }
            case "room":
            {
                return JSON.stringify(this.room, null, 4);
            }
            case "inv":
            {
                return JSON.stringify(this.inv);
            }
            case "item":
            {
                return JSON.stringify(this.prog.items[words[1]], null, 4);
            }
            case "drop":
            {
                if (!this.inv.includes(words[1])) {
                    return "Could not find " + words[1];
                }

                this.inv.splice(this.inv.indexOf(words[1]), 1);
                return "Dropped " + words[1];
            }
            case "comefrom":
            {
                return Object.entries(this.prog.rooms).flatMap(([roomId, room]) => Object.entries(room.dirs).filter(([__dirname, roomDir]) => typeof roomDir.goto == "string" && this.prog.rooms[roomDir.goto] == this.room).map(([dir, _]) => roomId + " " + dir)).join("\n");
            }
            case "finditem":
            {
                return Object.entries(this.prog.rooms).filter(([_, room]) => room.items.some((item) => item.itemId == words[1])).map(([roomId, _]) => roomId).join("\n");
            }
        }

        return "undefined";
    }

    private tryRunMoveInput(words: string[]): string | null {
        switch (words[0]) {
            case "north":
            case "n":
            {
                if (words.length > 1) {
                    return "I don't know how to do that. Did you want to say 'north'?";
                }

                return this.tryMove("north");
            }
            case "east":
            case "e":
            {
                if (words.length > 1) {
                    return "I don't know how to do that. Did you want to say 'east'?";
                }
                
                return this.tryMove("east");
            }
            case "south":
            case "s":
            {
                if (words.length > 1) {
                    return "I don't know how to do that. Did you want to say 'south'?";
                }
                
                return this.tryMove("south");
            }
            case "west":
            case "w":
            {
                if (words.length > 1) {
                    return "I don't know how to do that. Did you want to say 'west'?";
                }
                
                return this.tryMove("west");
            }
            case "northeast":
            case "ne":
            {
                if (words.length > 1) {
                    return "I don't know how to do that. Did you want to say 'northeast'?";
                }
                
                return this.tryMove("northeast");
            }
            case "northwest":
            case "nw":
            {
                if (words.length > 1) {
                    return "I don't know how to do that. Did you want to say 'northwest'?";
                }
                
                return this.tryMove("northwest");
            }
            case "southeast":
            case "se":
            {
                if (words.length > 1) {
                    return "I don't know how to do that. Did you want to say 'southeast'?";
                }
                
                return this.tryMove("southeast");
            }
            case "southwest":
            case "sw":
            {
                if (words.length > 1) {
                    return "I don't know how to do that. Did you want to say 'southwest'?";
                }
                
                return this.tryMove("southwest");
            }
            case "up":
            case "u":
            case "ascend":
            {
                if (words.length > 1 && !(words.length == 2 && ["stairs", "ramp", "elevator", "hill"].includes(words[1].toLowerCase()))) {
                    return "I don't know how to do that. Did you want to say 'up'?";
                }
                
                return this.tryMove("up");
            }
            case "down":
            case "d":
            case "descend":
            {
                if (words.length > 1 && !(words.length == 2 && ["stairs", "ramp", "elevator", "hill"].includes(words[1].toLowerCase()))) {
                    return "I don't know how to do that. Did you want to say 'down'?";
                }
                
                return this.tryMove("down");
            }
            default:
            {
                return null;
            }
        }
    }

    private tryPickUp(nounPhrase: string[], commandWord: string): string {
        const noun = nounPhrase.join(" ");
                
        if (noun == "") {
            return "What should I " + commandWord.toLowerCase() + "?";
        }

        for (let i = 0; i < this.room.items.length; i++) {
            const itemId = this.room.items[i].itemId;
            const item = this.prog.items[itemId];

            if (item.nouns.includes(noun)) {
                this.inv.push(itemId);
                this.room.items.splice(i, 1);

                return "Picked up " + noun + ".";
            }
        }

        return "I can't find any '" + noun + "'.";
    }

    private tryMove(dir: Dir, originalDoorDir?: string): string {
        if (this.room.dirs[dir] !== undefined) {
            if (this.room.dirs[dir].goto === undefined) {
                return this.room.dirs[dir].say ?? "You cannot go " + dir + ".";
            } else {
                if (this.room.dirs[dir].doorAliasOf !== undefined) {
                    return this.tryMove(this.room.dirs[dir].doorAliasOf, originalDoorDir ?? dir);
                }

                if (this.room.dirs[dir].isDoor && !this.room.dirs[dir].isOpen) {
                    return this.room.dirs[dir].sayIfClosed ?? "The door " + (originalDoorDir ?? dir) + " is closed.";
                }

                if (this.room.dirs[dir].isDoor && this.room.dirs[dir].closeOnUse === true) {
                    this.room.dirs[dir].isOpen = false;
                }

                const gotoRoom = this.prog.rooms[this.room.dirs[dir].goto]!;
                const say = ("say" in this.room.dirs[dir] ? this.room.dirs[dir].say + "\n\n" : "") + this.roomPrintout(gotoRoom);

                this.room = gotoRoom;

                return say;
            }
        } else {
            return "You cannot go " + dir + ".";
        }
    }

    private roomPrintout(room: Room) {
        return room.short + "\n" + room.printout + room.items.map((item) => {
            const isDroppedStr = item.dropped ? "dropped" : "undropped";

            if (item.itemId in room.itemBriefings && isDroppedStr in room.itemBriefings[item.itemId]) {
                const briefing = room.itemBriefings[item.itemId][isDroppedStr];

                return briefing && "\n" + briefing;
            } else {
                if (!(item.itemId in this.prog.items)) {
                    throw new Error("No item with ID '" + item.itemId + "'");
                }
                
                return "\nA " + this.prog.items[item.itemId].short + " is lying on the ground.";
            }
        }).join("") + Object.values(room.dirs).map((dir) => {
            if (dir.isDoor) {
                if (dir.isOpen) {
                    if (dir.sayOnSightIfOpen !== undefined) {
                        return dir.sayOnSightIfOpen && "\n" + dir.sayOnSightIfOpen;
                    }
                } else {
                    if (dir.sayOnSightIfClosed !== undefined) {
                        return dir.sayOnSightIfClosed && "\n" + dir.sayOnSightIfClosed;
                    }
                }
            }

            return "";
        }).join("");
    }
}

function uppercase(str: string): string {
    if (str != str.toLowerCase()) {
        return str;
    }

    const words = str.split(" ");

    return words.map((w) => /*["a", "an", "the", "of"].includes(w) && i != 0 ? w : */w[0].toUpperCase() + w.slice(1)).join(" ");
}