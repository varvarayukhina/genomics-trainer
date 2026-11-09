import csv
from pathlib import Path
from statistics import median

base = Path("data/pilot")   # запускай из корня репозитория
species = {"pair1": "Myotis sodalis", "pair2": "Rhinolophus clivosus", "pair3": "Eidolon dupreanum"}
families = ["KLRC", "KLRD1", "KLRK1", "KLRF", "LILR", "MHC-I", "CD1"]

diff_loci, diff_intact = [], []
for pair, name in species.items():
    with open(base / pair / f"{pair}.family_summary.tsv") as fh:
        rows = list(csv.DictReader(fh, delimiter="\t"))
    loci = {(r["family"], r["hap"]): int(r["loci"]) for r in rows}
    intact = {(r["family"], r["hap"]): int(r["intact"]) for r in rows}
    print(name)
    for fam in families:
        l1, l2 = loci.get((fam, "hap1"), 0), loci.get((fam, "hap2"), 0)
        i1, i2 = intact.get((fam, "hap1"), 0), intact.get((fam, "hap2"), 0)
        diff_loci.append(abs(l2 - l1)); diff_intact.append(abs(i2 - i1))
        print(f"  {fam:6} loci: hap1={l1:2d} hap2={l2:2d} ({l2 - l1:+d})   intact: hap1={i1} hap2={i2} ({i2 - i1:+d})")

print()
print("|hap2 - hap1| по всем 21 парам семейство×вид")
print("  все локусы: медиана", median(diff_loci), "максимум", max(diff_loci))
print("  только intact: медиана", median(diff_intact), "максимум", max(diff_intact))
