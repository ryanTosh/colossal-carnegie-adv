import { Item } from "./item";
import { Room } from "./room";

export interface Prog {
    initialPrintout: string;

    rooms: { [id: string]: Room };
    startingRoom: string;

    items: { [id: string]: Item };
}