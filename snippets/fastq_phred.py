import math

record = """@read1 demo
GATTACAGATTACA
+
IIIIIIII5?#!AA
"""

def phred(ch, offset=33):
    return ord(ch) - offset

seq, qual = record.strip().split("\n")[1], record.strip().split("\n")[3]
qs = [phred(c) for c in qual]
print("Q по позициям:", qs)

for q in (10, 20, 30, 40):
    err = 10 ** (-q / 10)
    print(f"Q{q}: вероятность ошибки {err:.4f}, точность {1 - err:.2%}")

naive = sum(qs) / len(qs)
mean_err = sum(10 ** (-q / 10) for q in qs) / len(qs)
print("средний Q (наивно):", round(naive, 1))
print("средний Q через среднюю ошибку:", round(-10 * math.log10(mean_err), 1))
print("позиции с Q<20 (с нуля):", [i for i, q in enumerate(qs) if q < 20])
