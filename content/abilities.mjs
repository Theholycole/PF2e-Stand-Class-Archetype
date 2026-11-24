// Stand Abilities: one class feature per ability, parsed from content/stand-abilities.md. Inline rolls come from
// tools/lib/enrich.mjs; extra rule elements and effect links for some abilities are listed here.
import fs from "node:fs";
import { feat, slugify, uuidFor } from "../tools/lib/items.mjs";
import { enrichBlock, enrichLine } from "../tools/lib/enrich.mjs";

const P = "stand-abilities";
const E = "stand-effects";
const effectLink = (name) => `@UUID[${uuidFor(E, slugify(name))}]{${name}}`;

/** Effects an ability's text points to. */
const EFFECTS = {
    Accelerate: ["Effect: Accelerated World"],
    Disguise: ["Effect: Disguise"],
    Shapeshift: ["Effect: Object Form"],
    Soften: ["Effect: Softened Armor"],
    "Ice Armor": ["Effect: Ice Armor"],
    "Devouring Flesh": ["Effect: Slime Armor"],
    Parasite: ["Effect: Talking Parasite"],
    "Guilt Lock": ["Effect: Guilt Lock"],
    "Doom Mark": ["Effect: Doom Mark"],
    "Fortune Directions": ["Effect: Lucky Direction", "Effect: Unlucky Square"],
    "Cursed Wealth": ["Effect: Cursed Wealth"],
    "Back Rider": ["Effect: Back Rider"],
    "Air Shots": ["Effect: Air Bubble Wall"],
    Replay: ["Effect: Replayed Action"],
    Weather: ["Effect: Storm Weather"],
    Lightning: ["Effect: Drained Power"],
    "Iron Blood": ["Effect: Iron Camouflage"],
    "Rage Field": ["Effect: Rage Field"],
};

/** Always-on rule elements on the ability itself. */
const RULES = {
    Accelerate: [{ key: "FlatModifier", selector: "all-speeds", type: "status", value: 5, label: "Accelerate" }],
    "Time Stop": [
        {
            key: "SpecialResource",
            slug: "time-stop",
            label: "Time Stop charges",
            max: "ternary(gte(@actor.level,17),3,ternary(gte(@actor.level,9),2,1))",
        },
        { key: "FlatModifier", selector: "initiative", type: "status", value: 1, predicate: [{ gte: ["self:level", 5] }], label: "Time Stop" },
    ],
    "Time Skip": [{ key: "RollTwice", selector: "initiative", keep: "higher", predicate: [{ gte: ["self:level", 5] }] }],
    "Scent Tracking": [{ key: "FlatModifier", selector: "survival", type: "circumstance", value: 2, predicate: ["action:track"], label: "Scent Tracking" }],
};

/** Damage type for D and S when the step doesn't name one. */
const DAMAGE_TYPE = { Flame: "fire", Ice: "cold", "Air Shots": "bludgeoning", "Melting Dart": "acid", Spin: "piercing", Lightning: "electricity", "Iron Blood": "slashing", Virus: "poison", "Dream Realm": "mental" };

/** Abilities only one stand type can take (Cole's pick). */
const LOCKED = {
    Disassemble: "automatic",
    "Melting Dart": "automatic",
    "Ice Armor": "integrated",
    "Devouring Flesh": "integrated",
};

function parse() {
    const md = fs.readFileSync(new URL("./stand-abilities.md", import.meta.url), "utf8");
    const out = [];
    let theme = null;
    for (const block of md.split(/^(?=##+ )/m)) {
        const head = block.match(/^(##+) (.+)$/m);
        if (!head) continue;
        if (head[1] === "##") {
            theme = head[2].trim();
            continue;
        }
        const name = head[2].trim();
        const body = block.slice(head[0].length).trim();
        const [first, ...rest] = body.split("\n");
        out.push({ name, theme, intro: first.trim(), steps: rest.join("\n").trim() });
    }
    return out;
}

export function standAbilities() {
    return parse().map((a) => {
        const lock = LOCKED[a.name];
        const themeSlug = slugify(a.theme);
        const effects = EFFECTS[a.name] ?? [];
        const description = [
            `<p><em>${enrichLine(a.intro)}</em></p>`,
            `<p><strong>Theme</strong> ${a.theme}${lock ? ` · <strong>Stand type</strong> ${lock} only` : ""}</p><hr />`,
            enrichBlock(a.steps, { type: DAMAGE_TYPE[a.name] }),
            effects.length ? `<hr /><p><strong>Effects</strong> ${effects.map(effectLink).join(", ")}</p>` : "",
            `<p><em>Defaults: Stand, Occult and Concentrate traits; a surge costs 1 Stand Point and 2 actions unless listed; ranges are measured from your stand; untyped damage is force; saves use your stand DC. A minion an ability makes, unless it says otherwise, is a creature of your level – 2 built with GM Core's Low numbers (Building Creatures), with the minion trait.</em></p>`,
        ].join("\n");
        return feat(P, {
            name: a.name,
            traits: ["stand"],
            tags: ["stand-ability", `stand-theme-${themeSlug}`, ...(lock ? [`stand-only-${lock}`] : [])],
            prerequisites: lock ? [`${lock} stand`] : [],
            img: "icons/magic/symbols/runes-star-pentagon-blue.webp",
            description,
            rules: RULES[a.name] ?? [],
            flags: { theme: a.theme },
        });
    });
}

export { P as ABILITIES_PACK };
