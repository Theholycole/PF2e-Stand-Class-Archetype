// Stand numbers, with no Foundry dependency so tests can run them in Node.
// Eidolon rules from Archives of Nethys: Eidolons (Rules ID 3682), Attribute Modifiers and Defenses (Rules ID 3684),
// Summoner (Classes ID 77). Grade rules from the Stand User class feature (content/features.mjs) and the book.

export const STATS = ["power", "speed", "range", "durability", "precision", "potential"];
export const STAT_LABELS = { power: "Power", speed: "Speed", range: "Range", durability: "Durability", precision: "Precision", potential: "Potential" };
export const GRADES = ["A", "B", "C", "D", "E"];
export const SPREAD = ["A", "B", "C", "C", "D", "E"];
export const ATTRS = ["str", "dex", "con", "int", "wis", "cha"];

/** The 7 stand types: base attributes besides Str/Dex, skills, senses, sizes, suggested attacks and grade limits. */
export const TYPES = {
    "close-range-power-stand": {
        label: "Close-range power", attrs: { con: 2, int: -1, wis: 1, cha: 1 }, skills: ["athletics", "intimidation"], senses: ["low-light-vision"],
        sizes: ["med", "sm"], attacks: [["Fist", "bludgeoning"], ["Kick", "bludgeoning"]],
        rule: "Power or Speed must take the A. Range can't be A or B.",
        check: (g) => (g.power === "A" || g.speed === "A") && !["A", "B"].includes(g.range),
    },
    "long-range-stand": {
        label: "Long-range", attrs: { con: 0, int: 1, wis: 2, cha: 0 }, skills: ["stealth", "survival"], senses: ["darkvision"],
        sizes: ["med", "sm"], attacks: [["Tendril", "bludgeoning"], ["Whip", "slashing"]],
        rule: "Range takes the A. Power can't be above C.",
        check: (g) => g.range === "A" && ["C", "D", "E"].includes(g.power),
    },
    "automatic-stand": {
        label: "Automatic", attrs: { con: 3, int: -2, wis: 1, cha: 1 }, skills: ["athletics", "stealth"], senses: [],
        sizes: ["sm", "tiny"], attacks: [["Ram", "bludgeoning"], ["Bite", "piercing"]],
        rule: "Durability must be A or B. Precision must be D.",
        check: (g) => ["A", "B"].includes(g.durability) && g.precision === "D",
    },
    "colony-stand": {
        label: "Colony", attrs: { con: 1, int: 0, wis: 1, cha: 1 }, skills: ["acrobatics", "thievery"], senses: ["low-light-vision"],
        sizes: ["med"], attacks: [["Many Hands", "bludgeoning"], ["Tiny Weapons", "piercing"]],
        rule: "Precision or Speed must take the A. Power can't be A.",
        check: (g) => (g.precision === "A" || g.speed === "A") && g.power !== "A",
    },
    "bound-stand": {
        label: "Bound", attrs: { con: 2, int: 0, wis: 1, cha: 0 }, skills: ["crafting", "thievery"], senses: ["low-light-vision"],
        sizes: ["tiny", "sm", "med", "lg"], attacks: [["Blade", "slashing"], ["Hilt", "bludgeoning"]],
        rule: "Durability must be A or B. Speed can't be A.",
        check: (g) => ["A", "B"].includes(g.durability) && g.speed !== "A",
    },
    "integrated-stand": {
        label: "Integrated", attrs: { con: 2, int: 0, wis: 0, cha: 1 }, skills: ["acrobatics", "athletics"], senses: [],
        sizes: ["user"], attacks: [["Fist", "bludgeoning"], ["Body Weapon", "piercing"]],
        rule: "Range must be E. Durability can't be E.",
        check: (g) => g.range === "E" && g.durability !== "E",
    },
    "evolving-stand": {
        label: "Evolving", attrs: { con: 1, int: 1, wis: 1, cha: 0 }, skills: ["occultism"], senses: ["low-light-vision"],
        sizes: ["med", "sm"], attacks: [["Fist", "bludgeoning"], ["Tail", "bludgeoning"]],
        rule: "Any spread.",
        check: () => true,
    },
};

/** The eidolon's primary attack choices (AoN Rules 3682). */
export const PRIMARY = {
    maneuver: { label: "1d8, with disarm, nonlethal, shove or trip", die: 8, traits: [] },
    fatal: { label: "1d6, fatal d10", die: 6, traits: ["fatal-d10"] },
    forceful: { label: "1d6, forceful and sweep", die: 6, traits: ["forceful", "sweep"] },
    deadly: { label: "1d6, deadly d8 and finesse", die: 6, traits: ["deadly-d8", "finesse"] },
};
export const MANEUVERS = ["disarm", "nonlethal", "shove", "trip"];

export const TETHER = { A: "1 mile", B: "500 feet", C: "100 feet", D: "30 feet", E: "10 feet" };
const SPEED_INIT = { A: 2, B: 1, C: 0, D: -1, E: -2 };
const SPEED_FEET = { A: 10, B: 5, C: 0, D: 0, E: 0 };
// Precision: A +1, E -1. B and D round toward C (+0), as the simulator does.
const PRECISION = { A: 1, B: 0, C: 0, D: 0, E: -1 };
const GUARD = { A: 2, B: 1 };
// Potential: bonus evolution feats [at 1st, at 11th].
const POTENTIAL = { A: [2, 0], B: [1, 1], C: [1, 0], D: [0, 1], E: [0, 0] };

/** Problems with a grade spread for a stand type (empty when legal). */
export function gradeProblems(type, grades) {
    const out = [];
    const given = STATS.map((s) => grades[s]).filter(Boolean);
    if (given.length < STATS.length) out.push("Grade all six stats.");
    else if ([...given].sort().join("") !== [...SPREAD].sort().join("")) out.push("Use exactly one A, one B, two C, one D and one E.");
    const t = TYPES[type];
    if (!t) out.push("Choose a stand type.");
    else if (given.length === STATS.length && !t.check(grades)) out.push(`${t.label}: ${t.rule}`);
    return out;
}

const rank = (lv, steps) => steps.reduce((r, [from, value]) => (lv >= from ? value : r), 0);
const PROF = { 1: 2, 2: 4, 3: 6, 4: 8 };

/** Apply one attribute boost: +1, or half a step once the modifier is +4 or more. */
function boost(mods, partial, attr) {
    if (mods[attr] >= 4) {
        if (partial[attr]) { mods[attr] += 1; partial[attr] = false; }
        else partial[attr] = true;
    } else mods[attr] += 1;
}

/** Attribute modifiers at a level: key +4, the other of Str/Dex +2, the type's line, 4 boosts at 5/10/15/20, +1 at 17. */
export function attributes({ type, key, level, boosts = {}, transcend }) {
    const mods = { str: 0, dex: 0, ...TYPES[type].attrs };
    mods[key] = 4;
    mods[key === "str" ? "dex" : "str"] = 2;
    const partial = {};
    for (const at of [5, 10, 15, 17, 20]) {
        if (level < at) continue;
        if (at === 17) {
            if (transcend) mods[transcend] += 1;
            continue;
        }
        const picks = boosts[at]?.length === 4 ? boosts[at] : defaultBoosts(key);
        for (const a of picks) boost(mods, partial, a);
    }
    return mods;
}
export const defaultBoosts = (key) => [key, key === "str" ? "dex" : "str", "con", "wis"];

/** Every number the stand actor needs. */
export function standStats(b) {
    const lv = b.level;
    const g = b.grades;
    const a = attributes(b);
    const unarmed = PROF[rank(lv, [[1, 1], [5, 2], [13, 3]])];
    const defense = PROF[rank(lv, [[1, 1], [11, 2], [19, 3]])];
    const prec = PRECISION[g.precision] ?? 0;
    const spec = lv >= 15 ? 6 : lv >= 13 ? 3 : lv >= 7 ? 2 : 0;
    const cap = b.key === "str" ? 3 : 4;
    const itemAC = b.key === "str" ? 2 : 1;
    const p = PRIMARY[b.primary.form] ?? PRIMARY.maneuver;
    const shift = g.power === "A" ? 1 : ["D", "E"].includes(g.power) ? -1 : 0;
    const dice = [4, 6, 8, 10, 12];
    const die = dice[Math.max(0, Math.min(dice.length - 1, dice.indexOf(p.die) + shift))];
    const strike = (name, die, traits, damageType) => {
        const finesse = traits.includes("finesse");
        const attr = finesse ? Math.max(a.str, a.dex) : a.str;
        const bonus = a.str + spec;
        return { name, bonus: lv + unarmed + attr + prec, damage: `1d${die}${bonus ? (bonus > 0 ? "+" : "") + bonus : ""}`, damageType, traits: ["unarmed", ...traits] };
    };
    const primaryTraits = [...p.traits, ...(b.primary.form === "maneuver" ? [b.primary.maneuver ?? "shove"] : [])];
    return {
        level: lv,
        attributes: a,
        ac: 10 + lv + defense + Math.min(a.dex, cap) + itemAC,
        saves: {
            fortitude: lv + PROF[rank(lv, [[1, 2], [11, 3]])] + a.con,
            reflex: lv + PROF[rank(lv, [[1, 1], [9, 2]])] + a.dex,
            will: lv + PROF[rank(lv, [[1, 2], [15, 3]])] + a.wis,
        },
        perception: lv + PROF[rank(lv, [[1, 1], [3, 2]])] + a.wis,
        speed: 25 + (SPEED_FEET[g.speed] ?? 0),
        strikes: [
            strike(b.primary.name || "Primary", die, primaryTraits, b.primary.damageType),
            strike(b.secondary.name || "Secondary", 6, ["agile", "finesse"], b.secondary.damageType),
        ],
        user: { initiative: SPEED_INIT[g.speed] ?? 0, guard: GUARD[g.durability] ?? 0, standDC: prec },
        tether: TETHER[g.range],
        potential: POTENTIAL[g.potential] ?? [0, 0],
    };
}
