"""Генерирует js/tasks.js: задачи практикума с эталонными решениями и проверкой.

Ожидаемые ответы считаются запуском эталонного решения, а не вводятся руками.
Дальше скрипт проверяет, что эталон проходит все тесты, а заготовка (стартовый код) не проходит.
Запуск: python3 make_tasks.py
"""
import copy
import json
from pathlib import Path

ROOT = Path(__file__).parent
HARNESS = (ROOT / "src" / "harness.py").read_text(encoding="utf-8")
PILOT1 = (ROOT / "data/pilot/pair1/pair1.family_summary.tsv").read_text(encoding="utf-8")
PILOT2 = (ROOT / "data/pilot/pair2/pair2.family_summary.tsv").read_text(encoding="utf-8")

VCF = """##fileformat=VCFv4.2
#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\tFORMAT\ts1
chr1\t100\t.\tA\tG\t812\tPASS\tDP=34\tGT:DP\t0/1:34
chr1\t250\t.\tC\tT\t15\tPASS\tDP=8\tGT:DP\t1/1:8
chr2\t40\t.\tG\tA\t300\tLowQual\tDP=20\tGT:DP\t0/1:20
chr2\t90\t.\tT\tC\t.\tPASS\tDP=5\tGT:DP\t0/0:5
chr3\t7\t.\tA\tC\t99\tPASS\tDP=30\tGT:DP\t1|0:30
"""

FASTA = """>seq1 первая последовательность
ATGC
GGCC

>seq2
TTTT
"""

CODON_HEAD = '''BASES = "TCAG"
AMINO = "FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG"
CODONS = [a + b + c for a in BASES for b in BASES for c in BASES]
TABLE = dict(zip(CODONS, AMINO))   # TABLE["ATG"] == "M", TABLE["TAA"] == "*"

'''

T = []


def task(**kw):
    T.append(kw)


# ---------- Основы ----------
task(id="gc", track="Основы", title="GC-состав", mod="genome", fn="gc_content", tol=1e-6,
     bio="В геномах разных организмов доля G и C разная. По ней отличают, например, гены от межгенных участков и проверяют сборку.",
     statement="<p>Верни долю букв G и C в последовательности в процентах (число от 0 до 100). Регистр не важен. Для пустой строки верни 0.0.</p>",
     starter='def gc_content(seq):\n    """Доля G и C в процентах."""\n    pass\n',
     solution='def gc_content(seq):\n    seq = seq.upper()\n    if not seq:\n        return 0.0\n    return 100 * (seq.count("G") + seq.count("C")) / len(seq)\n',
     cases=[(("ATGC",), 0), (("AAAA",), 0), (("GGCC",), 0), (("ATGCGC",), 0), (("atgcgc",), 1), (("",), 1)],
     hints=["Приведи строку к верхнему регистру: seq.upper().", "У строки есть метод .count(\"G\").", "Не делай деление, если строка пустая."],
     why="Так считают характеристики любой последовательности: пройти по буквам и посчитать. Дальше те же приёмы работают на FASTA целого генома.")
task(id="revcomp", track="Основы", title="Обратная комплементарная цепь", mod="genome", fn="reverse_complement", tol=0,
     bio="Ген может лежать на любой из двух цепей ДНК. Чтобы искать его на второй цепи, нужна обратная комплементарная последовательность.",
     statement="<p>A паруется с T, C с G. Верни обратную комплементарную последовательность: сначала замени каждую букву на парную, потом переверни строку. Букву N оставляй как N.</p>",
     starter='def reverse_complement(seq):\n    pass\n',
     solution='def reverse_complement(seq):\n    pair = {"A": "T", "T": "A", "C": "G", "G": "C", "N": "N"}\n    return "".join(pair[b] for b in reversed(seq))\n',
     cases=[(("ATGC",), 0), (("AAAACCCGGT",), 0), (("GATTACA",), 0), (("ATGN",), 1), (("",), 1)],
     hints=["Заведи словарь пар: {\"A\": \"T\", ...}.", "reversed(seq) перебирает строку с конца.", "Склей буквы через \"\".join(...)."],
     why="Каждая последовательность в геноме читается в двух направлениях. Программы поиска генов проверяют обе цепи.")
task(id="fasta", track="Основы", title="Читаем FASTA", mod="formats", fn="read_fasta", tol=0,
     bio="Любой геном или набор белков лежит в FASTA. Первое, что делает любой скрипт, это читает такой файл.",
     statement="<p>Дан текст FASTA. Верни словарь <code>{имя: последовательность}</code>. Имя — первое слово после <code>&gt;</code>. Последовательность может идти на нескольких строках, склей их. Пустые строки пропусти.</p>",
     starter='def read_fasta(text):\n    pass\n',
     solution='def read_fasta(text):\n    result = {}\n    name = None\n    for line in text.splitlines():\n        line = line.strip()\n        if not line:\n            continue\n        if line.startswith(">"):\n            name = line[1:].split()[0]\n            result[name] = ""\n        else:\n            result[name] += line\n    return result\n',
     cases=[((FASTA,), 0), ((">a\nAC\nGT\n",), 0), ((">x desc\nAAA\n>y\n\nTTT\n",), 1), ((">only\n",), 1)],
     hints=["Иди по строкам: text.splitlines().", "Строка с > начинает новую запись, остальные дописываются к последней.", "Имя: line[1:].split()[0]."],
     why="Тот же цикл лежит внутри Biopython и samtools. Разница в том, что они читают файл по частям и не держат геном в памяти.")
task(id="kmer", track="Основы", title="k-меры", mod="assembly", fn="kmer_counts", tol=0,
     bio="Сборщики геномов и программы оценки качества считают k-меры: все подстроки длины k. По их частотам оценивают размер генома и ошибки.",
     statement="<p>Верни словарь <code>{k-мер: сколько раз встретился}</code> для строки и числа k. Если строка короче k, верни пустой словарь.</p>",
     starter='def kmer_counts(seq, k):\n    pass\n',
     solution='def kmer_counts(seq, k):\n    counts = {}\n    for i in range(len(seq) - k + 1):\n        kmer = seq[i:i + k]\n        counts[kmer] = counts.get(kmer, 0) + 1\n    return counts\n',
     cases=[(("ATATA", 2), 0), (("AAAA", 3), 0), (("ACGTACGT", 4), 0), (("ACGT", 5), 1), (("GATTACA", 1), 1)],
     hints=["Окно длины k сдвигается по строке: seq[i:i+k].", "range(len(seq) - k + 1) даёт нужное число позиций.", "counts.get(kmer, 0) + 1 увеличивает счётчик."],
     why="Подсчёт k-меров — основа оценки размера генома, поиска ошибок и де Брёйновых графов сборки.")

# ---------- Форматы и сборка ----------
task(id="n50", track="Сборка и форматы", title="N50", mod="assembly", fn="n50", tol=1e-9,
     bio="N50 — главное число в описании сборки генома. Его указывают в каждой статье про новую сборку.",
     statement="<p>Дан список длин контигов. Верни N50: длину контига, на котором накопленная сумма длин, если идти от самых больших, достигает половины общей длины или превышает её. Список не отсортирован.</p>",
     starter='def n50(lengths):\n    pass\n',
     solution='def n50(lengths):\n    lengths = sorted(lengths, reverse=True)\n    half = sum(lengths) / 2\n    running = 0\n    for length in lengths:\n        running += length\n        if running >= half:\n            return length\n',
     cases=[(([10, 8, 6, 4, 2],), 0), (([62.9, 55.5, 41.0, 30.2, 12.4, 6.1, 2.2, 0.9, 0.4, 0.1],), 0), (([100],), 0), (([5, 5],), 1), (([1, 9, 3, 7],), 1)],
     hints=["Сначала отсортируй по убыванию.", "Половина общей длины: sum(lengths) / 2.", "Накапливай сумму и остановись, когда она не меньше половины."],
     why="Ты считаешь то же, что и NCBI для каждой сборки. Попробуй позже на длинах контигов пилота и убедись, что получаются те же 55,5 и 62,9 Мб.")
task(id="meanq", track="Сборка и форматы", title="Средний Phred", mod="formats", fn="mean_q", tol=1e-6,
     bio="Качество прочтения нельзя усреднять как обычные числа: шкала логарифмическая. Это частая ловушка в контроле качества.",
     statement="<p>Дана строка качества FASTQ (Phred+33: код символа минус 33 даёт Q). Верни Q, посчитанный через <em>среднюю вероятность ошибки</em>: найди p = 10<sup>−Q/10</sup> для каждой позиции, возьми среднее p и верни −10·log₁₀(среднее p). Не округляй.</p>",
     starter='import math\n\n\ndef mean_q(qual):\n    pass\n',
     solution='import math\n\n\ndef mean_q(qual):\n    errors = [10 ** (-(ord(c) - 33) / 10) for c in qual]\n    return -10 * math.log10(sum(errors) / len(errors))\n',
     cases=[(("IIIIIIII5?#!AA",), 0), (("IIII",), 0), (("!!!",), 0), (("?",), 1), (("5555IIII",), 1)],
     hints=["Q символа c: ord(c) - 33.", "Ошибка: 10 ** (-Q / 10).", "Усредняй ошибки, а не Q, потом переводи обратно в Q."],
     why="Среднее Q по позициям завышает качество. Поэтому FastQC и другие программы считают по вероятностям ошибки.")
task(id="cigar", track="Сборка и форматы", title="Конец выравнивания по CIGAR", mod="formats", fn="cigar_ref_end", tol=0,
     bio="В BAM написано только, где выравнивание начинается и как устроено. Конец на геноме выводят из CIGAR.",
     statement="<p>Даны CIGAR и начальная позиция <code>pos</code> (с 1). Верни последнюю позицию на референсе, которую покрывает выравнивание (включительно). Референс «съедают» операции M, D, N, = и X. Операции I, S, H референс не двигают.</p>",
     starter='import re\n\n\ndef cigar_ref_end(cigar, pos):\n    pass\n',
     solution='import re\n\n\ndef cigar_ref_end(cigar, pos):\n    ref_len = sum(int(n) for n, op in re.findall(r"(\\d+)([MIDNSHP=X])", cigar) if op in "MDN=X")\n    return pos + ref_len - 1\n',
     cases=[(("40M2I30M120N25M3D20M", 1000001), 0), (("10M", 1), 0), (("5S10M5S", 100), 0), (("10M5I10M", 1), 0), (("10M5D10M", 1), 0), (("3=2X", 5), 1)],
     hints=["Разбери строку регулярным выражением: re.findall(r\"(\\d+)([MIDNSHP=X])\", cigar).", "Суммируй длины только тех операций, которые съедают референс.", "Конец включительно: pos + длина - 1."],
     why="Так вычисляют, куда на геноме легла любая строка BAM или PAF. Тот же приём лежит в samtools и pysam.")
task(id="overlap", track="Сборка и форматы", title="Пересечение интервалов в BED", mod="formats", fn="interval_overlap", tol=0,
     bio="Какие гены попали в регион, какие регионы совпали между гаплотипами: всё это пересечения интервалов.",
     statement="<p>Даны два интервала в системе BED (начало с 0, конец не включён): <code>(start, end)</code>. Верни длину их пересечения. Если пересечения нет, верни 0. Интервалы <code>(100, 200)</code> и <code>(200, 300)</code> просто соприкасаются: пересечение 0.</p>",
     starter='def interval_overlap(a, b):\n    pass\n',
     solution='def interval_overlap(a, b):\n    return max(0, min(a[1], b[1]) - max(a[0], b[0]))\n',
     cases=[(((100, 200), (150, 300)), 0), (((100, 200), (200, 300)), 0), (((0, 10), (2, 5)), 0), (((5, 10), (1, 3)), 0), (((50, 60), (50, 60)), 1)],
     hints=["Пересечение начинается там, где позже начинается один из интервалов: max(a[0], b[0]).", "Заканчивается там, где раньше кончается один из них: min(a[1], b[1]).", "Если разность отрицательная, пересечения нет."],
     why="В BED-системе длина интервала это end - start, поэтому формула так проста. В GFF с включённым концом пришлось бы добавлять единицу.")
task(id="vcf", track="Сборка и форматы", title="Фильтр вариантов VCF", mod="formats", fn="vcf_filter", tol=0,
     bio="После вызова вариантов остаётся отобрать надёжные: с фильтром PASS и достаточным качеством.",
     statement="<p>Дан текст VCF. Верни список строк <code>\"хромосома:позиция\"</code> для записей, у которых поле FILTER равно <code>PASS</code> и QUAL не меньше <code>min_qual</code>. Заголовок (строки с <code>#</code>) пропусти. Если QUAL равен <code>.</code>, запись не проходит. Порядок сохрани. Поля разделены табуляцией.</p>",
     starter='def vcf_filter(text, min_qual):\n    pass\n',
     solution='def vcf_filter(text, min_qual):\n    result = []\n    for line in text.splitlines():\n        if not line or line.startswith("#"):\n            continue\n        f = line.split("\\t")\n        if f[6] == "PASS" and f[5] != "." and float(f[5]) >= min_qual:\n            result.append(f[0] + ":" + f[1])\n    return result\n',
     cases=[((VCF, 50), 0), ((VCF, 10), 0), ((VCF, 1000), 0), ((VCF, 0), 1)],
     hints=["line.split(\"\\t\") разделяет поля.", "Индексы: CHROM=0, POS=1, QUAL=5, FILTER=6.", "float(f[5]) работает только если там число."],
     why="Тот же отбор делает bcftools view -f PASS -i 'QUAL>=50'. Понимать, что он делает внутри, нужно, чтобы доверять результату.")
task(id="het", track="Сборка и форматы", title="Гетерозиготные варианты", mod="genome", fn="count_het", tol=0,
     bio="Гетерозиготность показывает, насколько два гаплотипа одного животного различаются. Число гетерозиготных вариантов — первая её оценка.",
     statement="<p>Дан текст VCF с одним образцом. Посчитай записи, где генотип гетерозиготный: два разных аллеля, например <code>0/1</code>, <code>1/0</code> или <code>1|0</code>. Генотип — первая часть поля образца (до первого двоеточия). Заголовок пропусти.</p>",
     starter='def count_het(text):\n    pass\n',
     solution='def count_het(text):\n    n = 0\n    for line in text.splitlines():\n        if not line or line.startswith("#"):\n            continue\n        genotype = line.split("\\t")[9].split(":")[0]\n        alleles = genotype.replace("|", "/").split("/")\n        if len(set(alleles)) == 2:\n            n += 1\n    return n\n',
     cases=[((VCF,), 0), ((VCF.replace("0/1:34", "0/0:34"),), 0), (("#h\nchr1\t1\t.\tA\tG\t50\tPASS\t.\tGT\t./.\n",), 1)],
     hints=["Поле образца — десятое (индекс 9).", "Генотип: split(\":\")[0].", "Замени | на / и раздели по /, затем посмотри, сколько разных аллелей."],
     why="Дели число гетерозиготных вариантов на длину генома и получишь оценку гетерозиготности особи.")

# ---------- Белок и гены ----------
task(id="translate", track="Белок и гены", title="Трансляция ДНК в белок", mod="alignment", fn="translate", tol=0,
     bio="Чтобы понять, целый ген или сломанный, нужно перевести его в белок и посмотреть на стоп-кодоны.",
     statement="<p>Переведи последовательность в белок по таблице <code>TABLE</code> (она уже в заготовке). Читай тройками с начала, остаток короче трёх букв игнорируй. Остановись на первом стоп-кодоне и включи символ <code>*</code> в ответ.</p>",
     starter=CODON_HEAD + 'def translate(dna):\n    pass\n',
     solution=CODON_HEAD + 'def translate(dna):\n    protein = ""\n    for i in range(0, len(dna) - 2, 3):\n        aa = TABLE[dna[i:i + 3]]\n        protein += aa\n        if aa == "*":\n            break\n    return protein\n',
     cases=[(("ATGGCTAAAGAACTGGGTCCGTTCAACGATTACTGGGAAAAATAA",), 0), (("ATGAAATAGCCC",), 0), (("ATGGC",), 0), (("",), 1), (("ATGTGATTT",), 1)],
     hints=["range(0, len(dna) - 2, 3) даёт начала полных троек.", "Аминокислота: TABLE[dna[i:i+3]].", "Если аминокислота равна \"*\", прекрати цикл."],
     why="Это ровно то, что проверяет miniprot, когда считает внутренние стопы (st). Сдвиг рамки видно по тому, что стоп появляется слишком рано.")
task(id="premature", track="Белок и гены", title="Преждевременный стоп", mod="alignment", fn="has_premature_stop", tol=0,
     bio="В пилоте ген считается целым, если нет сдвигов рамки и внутренних стопов. Здесь ты реализуешь эту проверку сама.",
     statement="<p>Дана кодирующая последовательность, которая начинается с ATG и заканчивается стоп-кодоном. Верни <code>True</code>, если ген «сломан»: длина не кратна 3 (сдвиг рамки) или стоп-кодон (TAA, TAG, TGA) встречается в рамке раньше последнего кодона. Иначе верни <code>False</code>.</p>",
     starter='STOPS = {"TAA", "TAG", "TGA"}\n\n\ndef has_premature_stop(cds):\n    pass\n',
     solution='STOPS = {"TAA", "TAG", "TGA"}\n\n\ndef has_premature_stop(cds):\n    if len(cds) % 3 != 0:\n        return True\n    codons = [cds[i:i + 3] for i in range(0, len(cds), 3)]\n    return any(c in STOPS for c in codons[:-1])\n',
     cases=[(("ATGGCTAAAGAACTGGGTCCGTTCAACGATTACTGGGAAAAATAA",), 0), (("ATGAAATAGCCCTAA",), 0), (("ATGAAACCCTAA",), 0), (("ATGAAACCCTA",), 1), (("ATGTGA",), 1), (("ATGTAATAA",), 1)],
     hints=["Сначала проверь len(cds) % 3.", "Разбей на кодоны срезами по 3.", "Последний кодон смотреть не надо: codons[:-1]."],
     why="Каждый «intact» в таблице пилота прошёл такую проверку на уровне выравнивания miniprot. Теперь ты знаешь, из чего она состоит.")
task(id="sw", track="Белок и гены", title="Локальное выравнивание", mod="alignment", fn="sw_score", tol=0,
     bio="Выравнивание — сердце поиска генов. Здесь ты считаешь лучший счёт локального выравнивания двух последовательностей.",
     statement="<p>Реализуй алгоритм Смита–Уотермена и верни лучший счёт. За совпадение даётся <code>match</code>, за замену <code>mismatch</code>, за пропуск <code>gap</code> (число отрицательное). Клетка таблицы равна максимуму из: 0, диагональ + (match или mismatch), клетка сверху + gap, клетка слева + gap. Ответ — наибольшее значение в таблице.</p>",
     starter='def sw_score(a, b, match=2, mismatch=-1, gap=-2):\n    pass\n',
     solution='def sw_score(a, b, match=2, mismatch=-1, gap=-2):\n    prev = [0] * (len(b) + 1)\n    best = 0\n    for i in range(1, len(a) + 1):\n        cur = [0] * (len(b) + 1)\n        for j in range(1, len(b) + 1):\n            diag = prev[j - 1] + (match if a[i - 1] == b[j - 1] else mismatch)\n            cur[j] = max(0, diag, prev[j] + gap, cur[j - 1] + gap)\n            best = max(best, cur[j])\n        prev = cur\n    return best\n',
     cases=[(("TGTTACGG", "GGTTGACTA"), 0), (("AAAA", "TTTT"), 0), (("ACGT", "ACGT"), 0), (("ACGTACGT", "TACG"), 0), (("GATTACA", "GCATGCU", 3, -2, -3), 1), (("", "ACGT"), 1)],
     hints=["Достаточно хранить две строки таблицы: прошлую и текущую.", "Первая строка и первый столбец заполнены нулями.", "Не забывай обновлять best на каждой клетке."],
     why="Настоящие программы делают то же, но очень быстро и с хитростями для длинных последовательностей. Идея остаётся этой.")
task(id="hapdiff", track="Белок и гены", title="Разница между гаплотипами в пилоте", mod="copies", fn="hap_diff", tol=0,
     bio="Это твой собственный пилот. Дан настоящий файл family_summary.tsv. Посчитай, на сколько локусов каждое семейство отличается между hap1 и hap2.",
     statement="<p>Дан текст TSV с колонками <code>family, hap, loci, intact, partial, pseudogene_like, uncertain</code>. Верни словарь <code>{семейство: loci(hap2) − loci(hap1)}</code> для семейств, которые есть в обоих гаплотипах. Первая строка — заголовок.</p>",
     starter='def hap_diff(tsv_text):\n    pass\n',
     solution='def hap_diff(tsv_text):\n    loci = {}\n    for line in tsv_text.strip().splitlines()[1:]:\n        f = line.split("\\t")\n        loci[(f[0], f[1])] = int(f[2])\n    families = {fam for fam, hap in loci}\n    return {fam: loci[(fam, "hap2")] - loci[(fam, "hap1")] for fam in families if (fam, "hap1") in loci and (fam, "hap2") in loci}\n',
     cases=[((PILOT1,), 0), ((PILOT2,), 1)],
     hints=["Читай строки после первой: splitlines()[1:].", "Ключ словаря: (семейство, гаплотип).", "Для семейств без одного из гаплотипов разницы нет."],
     why="Тот же приём в модуле «Семейства генов» дал медиану |разницы| 1 и максимум 7. Теперь ты знаешь, как это считалось.")

# ---------- Статистика ----------
task(id="perm", track="Статистика", title="Точный перестановочный тест", mod="stats", fn="exact_perm_p", tol=1e-9,
     bio="При малых выборках p-значение можно получить, перебрав все способы раздать метки групп. Это честнее, чем верить t-критерию.",
     statement="<p>Даны две группы чисел <code>a</code> и <code>b</code>. Перебери все способы выбрать из объединённых данных группу размера <code>len(a)</code> (<code>itertools.combinations</code>), для каждого посчитай разницу средних «остаток минус выбранная» и верни долю способов, где модуль разницы не меньше модуля наблюдаемой разницы <code>mean(b) − mean(a)</code>. Для сравнения чисел с плавающей точкой используй допуск 1e-12.</p>",
     starter='import itertools\n\n\ndef exact_perm_p(a, b):\n    pass\n',
     solution='import itertools\n\n\ndef exact_perm_p(a, b):\n    pooled = list(a) + list(b)\n    total_sum = sum(pooled)\n    n = len(pooled)\n    mean = lambda x: sum(x) / len(x)\n    observed = abs(mean(b) - mean(a))\n    count = total = 0\n    for idx in itertools.combinations(range(n), len(a)):\n        group_a = [pooled[i] for i in idx]\n        rest_sum = total_sum - sum(group_a)\n        diff = abs(rest_sum / (n - len(a)) - sum(group_a) / len(a))\n        total += 1\n        if diff >= observed - 1e-12:\n            count += 1\n    return count / total\n',
     cases=[(([1, 2], [3, 4]), 0), (([12, 15, 11], [18, 17, 21]), 0), (([1, 1, 1], [1, 1, 1]), 0), (([5, 6, 7, 8], [1, 2, 3, 4]), 1)],
     hints=["itertools.combinations(range(n), k) даёт все наборы индексов.", "Остаток — те, кого нет в выбранном наборе.", "Сравнивай модули разниц с допуском: diff >= observed - 1e-12."],
     why="Для 3 против 3 всего 20 вариантов, поэтому самое малое достижимое p равно 0,1. Это и есть мощность при малых группах.")
task(id="bh", track="Статистика", title="Поправка Бенджамини–Хохберга", mod="stats", fn="bh_adjust", tol=1e-9,
     bio="Тысячи генов проверяются сразу, и без поправки «значимыми» оказываются сотни случайных. BH контролирует долю ложных находок.",
     statement="<p>Даны p-значения. Верни скорректированные значения (q) в исходном порядке. Алгоритм: отсортируй по возрастанию, для места <code>i</code> (с 1) возьми <code>p·m/i</code>, затем пройди с конца и сделай значения монотонными, взяв минимум с правым соседом. Не превышай 1.</p>",
     starter='def bh_adjust(pvals):\n    pass\n',
     solution='def bh_adjust(pvals):\n    m = len(pvals)\n    order = sorted(range(m), key=lambda i: pvals[i])\n    adjusted = [0.0] * m\n    running = 1.0\n    for rank in range(m, 0, -1):\n        i = order[rank - 1]\n        running = min(running, pvals[i] * m / rank)\n        adjusted[i] = running\n    return adjusted\n',
     cases=[(([0.01, 0.02, 0.03, 0.04, 0.05],), 0), (([0.001, 0.04, 0.03, 0.5],), 0), (([0.5],), 0), (([0.9, 0.0001, 0.2, 0.0005, 0.04],), 1)],
     hints=["Порядок: sorted(range(m), key=lambda i: pvals[i]).", "Для места rank значение p * m / rank.", "Иди от большего ранга к меньшему и держи running = min(running, ...)."],
     why="Так считают padj в DESeq2 и в других пакетах. В модуле статистики ты видела, как BH находит больше настоящих эффектов, чем Бонферрони.")
task(id="poisson", track="Статистика", title="Пуассон и покрытие", mod="stats", fn="poisson_cdf", tol=1e-12,
     bio="Сколько позиций генома останется почти без прочтений при среднем покрытии 30×? Это вопрос про распределение Пуассона.",
     statement="<p>Верни вероятность того, что случайная величина Пуассона со средним <code>lam</code> не больше <code>k</code>: сумма <code>e<sup>−λ</sup>·λ<sup>i</sup>/i!</code> по i от 0 до k. Используй модуль <code>math</code>.</p>",
     starter='import math\n\n\ndef poisson_cdf(k, lam):\n    pass\n',
     solution='import math\n\n\ndef poisson_cdf(k, lam):\n    term = math.exp(-lam)\n    total = term\n    for i in range(1, k + 1):\n        term *= lam / i\n        total += term\n    return total\n',
     cases=[((9, 30), 0), ((9, 10), 0), ((0, 1), 0), ((20, 20), 1), ((5, 0.5), 1)],
     hints=["Первое слагаемое: math.exp(-lam).", "Каждое следующее получается умножением на lam / i.", "Не считай факториалы напрямую: слагаемые станут огромными."],
     why="При 30× по Пуассону меньше 10× получается около 7·10⁻⁶ позиций. Реальных плохо покрытых позиций больше: покрытие неровное.")
task(id="boot", track="Статистика", title="Бутстрэп медианы", mod="stats", fn="bootstrap_median_ci", tol=1e-12,
     bio="Бутстрэп даёт доверительный интервал без предположений о распределении. Для воспроизводимости генератор случайных чисел задан явно.",
     statement="<p>Создай <code>rng = random.Random(seed)</code>. Сделай <code>n</code> повторов: каждый раз возьми выборку той же длины как <code>[rng.choice(x) for _ in x]</code> и посчитай <code>statistics.median</code>. Отсортируй медианы и верни кортеж <code>(meds[int(0.025*n)], meds[int(0.975*n)])</code>. Порядок вызовов rng важен: тест ждёт именно эту схему.</p>",
     starter='import random\nimport statistics\n\n\ndef bootstrap_median_ci(x, n, seed):\n    pass\n',
     solution='import random\nimport statistics\n\n\ndef bootstrap_median_ci(x, n, seed):\n    rng = random.Random(seed)\n    meds = sorted(statistics.median([rng.choice(x) for _ in x]) for _ in range(n))\n    return (meds[int(0.025 * n)], meds[int(0.975 * n)])\n',
     cases=[(([3.1, 2.4, 5.8, 4.4, 3.9, 12.5, 2.9, 3.3, 4.1, 3.6], 1000, 7), 0), (([1, 2, 3, 4, 5], 400, 1), 0), (([10, 10, 10, 11], 200, 3), 1)],
     hints=["Один повтор: [rng.choice(x) for _ in x].", "statistics.median считает медиану.", "Индексы квантилей: int(0.025 * n) и int(0.975 * n)."],
     why="Видишь: интервал для медианы узкий, хотя в данных есть выброс. Для среднего он был бы шире.")


def load(src, fn):
    ns = {"__name__": "__main__"}
    exec(compile(src, "<task>", "exec"), ns)
    return ns[fn]


def run_harness(code, fn, cases, tol):
    g = {"USER_CODE": code, "FN": fn, "CASES_JSON": json.dumps(cases, ensure_ascii=False), "TOL": tol}
    exec(compile(HARNESS, "<harness>", "exec"), g)
    return json.loads(g["_RESULT"])


def jsonable(x):
    if isinstance(x, tuple):
        return [jsonable(i) for i in x]
    if isinstance(x, list):
        return [jsonable(i) for i in x]
    if isinstance(x, dict):
        return {str(k): jsonable(v) for k, v in x.items()}
    return x


out = []
for t in T:
    f = load(t["solution"], t["fn"])
    cases = []
    for args, hidden in t["cases"]:
        expected = f(*copy.deepcopy(args))
        cases.append({"args": jsonable(list(args)), "expected": jsonable(expected), "hidden": bool(hidden)})
    r = run_harness(t["solution"], t["fn"], cases, t["tol"])
    assert r["error"] is None and all(x["ok"] for x in r["tests"]), (t["id"], r)
    r0 = run_harness(t["starter"], t["fn"], cases, t["tol"])
    assert not all(x["ok"] for x in r0["tests"]), ("заготовка проходит тесты", t["id"])
    out.append({k: t[k] for k in ("id", "track", "title", "mod", "fn", "tol", "bio", "statement", "starter", "solution", "hints", "why")} | {"cases": cases})
    print(f'{t["id"]:10} ok: эталон {len(cases)}/{len(cases)}, заготовка не проходит')

(ROOT / "js" / "tasks.js").write_text("const TASKS=" + json.dumps(out, ensure_ascii=False) + ";\n", encoding="utf-8")
print(len(out), "задач ->", ROOT / "js" / "tasks.js")
