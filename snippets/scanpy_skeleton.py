import scanpy as sc

adata = sc.read_10x_mtx("filtered_feature_bc_matrix/")        # матрица клетки × гены
sc.pp.filter_cells(adata, min_genes=200)                       # убрать «пустые» капли
sc.pp.filter_genes(adata, min_cells=3)
# Имена митохондриальных генов зависят от аннотации вида: проверь, как они называются у тебя.
adata.var["mt"] = adata.var_names.str.startswith("MT-")
sc.pp.calculate_qc_metrics(adata, qc_vars=["mt"], inplace=True)
adata = adata[adata.obs["pct_counts_mt"] < 15].copy()

sc.pp.normalize_total(adata, target_sum=1e4)                   # на размер библиотеки
sc.pp.log1p(adata)
sc.pp.highly_variable_genes(adata, n_top_genes=2000)
sc.pp.pca(adata, n_comps=30)
sc.pp.neighbors(adata, n_neighbors=15)
sc.tl.leiden(adata, resolution=0.5)                            # число кластеров зависит от resolution
sc.tl.umap(adata)                                              # только для картинки
sc.tl.rank_genes_groups(adata, "leiden", method="wilcoxon")    # маркеры кластеров
