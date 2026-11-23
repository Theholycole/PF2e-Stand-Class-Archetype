// Helpers that turn compact content records into PF2e item sources (packs/_source/<pack>/<slug>.json).
import crypto from "node:crypto";

export const MODULE_ID = "pf2e-stand-class-archetype";
const PUBLICATION = { title: "PF2e Stand Class Archetype (homebrew)", authors: "TheHolyCole", license: "ORC", remaster: true };
const B62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

/** Stable 16-character Foundry id from a pack and slug, so links between items never change between builds. */
export function idFor(pack, slug) {
    const bytes = crypto.createHash("sha1").update(`${pack}/${slug}`).digest();
    let id = "";
    for (let i = 0; i < 16; i++) id += B62[bytes[i] % 62];
    return id;
}

export function uuidFor(pack, slug) {
    return `Compendium.${MODULE_ID}.${pack}.Item.${idFor(pack, slug)}`;
}

export function slugify(name) {
    return name
        .toLowerCase()
        .replace(/['’]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

function base(pack, { name, slug, img, type }) {
    slug ??= slugify(name);
    const _id = idFor(pack, slug);
    return { _id, _key: `!items!${_id}`, name, type, img, slug };
}

/** A feat-type item (class feature, class feat, mythic feat). */
export function feat(pack, r) {
    const b = base(pack, { ...r, type: "feat", img: r.img ?? "icons/magic/perception/silhouette-stealth-shadow.webp" });
    return {
        _id: b._id,
        _key: b._key,
        name: b.name,
        type: "feat",
        img: b.img,
        system: {
            slug: b.slug,
            category: r.category ?? "classfeature",
            level: { value: r.level ?? 1 },
            actionType: { value: r.actionType ?? "passive" },
            actions: { value: r.actions ?? null },
            traits: { value: r.traits ?? ["summoner"], rarity: r.rarity ?? "uncommon", otherTags: r.tags ?? [] },
            prerequisites: { value: (r.prerequisites ?? []).map((value) => ({ value })) },
            description: { value: r.description, gm: "" },
            publication: PUBLICATION,
            maxTakable: r.maxTakable ?? 1,
            rules: r.rules ?? [],
            ...(r.frequency ? { frequency: r.frequency } : {}),
            ...(r.selfEffect ? { selfEffect: r.selfEffect } : {}),
            subfeatures: {
                keyOptions: [],
                languages: { granted: [], slots: 0 },
                proficiencies: {},
                senses: {},
                suppressedFeatures: r.suppressedFeatures ?? [],
            },
        },
        flags: { [MODULE_ID]: r.flags ?? {} },
        ownership: { default: 0 },
    };
}

/** An action-type item (Manifest Stand, Mark, Feed the Program). */
export function action(pack, r) {
    const b = base(pack, { ...r, type: "action", img: r.img ?? "icons/magic/control/silhouette-hold-change-blue.webp" });
    return {
        _id: b._id,
        _key: b._key,
        name: b.name,
        type: "action",
        img: b.img,
        system: {
            slug: b.slug,
            category: r.category ?? "offensive",
            actionType: { value: r.actionType ?? "action" },
            actions: { value: r.actions ?? 1 },
            traits: { value: r.traits ?? ["concentrate", "stand"], rarity: "common", otherTags: r.tags ?? [] },
            description: { value: r.description },
            publication: PUBLICATION,
            rules: r.rules ?? [],
            ...(r.frequency ? { frequency: r.frequency } : {}),
            ...(r.selfEffect ? { selfEffect: r.selfEffect } : {}),
        },
        flags: { [MODULE_ID]: r.flags ?? {} },
        ownership: { default: 0 },
    };
}

/** An effect item that a feature or ability links to. */
export function effect(pack, r) {
    const b = base(pack, { ...r, type: "effect", img: r.img ?? "icons/magic/perception/eye-ringed-glow-angry-small-teal.webp" });
    return {
        _id: b._id,
        _key: b._key,
        name: b.name,
        type: "effect",
        img: b.img,
        system: {
            slug: b.slug,
            level: { value: r.level ?? 1 },
            traits: { value: r.traits ?? [], rarity: "common", otherTags: [] },
            description: { value: r.description },
            publication: PUBLICATION,
            duration: r.duration ?? { value: 1, unit: "rounds", expiry: "turn-end", sustained: false },
            start: { value: 0, initiative: null },
            tokenIcon: { show: true },
            badge: r.badge ?? null,
            rules: r.rules ?? [],
        },
        flags: { [MODULE_ID]: r.flags ?? {} },
        ownership: { default: 0 },
    };
}

/** Rule: grant an item once the character reaches a level, and re-check on level change. */
export function grantAtLevel(uuid, level, extra = {}) {
    return {
        key: "GrantItem",
        uuid,
        ...(level > 1 ? { predicate: [{ gte: ["self:level", level] }], reevaluateOnUpdate: true } : {}),
        ...extra,
    };
}
