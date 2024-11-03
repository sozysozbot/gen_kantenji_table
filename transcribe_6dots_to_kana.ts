export const TRANSCRIPTIONS = [
    "1", "2", "3", "4", "5", "6",
    "い", "う", "え", "お",
    "か", "き", "く", "け", "こ",
    "さ", "し", "す", "せ", "そ",
    "た", "ち", "つ", "て", "と",
    "な", "に", "ぬ", "ね", "の",
    "は", "ひ", "ふ", "へ", "ほ",
    "ま", "み", "む", "め", "も",
    "や", "ゆ", "よ",
    "ら", "り", "る", "れ", "ろ",

    "い↓", "う↓", "え↓", "お↓",
    "ら↓", "り↓", "る↓", "れ↓", "ろ↓",
    "数",
    "36",
    "イ", "ニ", "ナ", "イ↓",
] as const;
export type Transcription = typeof TRANSCRIPTIONS[number];
export const KANA_TO_DOT_INDICES: {
    [key in Transcription]: (1 | 2 | 3 | 4 | 5 | 6)[]
} = {
    "1": [1], "2": [2], "3": [3], "4": [4], "5": [5], "6": [6],
    "い": [1, 2], "う": [1, 4], "え": [1, 2, 4], "お": [2, 4],
    "か": [6, 1], "き": [6, 1, 2], "く": [6, 1, 4], "け": [6, 1, 2, 4], "こ": [6, 2, 4],
    "さ": [5, 6, 1], "し": [5, 6, 1, 2], "す": [5, 6, 1, 4], "せ": [5, 6, 1, 2, 4], "そ": [5, 6, 2, 4],
    "た": [3, 5, 1], "ち": [3, 5, 1, 2], "つ": [3, 5, 1, 4], "て": [3, 5, 1, 2, 4], "と": [3, 5, 2, 4],
    "な": [3, 1], "に": [3, 1, 2], "ぬ": [3, 1, 4], "ね": [3, 1, 2, 4], "の": [3, 2, 4],
    "は": [3, 6, 1], "ひ": [3, 6, 1, 2], "ふ": [3, 6, 1, 4], "へ": [3, 6, 1, 2, 4], "ほ": [3, 6, 2, 4],
    "ま": [3, 5, 6, 1], "み": [3, 5, 6, 1, 2], "む": [3, 5, 6, 1, 4], "め": [3, 5, 6, 1, 2, 4], "も": [3, 5, 6, 2, 4],

    "や": [3, 4], "ゆ": [3, 4, 6], "よ": [3, 4, 5],

    "ら": [5, 1], "り": [5, 1, 2], "る": [5, 1, 4], "れ": [5, 1, 2, 4], "ろ": [5, 2, 4],

    "い↓": [2, 3], "う↓": [2, 5], "え↓": [2, 3, 5], "お↓": [3, 5],
    "ら↓": [6, 2], "り↓": [6, 2, 3], "る↓": [6, 2, 5], "れ↓": [6, 2, 3, 5], "ろ↓": [6, 3, 5],
    "数": [3, 4, 5, 6],
    "36": [3, 6],
    "イ": [4, 5], "ニ": [6, 4, 5], "ナ": [6, 4], "イ↓": [5, 6],
} as const;

export function pack_into_unicode_braille(props: { dot_indices: (1 | 2 | 3 | 4 | 5 | 6)[], start_bit: boolean, end_bit: boolean }): string {
    const nth_dot = (n: number) => props.dot_indices.includes(n as 1 | 2 | 3 | 4 | 5 | 6) ? 1 : 0;
    // Dot #1 of Unicode is the start bit
    // Dot #2, 3, 7 of Unicode are dots #1, 2, 3 of Braille
    // Dot #4 of Unicode is the end bit
    // Dot #5, 6, 8 of Unicode are dots #4, 5, 6 of Braille

    const bit_pattern87654321 = [
        /* Unicode's Dot #1 */ props.start_bit ? 1 : 0,
        /* Unicode's Dot #2 */ nth_dot(1),
        /* Unicode's Dot #3 */ nth_dot(2),
        /* Unicode's Dot #4 */ props.end_bit ? 1 : 0,
        /* Unicode's Dot #5 */ nth_dot(4),
        /* Unicode's Dot #6 */ nth_dot(5),
        /* Unicode's Dot #7 */ nth_dot(3),
        /* Unicode's Dot #8 */ nth_dot(6),
    ].reduce((acc, bit, i) => acc + (bit << i), 0) + 0x2800;
    return String.fromCharCode(bit_pattern87654321);
}

export function braille_to_kana(braille: string): { kana: string, start_bit: boolean, end_bit: boolean } {
    const bit_pattern87654321 = braille.charCodeAt(0) - 0x2800;
    console.assert(0 <= bit_pattern87654321 && bit_pattern87654321 < 2 ** 8);
    const nth_bit = (n: number) => (bit_pattern87654321 & (1 << (n - 1))) !== 0;
    // Dot #1 of Unicode is the start bit
    // Dot #2, 3, 7 of Unicode are dots #1, 2, 3 of Braille
    // Dot #4 of Unicode is the end bit
    // Dot #5, 6, 8 of Unicode are dots #4, 5, 6 of Braille
    const start_bit = nth_bit(1);
    const end_bit = nth_bit(4);
    const braille_dots = {
        1: nth_bit(2),
        2: nth_bit(3),
        3: nth_bit(7),
        4: nth_bit(5),
        5: nth_bit(6),
        6: nth_bit(8)
    };

    // choose the kana whose raised dot matches the braille_dots
    const kana = Object.keys(KANA_TO_DOT_INDICES).find(kana => {
        const dots_of_kana = KANA_TO_DOT_INDICES[kana];
        return Object.entries(braille_dots).every(
            ([dot, is_raised]) => is_raised === dots_of_kana.includes(Number(dot) as 1 | 2 | 3 | 4 | 5 | 6)
        );
    });

    return { kana: kana || "", start_bit, end_bit };
}