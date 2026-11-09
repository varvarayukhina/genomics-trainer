def smith_waterman(a, b, match=2, mismatch=-1, gap=-2):
    rows, cols = len(a) + 1, len(b) + 1
    H = [[0] * cols for _ in range(rows)]
    best, best_pos = 0, (0, 0)
    for i in range(1, rows):
        for j in range(1, cols):
            diag = H[i - 1][j - 1] + (match if a[i - 1] == b[j - 1] else mismatch)
            H[i][j] = max(0, diag, H[i - 1][j] + gap, H[i][j - 1] + gap)
            if H[i][j] > best:
                best, best_pos = H[i][j], (i, j)
    # обратный проход от лучшей клетки до нуля
    i, j = best_pos
    top, bottom = [], []
    while H[i][j] > 0:
        s = match if a[i - 1] == b[j - 1] else mismatch
        if H[i][j] == H[i - 1][j - 1] + s:
            top.append(a[i - 1]); bottom.append(b[j - 1]); i -= 1; j -= 1
        elif H[i][j] == H[i - 1][j] + gap:
            top.append(a[i - 1]); bottom.append("-"); i -= 1
        else:
            top.append("-"); bottom.append(b[j - 1]); j -= 1
    return best, "".join(reversed(top)), "".join(reversed(bottom))

score, top, bottom = smith_waterman("TGTTACGG", "GGTTGACTA")
print("счёт:", score)
print(top)
print(bottom)
