import type { Prog } from "../../ciff-types/prog";
import type { Dir, Room } from "../../ciff-types/room";

export class Player {
    private prog: Prog;

    private inv: string[];
    private room: Room;
    private facing: Dir | undefined;

    constructor(prog: Prog) {
        this.prog = prog;

        this.inv = [];
        this.room = this.prog.rooms[this.prog.startingRoom]!;
        this.facing = this.room.facing as (Dir | undefined);
    }

    public initialPrintout(): string {
        return this.prog.initialPrintout + "\n\n" + this.roomPrintout(this.room);
    }

    public runUserInput(input: string): string {
        const words = input.replace(/\s+/g, " ").trim().split(" ");

        if (words.length == 0 || words[0] == "") {
            return "Huh??";
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
                                return "What should I " + words[0].toLowerCase() + "?";
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
            // move/move to/go/go to
            default:
            {
                return "I don't know how to '" + words[0] + "'.";
            }
        }
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
            case "forward":
            case "fwd":
            {
                if (words.length > 1) {
                    return "I don't know how to do that. Did you want to say 'forward'?";
                }

                if (this.facing === undefined) {
                    return "Which direction do you want to go?";
                }

                return this.tryMove(this.facing);
            }
            case "backward":
            case "back":
            case "reverse":
            case "bw":
            {
                if (words.length > 1) {
                    return "I don't know how to do that. Did you want to say 'backward'?";
                }

                if (this.facing === undefined) {
                    return "Which direction do you want to go?";
                }

                return this.tryMove({
                    "north": "south",
                    "east": "west",
                    "south": "north",
                    "west": "east",
                    "up": "down",
                    "down": "up"
                }[this.facing] as Dir);
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

    private tryMove(dir: Dir): string {
        if (this.room.dirs[dir] !== undefined) {
            if (this.room.dirs[dir].goto === null) {
                return this.room.dirs[dir].say ?? "You cannot go " + dir + ".";
            } else {
                const gotoRoom = this.prog.rooms[this.room.dirs[dir].goto]!;
                const say = ("say" in this.room.dirs[dir] ? this.room.dirs[dir].say + "\n\n" : "") + this.roomPrintout(gotoRoom);

                this.room = gotoRoom;
                this.facing = this.room.facing as (Dir | undefined);

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
                return "\nA " + this.prog.items[item.itemId].short + " is lying on the ground.";
            }
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