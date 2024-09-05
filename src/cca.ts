import { Dirs } from "./dirs";
import { Player } from "./player";

import locationsDat from './locations.dat?raw';

function parseLocationsDat(locationsDat: string): Location {

}

const spawn = parseLocationsDat(locationsDat);

export class CCA {
    private silenceCounter: number = 0;

    private location: Location;

    constructor() {
        this.player = new Player(new Location());
    }

    runUserInput(input: string): string {
        const words = input.trim().toLowerCase().split(/\s+/g);

        if (words.length == 0 || words.length == 1 && words[0] == "") {
            return ["Sorry?", "Still didn't catch that.", "Can you speak up?", "One more time?"][this.silenceCounter++] ?? "Out with it!";
        }

        this.silenceCounter = 0;

        switch (words[0]) {
            case "north":
                if (this.location.dirs[Dirs.North] == null) {
                    this.location.moveNorth();

                    return this.player.describeLocation();
                }
            default:
                return "Sorry, I don't know how to '" + words[0] + "'.";
        }
    }
}