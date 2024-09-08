import { Prog } from "./common/prog";
import { Dir, Room } from "./common/room";

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
        const words = input.toLowerCase().replace(/\s+/g, " ").trim().split(" ");

        if (words.length == 0 || words[0] == "") {
            return "Huh??";
        }

        switch (words[0]) {
            case "north":
            case "n":
                if (words.length > 1) {
                    return "I don't know how to do that. Did you want to say 'north'?";
                }

                return this.tryMove("north");
            case "east":
            case "e":
                if (words.length > 1) {
                    return "I don't know how to do that. Did you want to say 'east'?";
                }
                
                return this.tryMove("east");
            case "south":
            case "s":
                if (words.length > 1) {
                    return "I don't know how to do that. Did you want to say 'south'?";
                }
                
                return this.tryMove("south");
            case "west":
            case "w":
                if (words.length > 1) {
                    return "I don't know how to do that. Did you want to say 'west'?";
                }
                
                return this.tryMove("west");
            case "up":
            case "ascend":
                if (words.length > 1 && !(words.length == 2 && ["stairs", "ramp", "elevator", "hill"].includes(words[1]))) {
                    return "I don't know how to do that. Did you want to say 'up'?";
                }
                
                return this.tryMove("up");
            case "down":
            case "descend":
                if (words.length > 1 && !(words.length == 2 && ["stairs", "ramp", "elevator", "hill"].includes(words[1]))) {
                    return "I don't know how to do that. Did you want to say 'down'?";
                }
                
                return this.tryMove("down");
            case "inventory":
            case "inv":
            case "i":
            case "carrying":
            case "holding":
            case "items":
                return this.inv.length == 0 ? "You're not holding anything." : "You're holding the following items:" + this.inv.map(id => "- " + this.prog.items[id].short).join("");
            default:
                return "I don't know how to '" + words[0] + "'.";
        }
    }

    private tryMove(dir: Dir): string {
        if (dir in this.room.dirs) {
            if (this.room.dirs[dir]!.goto === null) {
                return this.room.dirs[dir]!.say ?? "You cannot go " + dir + ".";
            } else {
                const gotoRoom = this.prog.rooms[this.room.dirs[dir]!.goto]!;
                const say = ("say" in this.room.dirs[dir]! ? this.room.dirs[dir].say + "\n\n" : "") + this.roomPrintout(gotoRoom);

                this.room = gotoRoom;

                return say;
            }
        } else {
            return "You cannot go " + dir + ".";
        }
    }

    private roomPrintout(room: Room) {
        return room.short + "\n" + room.printout;
    }
}