export type Dir = "north" | "east" | "south" | "west" | "up" | "down";

interface RoomDir {
    goto: string | null;
    say?: string;
}

interface RoomItem {
    itemId: string;
    briefing?: string;
}

export interface Room {
    short: string;
    printout: string;

    dirs: { [dir in Dir]?: RoomDir };

    items: RoomItem[];
}
