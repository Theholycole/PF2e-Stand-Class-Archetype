// Stand builder: a guided form that asks every question a stand needs (type, name, size, key attribute, the six
// stat grades with the type's limits, both unarmed attacks, attribute boosts), then builds or updates the stand's
// NPC actor and puts the grade effects (initiative, guard, stand DC) on the user.
import { ATTRS, GRADES, MANEUVERS, PRIMARY, STATS, STAT_LABELS, TYPES, defaultBoosts, gradeProblems, standStats } from "./stand-math.js";

export const MODULE_ID = "pf2e-stand-class-archetype";
const SIZES = { tiny: "Tiny", sm: "Small", med: "Medium", lg: "Large" };
const DAMAGE = ["bludgeoning", "piercing", "slashing"];
const ATTR_LABEL = { str: "Str", dex: "Dex", con: "Con", int: "Int", wis: "Wis", cha: "Cha" };
const esc = (s) => foundry.utils.escapeHTML(String(s ?? ""));

/** The user's chosen stand type slug and Stand Ability names, read from the items the Stand User ChoiceSets granted. */
export function userChoices(user) {
    const tags = (i) => i.system?.traits?.otherTags ?? [];
    const type = user.items.find((i) => tags(i).includes("stand-type"))?.system.slug;
    const abilities = user.items.filter((i) => tags(i).includes("stand-ability")).map((i) => i.name);
    return { type: TYPES[type] ? type : null, abilities };
}

/** Starting answers: the saved build, or sensible defaults from the user's sheet. */
function defaults(user, stand) {
    const saved = stand?.getFlag(MODULE_ID, "build") ?? user.getFlag(MODULE_ID, "build");
    const { type } = userChoices(user);
    const t = type ?? saved?.type ?? "close-range-power-stand";
    const atk = TYPES[t].attacks;
    return foundry.utils.mergeObject(
        {
            type: t,
            name: `${user.name}'s Stand`,
            img: user.img,
            size: TYPES[t].sizes[0],
            key: "str",
            grades: {},
            primary: { name: atk[0][0], damageType: atk[0][1], form: "maneuver", maneuver: "shove" },
            secondary: { name: atk[1][0], damageType: atk[1][1] },
            boosts: {},
            transcend: "str",
        },
        { ...(saved ?? {}), type: type ?? saved?.type ?? t },
        { inplace: false },
    );
}

const options = (list, value, label = (x) => x) => list.map((x) => `<option value="${esc(x)}"${x === value ? " selected" : ""}>${esc(label(x))}</option>`).join("");

/** The Stand Ability list (grouped by theme) with a preview of what the selected one does. */
async function abilityIndex() {
    const pack = game.packs.get(`${MODULE_ID}.stand-abilities`);
    const index = await pack.getIndex({ fields: ["system.description.value", "system.traits.otherTags", `flags.${MODULE_ID}.theme`] });
    return [...index].filter((e) => e.system?.traits?.otherTags?.includes("stand-ability")).sort((a, b) => a.name.localeCompare(b.name));
}

function abilityField(chosen, index, b) {
    if (chosen.length) {
        const shown = index.filter((e) => chosen.includes(e.name));
        return `<div class="sb-note">Your Stand Ability: ${esc(chosen.join(", "))}</div>${shown.map((e) => `<details><summary>What ${esc(e.name)} does</summary><div class="sb-desc" data-raw="${esc(e._id)}"></div></details>`).join("")}`;
    }
    const themes = {};
    for (const e of index) (themes[e.flags?.[MODULE_ID]?.theme ?? "Other"] ??= []).push(e);
    const groups = Object.keys(themes).sort().map((t) => `<optgroup label="${esc(t)}">${themes[t].map((e) => `<option value="${e._id}"${e._id === b.ability ? " selected" : ""}>${esc(e.name)}</option>`).join("")}</optgroup>`).join("");
    return `<label>Choose <select name="ability"><option value="">-</option>${groups}</select></label><div class="sb-note">Read what each ability does below before you pick. It's added to your character when you create the stand.</div><div class="sb-desc sb-preview"></div>`;
}

async function enrich(html, user) {
    const TE = foundry.applications?.ux?.TextEditor?.implementation ?? TextEditor;
    return TE.enrichHTML(html ?? "", { rollData: user.getRollData?.() ?? {} });
}

// DialogV2 strips <style> from its content and wraps it in its own <form>, so the CSS goes in the page head once.
const CSS = `.stand-builder fieldset{margin:0 0 6px;padding:4px 8px}.stand-builder label{display:inline-flex;gap:4px;align-items:center;margin:2px 8px 2px 0}
.sb-grade select{width:4em}.sb-problems{color:#a00;min-height:1.2em}.sb-boost span{display:inline-block;width:9em}.sb-note{font-size:0.9em;opacity:.8}.stand-builder .sb-desc{max-height:220px;overflow:auto;font-size:0.9em;border-left:3px solid #8884;padding-left:6px;margin-top:4px}.stand-builder .sb-grades{display:grid;grid-template-columns:repeat(3,1fr)}`;
function addStyle() {
    if (document.getElementById("stand-builder-css")) return;
    const el = document.createElement("style");
    el.id = "stand-builder-css";
    el.textContent = CSS;
    document.head.append(el);
}

function formHtml(user, b, index) {
    const { abilities } = userChoices(user);
    const lv = user.level;
    const typeOpts = Object.entries(TYPES).map(([k, t]) => `<option value="${k}"${k === b.type ? " selected" : ""}>${esc(t.label)}</option>`).join("");
    const gradeRows = STATS.map(
        (s) => `<label class="sb-grade">${STAT_LABELS[s]}<select name="grades.${s}"><option value="">-</option>${options(GRADES, b.grades?.[s])}</select></label>`,
    ).join("");
    const boostRows = [5, 10, 15, 20]
        .filter((at) => lv >= at)
        .map((at) => {
            const picked = b.boosts?.[at]?.length === 4 ? b.boosts[at] : defaultBoosts(b.key);
            return `<div class="sb-boost" data-level="${at}"><span>${at}th level (pick 4)</span>${ATTRS.map((a) => `<label><input type="checkbox" name="boosts.${at}.${a}"${picked.includes(a) ? " checked" : ""}>${ATTR_LABEL[a]}</label>`).join("")}</div>`;
        })
        .join("");
    const sizeList = TYPES[b.type].sizes[0] === "user" ? [user.size ?? "med"] : TYPES[b.type].sizes;
    return `<div class="stand-builder">

<fieldset><legend>Stand</legend>
<label>Name <input type="text" name="name" value="${esc(b.name)}"></label>
<label>Type <select name="type">${typeOpts}</select></label>
<label>Size <select name="size">${options(sizeList, b.size, (x) => SIZES[x] ?? x)}</select></label>
<label>Image <input type="text" name="img" value="${esc(b.img)}"></label>
</fieldset>
<fieldset><legend>Stand Ability</legend>${abilityField(abilities, index, b)}
</fieldset>
<fieldset><legend>Stat grades (one A, one B, two C, one D, one E)</legend><div class="sb-grades">${gradeRows}</div>
<div class="sb-note sb-rule">${esc(TYPES[b.type].rule)}</div><div class="sb-problems"></div></fieldset>
<fieldset><legend>Attributes</legend>
<label>Key attribute <select name="key">${options(["str", "dex"], b.key, (x) => (x === "str" ? "Strength (+2 item bonus to AC, Dex cap +3)" : "Dexterity (+1 item bonus to AC, Dex cap +4)"))}</select></label>
${boostRows}${lv >= 17 ? `<label>Stand Transcendence (+1) <select name="transcend">${options(ATTRS, b.transcend, (x) => ATTR_LABEL[x])}</select></label>` : ""}
</fieldset>
<fieldset><legend>Primary attack</legend>
<label>Name <input type="text" name="primary.name" value="${esc(b.primary.name)}"></label>
<label>Damage <select name="primary.damageType">${options(DAMAGE, b.primary.damageType)}</select></label>
<label>Form <select name="primary.form">${Object.entries(PRIMARY).map(([k, p]) => `<option value="${k}"${k === b.primary.form ? " selected" : ""}>${esc(p.label)}</option>`).join("")}</select></label>
<label class="sb-maneuver">Trait <select name="primary.maneuver">${options(MANEUVERS, b.primary.maneuver)}</select></label>
<div class="sb-note">Power A steps the die up one size; Power D or E steps it down one.</div>
</fieldset>
<fieldset><legend>Secondary attack (1d6, agile, finesse)</legend>
<label>Name <input type="text" name="secondary.name" value="${esc(b.secondary.name)}"></label>
<label>Damage <select name="secondary.damageType">${options(DAMAGE, b.secondary.damageType)}</select></label>
</fieldset></div>`;
}

/** Read the form into a build object. */
function readForm(form, user) {
    const data = new foundry.applications.ux.FormDataExtended(form).object;
    const b = foundry.utils.expandObject(data);
    const boosts = {};
    for (const [at, picks] of Object.entries(b.boosts ?? {})) boosts[at] = ATTRS.filter((a) => picks[a]);
    return {
        type: b.type,
        name: b.name?.trim() || `${user.name}'s Stand`,
        img: b.img || user.img,
        size: b.size,
        key: b.key,
        grades: b.grades ?? {},
        primary: b.primary,
        secondary: b.secondary,
        boosts,
        transcend: b.transcend ?? "str",
        transcendPicked: user.level >= 17 && Boolean(b.transcend),
        ability: b.ability || null,
    };
}

function problems(b, user) {
    const out = gradeProblems(b.type, b.grades);
    if (user && !userChoices(user).abilities.length && !b.ability) out.push("Choose a Stand Ability.");
    for (const [at, picks] of Object.entries(b.boosts)) if (picks.length !== 4) out.push(`Pick exactly 4 boosts at ${at}th level.`);
    return out;
}

/** Open the builder for a user actor. Resolves to the stand actor, or null if cancelled. */
export async function openBuilder(user, { stand = null, build = null, linkStand, requestBuild } = {}) {
    const DialogV2 = foundry.applications.api.DialogV2;
    addStyle();
    const index = await abilityIndex();
    const byId = new Map(index.map((e) => [e._id, e]));
    let b = foundry.utils.mergeObject(defaults(user, stand), build ?? {}, { inplace: false });
    const result = await DialogV2.wait({
        window: { title: `Build ${user.name}'s Stand`, resizable: true },
        position: { width: 620 },
        content: formHtml(user, b, index),
        buttons: [
            { action: "build", label: stand ? "Update stand" : "Create stand", icon: "fa-solid fa-person-rays", default: true, callback: (event, button) => readForm(button.form, user) },
            { action: "cancel", label: "Cancel" },
        ],
        render: (event, dialog) => {
            const root = dialog.element ?? event.target?.element;
            const form = root.querySelector("form");
            const box = root.querySelector(".stand-builder");
            const submit = root.querySelector('button[data-action="build"]');
            const refresh = () => {
                const now = readForm(form, user);
                const list = problems(now, user);
                box.querySelector(".sb-problems").textContent = list.join(" ");
                box.querySelector(".sb-rule").textContent = TYPES[now.type]?.rule ?? "";
                box.querySelector(".sb-maneuver").style.display = now.primary.form === "maneuver" ? "" : "none";
                submit.disabled = list.length > 0;
            };
            form.querySelector('[name="type"]').addEventListener("change", () => {
                // Re-render the size list and suggested attacks for the new type.
                const now = readForm(form, user);
                const t = TYPES[now.type];
                const sizeSel = form.querySelector('[name="size"]');
                const sizes = t.sizes[0] === "user" ? [user.size ?? "med"] : t.sizes;
                sizeSel.innerHTML = options(sizes, sizes.includes(now.size) ? now.size : sizes[0], (x) => SIZES[x] ?? x);
                form.querySelector('[name="primary.name"]').value = t.attacks[0][0];
                form.querySelector('[name="primary.damageType"]').value = t.attacks[0][1];
                form.querySelector('[name="secondary.name"]').value = t.attacks[1][0];
                form.querySelector('[name="secondary.damageType"]').value = t.attacks[1][1];
                refresh();
            });
            form.addEventListener("change", refresh);
            const preview = async () => {
                const el = box.querySelector(".sb-preview");
                const id = form.querySelector('[name="ability"]')?.value;
                if (el) el.innerHTML = id ? await enrich(byId.get(id)?.system?.description?.value, user) : "";
            };
            form.querySelector('[name="ability"]')?.addEventListener("change", preview);
            preview();
            for (const el of box.querySelectorAll(".sb-desc[data-raw]")) enrich(byId.get(el.dataset.raw)?.system?.description?.value, user).then((h) => (el.innerHTML = h));
            refresh();
        },
        rejectClose: false,
    });
    if (!result || result === "cancel") return null;
    if (problems(result, user).length) {
        ui.notifications.error(problems(result, user).join(" "));
        return null;
    }
    if (!stand && !game.user.can("ACTOR_CREATE") && !game.user.isGM) return requestBuild(user, result);
    return applyBuild(user, result, { stand, linkStand });
}

/** Skill modifiers: every skill the user is trained in plus the type's skills, using the stand's own attributes. */
function skills(user, stats, type) {
    const out = {};
    const lv = stats.level;
    const userSkills = user.skills ?? {};
    const slugs = new Set([...Object.keys(userSkills).filter((s) => (userSkills[s]?.rank ?? 0) > 0), ...TYPES[type].skills]);
    for (const slug of slugs) {
        const attr = CONFIG.PF2E.skills?.[slug]?.attribute ?? userSkills[slug]?.attribute ?? "str";
        const r = Math.max(1, userSkills[slug]?.rank ?? 0);
        if (!CONFIG.PF2E.skills?.[slug]) continue;
        out[slug] = { base: lv + 2 * r + (stats.attributes[attr] ?? 0) };
    }
    return out;
}

/** Create or update the stand actor from a build, and refresh the user's grade effect. Run by someone allowed to. */
export async function applyBuild(user, b, { stand = null, linkStand } = {}) {
    const stats = standStats({ ...b, level: user.level });
    const size = b.size === "user" ? (user.size ?? "med") : b.size;
    const hp = user.system.attributes.hp;
    const senses = TYPES[b.type].senses.map((type) => ({ type }));
    const system = {
        details: { level: { value: stats.level }, publicNotes: notes(b, stats) },
        abilities: Object.fromEntries(ATTRS.map((a) => [a, { mod: stats.attributes[a] }])),
        attributes: { ac: { value: stats.ac }, hp: { value: hp.value, max: hp.max }, speed: { value: stats.speed } },
        perception: { mod: stats.perception, senses },
        saves: { fortitude: { value: stats.saves.fortitude }, reflex: { value: stats.saves.reflex }, will: { value: stats.saves.will } },
        skills: skills(user, stats, b.type),
        traits: { value: ["eidolon", "stand"], size: { value: size } },
    };
    const flags = { [MODULE_ID]: { build: b } };
    if (!stand) {
        stand = await Actor.create({
            name: b.name,
            type: "npc",
            img: b.img,
            ownership: user.ownership,
            system,
            flags,
            prototypeToken: { name: b.name, actorLink: true, disposition: user.prototypeToken.disposition, alpha: 0.75 },
        });
        const body = await bodyItem();
        if (body) await stand.createEmbeddedDocuments("Item", [body.toObject()]);
        await linkStand?.(user, stand);
    } else {
        await stand.update({ name: b.name, img: b.img, system, flags, "prototypeToken.name": b.name });
    }
    // Replace the strikes this builder made before.
    const old = stand.items.filter((i) => i.type === "melee" && i.getFlag(MODULE_ID, "builder"));
    if (old.length) await stand.deleteEmbeddedDocuments("Item", old.map((i) => i.id));
    await stand.createEmbeddedDocuments(
        "Item",
        stats.strikes.map((s) => ({
            name: s.name,
            type: "melee",
            img: "icons/skills/melee/unarmed-punch-fist.webp",
            system: {
                bonus: { value: s.bonus },
                damageRolls: { [foundry.utils.randomID()]: { damage: s.damage, damageType: s.damageType, category: null } },
                traits: { value: s.traits },
                weaponType: { value: "melee" },
            },
            flags: { [MODULE_ID]: { builder: true } },
        })),
    );
    await userEffect(user, b, stats);
    // A Stand Ability picked in the builder (the user had none yet) goes on the user.
    if (b.ability && !userChoices(user).abilities.length) {
        const doc = await game.packs.get(`${MODULE_ID}.stand-abilities`)?.getDocument(b.ability);
        if (doc) await user.createEmbeddedDocuments("Item", [doc.toObject()]);
    }
    await user.setFlag(MODULE_ID, "build", b);
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: user }), content: summary(b, stats) });
    return stand;
}

/** The user's "Stand Grades" effect: initiative from Speed, guard from Durability, stand DC from Precision. */
async function userEffect(user, b, stats) {
    const old = user.items.filter((i) => i.type === "effect" && i.getFlag(MODULE_ID, "grades"));
    if (old.length) await user.deleteEmbeddedDocuments("Item", old.map((i) => i.id));
    const rules = [];
    if (stats.user.initiative) rules.push({ key: "FlatModifier", selector: "initiative", value: stats.user.initiative, label: `Stand Speed ${b.grades.speed}` });
    if (stats.user.guard) {
        rules.push({ key: "RollOption", domain: "all", option: "stand-guard", toggleable: true, value: true, label: "Stand adjacent (guard)" });
        rules.push({ key: "FlatModifier", selector: "ac", type: "circumstance", value: stats.user.guard, predicate: ["stand-guard"], label: `Stand Durability ${b.grades.durability}` });
    }
    if (stats.user.standDC) rules.push({ key: "FlatModifier", selector: "stand", value: stats.user.standDC, label: `Stand Precision ${b.grades.precision}` });
    const desc = `<p>From your stand's grades: ${STATS.map((s) => `${STAT_LABELS[s]} ${b.grades[s]}`).join(", ")}. Tether ${stats.tether}.</p>`;
    await user.createEmbeddedDocuments("Item", [
        {
            name: "Effect: Stand Grades",
            type: "effect",
            img: "icons/magic/control/silhouette-aura-energy.webp",
            system: { description: { value: desc }, duration: { value: -1, unit: "unlimited", expiry: null, sustained: false }, rules, tokenIcon: { show: false } },
            flags: { [MODULE_ID]: { grades: true } },
        },
    ]);
}

function notes(b, stats) {
    return `<p><strong>Type</strong> ${esc(TYPES[b.type].label)} · <strong>Grades</strong> ${STATS.map((s) => `${STAT_LABELS[s]} ${b.grades[s]}`).join(", ")} · <strong>Tether</strong> ${stats.tether}</p>`;
}

function summary(b, stats) {
    const [early, late] = stats.potential;
    const pot = early || late ? `Potential ${b.grades.potential}: take ${[early ? `${early} bonus evolution feat${early > 1 ? "s" : ""} at 1st level` : "", late ? `${late} at 11th level` : ""].filter(Boolean).join(" and ")}.` : `Potential ${b.grades.potential}: no bonus evolution feats.`;
    const strikes = stats.strikes.map((s) => `${esc(s.name)} +${s.bonus} (${s.traits.join(", ")}), ${s.damage} ${s.damageType}`).join("; ");
    return `<h3>${esc(b.name)}</h3>${notes(b, stats)}
<p><strong>AC</strong> ${stats.ac} · <strong>Fort</strong> +${stats.saves.fortitude} · <strong>Ref</strong> +${stats.saves.reflex} · <strong>Will</strong> +${stats.saves.will} · <strong>Perception</strong> +${stats.perception} · <strong>Speed</strong> ${stats.speed} feet</p>
<p><strong>Strikes</strong> ${strikes}</p>
<p>${pot} Add item bonuses (potency and striking runes, invested items) by hand.</p>`;
}

async function bodyItem() {
    const pack = game.packs.get(`${MODULE_ID}.stand-features`);
    const index = await pack.getIndex({ fields: ["system.slug"] });
    const id = index.find((e) => e.system?.slug === "ghostly-stand-body")?._id;
    return id ? pack.getDocument(id) : null;
}
