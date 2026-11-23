// Effects that Stand Abilities and stand feats link to. Each one carries the rule elements for its bonus or penalty;
// conditions use PF2e's own condition items, linked from the ability text instead.
import { effect } from "../tools/lib/items.mjs";

const P = "stand-effects";
const ROUND = { value: 1, unit: "rounds", expiry: "turn-end", sustained: false };
const MINUTE = { value: 1, unit: "minutes", expiry: "turn-end", sustained: false };
const UNLIMITED = { value: -1, unit: "unlimited", expiry: null, sustained: false };
const pick = (flag, prompt, values) => ({
    key: "ChoiceSet",
    flag,
    prompt,
    choices: values.map((v) => ({ label: String(v), value: v })),
});

const DEFS = [
    {
        name: "Effect: Worn Stand",
        from: "Integrated stand (Worn Stand, Second Skin)",
        text: "Your stand is merged with you. Your unarmed Strikes use the stand's attack modifier and damage, and Act Together actions happen from your space. From 7th level (Second Skin) you gain +1 status bonus to AC and Athletics.",
        duration: UNLIMITED,
        rules: [
            { key: "FlatModifier", selector: "ac", type: "status", value: 1, predicate: [{ gte: ["self:level", 7] }], label: "Second Skin" },
            { key: "FlatModifier", selector: "athletics", type: "status", value: 1, predicate: [{ gte: ["self:level", 7] }], label: "Second Skin" },
        ],
    },
    {
        name: "Effect: Stand Cry",
        from: "Stand Cry",
        text: "+1 status bonus to attack rolls.",
        duration: ROUND,
        rules: [{ key: "FlatModifier", selector: "attack", type: "status", value: 1 }],
    },
    {
        name: "Effect: Stand Guard",
        from: "Stand Guard",
        text: "Resistance to all damage equal to your level against the triggering hit. Remove this effect after that hit.",
        duration: ROUND,
        rules: [{ key: "Resistance", type: "all-damage", value: "@actor.level" }],
    },
    {
        name: "Effect: Accelerated World",
        from: "Accelerate",
        text: "–10-foot penalty to Speed. Applied to creatures that fail the Will save.",
        rules: [{ key: "FlatModifier", selector: "all-speeds", type: "status", value: -10 }],
    },
    {
        name: "Effect: Disguise",
        from: "Disguise",
        text: "+4 status bonus to Deception checks to Impersonate the person whose face you wear.",
        duration: UNLIMITED,
        rules: [{ key: "FlatModifier", selector: "deception", type: "status", value: 4, predicate: ["action:impersonate"] }],
    },
    {
        name: "Effect: Object Form",
        from: "Shapeshift",
        text: "You're an object. You can't move or attack. From 5th level you have resistance to all damage equal to your level while shaped.",
        duration: UNLIMITED,
        rules: [{ key: "Resistance", type: "all-damage", value: "@actor.level", predicate: [{ gte: ["self:level", 5] }] }],
    },
    {
        name: "Effect: Softened Armor",
        from: "Soften",
        text: "Your armor is rubbery: –2 status penalty to AC. (If the stand softened your weapon instead, its damage is halved; apply that by hand.)",
        duration: MINUTE,
        rules: [{ key: "FlatModifier", selector: "ac", type: "status", value: -2 }],
    },
    {
        name: "Effect: Ice Armor",
        from: "Ice Armor",
        text: "+1 status bonus to AC. Creatures that hit you with a melee Strike take 1 cold damage per die of your stand's Strike. From 5th level you skate: +10-foot status bonus to Speed on flat ground. You can't swim while wearing it.",
        duration: UNLIMITED,
        rules: [
            { key: "FlatModifier", selector: "ac", type: "status", value: 1 },
            { key: "FlatModifier", selector: "land-speed", type: "status", value: 10, predicate: [{ gte: ["self:level", 5] }] },
        ],
    },
    {
        name: "Effect: Slime Armor",
        from: "Devouring Flesh",
        text: "Resistance to physical damage equal to half your level (your level from 17th). Creatures that hit you in melee take 1 acid damage per die of your stand's Strike.",
        duration: UNLIMITED,
        rules: [{ key: "Resistance", type: "physical", value: "ternary(gte(@actor.level,17),@actor.level,max(1,floor(@actor.level/2)))" }],
    },
    {
        name: "Effect: Talking Parasite",
        from: "Parasite",
        text: "A parasite face grows on you: –2 status penalty to Deception and Stealth checks.",
        duration: MINUTE,
        rules: [
            { key: "FlatModifier", selector: "deception", type: "status", value: -2 },
            { key: "FlatModifier", selector: "stealth", type: "status", value: -2 },
        ],
    },
    {
        name: "Effect: Guilt Lock",
        from: "Guilt Lock",
        text: "–1 status penalty to attack rolls. From 13th level, it also can't take reactions while locked. Helping the creature it hurt ends the lock.",
        rules: [{ key: "FlatModifier", selector: "attack", type: "status", value: -1 }],
    },
    {
        name: "Effect: Doom Mark",
        from: "Doom Mark",
        text: "Weakness to all damage: 1, or 2 from the marker's 9th level, or 3 from 17th. The mark lasts 1 round, or 1 minute when surged.",
        rules: [
            pick("weakness", "Doom Mark weakness (1, 2 at 9th, 3 at 17th)", [1, 2, 3]),
            { key: "Weakness", type: "all-damage", value: "@item.flags.system.rulesSelections.weakness" },
        ],
    },
    {
        name: "Effect: Lucky Direction",
        from: "Fortune Directions",
        text: "+1 status bonus to one check toward your lucky direction this turn (+2 from 17th level).",
        rules: [pick("bonus", "Bonus (+2 from 17th level)", [1, 2]), { key: "FlatModifier", selector: "check", type: "status", value: "@item.flags.system.rulesSelections.bonus" }],
    },
    {
        name: "Effect: Unlucky Square",
        from: "Fortune Directions",
        text: "You're attacking from a square your foe marked as unlucky: –2 status penalty to attack rolls from it.",
        rules: [{ key: "FlatModifier", selector: "attack", type: "status", value: -2 }],
    },
    {
        name: "Effect: Cursed Wealth",
        from: "Cursed Wealth",
        text: "–1 status penalty to checks. Lasts 1 round (1 minute from the giver's 9th level).",
        rules: [{ key: "FlatModifier", selector: "check", type: "status", value: -1 }],
    },
    {
        name: "Effect: Back Rider",
        from: "Back Rider",
        text: "A stand rides your back unseen. From the rider's 13th level, you take –2 to attack rolls against that stand while it rides.",
        duration: UNLIMITED,
        rules: [{ key: "FlatModifier", selector: "attack", type: "status", value: -2, predicate: ["target:trait:stand"] }],
    },
    {
        name: "Effect: Air Bubble Wall",
        from: "Air Shots",
        text: "+2 circumstance bonus to AC against ranged attacks.",
        rules: [{ key: "FlatModifier", selector: "ac", type: "circumstance", value: 2, predicate: ["item:ranged"] }],
    },
    {
        name: "Effect: Replayed Action",
        from: "Replay",
        text: "+2 status bonus to AC against the replayed creature.",
        rules: [{ key: "FlatModifier", selector: "ac", type: "status", value: 2 }],
    },
    {
        name: "Effect: Storm Weather",
        from: "Weather",
        text: "Rain or wind: the area is difficult terrain, and ranged attacks take –2.",
        duration: MINUTE,
        rules: [{ key: "FlatModifier", selector: "attack", type: "status", value: -2, predicate: ["item:ranged"] }],
    },
    {
        name: "Effect: Drained Power",
        from: "Lightning",
        text: "Put this on your stand: +2 status bonus to its Strike damage.",
        duration: MINUTE,
        rules: [{ key: "FlatModifier", selector: "strike-damage", type: "status", value: 2 }],
    },
    {
        name: "Effect: Iron Camouflage",
        from: "Iron Blood",
        text: "You can Hide against metal or stone walls without cover, with +2 circumstance bonus to Stealth.",
        duration: UNLIMITED,
        rules: [{ key: "FlatModifier", selector: "stealth", type: "circumstance", value: 2, predicate: ["action:hide"] }],
    },
    {
        name: "Effect: Rage Field",
        from: "Rage Field",
        text: "You see every creature's strength: –1 status penalty to Will saves against fear and emotion effects.",
        rules: [{ key: "FlatModifier", selector: "will", type: "status", value: -1, predicate: [{ or: ["item:trait:fear", "item:trait:emotion"] }] }],
    },
];

export function standEffects() {
    return DEFS.map((d) =>
        effect(P, {
            name: d.name,
            duration: d.duration ?? ROUND,
            traits: ["stand"],
            description: `<p>${d.text}</p><p><em>From ${d.from}.</em></p>`,
            rules: d.rules,
        }),
    );
}

export { P as EFFECTS_PACK };
