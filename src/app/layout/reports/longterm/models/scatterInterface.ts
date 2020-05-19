
export interface ComprisonArrayElt {
    x: string;
    y: string;
    graph: string;
    xLabel: string;
    yLabel: string;
    dataType: string;
    info?: string;
    annotation?: () => {};
    barCallback?: (data: RawScatterData | SOVRawScatterData) => {x: any, y: any}[];
}

export interface RawScatterData {
    _id: number;
    label: string[];
    date: number[];
    queryFields: {[prop: string]: string};
    groups?: any[];
}

export interface SOVRawScatterData {
    _id: string;
    label: string[];
    turbine: null | RawScatterData;
    platform: null | RawScatterData;
}
