import { Dir, Room } from "./room";

const ROOMS: { [room: string]: Room } = {
    mall: {
        id: "mall",
        short: "The Mall",
        long: "You are standing in front of an open field, facing west toward Hamerschlag Hall. Doherty Hall stands to your north, and Baker Hall to your south.",

        dirs: {
            north: {
                goto: "doherty1west"
            }
        }
    },
    doherty1west: {
        id: "doherty1west",
        short: "Doherty Hall",
        long: "You're in Doherty Hall.",

        dirs: {
            south: {
                goto: "mall"
            }
        }
    }
};
const STARTING_ROOM = "mall";

export class CCA {
    private room: Room;

    constructor() {
        this.room = ROOMS[STARTING_ROOM]!;
    }

    public runUserInput(input: string): string {
        const words = input.toLowerCase().replace(/\s+/g, " ").trim().split(" ");

        if (words.length == 0 || words[0] == "") {
            return "Huh??";
        }

        switch (words[0]) {
            case "north":
            case "east":
            case "south":
            case "west":
            case "up":
            case "down":
                return this.tryMove(words[0]);
            default:
                return "I don't know how to '" + words[0] + "'.";
        }
    }

    private tryMove(dir: Dir): string {
        if (dir in this.room.dirs) {
            if (this.room.dirs[dir]!.goto === null) {
                return this.room.dirs[dir]!.say ?? "You cannot go " + dir + ".";
            } else {
                const gotoRoom = ROOMS[this.room.dirs[dir]!.goto]!;
                const say = ("say" in this.room.dirs[dir]! ? this.room.dirs[dir].say + "\n\n" : "") + gotoRoom.short + "\n" + gotoRoom.long;

                this.room = gotoRoom;

                return say;
            }
        } else {
            return "You cannot go " + dir + ".";
        }
    }
}