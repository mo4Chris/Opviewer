



export class E2eRandomTools {
    getRandomInt(min = 0, max = 100): number {
        return Math.floor(min + Math.random() * (max - min + 1));
    }

    getRandomNumber(min = 0, max = 100): number {
        return min + Math.random() * (max - min);
    }

    getRandomString(length = 10) {
        var string = '';
        var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz' //Include numbers if you want
        for (let i = 0; i < length; i++) {
            string += letters.charAt(Math.floor(Math.random() * letters.length));
        }
        return string;
    } 
}
