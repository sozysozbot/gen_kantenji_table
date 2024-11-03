Read-Host -Prompt "Requires Python3 and Deno. Press Enter here to continue executing the script."

Invoke-WebRequest -OutFile tenjtext10.exe -Uri http://www.ukanokai-web.jp/kantenji_kiso02/tenjtext10.exe # 「横浜漢点字羽化の会」で配布されているファイルをダウンロードする
.\tenjtext10.exe # 自己解凍形式のファイルを解凍する

# prompt the user to click the GUI
Read-Host -Prompt "Click the button in the GUI, and then press Enter here to continue executing the script."

python3 .\decode.py
deno run --allow-read --allow-write sort_and_transcribe.ts
deno run --allow-read --allow-write gen_table.ts
