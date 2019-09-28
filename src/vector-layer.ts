export interface VectorLayer {
    path: Array<[number, number]>;
    closed: boolean;
    style: VectorStyle;
}

export interface VectorStyle {
    thickness: number;
    color: [number, number, number];
}
