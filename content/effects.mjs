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
        text: "Your stand is merged with you. Your unarmed Strikes use the stand's attack modifier and damage, and Act Together actions happen from your space. You can still Act Together while merged: the stand's action happens from your space, through your body (a Strike with its numbers, a Stand Ability, or another stand action), and if it Strides it carries you with it. You and the stand share one multiple attack penalty. From 7th level (Second Skin) you gain +1 status bonus to Athletics.",
        duration: UNLIMITED,
        rules: [
            { key: "FlatModifier", selector: "athletics", type: "status", value: 1, predicate: [{ gte: ["self:level", 7] }], label: "Second Skin" },
        ],
    },
    {
        name: "Effect: Stand Cry",
        from: "Stand Cry",
        text: "+1 status bonus to attack rolls.",
        duration: MINUTE,
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
        text: "+1 circumstance bonus to AC (+2 from 9th level). Creatures that hit you with a melee Strike take cold damage equal to your level. From 5th level you skate: +10-foot status bonus to Speed on flat ground. You can't swim while wearing it.",
        duration: UNLIMITED,
        rules: [
            { key: "FlatModifier", selector: "ac", type: "circumstance", value: "ternary(gte(@actor.level,9),2,1)" },
            { key: "FlatModifier", selector: "land-speed", type: "status", value: 10, predicate: [{ gte: ["self:level", 5] }] },
        ],
    },
    {
        name: "Effect: Slime Armor",
        from: "Devouring Flesh",
        text: "Resistance to physical damage equal to your level (to all damage from 17th). Creatures that hit you in melee take acid damage equal to your level.",
        duration: UNLIMITED,
        rules: [
            { key: "Resistance", type: "physical", value: "@actor.level", predicate: [{ lt: ["self:level", 17] }] },
            { key: "Resistance", type: "all-damage", value: "@actor.level", predicate: [{ gte: ["self:level", 17] }] },
        ],
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
        text: "You're locked by guilt: apply the frightened value from the save. From the locker's 13th level, you can't take reactions while locked. Helping the creature you hurt ends the lock.",
        rules: [],
    },
    {
        name: "Effect: Doom Mark",
        from: "Doom Mark",
        text: "Weakness to all damage equal to half the marker's level (minimum 2), or the marker's level from 17th. Until the start of the marker's next turn on a success, 1 minute on a failure or when surged. From the marker's 9th level, you're also off-guard to its stand.",
        rules: [
            pick("weakness", "Doom Mark weakness (half the marker's level, minimum 2; its level from 17th)", [2, 3, 4, 5, 6, 7, 8, 9, 10, 17, 18, 19, 20]),
            { key: "Weakness", type: "all-damage", value: "@item.flags.system.rulesSelections.weakness" },
        ],
    },
    {
        name: "Effect: Lucky Direction",
        from: "Fortune Directions",
        text: "+1 status bonus to attack rolls and saves until the start of your next turn (+2 from 17th level). Put it on you and your stand.",
        rules: [
            pick("bonus", "Bonus (+2 from 17th level)", [1, 2]),
            { key: "FlatModifier", selector: "attack", type: "status", value: "@item.flags.system.rulesSelections.bonus" },
            { key: "FlatModifier", selector: "saving-throw", type: "status", value: "@item.flags.system.rulesSelections.bonus" },
        ],
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
        text: "–1 status penalty to checks and DCs (–2 on a critical failure). 1 round on a success, 1 minute on a failure. Throwing the coin away (Interact) ends it.",
        rules: [
            pick("penalty", "Penalty (2 on a critical failure)", [1, 2]),
            { key: "FlatModifier", selector: "check", type: "status", value: "-@item.flags.system.rulesSelections.penalty" },
            { key: "FlatModifier", selector: "dc", type: "status", value: "-@item.flags.system.rulesSelections.penalty" },
        ],
    },
    {
        name: "Effect: Back Rider",
        from: "Back Rider",
        text: "A stand rides your back unseen: you take –2 to attack rolls against that stand while it rides. From the rider's 13th level, you can't reduce your frightened value below 1 while it rides.",
        duration: UNLIMITED,
        rules: [{ key: "FlatModifier", selector: "attack", type: "status", value: -2, predicate: ["target:trait:stand"] }],
    },
    {
        name: "Effect: Air Bubble Wall",
        from: "Air Shots",
        text: "Standard cover from the air bubble wall: +2 circumstance bonus to AC against ranged attacks from the other side (and to Reflex saves against areas from there; apply by hand).",
        duration: MINUTE,
        rules: [{ key: "FlatModifier", selector: "ac", type: "circumstance", value: 2, predicate: ["item:ranged"] }],
    },
    {
        name: "Effect: Replayed Action",
        from: "Replay",
        text: "+2 status bonus to AC and saves against the replayed creature, until the end of the replayer's next turn (1 minute from its 17th level).",
        rules: [
            { key: "FlatModifier", selector: "ac", type: "status", value: 2 },
            { key: "FlatModifier", selector: "saving-throw", type: "status", value: 2 },
        ],
    },
    {
        name: "Effect: Storm Weather",
        from: "Weather",
        text: "Rain or wind: the area is difficult terrain for you, and your ranged attacks take –2 (the weather user chooses who is hindered).",
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
