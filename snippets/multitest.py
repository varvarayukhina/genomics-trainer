import numpy as np
from scipy.stats import norm

rng = np.random.default_rng(1)
m, m_true = 10_000, 500                      # 10 000 генов, у 500 есть настоящий эффект
is_true = np.zeros(m, dtype=bool); is_true[:m_true] = True

z = rng.normal(0, 1, m)
z[:m_true] += 3.0                            # настоящий эффект = сдвиг на 3 SD
p = 2 * norm.sf(np.abs(z))

def benjamini_hochberg(p, q=0.05):
    m = len(p); order = np.argsort(p); ranked = p[order]
    below = ranked <= q * np.arange(1, m + 1) / m
    k = np.max(np.where(below)[0]) + 1 if below.any() else 0
    sig = np.zeros(m, dtype=bool); sig[order[:k]] = True
    return sig

def report(name, sig):
    fp = int(np.sum(sig & ~is_true)); tp = int(np.sum(sig & is_true))
    fdp = fp / max(fp + tp, 1)
    print(f"{name:22} найдено {fp + tp:4d} | настоящих {tp:4d} | ложных {fp:4d} | доля ложных {fdp:.1%}")

report("p < 0.05 без поправки", p < 0.05)
report("Bonferroni (0.05/m)", p < 0.05 / m)
report("Benjamini-Hochberg 5%", benjamini_hochberg(p))
