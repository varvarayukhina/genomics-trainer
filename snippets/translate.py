bases = "TCAG"
codons = [a + b + c for a in bases for b in bases for c in bases]
amino = "FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG"
TABLE = dict(zip(codons, amino))

def translate(dna):
    protein = []
    for i in range(0, len(dna) - 2, 3):
        aa = TABLE[dna[i:i + 3]]
        protein.append(aa)
        if aa == "*":
            break
    return "".join(protein)

orf = "ATGGCTAAAGAACTGGGTCCGTTCAACGATTACTGGGAAAAATAA"
print("исходный белок:      ", translate(orf), f"({len(orf)} нуклеотидов)")

for pos, size in ((10, 1), (10, 3), (30, 2)):
    mutant = orf[:pos] + orf[pos + size:]
    kind = "сдвиг рамки" if size % 3 else "в рамке"
    print(f"делеция {size} нт с позиции {pos}: {translate(mutant):18} {kind}")

# длинная учебная рамка (случайные смысловые кодоны, фиксированный seed): что делает сдвиг рамки
import random
rng = random.Random(3)
sense = [c for c, a in TABLE.items() if a != "*"]
long_orf = "ATG" + "".join(rng.choice(sense) for _ in range(99)) + "TAA"
full = translate(long_orf)
premature = 0
for pos in range(len(long_orf)):
    mutant = translate(long_orf[:pos] + long_orf[pos + 1:])
    if mutant.endswith("*") and len(mutant) < len(full):
        premature += 1
print(f"длинная рамка: {len(long_orf)} нт, белок {len(full) - 1} аминокислот")
print(f"делеция 1 нт в каждой позиции: преждевременный стоп в {premature} из {len(long_orf)} случаев")
