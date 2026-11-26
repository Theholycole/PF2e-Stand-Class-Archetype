// Stand builder numbers (scripts/stand-math.js) against hand-worked eidolon values (AoN Rules 3682/3684, Summoner).
import { test } from "node:test";
import assert from "node:assert/strict";
import { TYPES, attributes, gradeProblems, standStats } from "../scripts/stand-math.js";

const close = { power: "A", speed: "B", range: "C", durability: "C", precision: "D", potential: "E" };
const base = { type: "close-range-power-stand", key: "str", grades: close, primary: { form: "maneuver", maneuver: "shove", name: "Fist", damageType: "bludgeoning" }, secondary: { name: "Kick", damageType: "bludgeoning" } };

test("grade spread and type limits", () => {
    assert.deepEqual(gradeProblems("close-range-power-stand", close), []);
    assert.match(gradeProblems("close-range-power-stand", { ...close, range: "A", power: "C" }).join(), /Close-range/);
    assert.match(gradeProblems("close-range-power-stand", { ...close, potential: "A" }).join(), /exactly one A/);
    assert.match(gradeProblems("long-range-stand", close).join(), /Long-range/);
    assert.deepEqual(gradeProblems("long-range-stand", { power: "C", speed: "B", range: "A", durability: "C", precision: "D", potential: "E" }), []);
    for (const t of Object.keys(TYPES)) assert.ok(TYPES[t].check, t);
});

test("1st-level close-range stand", () => {
    const s = standStats({ ...base, level: 1 });
    assert.deepEqual(s.attributes, { str: 4, dex: 2, con: 2, int: -1, wis: 1, cha: 1 });
    assert.equal(s.ac, 10 + 1 + 2 + 2 + 2); // trained unarmored, Dex 2 (cap 3), +2 item (Str key)
    assert.equal(s.saves.fortitude, 1 + 4 + 2); // expert
    assert.equal(s.saves.reflex, 1 + 2 + 2); // trained
    assert.equal(s.saves.will, 1 + 4 + 1); // expert
    assert.equal(s.perception, 1 + 2 + 1);
    assert.equal(s.strikes[0].bonus, 1 + 2 + 4 + 0);
    assert.equal(s.strikes[0].damage, "1d10+4"); // Power A: d8 -> d10
    assert.deepEqual(s.strikes[0].traits, ["unarmed", "shove"]);
    assert.equal(s.strikes[1].damage, "1d6+4");
    assert.equal(s.speed, 30); // Speed B +5
    assert.deepEqual(s.user, { initiative: 1, guard: 0, standDC: 0 });
    assert.equal(s.tether, "100 feet");
});

test("boosts, specialization and proficiency steps", () => {
    const s7 = standStats({ ...base, level: 7 });
    assert.equal(s7.attributes.str, 4); // a boost at +4 is only half a step
    assert.equal(s7.strikes[0].bonus, 7 + 4 + 4); // expert at 5th
    assert.equal(s7.strikes[0].damage, "1d10+6"); // +2 specialization at 7th
    const s10 = attributes({ ...base, level: 10 });
    assert.equal(s10.str, 5);
    const s15 = standStats({ ...base, level: 15 });
    assert.equal(s15.strikes[0].damage, `1d10+${5 + 6}`); // master, greater specialization
    const s17 = attributes({ ...base, level: 17, transcend: "cha" });
    assert.equal(s17.cha, 1 + 1);
});

test("Dex key, finesse attack, Power E and the user's effects", () => {
    const s = standStats({ ...base, type: "colony-stand", key: "dex", level: 1, grades: { power: "E", speed: "A", range: "C", durability: "B", precision: "C", potential: "D" }, primary: { form: "deadly", name: "Hands", damageType: "bludgeoning" } });
    assert.equal(s.ac, 10 + 1 + 2 + 4 + 1); // Dex 4 (cap 4), +1 item
    assert.equal(s.strikes[0].bonus, 1 + 2 + 4); // finesse uses Dex
    assert.equal(s.strikes[0].damage, "1d4+2"); // d6 down to d4, Str 2 damage
    assert.deepEqual(s.user, { initiative: 2, guard: 1, standDC: 0 });
    assert.deepEqual(s.potential, [0, 1]);
});
