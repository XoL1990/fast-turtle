export class Helpers {
    public static rgbToHex(r: number, g: number, b: number) {
        return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
    }

    private static componentToHex(c: number) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }
}