



export class E2eRandomTools {
    getRandomInt(min = 0, max = 100): number {
        return Math.round(min + Math.random() * (max - min));
    }

    getRandomNumber(min = 0, max = 100): number {
        return min + Math.random() * (max - min);
    }

    getRandomString(length = 10) {
        let string = '';
        let letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'; // Include numbers if you want
        for (let i = 0; i < length; i++) {
            string += letters.charAt(Math.floor(Math.random() * letters.length));
        }
        return string;
    }
}
