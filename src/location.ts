export class Location {
    private name: string;
    private description: string;

    public dirs: { [dir: string]: Location };

    constructor(name: string, description: string) {
        this.name = name;
        this.description = description;
    }
}