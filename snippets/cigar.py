import re

REF = set("MDN=X")   # операции, которые «съедают» референс
QRY = set("MIS=X")   # операции, которые «съедают» рид

def parse_cigar(cigar):
    return [(int(n), op) for n, op in re.findall(r"(\d+)([MIDNSHP=X])", cigar)]

def spans(cigar, ref_start_1based):
    ops = parse_cigar(cigar)
    ref_len = sum(n for n, op in ops if op in REF)
    qry_len = sum(n for n, op in ops if op in QRY)
    return ref_len, qry_len, ref_start_1based + ref_len - 1

cigar = "5S40M2I30M120N25M3D20M4S"
print(parse_cigar(cigar))
ref_len, qry_len, ref_end = spans(cigar, 1_000_001)
print("длина на референсе:", ref_len)
print("длина рида:", qry_len)
print("последняя позиция на референсе:", ref_end)
