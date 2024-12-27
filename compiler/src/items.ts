import type { Item } from "../../ciff-types/item";

export function parseItems(itemsSrc: string, namespace: string[], usedIds: Set<string>): { [id: string]: Item } {
    const nsString = namespace.map(n => n + ".").join("");
    const items: { [id: string]: Item } = {};

    for (const itemSrc of itemsSrc.replace(/\r/g, "").split("\n\n")) {
        const rows = itemSrc.split("\n");

        const id = nsString + rows[0].split(" ")[0];
        const short = rows[0].split(" ").slice(1).join(" ");
        const inspect = rows[1];

        const nouns = rows[2].split(",").map(n => n.trim());

        if (id in items || usedIds.has(id)) {
            throw "Duplicate item ID '" + id + "'";
        }

        const actions: Item['actions'] = {};

        for (let propRow of rows.slice(3)) {
            propRow = propRow.replace(/\s+/g, " ").trim();

            const noteIndex = propRow.indexOf("NOTE");

            if (noteIndex != -1) {
                console.warn(propRow.slice(noteIndex));

                propRow = propRow.slice(0, noteIndex).trim();
            }

            if (propRow == "") continue;

            const words = propRow.split(" ");

            switch (words[0]) {
                case "read":
                    if ("read" in actions) {
                        actions.read += "\n" + words.slice(1).join(" ");
                    } else {
                        actions.read = words.slice(1).join(" ");
                    }

                    break;
                default:
                    throw "Unknown prop '" + words[0] + "'";
            }
        }
        
        items[id] = {
            short,
            inspect,

            nouns,

            actions
        };
    }

    return items;
}