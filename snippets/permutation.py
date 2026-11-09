import numpy as np
from scipy import stats

rng = np.random.default_rng(42)
a = np.array([12, 15, 11, 14, 13, 16])   # группа A
b = np.array([18, 17, 21, 16, 19, 20])   # группа B
observed = b.mean() - a.mean()

pool = np.concatenate([a, b])
n_perm = 10_000
count = 0
for _ in range(n_perm):
    rng.shuffle(pool)                              # метки групп перемешаны
    diff = pool[len(a):].mean() - pool[:len(a)].mean()
    if abs(diff) >= abs(observed):
        count += 1

p_perm = (count + 1) / (n_perm + 1)
print("наблюдаемая разница средних:", round(observed, 2))
print("p, перестановочный тест:     ", round(p_perm, 4))
print("p, t-критерий Уэлча:         ", round(stats.ttest_ind(b, a, equal_var=False).pvalue, 4))
print("p, Манна-Уитни:              ", round(stats.mannwhitneyu(b, a).pvalue, 4))
