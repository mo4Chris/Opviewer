
export class LongtermColorScheme {
    // Provides a consistent use of colors for usage throughout the longterm component
    static backgroundColors = [
        'rgba(44,127,184,1)',
        'rgba(217,95,14,1)',
        'rgba(49,163,84,1)',
        'rgba(197,27,138,1)',
        'rgba(117,107,177,1)',
        'rgba(221,28,119,1)',
        'rgba(240,59,32,1)',
    ];
    static bordercolors = [
        'rgba(44,127,184,1)',
        'rgba(217,95,14,1)',
        'rgba(49,163,84,1)',
        'rgba(197,27,138,1)',
        'rgba(117,107,177,1)',
        'rgba(221,28,119,1)',
        'rgba(240,59,32,1)',
    ];
    static backgroundColorsNiceName = [
        'blue',
        'orange',
        'green',
        'magenta',
        'purple',
        'pink',
        'red'
    ];
    static pointStyles = [
        'circle',
        'rect',
        'triangle',
        'star',
        'crossRot',
        'cross',
        'dash',
        'RectRounded',
    ];
    static borderWidth = [1, 1, 1, 1, 3, 3, 4, 1]; // This is imporant due to the various pointstyles being larger already
    static missingData = 'gray';

    static getNameForColor(rgbaCode: string): string {
        const index = this.backgroundColors.findIndex(color => color === rgbaCode);
        if (index < 0 ) {
            return 'unknown';
        } else {
            return this.backgroundColorsNiceName[index];
        }
    }
}

