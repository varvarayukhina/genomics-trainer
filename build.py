"""Собирает site.html из src/*.html, js/*.js и snippets/. Запуск: uv run --with pygments python build.py"""
import csv
import html
import json
import re
from pathlib import Path

from pygments import highlight
from pygments.formatters import HtmlFormatter
from pygments.lexers import get_lexer_by_name

ROOT = Path(__file__).parent
PILOT_DIR = ROOT / "data" / "pilot"
VIEWS = ["v0_start", "v1b_map", "v1_genome", "v2_assembly", "v3_formats", "v4_alignment", "v5_copies",
         "v6_stats", "v7_singlecell", "v8_pipelines", "v8b_practice", "v8c_code", "v9_interview", "v10_glossary"]
EXT = {"python": "py", "r": "R", "bash": "sh"}
NOTE = {  # подпись под названием примера
    "deseq2": "R 4.4.1, DESeq2 1.46: запущено",
    "scanpy_skeleton": "шаблон, на данных не запускался",
    "gatk_skeleton": "шаблон, на данных не запускался",
    "pilot_cmds": "команды пилота: их запускал агент, вывод лежит в файлах пилота",
}


def code_figure(name: str, lang: str, label: str) -> str:
    src = (ROOT / "snippets" / f"{name}.{EXT[lang]}").read_text(encoding="utf-8").rstrip("\n")
    body = highlight(src, get_lexer_by_name(lang), HtmlFormatter(nowrap=True))
    out_file = ROOT / "snippets" / "out" / f"{name}.txt"
    note = NOTE.get(name) or ("Python 3.12: запущено" if out_file.exists() else "не запускалось")
    parts = [
        '<figure class="code"><figcaption><span>', html.escape(label),
        "<small>", html.escape(note), "</small></span>",
        '<button type="button" class="copy">Копировать</button></figcaption>',
        "<pre><code>", body, "</code></pre>",
    ]
    if out_file.exists():
        out = out_file.read_text(encoding="utf-8").rstrip("\n")
        parts += ["<details open><summary>Вывод (настоящий)</summary><pre>", html.escape(out), "</pre></details>"]
    parts.append("</figure>")
    return "".join(parts)


def read_tsv(path: Path) -> list[dict]:
    with open(path, encoding="utf-8") as fh:
        return list(csv.DictReader(fh, delimiter="\t"))


def ru(x: float, d: int) -> str:
    return f"{x:.{d}f}".replace(".", ",")


def pilot_table() -> str:
    head = ("<thead><tr><th>Вид</th><th>Гаплотип</th><th>Номер в NCBI</th><th>BioSample</th>"
            "<th>Размер, Гб</th><th>Контигов</th><th>Contig N50, Мб</th><th>Scaffold N50, Мб</th></tr></thead><tbody>")
    rows = []
    for n in (1, 2, 3):
        for r in read_tsv(PILOT_DIR / f"pair{n}" / f"pair{n}.assembly_report.tsv"):
            rows.append(
                f"<tr><td><em>{html.escape(r['organism'])}</em></td><td>{html.escape(r['haplotype'])}</td>"
                f"<td>{html.escape(r['accession'])}</td><td>{html.escape(r['biosample'])}</td>"
                f"<td>{ru(int(r['total_length']) / 1e9, 2)}</td><td>{r['n_contigs']}</td>"
                f"<td>{ru(int(r['contig_N50']) / 1e6, 1)}</td><td>{ru(int(r['scaffold_N50']) / 1e6, 1)}</td></tr>"
            )
    return '<div class="scroll-x"><table>' + head + "".join(rows) + "</tbody></table></div>"


def pilot_json() -> str:
    names = {1: "Myotis sodalis", 2: "Rhinolophus clivosus", 3: "Eidolon dupreanum"}
    pairs = []
    for n in (1, 2, 3):
        rows: dict = {}
        for r in read_tsv(PILOT_DIR / f"pair{n}" / f"pair{n}.family_summary.tsv"):
            rows.setdefault(r["family"], {})[r["hap"]] = {
                k: int(r[k]) for k in ("loci", "intact", "partial", "pseudogene_like", "uncertain")}
        pairs.append({"id": f"pair{n}", "name": names[n], "rows": rows})
    return json.dumps({"pairs": pairs}, ensure_ascii=False)


def coderead_json() -> str:
    f = ROOT / "data" / "code_reading.json"
    return f.read_text(encoding="utf-8").replace("</", "<\\/") if f.exists() else "[]"


def expand(text: str) -> str:
    text = re.sub(r"<!--code:([\w]+)\|(\w+)\|([^>]*?)-->", lambda m: code_figure(m[1], m[2], m[3]), text)
    return text.replace("<!--table:pilot_assemblies-->", pilot_table())


def main() -> None:
    src = ROOT / "src"
    parts = [(src / "head.html").read_text(encoding="utf-8"), (src / "shell_open.html").read_text(encoding="utf-8")]
    parts += [expand((src / f"{v}.html").read_text(encoding="utf-8")) for v in VIEWS]
    parts.append((src / "shell_close.html").read_text(encoding="utf-8"))
    js = "\n".join((ROOT / "js" / f).read_text(encoding="utf-8") for f in ("data.js", "core.js", "start.js", "widgets1.js", "widgets2.js", "tasks.js", "map.js", "practice.js"))
    parts.append(f"<script>\n(function(){{\n'use strict';\nconst PILOT={pilot_json()};\nconst HARNESS={json.dumps((ROOT / "src" / "harness.py").read_text(encoding="utf-8"), ensure_ascii=False)};\nconst CODEREAD={coderead_json()};\n{js}\nboot();\n}})();\n</script>\n")
    (ROOT / "site.html").write_text("".join(parts), encoding="utf-8")
    print("site.html:", (ROOT / "site.html").stat().st_size, "bytes")
    # index.html для GitHub Pages: тот же скелет, который добавляет публикация артефакта
    skeleton = ('<!doctype html><html lang="ru"><head><meta charset="utf-8">'
                '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
                '<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}'
                'body{margin:0;font:14px system-ui}img{max-width:100%}[hidden]{display:none!important}</style></head><body>')
    (ROOT / "index.html").write_text(skeleton + "".join(parts) + "</body></html>", encoding="utf-8")


if __name__ == "__main__":
    main()
