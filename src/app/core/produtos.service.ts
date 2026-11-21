import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { Filtros, Produto, ProdutoRequest } from "./models";
@Injectable({ providedIn: "root" })
export class ProdutosService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/produtos`;
  listar(filtros: Filtros = {}) {
    let params = new HttpParams();
    if (filtros.nome?.trim()) params = params.set("nome", filtros.nome.trim());
    if (filtros.cor?.trim()) params = params.set("cor", filtros.cor.trim());
    if (filtros.precoMax != null)
      params = params.set("precoMax", filtros.precoMax);
    return this.http.get<Produto[]>(this.url, { params });
  }
  buscar(id: number) {
    return this.http.get<Produto>(`${this.url}/${id}`);
  }
  criar(dto: ProdutoRequest) {
    return this.http.post<Produto>(this.url, dto);
  }
  atualizar(id: number, dto: ProdutoRequest) {
    return this.http.put<Produto>(`${this.url}/${id}`, dto);
  }
  excluir(id: number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
