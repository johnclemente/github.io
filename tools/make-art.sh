#!/usr/bin/env bash
# Draws every card picture in assets/art from the originals in art-src, with
# tools/image-piece.py. Edit a line here to retune one, then run this again.
set -euo pipefail
cd "$(dirname "$0")/.."
piece() { python3 -I tools/image-piece.py "art-src/$1" "assets/art/$2.js" "${@:3}"; }

piece attwh-memento.jpg attwh-memento --name "all that we have" --note "your life in weeks: the memento mori grid"
piece jawn-games.jpg jawn --name "jawn.games" --note "the homepage: games you can actually just play"
piece ctf.png ctf --name "ctf tracker" --note "a flag, hand-drawn"
piece chimp.png mailchimp --name "mailchimp automations" --note "a chimp, hand-drawn"
piece Hands.png cheatsheets --name "security cheat sheets" --note "hands holding a console"
piece fileLock.png gcp-forms --name "form validation on gcp" --note "a locked document, hand-drawn"
piece clementeChristmas.png christmas-caper --name "christmas caper" --note "the title screen: a snowy street, start and continue"
piece Title.png graviscape --name "graviscape" --note "the title screen on a laptop"
piece RendezvousTitleScreen.png rendezvous --name "rendezvous" --note "the title screen on a laptop"
piece HumanResources.png human-resources --name "human resources" --note "the office, on a laptop"
piece dottrail.jpg dot-trail --name "dot trail" --note "the menu: four dots and play"
piece fuddle.jpg fuddle --name "fuddle" --note "how to play, on a cozy card"
