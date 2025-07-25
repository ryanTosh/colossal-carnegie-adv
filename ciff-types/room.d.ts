export type Dir = "north" | "east" | "south" | "west" | "up" | "down" | "northeast" | "northwest" | "southeast" | "southwest";

interface RoomDir {
    goto?: string;
    say?: string;

    nouns: string[];

    isDoor: boolean;
    doorAliasOf?: Dir;
    isOpen?: boolean;
    closeOnUse?: boolean;
    keyItem?: string | null;
    sayOnSightIfOpen?: string;
    sayOnSightIfClosed?: string;
    sayIfClosed?: string;
    sayOnOpen?: string;
    sayOnNoItem?: string;
    sayOnWrongItem?: string;
    sayOnAlreadyOpen?: string;
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

    items: RoomItem[];
    itemBriefings: { [itemId: string]: ItemBriefings };
}
