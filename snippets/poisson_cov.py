from scipy.stats import poisson

for mean in (10, 20, 30, 40):
    low = poisson.cdf(9, mean)          # P(покрытие <= 9)
    print(f"среднее покрытие {mean}x: доля позиций с покрытием <10x по Пуассону = {low:.2e}")
