export type Dir = "north" | "east" | "south" | "west" | "up" | "down";

interface RoomDir {
    goto: string | null;
    say?: string;
}

export interface Room {
    id: string;
    short: string;
    long: string;

    dirs: { [dir in Dir]?: RoomDir };
}