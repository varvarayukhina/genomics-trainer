def n50(lengths):
    """Длина контига, на котором накопленная сумма (от больших к меньшим) достигает половины всей длины."""
    lengths = sorted(lengths, reverse=True)
    half = sum(lengths) / 2
    running = 0
    for length in lengths:
        running += length
        if running >= half:
            return length

contigs_mb = [62.9, 55.5, 41.0, 30.2, 12.4, 6.1, 2.2, 0.9, 0.4, 0.1]
print("всего, Мб:", round(sum(contigs_mb), 1))
print("N50, Мб:", n50(contigs_mb))
print("N50 без самого длинного контига, Мб:", n50(contigs_mb[1:]))
