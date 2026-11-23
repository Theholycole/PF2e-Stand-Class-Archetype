// PF2e Stand Class Archetype: registers the Stand trait, adds a "Spend Stand Point" button to Stand Ability surges,
// and links a stand actor to its user (Manifest Stand places or removes the stand's token; the two share Hit Points).
const MODULE_ID = "pf2e-stand-class-archetype";
const SOCKET = `module.${MODULE_ID}`;
const FEATURES = `Compendium.${MODULE_ID}.stand-features.Item`;

Hooks.once("init", () => {
    const label = "Stand";
    for (const key of ["featTraits", "actionTraits", "effectTraits", "creatureTraits", "npcAttackTraits"]) {
        if (CONFIG.PF2E[key]) CONFIG.PF2E[key].stand = label;
    }
    CONFIG.PF2E.traitsDescriptions.stand =
        "A stand is a visible spirit of its user's will. Stand abilities come from it, and stand creatures are ghostly: they resist all damage except force, spirit and ghost touch.";

    game.settings.register(MODULE_ID, "sharedHp", {
        name: "Stands share Hit Points with their user",
        hint: "When a linked stand or its user loses or regains Hit Points, the other one gets the same value, like an eidolon.",
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
    });
});

Hooks.once("ready", () => {
    game.socket.on(SOCKET, (data) => {
        if (game.user !== game.users.activeGM) return;
        if (data?.type === "toggle") toggleStand(data.userUuid).catch((e) => console.error(MODULE_ID, e));
    });
    game.modules.get(MODULE_ID).api = { linkStand, standOf, userOf, toggleStand: requestToggle, createStand };
});

/* -------------------------------------------- */
/* Linking                                      */
/* -------------------------------------------- */

function standOf(user) {
    const uuid = user?.getFlag(MODULE_ID, "stand");
    return uuid ? fromUuidSync(uuid) : null;
}

function userOf(stand) {
    const uuid = stand?.getFlag(MODULE_ID, "user");
    return uuid ? fromUuidSync(uuid) : null;
}

async function linkStand(user, stand) {
    await user.setFlag(MODULE_ID, "stand", stand.uuid);
    await stand.setFlag(MODULE_ID, "user", user.uuid);
    ui.notifications.info(`${stand.name} is now ${user.name}'s stand.`);
}

/** A basic NPC actor for the stand: the user's level and HP, the Ghostly Stand Body, the stand's size. Strikes and
 *  grades are filled in by the player, as with an eidolon. */
async function createStand(user) {
    const body = await fromUuid(`${FEATURES}.${await bodyId()}`);
    const hp = user.system.attributes.hp;
    const stand = await Actor.create({
        name: `${user.name}'s Stand`,
        type: "npc",
        img: user.img,
        ownership: user.ownership,
        system: {
            details: { level: { value: user.level } },
            attributes: { hp: { value: hp.value, max: hp.max } },
            traits: { value: ["eidolon", "stand"], size: { value: user.size ?? "med" } },
        },
        prototypeToken: { name: `${user.name}'s Stand`, actorLink: true, disposition: user.prototypeToken.disposition, alpha: 0.75 },
    });
    if (body) await stand.createEmbeddedDocuments("Item", [body.toObject()]);
    await linkStand(user, stand);
    return stand;
}

async function bodyId() {
    const pack = game.packs.get(`${MODULE_ID}.stand-features`);
    const index = await pack.getIndex({ fields: ["system.slug"] });
    return index.find((e) => e.system?.slug === "ghostly-stand-body")?._id;
}

/* -------------------------------------------- */
/* Manifest Stand                               */
/* -------------------------------------------- */

function requestToggle(user) {
    if (game.user === game.users.activeGM) return toggleStand(user.uuid);
    game.socket.emit(SOCKET, { type: "toggle", userUuid: user.uuid });
}

/** Run by the active GM: remove the stand's tokens from the scene, or place one next to the user's token. */
async function toggleStand(userUuid) {
    const user = await fromUuid(userUuid);
    const stand = standOf(user);
    const scene = canvas.scene;
    if (!user || !stand || !scene) return;
    const existing = scene.tokens.filter((t) => t.actorId === stand.id);
    if (existing.length) {
        await scene.deleteEmbeddedDocuments("Token", existing.map((t) => t.id));
        return;
    }
    const userToken = scene.tokens.find((t) => t.actorId === user.id);
    if (!userToken) return ui.notifications.warn(`${user.name} has no token on this scene.`);
    const grid = scene.grid.size;
    const token = await stand.getTokenDocument({ x: userToken.x + userToken.width * grid, y: userToken.y });
    await scene.createEmbeddedDocuments("Token", [token.toObject()]);
}

/* -------------------------------------------- */
/* Chat buttons                                 */
/* -------------------------------------------- */

Hooks.on("renderChatMessageHTML", (message, html) => {
    const item = message.item;
    const actor = message.actor;
    if (!item || !actor || !item.system?.traits?.value?.includes("stand")) return;
    const owner = actor.isOwner;
    const row = document.createElement("div");
    row.className = "stand-buttons";
    row.style.cssText = "display:flex;gap:4px;margin-top:4px;flex-wrap:wrap";

    if (owner && /surge/i.test(item.system.description?.value ?? "") && actor.system.resources?.focus) {
        row.append(button("Spend 1 Stand Point", async () => {
            const focus = actor.system.resources.focus;
            if (focus.value < 1) return ui.notifications.warn("No Stand Points left.");
            await actor.update({ "system.resources.focus.value": focus.value - 1 });
            ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>${actor.name} spends 1 Stand Point (${focus.value - 1} left).</p>` });
        }));
    }
    if (owner && item.system.slug === "manifest-stand") {
        const stand = standOf(actor);
        if (stand) row.append(button(`Manifest / unmanifest ${stand.name}`, () => requestToggle(actor)));
        else if (game.user.isGM || game.user.can("ACTOR_CREATE")) row.append(button("Create stand actor", () => createStand(actor)));
    }
    if (row.children.length) html.querySelector(".message-content")?.append(row);
});

function button(label, onClick) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.style.flex = "1 1 auto";
    b.addEventListener("click", (ev) => {
        ev.preventDefault();
        onClick();
    });
    return b;
}

/* -------------------------------------------- */
/* Shared Hit Points                            */
/* -------------------------------------------- */

Hooks.on("updateActor", (actor, changes) => {
    if (game.user !== game.users.activeGM || !game.settings.get(MODULE_ID, "sharedHp")) return;
    const value = foundry.utils.getProperty(changes, "system.attributes.hp.value");
    if (value === undefined) return;
    const other = standOf(actor) ?? userOf(actor);
    if (!other || other.system.attributes.hp.value === value) return;
    other.update({ "system.attributes.hp.value": Math.min(value, other.system.attributes.hp.max) });
});
