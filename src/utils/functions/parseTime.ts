export default function parseTime(
    time: string | number,
    returnUnit: "s" | "ms" = "ms",
    shouldRound: boolean = true
): number | null {
    if (typeof time !== "string" && typeof time !== "number") {
        throw new TypeError("'time' must be a string or number");
    }

    const timeUnits: { [key: string]: number } = {
        y: 31536000000,
        mon: 2628002880,
        w: 604800000,
        d: 86400000,
        h: 3600000,
        min: 60000,
        s: 1000,
        ms: 1
    };

    if (typeof time === "number") {
        return returnUnit === "s" ? time / 1000 : time;
    } else {
        const Hash = new Map<string, number>();

        time.split(" ").forEach((x) => {
            if (x.endsWith("y")) {
                Hash.set("y", Number(x.split("y")[0]) * timeUnits.y);
            }
            if (x.endsWith("mon") || x.endsWith("M")) {
                Hash.set("mon", Number(x.split("mon")[0].split("M")[0]) * timeUnits.mon);
            }
            if (x.endsWith("w")) {
                Hash.set("w", Number(x.split("w")[0]) * timeUnits.w);
            }
            if (x.endsWith("d")) {
                Hash.set("d", Number(x.split("d")[0]) * timeUnits.d);
            }
            if (x.endsWith("h") || x.endsWith("hr")) {
                Hash.set("h", Number(x.split("h")[0].split("hr")[0]) * timeUnits.h);
            }
            if (x.endsWith("min") || x.endsWith("m")) {
                Hash.set("min", Number(x.split("min")[0].split("m")[0]) * timeUnits.min);
            }
            if (x.endsWith("s") && !x.endsWith("ms")) {
                Hash.set("s", Number(x.split("s")[0]) * timeUnits.s);
            }
            if (x.endsWith("ms")) {
                Hash.set("ms", Number(x.split("ms")[0]) * timeUnits.ms);
            }
        });

        const ms = Array.from(Hash.values()).reduce((a, b) => a + b, 0);
        const result = returnUnit === "s" ? ms / 1000 : ms;

        return Hash.size === 0 ? null : shouldRound ? Math.round(result) : result;
    }
}
