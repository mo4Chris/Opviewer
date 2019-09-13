
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
    date: number[];
    queryFields: {[prop: string]: string};
}
