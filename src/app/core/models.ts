export interface Categoria {
  id: number;
  nome: string;
}
export interface Produto {
  id: number;
  nome: string;
  descricao: string;
  cor: string;
  preco: number;
  estoque: number;
  categoria: Categoria;
}
export interface ProdutoRequest {
  nome: string;
  descricao: string;
  cor: string;
  preco: number;
  estoque: number;
  categoriaId: number;
}
export interface Sessao {
  token: string;
  tipo: string;
  expiraEm: string;
  nome: string;
  email: string;
}
export interface Filtros {
  nome?: string;
  cor?: string;
  precoMax?: number | null;
}
