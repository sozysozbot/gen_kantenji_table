import json

# get_shift_jis_kanji_from_range
def sjis_range(start, end):
    shift_jis_kanji = [
        bytes.fromhex(format(i, "x")).decode('shift_jis')
        for i in range(start, end + 1)
    ]
    return shift_jis_kanji

def sjis_row(high_byte):
    high_byte = high_byte << 8
    return sjis_range(high_byte + 0x40, high_byte + 0x7e) + sjis_range(high_byte + 0x80, high_byte + 0xfc)

shift_jis_kanji = (
    sjis_range(0x889f, 0x88fc) # 第一水準スタート：16区
    + sum([sjis_row(i) for i in range(0x89, 0x97 + 1)], []) # 17/18区 ～ 45/46区 
    + sjis_range(0x9840, 0x9872) # 47区（47区51点「腕」まで）
    + sjis_range(0x989f, 0x98fc) # 第二水準スタート：48区
    + sum([sjis_row(i) for i in range(0x99, 0x9f + 1)], []) # 49/50区 ～ 61/62区
    + sum([sjis_row(i) for i in range(0xe0, 0xe9 + 1)], []) # 63/64区 ～ 81/82区
    + sjis_range(0xea40, 0xea7e) + sjis_range(0xea80, 0xea9e) # 83区
    + sjis_range(0xea9f, 0xeaa4) # 84区（84区6点「熙」まで）
    )


def byte_to_braille(byte):
    # The byte encodes the braille as 0b①②③⑦④⑤⑥⑧
    # Unicode encodes it as 0x2800 + 0b⑧⑦⑥⑤④③②①
    dots = {
        1: (byte & (1 << 7)) != 0,
        2: (byte & (1 << 6)) != 0,
        3: (byte & (1 << 5)) != 0,
        7: (byte & (1 << 4)) != 0,
        4: (byte & (1 << 3)) != 0,
        5: (byte & (1 << 2)) != 0,
        6: (byte & (1 << 1)) != 0,
        8: (byte & (1 << 0)) != 0
    }
    return chr(0x2800 + sum([1 << (i - 1) for i in dots if dots[i]]))

with open("Kanjcodg.tbl", "rb") as f:
    data = f.read()
    data = [data[i:i+3] for i in range(0, len(data), 3)]

resulting_map = dict([])
result_sorted_by_shift_jis = ""
for (i, char) in enumerate(shift_jis_kanji):
    result_sorted_by_shift_jis += char + "\t" + byte_to_braille(data[i][0])+ byte_to_braille(data[i][1])+ byte_to_braille(data[i][2]) + "\n"
    resulting_map[char] = byte_to_braille(data[i][0])+ byte_to_braille(data[i][1])+ byte_to_braille(data[i][2])
with open("result_sorted_by_shift_jis.txt", "w", encoding="utf-8") as f:
    f.write(result_sorted_by_shift_jis)
    
with open('result_sorted_by_shift_jis.json', 'w', encoding="utf-8") as fp:
    json.dump(resulting_map, fp, ensure_ascii=False, indent=4)
