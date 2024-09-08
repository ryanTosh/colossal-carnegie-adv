import { Prog } from "./common/prog";

export function validateProg(prog: Prog) {
    for (const roomId in prog.rooms) {
        const room = prog.rooms[roomId];

        for (const [dir, roomDir] of Object.entries(room.dirs)) {
            if (roomDir.goto != null) {
                if (!(roomDir.goto in prog.rooms)) {
                    console.warn("MISSING_ROOM " + roomDir.goto + " (" + roomId + "." + dir + ")");
                }
            }
        }
    }
}