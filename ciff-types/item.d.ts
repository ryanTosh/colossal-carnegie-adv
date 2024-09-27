export interface Item {
    short: string;
    inspect: string;

    nouns: string[];

    actions: {
        read?: string;
    };
}