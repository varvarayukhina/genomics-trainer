import numpy as np
from scipy.stats import ranksums
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.metrics import adjusted_rand_score

rng = np.random.default_rng(0)
named = ["NCR1", "KLRD1", "NKG7", "GZMB", "PRF1", "CD3E", "CD8A", "CD79A", "MS4A1"]
n_bg = 191
genes = named + [f"g{i}" for i in range(n_bg)]
# средняя экспрессия (учебные числа, не данные): строки = тип клеток
rates = {
    "NK":   dict(NCR1=6, KLRD1=8, NKG7=12, GZMB=9, PRF1=7, CD3E=0.2),
    "CD8T": dict(CD3E=8, CD8A=7, NKG7=7, GZMB=5, PRF1=4, KLRD1=1.5),
    "B":    dict(CD79A=9, MS4A1=7),
}
labels, rows = [], []
for t, r in rates.items():
    for _ in range(100):
        mu = np.full(len(genes), 0.5)
        for g, v in r.items():
            mu[genes.index(g)] = v
        depth = rng.lognormal(0, 0.3)               # разная глубина секвенирования клеток
        rows.append(rng.poisson(mu * depth)); labels.append(t)
X = np.array(rows, dtype=float); labels = np.array(labels)

# нормализация на размер библиотеки + log1p, как в Scanpy/Seurat
Xn = np.log1p(X / X.sum(1, keepdims=True) * 1e4)
pcs = PCA(n_components=10, random_state=0).fit_transform(Xn)
cl = KMeans(n_clusters=3, n_init=10, random_state=0).fit_predict(pcs)
print("ARI кластеры vs настоящие типы:", round(adjusted_rand_score(labels, cl), 3))

print("\nдоля клеток, где ген обнаружен (>0 счётов):")
for g in ("GZMB", "PRF1", "NKG7", "KLRD1", "CD3E", "NCR1"):
    j = genes.index(g)
    print(f"  {g:6}", "  ".join(f"{t}={np.mean(X[labels == t, j] > 0):.0%}" for t in rates))

# маркеры «NK против CD8T» критерием Уилкоксона (ранговые суммы)
nk, cd8 = Xn[labels == "NK"], Xn[labels == "CD8T"]
res = sorted(((ranksums(nk[:, j], cd8[:, j]).statistic, g) for j, g in enumerate(genes[:len(named)])), reverse=True)
print("\nзнак статистики: + выше у NK, - выше у CD8T")
for stat, g in res:
    print(f"  {g:6} {stat:+7.1f}")
