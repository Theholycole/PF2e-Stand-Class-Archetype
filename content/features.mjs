// Stand User class archetype: the 1st-level key feature, Manifest Stand, the stand body, the 7 stand types and
// their 7th- and 13th-level features. Rules text follows the "Stand User class" tab of Cole's design doc.
import { action, feat, grantAtLevel, slugify, uuidFor } from "../tools/lib/items.mjs";
import { enrichBlock } from "../tools/lib/enrich.mjs";
const enrichBlockNoDice = (md) => enrichBlock(md, { damage: false });

const P = "stand-features";
const E = "stand-effects";
const PF2E = {
    eidolon: "Compendium.pf2e.classfeatures.Item.qOEpe596B0UjhcG0",
    summonerSpellcasting: "Compendium.pf2e.classfeatures.Item.gWcN75VNpSZ4FqNb",
    spellRepertoire: "Compendium.pf2e.classfeatures.Item.1RfnAiyQ5FR7vnuH",
    signatureSpells: "Compendium.pf2e.classfeatures.Item.VKRjmXxBFLrJK01c",
    instantManifestation: "Compendium.pf2e.classfeatures.Item.H0iWhiyP0QqgmAKs",
    actTogether: "Compendium.pf2e.actionspf2e.Item.2KV87ponbWXgGIhZ",
    shareSenses: "Compendium.pf2e.actionspf2e.Item.3ZzoI9MTtJFd1Kjl",
};
const link = (pack, slug, label) => `@UUID[${uuidFor(pack, slug)}]{${label}}`;

const TYPES = [
    {
        name: "Close-Range Power Stand",
        size: "Medium or Small",
        attacks: "fist (bludgeoning), kick (bludgeoning)",
        attributes: "Con +2, Int –1, Wis +1, Cha +1",
        skills: "Athletics, Intimidation",
        senses: "low-light vision",
        grades: "Power or Speed must take the A. Range can't be A or B, so the stand stays close.",
        examples: "Star Platinum, Crazy Diamond, The World",
        gameplay:
            "You fight side by side with your stand and hit hardest within 10 feet (Point-Blank Power, Point-Blank Fury). The type feats make you a reactive brawler: Bullet Catch (4) stops shots, Retaliation Rush (6) punishes crits, Undying Barrage (12) improves rushes and pushes foes back, and Stolen Seconds (14) gives a once-a-day extra turn. Of the class feats, Barrage Rush, Stand Guard and Golden Spirit fit best. The price is that you and your stand stay close together, right where area attacks and flanking hurt. **Pick this if** you want to punch hard up close and live in the thick of the fight.",
        initial: ["Point-Blank Power", "While your stand is within 10 feet of you, its primary attack gains the forceful trait (or +1 status bonus to damage if it already has forceful). Beyond 10 feet it uses its Power grade as one step lower."],
        seventh: ["Point-Blank Fury", "Stand Strikes deal 1 extra damage die against creatures adjacent to you."],
        thirteenth: ["Blinding Speed", "Once per round, the stand can use a reaction to Strike a creature that enters its reach, while the stand is within 10 feet of you."],
    },
    {
        name: "Long-Range Stand",
        size: "Medium or Small",
        attacks: "tendril (bludgeoning), whip (slashing)",
        attributes: "Con +0, Int +1, Wis +2, Cha +0",
        skills: "Stealth, Survival",
        senses: "darkvision",
        grades: "Range takes the A (1 mile tether). Power can't be above C.",
        examples: "Hierophant Green, Hermit Purple",
        gameplay:
            "You stay back while your stand scouts and fights far away. Stand Senses (1) and Far Eyes let you see through it at any distance, and Remote Strike (8) lets it attack at full range, but its damage drops beyond 60 feet and Power is capped at C. Distant Precision (7) adds a damage die against foes that aren't next to you, rewarding you for staying back. Your Stand Ability carries more of the load, so Second Wind of Will and Ability Mastery are strong class feats, and Precise Hands lets it pick locks or treat allies from afar. The price is that while you look through the stand, your own body is helpless. **Pick this if** you want to scout, strike from safety and win with information and your Stand Ability.",
        initial: ["Remote Eyes", "You can Seek and Point Out through the stand's senses anywhere in its range. While you do, you're off-guard in your own body until your next turn."],
        seventh: ["Far Eyes", "Stand range doubles and you share its senses at any distance. Distant Precision: the stand's Strikes deal 1 extra damage die against creatures that aren't adjacent to you."],
        thirteenth: ["Long Arm", "You can Manifest the stand anywhere in its range, and your Stand Ability's range doubles."],
    },
    {
        name: "Automatic Stand",
        size: "Small or Tiny",
        attacks: "ram (bludgeoning), bite (piercing)",
        attributes: "Con +3, Int –2, Wis +1, Cha +1",
        skills: "Athletics, Stealth",
        senses: "program sense (imprecise, 60 feet, for the one stimulus its program tracks)",
        grades: "Durability must be A or B. Precision must be D.",
        examples: "Sheer Heart Attack, Black Sabbath, Notorious B.I.G",
        gameplay:
            "You set the stand loose on a program and let it hunt while you do other things. It acts even on turns you don't Act Together, Mark points it at the enemy that matters, Feed the Program trades one of your actions for a second stand action, Set Program (6) sends it beyond your range without sharing damage, Relentless Program and Undying Program make it hard to stop out of your sight, and a Set Program stand turns Autonomous: nearly impossible to beat head-on, so enemies have to starve its program or come for you. Its Precision is low and it attacks allies who match the program, so choosing the program and keeping allies clear is the skill. Class feats like Stand Cry and Stand Guard keep you useful while it works. **Pick this if** you want a relentless hunter that keeps up pressure without your attention, and you're happy to manage the risk to your allies.",
        initial: [
            "Program",
            "When you Manifest the stand, give it one program: heat, movement, the creature that last damaged you, or a marked creature. You gain the Mark and Feed the Program actions. On a turn you don't Act Together, the stand still spends 1 action at the end of your turn to Stride toward or Strike the nearest creature that matches, allies included. To call it off: if no creature matching the program is within the stand's senses, spend 1 action (concentrate) on your turn to end or swap the program. Otherwise it takes 2 actions (concentrate) to force it to stop. The stand stays manifested either way. Once the end-of-turn action starts it can't be stopped, so plan before you end your turn. The Set Program feat is stricter: that stand can't be recalled until no matching target remains, except by spending 3 actions to force it to stop.",
        ],
        seventh: ["Relentless Program", "Out of your sight, the stand stops sharing damage with you: it has its own Hit Points equal to 5 × your level (damage to it doesn't reach you) and gains +2 to saves. **Autonomous:** while it runs a Set Program (the Set Program feat), it also gains resistance to all damage equal to twice your level (half that against force, spirit and ghost touch), immunity to mental, fear and death effects and to grabbed, restrained, paralyzed, slowed and stunned, +3 to hit, Strikes that roll damage dice equal to your level (minimum 8), and it never retreats. When an Autonomous stand is destroyed, it reforms at the start of its own next turn with half its Hit Points. While you're out of its sight you can't Act Together with it, but Feed the Program still works from any distance (your action gives it a second action that turn). **Starving the program:** if no creature matching its program is within its 60-foot program sense at the start of its turn, it is dormant and does nothing that turn; after 2 dormant turns in a row it unmanifests. **The user:** if you are knocked out, killed or forced to call it off, it loses these benefits and unmanifests."],
        thirteenth: ["Undying Program", "When your stand is destroyed while out of your sight, it reforms at the start of your next turn with full Hit Points, even if you are out of its range. An Autonomous stand (Set Program) reforms at the start of its own next turn with full Hit Points, every time: only starving the program or dealing with you ends it."],
        actions: ["mark", "feed-the-program"],
    },
    {
        name: "Colony Stand",
        size: "Medium (made of Tiny units)",
        attacks: "many hands (bludgeoning), tiny weapons (piercing)",
        attributes: "Con +1, Int +0, Wis +1, Cha +1",
        skills: "Acrobatics, Thievery",
        senses: "low-light vision",
        grades: "Precision or Speed must take the A. Power can't be A.",
        examples: "Harvest, Bad Company, Sex Pistols",
        gameplay:
            "Your stand is a swarm of tiny units that gets everywhere. It shares spaces with enemies, flanks from inside them and does two small jobs with one action. Swarm Split (2) puts it in two places, Spread Thin shrugs off single Strikes from 1st level, Overwhelm (7) hits everyone in a 15-foot area (20 feet at 13), allies included, and Endless Colony (16) brings lost units back. Area damage is its weakness. Precise Hands and Barrage Rush are good class feats for it. **Pick this if** you want to control space, set up flanks and handle many small tasks at once, and can keep the swarm out of area attacks.",
        initial: ["Many Hands", "The stand can share spaces with other creatures, flank from inside an enemy's space, and Interact twice with a single action as long as both are within its reach. It has weakness to area damage equal to half your level (minimum 1). Spread Thin: against single-target Strikes, the stand's ghostly resistance increases by half your level."],
        seventh: ["Overwhelm", "The stand fills a 15-foot area and its Strike hits everyone there, allies included (basic Reflex instead of an attack roll)."],
        thirteenth: ["Swarm Tide", "Overwhelm's area grows to 20 feet."],
    },
    {
        name: "Bound Stand",
        size: "the size of its vessel (minimum Tiny)",
        attacks: "the vessel's form (blade, wheel, hull)",
        attributes: "Con +2, Int +0, Wis +1, Cha +0",
        skills: "Crafting, Thievery",
        senses: "low-light vision",
        grades: "Durability must be A or B. Speed can't be A.",
        examples: "Anubis, Emperor, Strength, Wheel of Fortune",
        gameplay:
            "Your stand lives inside an object: a weapon, a tool, later a vehicle. You fight with the bound weapon using the stand's numbers, Hidden in Plain Sight (4) lets it ambush from inside objects, Vessel Bond gives the vessel Hardness and lets you act through it anywhere in range, and Living Vessel lets it jump between objects. Vessel Guard lets the vessel take blows for you, and it can't be disarmed while the stand is out, but if the vessel is broken the stand shuts off. Stand Guard and Precise Hands fit well. **Pick this if** you want a haunted-weapon or living-object fantasy built on ambushes and object tricks.",
        initial: ["Vessel", "Each day, bind the stand to one object you hold or touch. When you Strike with a bound weapon, you can use the stand's attack modifier and damage. If the vessel is destroyed or taken from you, the stand unmanifests until you Manifest it into a new vessel. While the stand is manifested, the vessel can't be disarmed or taken from you against your will. The vessel has Hardness equal to half your level (minimum 1). Vessel Guard: reaction, once per round, when a Strike hits you, the vessel takes the blow and you reduce the damage by the vessel's Hardness."],
        seventh: ["Vessel Bond", "The vessel's Hardness becomes equal to your level, and you act through it anywhere in range."],
        thirteenth: ["Living Vessel", "Spend 1 action to move the stand into a new object, or bind it to a vehicle."],
    },
    {
        name: "Integrated Stand",
        size: "your size",
        attacks: "fist (bludgeoning), body weapon (as the stand's form)",
        attributes: "Con +2, Int +0, Wis +0, Cha +1",
        skills: "Acrobatics, Athletics",
        senses: "your senses",
        grades: "Range must be E. Durability can't be E.",
        examples: "Oasis, Catch the Rainbow",
        gameplay:
            "You wear your stand and fight as one body. While merged, your own Strikes use its numbers, you share its ghostly resistance, Second Skin adds AC and Athletics, Stand Armor (8) turns its Durability into defense, and Full Merge saves you actions. It can't scout or flank on its own, since its Range is E. Barrage Rush, Stand Guard and Golden Spirit are good class feats for it. **Pick this if** you want to be the fighter yourself, with one sturdy body to protect instead of two.",
        initial: ["Worn Stand", "Spend 1 action to merge the stand with you, or to separate it into an adjacent space. While merged, it shares your space, your unarmed Strikes use the stand's attack modifier and damage, and Act Together actions happen from your space. While merged, you share the stand's ghostly body: you gain its ghostly resistance (half your level, minimum 1, to all damage except force, spirit and ghost touch)."],
        seventh: ["Second Skin", "While merged, you gain +1 status bonus to AC and Athletics."],
        thirteenth: ["Full Merge", "Once per turn, a stand action costs you no action, but the stand can't leave your space that round."],
        actions: ["worn-stand"],
    },
    {
        name: "Evolving Stand",
        size: "Medium or Small (each Act can change it)",
        attacks: "fist (bludgeoning), tail (bludgeoning)",
        attributes: "Con +1, Int +1, Wis +1, Cha +0",
        skills: "Occultism, plus one skill of your choice",
        senses: "low-light vision",
        grades: "any spread. Each Act can use its own spread with the same letters.",
        examples: "Echoes Acts 1 to 3, Tusk Acts 1 to 4",
        gameplay:
            "Your stand grows into new Acts, each a different Stand Ability from the same theme, and you switch between them for 1 action. It has no type-only feats and no combat perk. Instead it gets the most Stand Abilities (three by 13th level), and it can retrain evolution feats or swap stat grades as you level. Class feats that power up Stand Abilities (Second Wind of Will, Ability Mastery, Stand Apex) give it the most value. **Pick this if** you want the biggest toolbox and like solving each problem with the right Act more than raw fighting power.",
        initial: ["Growing Spirit", "When you gain a level, you can retrain one evolution feat or swap two of your stand's stat grades."],
        seventh: ["Act Two", "A second Stand Ability from Act One's theme, with every step up to your level. Switching Acts takes 1 action."],
        thirteenth: ["Act Three", "A third Stand Ability from the same theme."],
        actions: ["switch-acts"],
    },
];

function typeFeature(t, which, level) {
    const [name, text] = t[which];
    const rules = [];
    let description = enrichBlockNoDice(text);
    if (t.name === "Evolving Stand" && level > 1) {
        const flag = level === 7 ? "actTwo" : "actThree";
        rules.push(
            { key: "ChoiceSet", flag, prompt: "Choose a Stand Ability from Act One's theme", choices: { itemType: "feat", filter: ["item:tag:stand-ability"] }, adjustName: false },
            { key: "GrantItem", uuid: `{item|flags.system.rulesSelections.${flag}}` },
        );
    }
    if (name === "Second Skin") description += `<p>${link(E, "effect-worn-stand", "Effect: Worn Stand")} includes this bonus once you're 7th level.</p>`;
    return feat(P, {
        name,
        slug: slugify(name) in ACTIONS ? `${slugify(name)}-feature` : undefined,
        level,
        traits: ["summoner", "stand"],
        tags: ["stand-type-feature"],
        description: `<p><em>${t.name} feature, ${level === 1 ? "1st" : `${level}th`} level.</em></p>${description}`,
        rules,
    });
}

const ACTIONS = {
    mark: action(P, {
        name: "Mark",
        actions: 1,
        traits: ["concentrate", "stand"],
        description: enrichBlockNoDice(
            "**Requirements** Your automatic stand (or sub-stand) is manifested.\n\nMark a creature you can see. If the stand's program is \"a marked creature\", it pursues that creature until it dies or you Mark another.",
        ),
    }),
    "feed-the-program": action(P, {
        name: "Feed the Program",
        actions: 1,
        traits: ["concentrate", "stand"],
        frequency: { max: 1, per: "turn" },
        description: enrichBlockNoDice(
            "**Frequency** once per turn\n\n**Requirements** Your automatic stand (or sub-stand) is manifested.\n\nThe stand's end-of-turn action becomes 2 actions this turn (for example Stride and Strike). This keeps the same 4 actions a turn a summoner gets from Act Together, just split differently.",
        ),
    }),
    "worn-stand": action(P, {
        name: "Worn Stand",
        actions: 1,
        traits: ["concentrate", "stand"],
        selfEffect: { uuid: uuidFor(E, "effect-worn-stand"), name: "Effect: Worn Stand" },
        description: enrichBlockNoDice(
            "**Requirements** You have an integrated stand.\n\nMerge the stand with you, or separate it into an adjacent space. While merged, it shares your space, your unarmed Strikes use the stand's attack modifier and damage, and Act Together actions happen from your space. While merged, you gain the stand's ghostly resistance.",
        ),
    }),
    "switch-acts": action(P, {
        name: "Switch Acts",
        actions: 1,
        traits: ["concentrate", "stand"],
        description: enrichBlockNoDice(
            "**Requirements** You have an evolving stand with at least two Acts.\n\nYour stand changes to another Act it has unlocked. Only the current Act's Stand Ability works until you switch again; the stand's stat grades can change with it.",
        ),
    }),
};

export function standFeatures() {
    const items = [...Object.values(ACTIONS)];
    const typeItems = [];
    for (const t of TYPES) {
        const initial = typeFeature(t, "initial", 1);
        const seventh = typeFeature(t, "seventh", 7);
        const thirteenth = typeFeature(t, "thirteenth", 13);
        items.push(initial, seventh, thirteenth);
        const desc = [
            `<p><strong>Traits</strong> Eidolon, Stand · <strong>Size</strong> ${t.size} · <strong>Suggested Attacks</strong> ${t.attacks}</p>`,
            `<p><strong>Stand Attributes</strong> ${t.attributes} · <strong>Skills</strong> ${t.skills} · <strong>Senses</strong> ${t.senses} · <strong>Speed</strong> 25 feet</p>`,
            `<p><strong>Grades</strong> ${t.grades}</p>`,
            `<p><strong>Examples</strong> ${t.examples}</p>`,
            `<hr />${enrichBlockNoDice(t.gameplay)}<hr />`,
            `<p><strong>Initial (1st)—${t.initial[0]}</strong> ${enrichBlockNoDice(t.initial[1]).replace(/^<p>|<\/p>$/g, "")}</p>`,
            `<p><strong>7th—${t.seventh[0]}</strong> ${enrichBlockNoDice(t.seventh[1]).replace(/^<p>|<\/p>$/g, "")}</p>`,
            `<p><strong>13th—${t.thirteenth[0]}</strong> ${enrichBlockNoDice(t.thirteenth[1]).replace(/^<p>|<\/p>$/g, "")}</p>`,
            t.actions ? `<p>Actions: ${t.actions.map((a) => `@UUID[${uuidFor(P, a)}]{${ACTIONS[a].name}}`).join(", ")}</p>` : "",
        ].join("\n");
        const typeItem = feat(P, {
            name: t.name,
            traits: ["summoner", "stand"],
            tags: ["stand-type"],
            description: desc,
            rules: [
                grantAtLevel(uuidFor(P, initial.system.slug), 1),
                grantAtLevel(uuidFor(P, seventh.system.slug), 7),
                grantAtLevel(uuidFor(P, thirteenth.system.slug), 13),
                ...(t.actions ?? []).map((a) => grantAtLevel(uuidFor(P, a), 1)),
                { key: "RollOption", domain: "all", option: `stand-type:${slugify(t.name).replace(/-stand$/, "")}` },
            ],
        });
        typeItems.push(typeItem);
        items.push(typeItem);
    }

    const manifest = action(P, {
        name: "Manifest Stand",
        actions: 1,
        traits: ["concentrate", "occult", "stand"],
        category: "interaction",
        description: enrichBlockNoDice(
            [
                "Your stand appears in an open space adjacent to you, and can then take a single action. If your stand was already manifested, you unmanifest it instead.",
                "The stand must stay within its Range grade of you (its tether: A 1 mile, B 500 feet, C 100 feet, D 30 feet, E 10 feet) and can't willingly go beyond it. If forced beyond that distance, or if you are reduced to 0 Hit Points or your stand is destroyed, the stand unmanifests, and you need to use Manifest Stand to manifest it again.",
                "**Special** This replaces Manifest Eidolon, which takes 3 actions.",
            ].join("\n\n"),
        ),
    });
    items.push(manifest);

    const body = action(P, {
        name: "Ghostly Stand Body",
        actionType: "passive",
        actions: null,
        category: "defensive",
        traits: ["stand"],
        tags: ["stand-body"],
        description: enrichBlockNoDice(
            [
                "*Put this on your stand's actor, not on the Stand User.*",
                "A stand is ghostly. It has resistance to all damage equal to half its level (minimum 1), except force, spirit and ghost touch damage, and its unarmed Strikes have the ghost touch property, so stands hurt each other and ghosts at full strength.",
            ].join("\n\n"),
        ),
        rules: [
            { key: "Resistance", type: "all-damage", value: "max(1,floor(@actor.level/2))", exceptions: ["force", "ghost-touch", "spirit"] },
            { key: "AdjustStrike", mode: "add", property: "property-runes", value: "ghost-touch", definition: ["item:category:unarmed"] },
        ],
    });
    items.push(body);

    const transcendence = feat(P, {
        name: "Stand Transcendence",
        level: 17,
        traits: ["summoner", "stand"],
        description: enrichBlockNoDice("As Eidolon Transcendence, your stand raises one attribute modifier by 1. Your stand DC also becomes master (Master Stand)."),
    });
    const instinct = feat(P, {
        name: "Stand Instinct",
        level: 19,
        traits: ["summoner", "stand"],
        description: enrichBlockNoDice(
            "When you roll initiative, you can Manifest your stand as a free action. Once per round, when you Act Together, the stand can Stride 10 feet as part of the first action. This replaces Instant Manifestation.",
        ),
    });
    items.push(transcendence, instinct);

    const standUser = feat(P, {
        name: "Stand User",
        traits: ["summoner"],
        tags: ["stand-user"],
        img: "icons/magic/control/silhouette-aura-energy.webp",
        suppressedFeatures: [PF2E.eidolon, PF2E.summonerSpellcasting, PF2E.spellRepertoire, PF2E.signatureSpells, PF2E.instantManifestation],
        description: [
            enrichBlockNoDice(
                [
                    "*Summoner class archetype.* Your eidolon is a Stand: a visible spirit of your own will with one unique power.",
                    "**You don't gain** an eidolon, the summoner's spellcasting (spell slots, spell repertoire and cantrips), Signature Spells, or Instant Manifestation at 19th level. This feature turns those off on your sheet. Add it **before** the Summoner class so the Eidolon choice never pops up, or pick any eidolon when asked and this feature hides it.",
                    "**You keep** everything else in the summoner: shared Hit Points, Act Together, the tether rule (now set by your stand's Range grade), link spells, evolution feats, and every proficiency increase for you and your companion.",
                    "**Stand.** Choose a stand type below. Your stand keeps the eidolon's rules: shared HP, eidolon proficiencies, Str or Dex key attribute, two unarmed attacks (the Power grade shifts the primary attack's die one size up at A, one size down at D and E). Grade its six stats at creation (one A, one B, two C, one D, one E). A stand with Durability A or B also guards you: while it's adjacent to you, you gain a +2 (A) or +1 (B) circumstance bonus to AC. Give the stand's actor the Ghostly Stand Body feature.",
                    "**Stand Ability.** Pick one Stand Ability; its theme becomes your stand's theme. Its always-on part is at will, like a cantrip. Surges cost Stand Points. Saves use your **stand DC** (10 + your level + your spellcasting proficiency + Charisma; expert at 9th level, master at 17th).",
                    "**Stand Points.** Your focus pool is called Stand Points. It starts at 2 (1 for link spells, 1 more replacing your spell slots), maximum 3. Stand User gives you both points, since the suppressed eidolon no longer hands out the link spell; a link spell or focus spell you add by hand still counts, up to the maximum of 3. Refocus regains 1. Link spells and Stand Ability surges share it.",
                    "**Stand builder.** When you add this feature, the module offers a stand builder that asks every question: type, name, size, key attribute, the six grades (with your type's limits), both attacks and attribute boosts. It creates your stand's actor with its numbers and puts an Effect: Stand Grades on you (initiative from Speed, guard from Durability, stand DC from Precision). Post Manifest Stand to chat for Build stand or Rebuild stand buttons. The stand updates itself when you level up.",
                    "**2nd level:** you must take Stand User Dedication as your 2nd-level class feat.",
                ].join("\n\n"),
            ),
            `<p>Granted: ${link(P, "manifest-stand", "Manifest Stand")}, @UUID[${PF2E.actTogether}]{Act Together}, @UUID[${PF2E.shareSenses}]{Share Senses}, ${link(P, "stand-transcendence", "Stand Transcendence")} (17th), ${link(P, "stand-instinct", "Stand Instinct")} (19th).</p>`,
        ].join("\n"),
        rules: [
            { key: "SpecialStatistic", slug: "stand", label: "Stand DC", type: "check", extends: "base-spellcasting", attribute: "cha" },
            { key: "ActiveEffectLike", mode: "upgrade", path: "system.proficiencies.spellcasting.rank", value: 2, predicate: [{ gte: ["self:level", 9] }] },
            { key: "ActiveEffectLike", mode: "upgrade", path: "system.proficiencies.spellcasting.rank", value: 3, predicate: [{ gte: ["self:level", 17] }] },
            { key: "ActiveEffectLike", mode: "add", path: "system.resources.focus.max", value: 2, priority: 10 },
            { key: "ActiveEffectLike", mode: "override", path: "flags.system.eidolon.tradition", value: "occult" },
            { key: "ChoiceSet", flag: "standType", prompt: "Choose your stand type", choices: { itemType: "feat", filter: ["item:tag:stand-type"] }, adjustName: false },
            { key: "GrantItem", uuid: "{item|flags.system.rulesSelections.standType}" },
            { key: "ChoiceSet", flag: "standAbility", prompt: "Choose your Stand Ability", choices: { itemType: "feat", filter: ["item:tag:stand-ability"] }, adjustName: false },
            { key: "GrantItem", uuid: "{item|flags.system.rulesSelections.standAbility}" },
            grantAtLevel(uuidFor(P, "manifest-stand"), 1),
            grantAtLevel(PF2E.actTogether, 1, { allowDuplicate: true }),
            grantAtLevel(PF2E.shareSenses, 1, { allowDuplicate: true }),
            grantAtLevel(uuidFor(P, "stand-transcendence"), 17),
            grantAtLevel(uuidFor(P, "stand-instinct"), 19),
        ],
    });
    items.push(standUser);
    return items;
}

export { P as FEATURES_PACK };
