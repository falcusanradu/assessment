export interface House {
    coords: Coordinates;
    params: Parameters;
    street: string;
    distanceTo?: number;

}
export interface Coordinates {
    lat: number;
    lon: number;
}

export interface Parameters {
    rooms: number;
    value: number;
}
