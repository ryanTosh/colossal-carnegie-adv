import { Room } from "./room";

export interface Prog {
    initialPrintout: string;

    rooms: { [id: string]: Room };
    startingRoom: string;
}