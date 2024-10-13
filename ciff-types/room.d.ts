export type Dir = "north" | "east" | "south" | "west" | "up" | "down";

interface RoomDir {
    goto?: string;
    say?: string;

    isDoor: boolean;
    isOpen?: boolean;
    keyItem?: string | null;
    sayIfClosed?: string;
    sayOnOpen?: string;
    sayOnNoItem?: string;
    sayOnWrongItem?: string;
    sayOnClose?: string;
}

interface RoomItem {
    itemId: string,
    dropped: boolean
}

interface ItemBriefings {
    dropped?: string,
    undropped?: string
}

export interface Room {
    short: string;
    printout: string;

    dirs: { [dir in Dir]?: RoomDir };
    facing?: string;

    items: RoomItem[];
    itemBriefings: { [itemId: string]: ItemBriefings };
}
