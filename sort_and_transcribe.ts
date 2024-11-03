#!/usr/bin/env -S deno run --allow-read --allow-write sort_and_transcribe.ts
import RESULT from "./result_sorted_by_shift_jis.json" with {type: "json"};
import { TRANSCRIPTIONS, Transcription, braille_to_kana } from "./transcribe_6dots_to_kana.ts";

const result: [string, string, string][] = Object.entries(RESULT).map(([kanji, braille_string]) => {
    const a = braille_string.replace(/\u2800+$/, "");

    return [kanji,
        a,
        [...a].map(c => braille_to_kana(c).kana).join("|"),
    ];
});

result.sort(([_qa, a, _ka], [_qb, b, _kb]) => {
    if (a.length !== b.length) {
        return a.length - b.length;
    }
    const kana_a = [...a].map(c => braille_to_kana(c));
    const kana_b = [...b].map(c => braille_to_kana(c));

    for (let i = 0; i < a.length; i++) {
        if (kana_a[i].kana !== kana_b[i].kana) {
            return TRANSCRIPTIONS.indexOf(kana_a[i].kana as Transcription) - TRANSCRIPTIONS.indexOf(kana_b[i].kana as Transcription);
        }
    }
    return 0;
});

// write to TSV
const tsv = result.map(([kanji, braille, transcription]) => [kanji, braille, "[" + transcription + "]"].join("\t")).join("\n");
await Deno.writeTextFile("result_sorted_by_braille_and_transcribed.tsv", tsv);

// write to JSON
await Deno.writeTextFile("result_sorted_by_braille_and_transcribed.json", JSON.stringify(result.map(([kanji, braille, kana]) => ({kanji, braille, transcription: kana.split("|")})), null, 2));
