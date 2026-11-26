// content/*.mjs -> packs/_source/<pack>/<slug>.json. `node tools/build-items.mjs`
import fs from "node:fs";
import { standFeatures } from "../content/features.mjs";
import { standAbilities } from "../content/abilities.mjs";
import { standFeats } from "../content/feats.mjs";
import { standEffects } from "../content/effects.mjs";
import { standUserClass } from "../content/class.mjs";

const root = new URL("../packs/_source/", import.meta.url).pathname;
const packs = {
    "stand-features": [...standFeatures(), standUserClass()],
    "stand-abilities": standAbilities(),
    "stand-feats": standFeats(),
    "stand-effects": standEffects(),
};
for (const [pack, items] of Object.entries(packs)) {
    fs.rmSync(`${root}${pack}`, { recursive: true, force: true });
    fs.mkdirSync(`${root}${pack}`, { recursive: true });
    const seen = new Set();
    for (const item of items) {
        if (seen.has(item._id)) throw new Error(`${pack}: duplicate id for ${item.name}`);
        seen.add(item._id);
        fs.writeFileSync(`${root}${pack}/${item.system.slug}.json`, JSON.stringify(item, null, 2) + "\n");
    }
    console.log(`${pack}: ${items.length}`);
}
