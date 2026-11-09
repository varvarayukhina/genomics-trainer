# Команды из methods_and_limitations.txt твоего пилота (запускал агент). Координаты региона взяты как пример.
miniprot -t4 -j2 -p 0.3 -N 100 --outs=0.3 --outc=0.3 --outn=200 --gff -P hap1c01_ group.fa queries_final.faa
samtools faidx hap1.fna chr3:22580000-24480000 > hap1_region.fa
samtools faidx hap2.fna chr3:22810000-24850000 > hap2_region.fa
minimap2 -x asm10 -c -t 2 hap1_region.fa hap2_region.fa > region.paf
