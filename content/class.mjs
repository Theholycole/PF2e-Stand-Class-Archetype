// "Stand User" as a class choice: the PF2e Summoner class (foundryvtt/pf2e packs/classes/summoner.json) with the
// eidolon, summoner spellcasting, repertoire, signature spells and Instant Manifestation taken out and the Stand User
// feature granted at 1st level, so picking the class never asks for an eidolon. Its slug stays "summoner" so summoner
// and evolution feats, archetypes and PF2e's summoner rules still apply.
import { idFor, uuidFor } from "../tools/lib/items.mjs";

const P = "stand-features";
const SUMMONER_FEATURES = [
        [1, "Evolution Feat", "Compendium.pf2e.classfeatures.Item.IPcdQAwJk0aZe5mg"],
        [1, "Link Spells", "Compendium.pf2e.classfeatures.Item.wguqw300DB5XdD8W"],
        [3, "Shared Vigilance", "Compendium.pf2e.classfeatures.Item.QiMlJ33kNEoyh1M0"],
        [5, "Eidolon Unarmed Expertise", "Compendium.pf2e.classfeatures.Item.pda6iUaU9waXId5Q"],
        [7, "Eidolon Symbiosis", "Compendium.pf2e.classfeatures.Item.skQBrwRwJW2K6ACj"],
        [7, "Eidolon Weapon Specialization", "Compendium.pf2e.classfeatures.Item.oCnyGRvkfjTsZXcX"],
        [9, "Expert Spellcaster", "Compendium.pf2e.classfeatures.Item.cD3nSupdCvONuHiE"],
        [9, "Shared Reflexes", "Compendium.pf2e.classfeatures.Item.dZNAXTQovlWVvAyX"],
        [11, "Eidolon Defensive Expertise", "Compendium.pf2e.classfeatures.Item.2CZPYoyWih6zYTcb"],
        [11, "Simple Weapon Expertise", "Compendium.pf2e.classfeatures.Item.itTk4dBouzz89vs9"],
        [11, "Twin Juggernauts", "Compendium.pf2e.classfeatures.Item.q1Y12Pg2gQg2FJPR"],
        [13, "Defensive Robes", "Compendium.pf2e.classfeatures.Item.gU7epgcPSm0TD1UK"],
        [13, "Eidolon Unarmed Mastery", "Compendium.pf2e.classfeatures.Item.NIzHfVcVMhDmvA49"],
        [13, "Weapon Specialization", "Compendium.pf2e.classfeatures.Item.9EqIasqfI8YIM3Pt"],
        [15, "Greater Eidolon Specialization", "Compendium.pf2e.classfeatures.Item.B5SyM7qHrU0gTGR0"],
        [15, "Shared Resolve", "Compendium.pf2e.classfeatures.Item.eZPfHVz14j42jCnS"],
        [17, "Eidolon Transcendence", "Compendium.pf2e.classfeatures.Item.nCE9DzkugRefREqT"],
        [17, "Master Spellcaster", "Compendium.pf2e.classfeatures.Item.l1InYvhnQSz6Ucxc"],
        [19, "Eidolon Defensive Mastery", "Compendium.pf2e.classfeatures.Item.0WvI8KM5m0SaZ3MH"],
];

export function standUserClass() {
    const _id = idFor(P, "stand-user-class");
    const items = { standuser: { img: "icons/magic/control/silhouette-aura-energy.webp", level: 1, name: "Stand User", uuid: uuidFor(P, "stand-user") } };
    SUMMONER_FEATURES.forEach(([level, name, uuid], i) => {
        items[`sf${String(i).padStart(3, "0")}`] = { img: "systems/pf2e/icons/default-icons/classfeature.svg", level, name, uuid };
    });
    return {
        _id,
        _key: `!items!${_id}`,
        name: "Stand User",
        type: "class",
        img: "systems/pf2e/icons/classes/summoner.webp",
        system: {
            slug: "summoner",
            description: {
                value: "<p><em>Summoner class archetype.</em> A summoner whose eidolon is a Stand: a visible spirit of your own will with one unique power. Pick this class instead of Summoner. At 1st level you choose your stand type and Stand Ability, then the stand builder makes your stand. You don't get an eidolon, summoner spellcasting, a spell repertoire, signature spells or Instant Manifestation; everything else is the summoner's.</p><p>@UUID[{uuid}]{Stand User}</p>".replace("{uuid}", uuidFor(P, "stand-user")),
                gm: "",
            },
            publication: { title: "PF2e Stand Class Archetype (homebrew)", authors: "TheHolyCole", license: "ORC", remaster: true },
            _migration: { version: 0.961, previous: null },
            rules: [],
            traits: { rarity: "uncommon", value: [] },
            ancestryFeatLevels: { value: [1, 5, 9, 13, 17] },
            attacks: { advanced: 0, martial: 0, other: { name: "", rank: 0 }, simple: 1, unarmed: 1 },
            classFeatLevels: { value: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20] },
            defenses: { heavy: 0, light: 0, medium: 0, unarmored: 1 },
            generalFeatLevels: { value: [3, 7, 11, 15, 19] },
            hp: 10,
            keyAbility: { value: ["cha"] },
            perception: 1,
            savingThrows: { fortitude: 2, reflex: 1, will: 2 },
            skillFeatLevels: { value: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20] },
            skillIncreaseLevels: { value: [3, 5, 7, 9, 11, 13, 15, 17, 19] },
            spellcasting: 1,
            trainedSkills: { additional: 3, value: [] },
            items,
        },
        flags: {},
        ownership: { default: 0 },
    };
}
