// Markdown-ish rules text -> PF2e item HTML with inline rolls.
// D = shared at-will damage (1d6, +1 die at 5/9/13/17), S = surge damage (2d6, +2d6 per odd level after 1st).
// Saves roll against the "stand" statistic that the Stand User feature creates (stand DC).
import fs from "node:fs";

const CONDITIONS = JSON.parse(fs.readFileSync(new URL("../../content/conditions.json", import.meta.url), "utf8"));
const COND_NAMES = Object.keys(CONDITIONS)
    .filter((n) => !["Persistent Damage", "Hidden", "Broken", "Helpful", "Friendly", "Indifferent", "Unfriendly", "Hostile", "Observed", "Unnoticed", "Cursebound", "Encumbered", "Dying", "Wounded", "Doomed", "Controlled"].includes(n))
    .sort((a, b) => b.length - a.length);

export const FORMULA = {
    D: "(1+floor((@actor.level - 1)/4))d6",
    S: "(2*ceil(@actor.level/2))d6",
    halfS: "(ceil(@actor.level/2))d6",
};
const DAMAGE_TYPES = "force|fire|cold|electricity|sonic|acid|poison|mental|piercing|slashing|bludgeoning|spirit|vitality|void";

export function conditionLink(name, label) {
    const id = CONDITIONS[name];
    return id ? `@UUID[Compendium.pf2e.conditionitems.Item.${id}]{${label}}` : label;
}

function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Inline rolls for one line of rules text. Placeholders keep later passes from touching what earlier ones made. */
export function enrichLine(raw, opts = {}) {
    const keep = [];
    const hold = (s) => `\u0000${keep.push(s) - 1}\u0000`;
    let t = escapeHtml(raw);

    t = t.replace(/Second Wind of Will/g, () => hold("Second Wind of Will"));
    if (opts.damage === false) t = t.replace(/\b[DS]\b(?![-\w])/g, (m) => hold(m));
    // "2d6 force ... +1d6 per 2 levels" (the drafted Bomb Touch wording)
    t = t.replace(/(\d)d6 (force)([^.]*?)\. \+1d6 per 2 levels\./, (_m, n, type, rest) =>
        `${hold(`@Damage[(${n}+floor((@actor.level - 1)/2))d6[${type}]]`)}${rest}. (The damage grows by 1d6 at every odd level.)`,
    );
    // healing "2d8 + your key attribute, +1d8 per 2 levels"
    t = t.replace(/2d8 \+ your key attribute, \+1d8 per 2 levels/g, () =>
        hold("@Damage[(2+floor((@actor.level - 1)/2))d8+@actor.system.abilities.cha.mod[healing]]{2d8 + your Charisma modifier, +1d8 at every odd level}"),
    );
    // persistent damage written out: "persistent 1d6 poison", "persistent 2d6 fire", "persistent 1d6 acid"
    t = t.replace(new RegExp(`[Pp]ersistent (\\d+d\\d+) (${DAMAGE_TYPES})`, "g"), (_m, f, type) =>
        hold(`@Damage[${f}[persistent,${type}]]`),
    );
    // "D persistent poison", "persistent damage equals D", "S/2"
    t = t.replace(new RegExp(`\\b(half )?([DS])(\\/2)? persistent (${DAMAGE_TYPES})`, "g"), (_m, half, l, slash, type) =>
        hold(`@Damage[${half || slash ? FORMULA.halfS : FORMULA[l]}[persistent,${type}]]`),
    );
    t = t.replace(/([Pp])ersistent damage equals ([DS])(\/2)?/g, (_m, p, l, slash) =>
        `${p}ersistent damage equals ${hold(`@Damage[${slash ? FORMULA.halfS : FORMULA[l]}[persistent,poison]]`)}`,
    );
    // "D + D fire", "S (half bludgeoning, half fire)"
    t = t.replace(/\bD bludgeoning \+ D fire\b/g, () =>
        hold(`@Damage[${FORMULA.D}[bludgeoning],${FORMULA.D}[fire]]`),
    );
    t = t.replace(/\bS \(half bludgeoning, half fire\)/g, () =>
        hold(`@Damage[${FORMULA.halfS}[bludgeoning],${FORMULA.halfS}[fire]]`),
    );
    // healing: "heal D", "allies heal D each turn"
    t = t.replace(/\b(heals?) ([DS])\b(?![-\w])/g, (_m, verb, l) => `${verb} ${hold(`@Damage[${FORMULA[l]}[healing]]`)}`);
    // "D extra electricity", "D fire", "half S", "S/2", "S fire", bare "D" / "S"
    t = t.replace(new RegExp(`\\b(half )?([DS])(\\/2)?( extra)?( (?:${DAMAGE_TYPES}))?\\b(?![-\\w])`, "g"), (m, half, l, slash, extra, type) => {
        const f = half || slash ? FORMULA.halfS : FORMULA[l];
        const ty = type ? type.trim() : (opts.type ?? "force");
        return `${hold(`@Damage[${f}[${ty}]]`)}${extra ? " extra" : ""}${type ? "" : ""}`;
    });

    // saves against the stand DC
    t = t.replace(/\b(basic )?(Fortitude|Reflex|Will)\b(,? incapacitation)?/g, (_m, basic, save, inc) => {
        const parts = [save.toLowerCase(), "against:stand"];
        if (basic) parts.push("basic");
        if (inc) parts.push("traits:incapacitation");
        return hold(`@Check[${parts.join("|")}]{${basic ? "basic " : ""}${save}}`) + (inc ? ", incapacitation" : "");
    });
    t = t.replace(/\b(Athletics|Acrobatics|Medicine|Recall Knowledge|Seek|Athletics or Acrobatics) check (?:against|vs) your (?:stand )?DC/g, (m, skill) => {
        if (skill === "Athletics or Acrobatics")
            return `${hold("@Check[athletics|against:stand]")} or ${hold("@Check[acrobatics|against:stand]")} check against your stand DC`;
        if (skill === "Recall Knowledge" || skill === "Seek") return m;
        return `${hold(`@Check[${skill.toLowerCase()}|against:stand]`)} check against your stand DC`;
    });

    // areas
    t = t.replace(/(\d+)-(?:ft|foot) (burst|emanation|cone|line)/g, (_m, d, type) =>
        hold(`@Template[${type}|distance:${d}]{${d}-ft ${type}}`),
    );

    // conditions: "slowed 1", "off-guard", "enfeebled 2"
    for (const name of COND_NAMES) {
        const re = new RegExp(`\\b(${name.toLowerCase().replace("-", "\\-")})( \\d)?\\b`, "g");
        t = t.replace(re, (m) => hold(conditionLink(name, m)));
    }

    t = t.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>");
    return t.replace(/\u0000(\d+)\u0000/g, (_m, i) => keep[Number(i)]);
}

/** Markdown block (paragraphs and "- " bullets) -> HTML. */
export function enrichBlock(md, opts = {}) {
    const out = [];
    let list = null;
    for (const line of md.split("\n")) {
        const l = line.trim();
        if (!l) {
            if (list) out.push(`<ul>${list.join("")}</ul>`), (list = null);
            continue;
        }
        if (l.startsWith("- ")) {
            (list ??= []).push(`<li>${enrichLine(l.slice(2), opts)}</li>`);
        } else {
            if (list) out.push(`<ul>${list.join("")}</ul>`), (list = null);
            out.push(`<p>${enrichLine(l, opts)}</p>`);
        }
    }
    if (list) out.push(`<ul>${list.join("")}</ul>`);
    return out.join("\n");
}
