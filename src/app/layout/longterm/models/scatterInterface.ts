
export interface ComprisonArrayElt {
    x: string;
    y: string;
    graph: string;
    xLabel: string;
    yLabel: string;
    dataType: string;
    info?: string;
    annotation?: () => {};
}

export interface RawScatterData {
    _id: number;
    label: string[];
    xVal: number[];
    yVal: number[];
}
