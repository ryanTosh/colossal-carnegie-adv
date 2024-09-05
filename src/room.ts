export interface Room {
    id: string;
    name: string;
    description: string;

    north?: string;
    east?: string;
    south?: string;
    west?: string;
    up?: string;
    down?: string;
}