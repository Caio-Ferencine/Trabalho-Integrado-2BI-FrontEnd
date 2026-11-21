import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { Categoria, Produto } from "./models";
@Injectable({ providedIn: "root" })
export class CategoriasService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/categorias`;
  listar() {
    return this.http.get<Categoria[]>(this.url);
  }
  buscar(id: number) {
    return this.http.get<Categoria>(`${this.url}/${id}`);
  }
  produtos(id: number) {
    return this.http.get<Produto[]>(`${this.url}/${id}/produtos`);
  }
  criar(nome: string) {
    return this.http.post<Categoria>(this.url, { nome: nome.trim() });
  }
  atualizar(id: number, nome: string) {
    return this.http.put<Categoria>(`${this.url}/${id}`, { nome: nome.trim() });
  }
  excluir(id: number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
