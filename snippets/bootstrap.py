import numpy as np

rng = np.random.default_rng(7)
x = np.array([3.1, 2.4, 5.8, 4.4, 3.9, 12.5, 2.9, 3.3, 4.1, 3.6])  # в выборке один выброс: 12.5

boot_medians = np.array([np.median(rng.choice(x, size=len(x), replace=True)) for _ in range(10_000)])
lo, hi = np.percentile(boot_medians, [2.5, 97.5])
print("медиана выборки:", np.median(x))
print(f"95% доверительный интервал медианы (bootstrap): [{lo:.2f}, {hi:.2f}]")
print("среднее выборки:", round(x.mean(), 2), "(тянется к выбросу)")
