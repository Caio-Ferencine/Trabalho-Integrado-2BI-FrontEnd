import { Injectable, inject, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { tap } from "rxjs";
import { environment } from "../../environments/environment";
import { Sessao } from "./models";

@Injectable({ providedIn: "root" })
export class AuthService {
  private http = inject(HttpClient);
  private chave = "loja.sessao";
  sessao = signal<Sessao | null>(this.recuperar());
  login(email: string, senha: string) {
    return this.http
      .post<Sessao>(`${environment.apiUrl}/auth/login`, {
        email: email.trim(),
        senha,
      })
      .pipe(
        tap((s) => {
          sessionStorage.setItem(this.chave, JSON.stringify(s));
          this.sessao.set(s);
        }),
      );
  }
  autenticado(): boolean {
    const s = this.sessao();
    if (s && new Date(s.expiraEm).getTime() > Date.now()) return true;
    this.logout();
    return false;
  }
  logout() {
    sessionStorage.removeItem(this.chave);
    this.sessao.set(null);
  }
  private recuperar(): Sessao | null {
    try {
      const s: Sessao | null = JSON.parse(
        sessionStorage.getItem(this.chave) || "null",
      );
      if (s?.token && new Date(s.expiraEm).getTime() > Date.now()) return s;
    } catch {
      /* Uma sessão corrompida é descartada. */
    }
    sessionStorage.removeItem(this.chave);
    return null;
  }
}
