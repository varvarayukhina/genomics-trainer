# Один и тот же ген в разных форматах. GFF3/VCF/SAM: счёт с 1, конец включён.
# BED/PAF: счёт с 0, конец не включён.
gff_start, gff_end = 101, 200

bed_start, bed_end = gff_start - 1, gff_end
print("GFF3:", gff_start, gff_end, "-> длина", gff_end - gff_start + 1)
print("BED: ", bed_start, bed_end, "-> длина", bed_end - bed_start)

# обратно
print("BED -> GFF:", bed_start + 1, bed_end)

# samtools faidx принимает регион в координатах 1-based
print(f"samtools faidx genome.fa chr3:{gff_start}-{gff_end}")
