import { Item } from "../../ciff-types/item";

export function parseItems(itemsSrc: string): { [id: string]: Item } {
    const items: { [id: string]: Item } = {};

    for (const itemSrc of itemsSrc.replace(/\r/g, "").split("\n\n")) {
        const rows = itemSrc.split("\n");

        const id = rows[0].split(" ")[0];
        const short = rows[0].split(" ").slice(1).join(" ");
        const inspect = rows[1];

        const nouns = rows[2].split(",").map(n => n.trim());

        if (id in items) {
            throw "Duplicate item ID '" + id + "'";
        }
        
        items[id] = {
            short,
            inspect,

            nouns
        };
    }

    return items;
}