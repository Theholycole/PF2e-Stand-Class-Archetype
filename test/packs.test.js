// Checks the built item sources: every compendium link resolves, inline rolls are well formed, and every
// ChoiceSet tag filter has items to choose from.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { execFileSync } from "node:child_process";

execFileSync("node", ["tools/build-items.mjs"]);
const root = new URL("../packs/_source/", import.meta.url).pathname;
const items = fs.readdirSync(root).flatMap((pack) =>
    fs.readdirSync(`${root}${pack}`).map((f) => ({ pack, ...JSON.parse(fs.readFileSync(`${root}${pack}/${f}`, "utf8")) })),
);
const ids = new Map(items.map((i) => [`Compendium.pf2e-stand-class-archetype.${i.pack}.Item.${i._id}`, i]));
const conditions = new Set(Object.values(JSON.parse(fs.readFileSync(new URL("../content/conditions.json", import.meta.url), "utf8"))));

test("every module link points at an item that exists", () => {
    for (const i of items) {
        const text = JSON.stringify(i);
        for (const [uuid] of text.matchAll(/Compendium\.pf2e-stand-class-archetype\.[a-z-]+\.Item\.[A-Za-z0-9]{16}/g)) {
            assert.ok(ids.has(uuid), `${i.name}: ${uuid}`);
        }
        for (const [, id] of text.matchAll(/Compendium\.pf2e\.conditionitems\.Item\.([A-Za-z0-9]{16})/g)) {
            assert.ok(conditions.has(id), `${i.name}: condition ${id}`);
        }
    }
});

test("inline rolls are well formed", () => {
    for (const i of items) {
        const html = i.system.description.value;
        let depth = 0;
        for (const ch of html) depth += ch === "[" ? 1 : ch === "]" ? -1 : 0;
        assert.equal(depth, 0, `${i.name}: unbalanced brackets`);
        for (const [, body] of html.matchAll(/@Check\[([^\]]+)\]/g)) {
            assert.match(body, /^(fortitude|reflex|will|athletics|acrobatics|medicine)\|against:stand/, `${i.name}: ${body}`);
        }
        for (const [, body] of html.matchAll(/@Damage\[(.+?\]\])/g)) {
            assert.match(body, /^.+\[[a-z,]+\]\]$/, `${i.name}: ${body}`);
        }
    }
});

test("ChoiceSet tag filters have options", () => {
    const tags = new Set(items.flatMap((i) => i.system.traits?.otherTags ?? []));
    for (const i of items) {
        for (const r of i.system.rules ?? []) {
            if (r.key !== "ChoiceSet" || !Array.isArray(r.choices?.filter)) continue;
            for (const f of r.choices.filter) {
                const tag = /^item:tag:(.+)$/.exec(f)?.[1];
                if (tag) assert.ok(tags.has(tag), `${i.name}: ${f}`);
            }
        }
    }
});

test("there are 7 stand types and 87 Stand Abilities", () => {
    assert.equal(items.filter((i) => i.system.traits?.otherTags?.includes("stand-type")).length, 7);
    assert.equal(items.filter((i) => i.system.traits?.otherTags?.includes("stand-ability")).length, 87);
});

test("D and S follow the shared numbers", () => {
    const D = (L) => 1 + Math.floor((L - 1) / 4);
    const S = (L) => 2 * Math.ceil(L / 2);
    assert.deepEqual([1, 5, 9, 13, 17].map(D), [1, 2, 3, 4, 5]);
    assert.deepEqual([1, 3, 5, 9, 17].map(S), [2, 4, 6, 10, 18]);
});
