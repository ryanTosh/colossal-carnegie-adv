import { Prog } from "../../ciff-types/prog";
import { Dir, Room } from "../../ciff-types/room";

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
        const words = input.replace(/\s+/g, " ").trim().split(" ");

        if (words.length == 0 || words[0] == "") {
            return "Huh??";
        }

        switch (words[0].toLowerCase()) {
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

                return this.inv.length == 0 ? "You're not holding anything." : "You're holding the following items:\n" + this.inv.map(id => "- " + this.prog.items[id].short).join("\n");
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
                    return "What should I " + words[0].toLowerCase() + "?";
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
            // move/move to/go/go to
            default:
            {
                return "I don't know how to '" + words[0] + "'.";
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

                return "";
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

                return say;
            }
        } else {
            return "You cannot go " + dir + ".";
        }
    }

    private roomPrintout(room: Room) {
        return room.short + "\n" + room.printout + room.items.filter((item) => item.briefing !== undefined).map((item) => "\n" + item.briefing).join("");
    }
}