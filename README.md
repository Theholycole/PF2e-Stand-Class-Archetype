# PF2e Stand Class Archetype

A homebrew Summoner class archetype for Pathfinder Second Edition on Foundry VTT, inspired by the Stands of *JoJo's Bizarre Adventure*: your eidolon is a Stand, a visible spirit of your own will with one unique power. The rules come from TheHolyCole's design doc "JoJo Stands in PF2e".

## Install

In Foundry go to **Add-on Modules → Install Module**, paste this manifest URL and click **Install**:

```
https://github.com/Theholycole/PF2e-Stand-Class-Archetype/releases/latest/download/module.json
```

Foundry 13 or 14 and the PF2e system 7 or later.

## What's in it

| Compendium | Contents |
| --- | --- |
| Stand User Class Features | **Stand User** (the 1st-level class archetype feature), Manifest Stand, the 7 stand types with their 1st, 7th and 13th-level features, Mark, Feed the Program, Worn Stand, Switch Acts, Ghostly Stand Body, Stand Transcendence, Stand Instinct |
| Stand Abilities | 87 Stand Abilities in 7 themes (Time, Space, Matter and Life, Force and Energy, Affliction, Mind and Sense, Fate) |
| Stand Feats | Stand User Dedication, 20 class feats, Sub-Stand, and the Heaven Ascension mythic destiny (dedication and 10 feats) |
| Stand Effects | 22 effects the abilities and feats link to |

## Making a Stand User

1. Drag **Stand User** onto the character **before** adding the Summoner class. It turns off the eidolon, the summoner's spellcasting, Spell Repertoire, Signature Spells and Instant Manifestation, so the Eidolon choice never opens. (If the class is already there, add Stand User anyway: it hides the eidolon you picked.)
2. Stand User asks for your **stand type** and your **Stand Ability**, and grants Manifest Stand, Act Together and Share Senses.
3. At 2nd level, take **Stand User Dedication** as your class feat.
4. Use **Manifest Stand** and press **Create stand actor** on its chat card. That makes an NPC actor for the stand with your level, your Hit Points and the Ghostly Stand Body (resists all damage except force, spirit and ghost touch; its unarmed Strikes have ghost touch). Fill in its Strikes and stat grades like an eidolon.
5. After that, Manifest Stand's chat card has a button that places the stand's token next to yours or removes it. The stand and its user share Hit Points (a world setting turns this off).

## How the rules are wired

- **Stand DC** is a statistic made by Stand User: 10 + your level + your spellcasting proficiency + Charisma. It becomes expert at 9th level and master at 17th on its own. Every save in a Stand Ability rolls against it (`@Check[...|against:stand]`).
- **Stand Points** are your focus pool: Stand User adds 1 to the maximum, link spells add theirs. Stand Ability surges get a **Spend 1 Stand Point** button on their chat card.
- **D** (at-will damage: 1d6, plus a die at 5th, 9th, 13th and 17th) and **S** (surge damage: 2d6, plus 2d6 at every odd level) are inline rolls that read your level.
- **Time Stop** charges are a special resource on the sheet (1, 2 at 9th, 3 at 17th).
- Abilities that only one stand type can take (Disassemble, Melting Dart, Ice Armor, Devouring Flesh) say so in their prerequisites.

Abilities that move tokens, rewind turns, redirect damage or take over a creature's actions still need the GM to run them from their text.

## Development

`npm install` then `npm run build` turns `content/` into `packs/_source/*.json` and then into the LevelDB packs Foundry reads. `npm test` checks every link and inline roll. The Release workflow (run by hand on `main` with release notes) publishes `v<module.json version>`.

MIT licensed (see [LICENSE](LICENSE)). Pathfinder rules used under Paizo's ORC license. *JoJo's Bizarre Adventure* belongs to Hirohiko Araki; this is a fan homebrew.
