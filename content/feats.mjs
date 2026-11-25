// Stand User class feats, Stand User Dedication, Sub-Stand, and the Heaven Ascension mythic destiny.
// Text follows the feat table in the main tab and the Stand User class tab of Cole's design doc.
import { feat, uuidFor } from "../tools/lib/items.mjs";
import { enrichBlock } from "../tools/lib/enrich.mjs";

const P = "stand-feats";
const E = "stand-effects";
const F = "stand-features";
const eff = (slug, label) => `@UUID[${uuidFor(E, slug)}]{${label}}`;

// [level, name, stand type or null, actions ("1", "2", "reaction", "free" or null), text, extra]
const CLASS_FEATS = [
    [1, "Barrage Rush", null, "2", "**Frequency** once per turn\n\n**Requirements** Your stand is within 10 feet of you.\n\nYour stand makes 3 Strikes at one target with the normal multiple attack penalty (never better than a monk's Flurry of Blows). If two or more of them hit, combine their damage for resistances and weaknesses. The stand's range stays 10 feet until your next turn."],
    [1, "Stand Guard", null, "reaction", `**Trigger** An attack would hit you while your stand is adjacent to you.\n\nYour stand steps in front. You gain resistance to all damage equal to your level against that hit (${eff("effect-stand-guard", "Effect: Stand Guard")}).`],
    [1, "Stand Senses", "long-range", null, "You can perceive through the stand anywhere within its range. While you do, you're blinded and off-guard in your own body."],
    [2, "Precise Hands", null, null, "Your stand can Interact, and can attempt Thievery or Medicine checks, using its Precision bonus."],
    [2, "Swarm Split", "colony", "1", "Split the colony into two squads in spaces up to 30 feet apart, still one creature with one set of Hit Points and actions. It can Strike or Interact from either space, and it counts as being in both spaces for flanking. Rejoining takes 1 action, or happens when you Dismiss or unmanifest it."],
    [2, "Stand Assist", null, null, "Your stand can help with skill checks. It can prepare to Aid and use the Aid reaction (your reaction) for an ally's skill check while that ally is within its reach, rolling your own modifier for the skill. During exploration, it can Aid one ally's skill check once per 10 minutes without preparing first."],
    [4, "Bullet Catch", "close-range", "reaction", "**Trigger** A ranged attack would hit you or an ally adjacent to your stand.\n\nYour stand grabs the shot. Attempt a check with the stand's attack modifier against the attacker's attack roll result; on a success, the hit becomes a miss."],
    [4, "Second Wind of Will", null, null, "Your Stand Points maximum increases by 1 (up to the normal maximum of 3).", { rules: [{ key: "ActiveEffectLike", mode: "add", path: "system.resources.focus.max", value: 1, priority: 10 }] }],
    [4, "Hidden in Plain Sight", "bound", "1", "Your stand hides inside an object (it's undetected until it acts). When it comes out to Strike, the target is off-guard to it until the end of your turn."],
    [4, "Stand Scout", null, null, "Your stand can Scout or Search for your group from up to 60 feet ahead (anywhere in its range for a long-range stand) while you travel with the group. Scouting gives the usual +1 circumstance bonus to initiative. When it Searches, the GM rolls your secret Seek check from the stand's space. If the group walks into a hazard or ambush the stand was searching for, the stand triggers it first and takes its effect instead of the first creature in line."],
    [6, "Stand Expertise", null, null, "You become expert in both skills your stand type grants (trained first if you weren't). At 14th level you become master in one of them. This grants no other skill increases, so a rogue stays ahead in skills."],
    [6, "Set Program", "automatic", null, "Give the stand one simple trigger (heat, movement or sound). It acts alone beyond range and stops sharing damage, but attacks anything that matches, allies included, and can't be recalled until no target remains, except by spending 3 actions (concentrate) to force it to stop."],
    [6, "Retaliation Rush", "close-range", "reaction", "**Trigger** An enemy within 10 feet hits you with a Strike.\n\nYour stand uses Barrage Rush against it. You're off-guard until your next turn."],
    [8, "Stand Cry", null, "free", `**Trigger** You Manifest your stand.\n\nShout your stand's name: you and allies within 30 feet gain +1 status bonus to attack rolls for 1 minute (${eff("effect-stand-cry", "Effect: Stand Cry")}).`],
    [8, "Stand Armor", "integrated", null, "While your stand is merged with you (Worn Stand), its Durability guards you: Durability A gives +2 circumstance bonus to AC and resistance to physical damage equal to your level, Durability B gives +1 and half your level (minimum 1). It still acts through Act Together."],
    [8, "Remote Strike", "long-range", null, "Your stand's Strikes have a reach of 60 feet (its tendrils lash out from its space). Beyond 60 feet, up to its range, it can still Strike, but its damage die drops to d4."],
    [10, "Stand Duo", null, null, "Once per round, when your stand hits a creature, one ally adjacent to that creature can use its reaction to Strike it. If that ally has a stand, eidolon or companion, that creature can Strike instead."],
    [12, "Ability Mastery", null, null, "Once per 10 minutes, you can use a Stand Ability surge without spending a Stand Point.", { frequency: { max: 1, per: "PT10M" } }],
    [12, "Undying Barrage", "close-range", null, "Barrage Rush's third Strike uses the second Strike's multiple attack penalty, and each hit pushes the target 5 feet."],
    [14, "Stolen Seconds", "close-range", "free", "**Frequency** once per day\n\nTake a full extra turn while time stops for everyone else. The daily limit is its price, so it has no other condition.", { frequency: { max: 1, per: "day" } }],
    [16, "Endless Colony", "colony", null, "When the stand is destroyed, it re-forms from surviving units at the start of your next turn with half its Hit Points, once per 10 minutes. Its weakness to area damage is halved."],
    [18, "Golden Spirit", null, "free", "**Trigger** You would be reduced to 0 Hit Points.\n\n**Frequency** once per day\n\nYou stay up at 1 Hit Point and gain temporary Hit Points equal to twice your level until the end of your next turn, and you take a full turn with your stand. Then you fall as normal unless you were healed."],
    [20, "Stand Apex", null, null, "Your stand's best stat goes beyond A (+1 more to that stat's bonus), and once per day a surge costs no Stand Point and uses your stand DC + 2."],
];

const HEAVEN = [
    [12, "Eternal Will", "free", "**Frequency** once per encounter\n\n**Cost** all your remaining Mythic Points (none needed if you have none)\n\n**Trigger** You would drop to 0 HP.\n\nYou stay up with Hit Points equal to half your maximum, and your stand gets 2 actions right now. (Modeled on a mythic creature's Undying Myth. Heaven Ascension Dedication grants this feat.)"],
    [14, "Mythic Stand", null, "Your stand's Strikes deal weapon specialization damage of 12 instead of their normal specialization damage, as Mythic Weapon Specialization does for a mythic-proficiency Strike."],
    [14, "Return to Zero", "reaction", "**Cost** 1 Mythic Point\n\n**Frequency** once per round\n\n**Trigger** An attack, spell or effect you can see coming targets you or your stand.\n\nIt never happens; its user still spends the actions."],
    [14, "Soul Shuffle", "2", "**Cost** 1 Mythic Point\n\n30-foot emanation, Will save (incapacitation): on a failure a creature's soul is shuffled with a random creature in the area for 1 round (1 minute on a critical failure): it's confused, and when it attacks it uses the other creature's Strike."],
    [16, "Universal Acceleration", "1", "**Cost** 1 Mythic Point\n\nFor 1 minute you're quickened (Stride, Strike or a stand action), and foes within 60 feet can't take reactions against you."],
    [16, "Infinite Rotation", null, "**Cost** 1 Mythic Point, when your stand hits\n\nThe target takes the Strike's damage dice again at the start of each of its turns until it dies, leaves the plane, or the rotation is counteracted."],
    [18, "Love Train", "3", "**Cost** 2 Mythic Points\n\nFor 1 minute, damage and harmful conditions that would hit you go to a creature of your choice within 120 feet instead. Area effects still reach you, and the light ends if you leave the spot you used it on."],
    [18, "Overwrite Reality", null, "**Cost** 1 Mythic Point, when your stand hits\n\nRewrite one fact: attempt to counteract one spell or magical effect on the target with mythic proficiency, give it a condition at value 2 (frightened, sickened, stupefied, enfeebled or clumsy), or heal an ally for the damage dealt."],
    [20, "Restore Truth", "2", "**Cost** 1 Mythic Point\n\nAttempt to counteract every spell, magical effect and Stand Ability you choose within 60 feet, using mythic proficiency. Each enemy whose effect you end is also stupefied 2 for 1 round."],
    [20, "Requiem", "free", "**Frequency** once per day\n\nAt the start of a round, before anyone acts: rewrite the initiative order however you like for the rest of the fight. For this round, the first attack, spell or ability each enemy uses returns to zero (actions spent, no effect), and you and your allies are quickened (extra action: Stride, Strike or Step)."],
];

function actionFields(a) {
    if (!a) return { actionType: "passive", actions: null };
    if (a === "reaction" || a === "free") return { actionType: a, actions: null };
    return { actionType: "action", actions: Number(a) };
}

export function standFeats() {
    const items = [];
    items.push(
        feat(P, {
            name: "Stand User Dedication",
            category: "class",
            level: 2,
            traits: ["archetype", "class", "dedication", "summoner"],
            prerequisites: ["Stand User class archetype"],
            description: enrichBlock(
                "You become trained in Intimidation, or another skill if you already are. When you Manifest your stand, you can attempt to Demoralize one creature that can see it, as part of the same action. A creature can be affected by this only once per 10 minutes.\n\n*Like the Battle Harbinger's dedication, this is a small flavor perk; the archetype's power is in the stand itself.*",
            ),
            rules: [
                { key: "ActiveEffectLike", mode: "upgrade", path: "system.skills.intimidation.rank", value: 1 },
            ],
        }),
    );
    for (const [level, name, type, a, text, extra] of CLASS_FEATS) {
        items.push(
            feat(P, {
                name,
                category: "class",
                level,
                ...actionFields(a),
                traits: ["summoner", "stand"],
                prerequisites: ["Stand User Dedication", ...(type ? [`${type} stand`] : [])],
                description: enrichBlock(text),
                ...(extra ?? {}),
            }),
        );
    }
    items.push(
        feat(P, {
            name: "Sub-Stand",
            category: "class",
            level: 10,
            traits: ["summoner", "stand"],
            prerequisites: ["Stand User Dedication", "your stand isn't an automatic or colony stand"],
            description: enrichBlock(
                [
                    "Part of your stand can break off and hunt on its own, like Sheer Heart Attack leaving Killer Queen's left hand.",
                    "**Detach Sub-Stand** (1 action, concentrate, 1 Stand Point). Your manifested stand releases a Tiny sub-stand in an adjacent space. It uses the Automatic stand's Program rules, including Mark, Feed the Program and calling it off. It uses your stand's attack modifier, its primary attack (with its normal damage dice), its AC, and Hit Points equal to 5 × your level. Damage to it isn't shared with you, as with any automatic stand. It lasts until it's destroyed, you call it off, or your stand unmanifests. You can have only one sub-stand at a time.",
                    "**Price** While the sub-stand is out, your main stand's Power grade counts one grade lower, and the sub-stand attacks allies who match its program.",
                    "**Theme link** If your Stand Ability can ride on a Strike (for example Bomb Touch's level 5 surge that arms a creature), the sub-stand can use it instead of your stand, still paying the Stand Point.",
                ].join("\n\n"),
            ),
            rules: [
                { key: "GrantItem", uuid: uuidFor(F, "mark") },
                { key: "GrantItem", uuid: uuidFor(F, "feed-the-program") },
            ],
        }),
    );
    items.push(
        feat(P, {
            name: "Heaven Ascension Dedication",
            category: "class",
            level: 12,
            traits: ["destiny", "mythic"],
            rarity: "rare",
            prerequisites: ["Stand User summoner", "mythic", "a Heaven catalyst gained in play"],
            description: enrichBlock(
                [
                    "Your stand ascends. Its ghostly resistance doubles, and it can see invisible and incorporeal creatures. Your stand's Strikes and your stand DC always use mythic proficiency (10 + your level), with no Mythic Point needed. **Heaven's Grace:** you and your stand gain resistance equal to half your level to Strikes and spells from non-mythic creatures. When your stand reduces a creature to 0 Hit Points, you regain 1 Mythic Point (to your maximum of 3). You gain the Eternal Will feat, and your catalyst's free feat: Stand Arrow (Requiem) grants Return to Zero or Soul Shuffle, DIO's Bone (Heaven) grants Universal Acceleration, the Saint's Corpse grants Infinite Rotation or Love Train.",
                    "Against a non-mythic foe, a destiny effect just works; against a mythic foe, you roll a counteract check with mythic proficiency.",
                ].join("\n\n"),
            ),
        }),
    );
    for (const [level, name, a, text] of HEAVEN) {
        items.push(
            feat(P, {
                name,
                category: "class",
                level,
                ...actionFields(a),
                traits: ["mythic", "stand"],
                rarity: "rare",
                prerequisites: ["Heaven Ascension Dedication"],
                description: enrichBlock(text),
            }),
        );
    }
    return items;
}

export { P as FEATS_PACK };
