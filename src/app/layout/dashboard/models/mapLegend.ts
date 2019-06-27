export class mapLegend {
    markers: any[];

    constructor(markers: any[]) {
        this.markers = markers;
    }

    add(marker: any) {
        this.markers.push(marker);
    }
}

export class mapMarkerIcon {
    url: string;
    description: string;
    scaledSize: object;

    constructor(url: string, description: string, scaledSize = {width: 40, height: 40}) {
        this.url = url;
        this.description = description;
        this.scaledSize = scaledSize;
    }
}