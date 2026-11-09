# Шаблон экзомного пайплайна GATK. Имена файлов условные, на данных не запускался.
bwa-mem2 mem -t 8 -R "@RG\tID:s1\tSM:s1\tPL:ILLUMINA" GRCh38.fa s1_R1.fq.gz s1_R2.fq.gz \
  | samtools sort -@ 4 -o s1.sorted.bam -
samtools index s1.sorted.bam
gatk MarkDuplicates -I s1.sorted.bam -O s1.dedup.bam -M s1.dup.metrics.txt
gatk BaseRecalibrator -I s1.dedup.bam -R GRCh38.fa --known-sites dbsnp.vcf.gz -O s1.recal.table
gatk ApplyBQSR -I s1.dedup.bam -R GRCh38.fa --bqsr-recal-file s1.recal.table -O s1.bqsr.bam
gatk HaplotypeCaller -R GRCh38.fa -I s1.bqsr.bam -O s1.g.vcf.gz -ERC GVCF -L exome_targets.bed
# все образцы вместе
gatk CombineGVCFs -R GRCh38.fa -V s1.g.vcf.gz -V s2.g.vcf.gz -O cohort.g.vcf.gz
gatk GenotypeGVCFs -R GRCh38.fa -V cohort.g.vcf.gz -O cohort.vcf.gz
