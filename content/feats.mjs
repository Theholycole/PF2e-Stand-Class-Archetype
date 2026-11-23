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
    [1, "Barrage Rush", null, "2", "**Frequency** once per turn\n\n**Requirements** Your stand is within 10 feet of you.\n\nYour stand makes 3 Strikes at one target with the normal multiple attack penalty (never better than a monk's Flurry of Blows). The stand's range stays 10 feet until your next turn."],
    [1, "Stand Guard", null, "reaction", `**Trigger** An attack would hit you while your stand is adjacent to you.\n\nYour stand steps in front. You gain resistance to all damage equal to your level against that hit (${eff("effect-stand-guard", "Effect: Stand Guard")}).`],
    [1, "Stand Senses", "long-range", null, "You can perceive through the stand anywhere within its range. While you do, you're blinded and off-guard in your own body."],
    [2, "Precise Hands", null, null, "Your stand can Interact, and can attempt Thievery or Medicine checks, using its Precision bonus."],
    [2, "Swarm Split", "colony", "1", "Split the colony into two squads that act as one creature with two spaces."],
    [4, "Bullet Catch", "close-range", "reaction", "**Trigger** A ranged attack would hit you or an ally adjacent to your stand.\n\nYour stand grabs the shot. Attempt a check with the stand's attack modifier against the attacker's attack roll result; on a success, the hit becomes a miss."],
    [4, "Second Wind of Will", null, null, "Your Stand Points maximum increases by 1 (up to the normal maximum of 3).", { rules: [{ key: "ActiveEffectLike", mode: "add", path: "system.resources.focus.max", value: 1, priority: 10 }] }],
    [4, "Hidden in Plain Sight", "bound", "1", "Your stand hides inside an object. Its next Strike from the object is made with surprise: the target is off-guard to it."],
    [6, "Set Program", "automatic", null, "Give the stand one simple trigger (heat, movement or sound). It acts alone beyond range and stops sharing damage, but attacks anything that matches, allies included, and can't be recalled until no target remains, except by spending 3 actions (concentrate) to force it to stop."],
    [6, "Retaliation Rush", "close-range", "reaction", "**Trigger** An enemy within 10 feet critically hits you.\n\nYour stand uses Barrage Rush against it. You're off-guard until your next turn."],
    [8, "Stand Cry", null, "free", `**Trigger** You Manifest your stand.\n\nShout your stand's name: you and allies within 30 feet gain +1 status bonus to attack rolls for 1 round (${eff("effect-stand-cry", "Effect: Stand Cry")}).`],
    [8, "Stand Armor", "integrated", null, "Wear the stand: you gain its Durability as AC and resistance, but the stand can't move away or take its own actions while worn."],
    [8, "Remote Strike", "long-range", null, "Your stand attacks at full range with no penalty for distance, but beyond 60 feet its damage die drops to d4."],
    [10, "Stand Duo", null, null, "When an ally uses a Tandem action or Act Together, both stands act."],
    [12, "Ability Mastery", null, null, "Once per 10 minutes, you can use a Stand Ability surge without spending a Stand Point.", { frequency: { max: 1, per: "PT10M" } }],
    [12, "Undying Barrage", "close-range", null, "Barrage Rush's third Strike uses the second Strike's multiple attack penalty, and each hit pushes the target 5 feet."],
    [14, "Stolen Seconds", "close-range", "free", "**Frequency** once per day\n\nTake a full extra turn while time stops for everyone else. The daily limit is its price, so it has no other condition.", { frequency: { max: 1, per: "day" } }],
    [16, "Endless Colony", "colony", null, "Destroyed units return at the start of your turn while at least one survives; area damage hits the stand for half."],
    [18, "Golden Spirit", null, "free", "**Trigger** You would be reduced to 0 Hit Points.\n\nYou stay up for 1 round to act once with your stand, then fall as normal."],
    [20, "Stand Apex", null, null, "Your stand's best stat goes beyond A (+1 more to that stat's bonus), and once per day a surge costs no Stand Point and uses your stand DC + 2."],
];

const HEAVEN = [
    [14, "Mythic Stand", "free", "**Cost** 1 Mythic Point\n\nUntil your next turn, stand Strikes use mythic proficiency and ignore resistance from non-mythic sources."],
    [14, "Eternal Will", "reaction", "**Cost** 1 Mythic Point\n\n**Trigger** You would drop to 0 HP.\n\nStay at 1 HP, and your stand gets 2 actions right now."],
    [14, "Return to Zero", "reaction", "**Cost** 1 Mythic Point\n\n**Frequency** once per round\n\n**Trigger** An attack, spell or effect you can see coming targets you or your stand.\n\nIt never happens; its user still spends the actions."],
    [14, "Soul Shuffle", "2", "**Cost** 1 Mythic Point\n\n30-foot emanation, Will save: on a failure a creature swaps minds with a random creature in the area for 1 round, 1 minute on a critical failure (incapacitation)."],
    [16, "Universal Acceleration", "1", "**Cost** 1 Mythic Point\n\nFor 1 minute you're quickened (Stride, Strike or a stand action), and foes within 60 feet can't take reactions against you."],
    [16, "Infinite Rotation", null, "**Cost** 1 Mythic Point, when your stand hits\n\nThe target takes the Strike's damage dice again at the start of each of its turns until it dies, leaves the plane, or the rotation is counteracted."],
    [18, "Love Train", "3", "**Cost** 2 Mythic Points\n\nFor 1 minute, damage and harmful conditions that would hit you go to a creature of your choice within 120 feet instead. Area effects still reach you, and the light ends if you leave the spot you used it on."],
    [18, "Overwrite Reality", null, "**Cost** 1 Mythic Point, when your stand hits\n\nRewrite one fact: end one effect on the target, give it a condition at value 2 (frightened, sickened, stupefied, enfeebled or clumsy), or heal an ally for the damage dealt."],
    [20, "Restore Truth", "2", "**Cost** 1 Mythic Point\n\nCounteract every reality-altering effect you choose within 60 feet, using mythic proficiency."],
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
                    "**Detach Sub-Stand** (1 action, concentrate, 1 Stand Point). Your manifested stand releases a Tiny sub-stand in an adjacent space. It uses the Automatic stand's Program rules, including Mark, Feed the Program and calling it off. It uses your stand's attack modifier and its secondary attack (1d6, agile, finesse), its AC, and Hit Points equal to 5 × your level. Damage to it isn't shared with you, as with any automatic stand. It lasts until it's destroyed, you call it off, or your stand unmanifests. You can have only one sub-stand at a time.",
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
                    "Your stand ascends. Its ghostly resistance doubles, and it can see invisible and incorporeal creatures. Spend 1 Mythic Point: your stand's next Strike or Stand Ability DC uses mythic proficiency. You also gain your catalyst's free feat: Stand Arrow (Requiem) grants Return to Zero or Soul Shuffle, DIO's Bone (Heaven) grants Universal Acceleration, the Saint's Corpse grants Infinite Rotation or Love Train.",
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
