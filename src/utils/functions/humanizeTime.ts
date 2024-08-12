export default function humanizeTime(
    duration: number,
    unit: "s" | "ms" = "ms",
    language: "en" | "fr" = "en"
): string | undefined {
    const timeUnits = {
        en: {
            y: "year",
            mon: "month",
            w: "week",
            d: "day",
            h: "hour",
            min: "minute",
            s: "second",
            ms: "millisecond"
        },
        fr: {
            y: "an",
            mon: "mois",
            w: "semaine",
            d: "jour",
            h: "heure",
            min: "minute",
            s: "seconde",
            ms: "milliseconde"
        }
    };

    const timeMultipliers: { [key: string]: number } = {
        y: 365 * 24 * 60 * 60 * 1000,
        mon: 30 * 24 * 60 * 60 * 1000,
        w: 7 * 24 * 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
        h: 60 * 60 * 1000,
        min: 60 * 1000,
        s: 1000,
        ms: 1
    };

    let totalMs = unit === "s" ? duration * 1000 : duration;

    const timeValues: { [key: string]: number } = {
        y: 0,
        mon: 0,
        w: 0,
        d: 0,
        h: 0,
        min: 0,
        s: 0,
        ms: 0
    };

    for (const key of Object.keys(timeValues)) {
        if (totalMs >= timeMultipliers[key]) {
            timeValues[key] = Math.floor(totalMs / timeMultipliers[key]);
            totalMs -= timeValues[key] * timeMultipliers[key];
        }
    }

    const parts: string[] = [];
    for (const key of Object.keys(timeValues)) {
        if (timeValues[key] > 0) {
            const unit = timeUnits[language][key as keyof typeof timeUnits.en];
            const isPlural = timeValues[key] > 1;
            parts.push(`${timeValues[key]} ${unit}${isPlural ? "s" : ""}`.replace("ss", "s"));
        }
    }

    const lastPart = parts.pop();
    return parts.length > 0 ? parts.join(", ") + (language === "en" ? " and " : " et ") + lastPart : lastPart;
}
