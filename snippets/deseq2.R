suppressPackageStartupMessages(library(DESeq2))
set.seed(1)
n_genes <- 500
base  <- rgamma(n_genes, shape = 2, scale = 100)            # средняя экспрессия каждого гена
group <- factor(rep(c("control", "infected"), each = 3))    # 3 против 3 образцов
mu <- matrix(base, nrow = n_genes, ncol = 6)
mu[1:50, group == "infected"] <- mu[1:50, group == "infected"] * 2   # у первых 50 генов настоящий эффект x2
counts <- matrix(rnbinom(n_genes * 6, mu = mu, size = 10), nrow = n_genes,
                 dimnames = list(sprintf("gene%03d", 1:n_genes), paste0("s", 1:6)))

dds <- DESeqDataSetFromMatrix(counts, DataFrame(group), ~ group)
dds <- DESeq(dds, quiet = TRUE)
res <- results(dds, contrast = c("group", "infected", "control"))

cat("padj < 0.05:", sum(res$padj < 0.05, na.rm = TRUE), "генов\n")
cat("из них среди 50 настоящих:", sum(res$padj[1:50] < 0.05, na.rm = TRUE), "\n")
cat("ложных среди 450 остальных:", sum(res$padj[51:500] < 0.05, na.rm = TRUE), "\n")
print(head(res[order(res$padj), c("baseMean", "log2FoldChange", "padj")], 5))
