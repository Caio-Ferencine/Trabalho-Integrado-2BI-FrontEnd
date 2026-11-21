import { Component, inject } from "@angular/core";
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from "@angular/router";
import { AuthService } from "../core/auth.service";
@Component({
  selector: "app-layout",
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-shell">
      <aside class="sidebar">
        <a class="brand" routerLink="/produtos"
          ><span class="brand-mark">L</span
          ><span>loja<span class="brand-dot">.</span></span></a
        >
        <p class="nav-label">GESTÃO DO CATÁLOGO</p>
        <nav aria-label="Menu principal">
          <a routerLink="/produtos" routerLinkActive="active"
            ><span class="nav-icon" aria-hidden="true">▦</span> Produtos</a
          >
          <a routerLink="/categorias" routerLinkActive="active"
            ><span class="nav-icon" aria-hidden="true">◫</span> Categorias</a
          >
        </nav>
        <div class="sidebar-bottom">
          <span class="avatar">AD</span>
          <div>
            <strong>{{ auth.sessao()?.nome }}</strong
            ><small>{{ auth.sessao()?.email }}</small>
          </div>
          <button
            class="logout"
            (click)="sair()"
            aria-label="Sair da conta"
            title="Sair da conta"
          >
            Sair
          </button>
        </div>
      </aside>
      <div class="workspace">
        <header class="topbar">
          <span>Seu catálogo, organizado.</span
          ><span class="topbar-tag">Painel de gestão</span>
        </header>
        <main id="conteudo"><router-outlet /></main>
        <footer>Loja · Trabalho integrado · UNIPAR</footer>
      </div>
    </div>
  `,
})
export class LayoutComponent {
  auth = inject(AuthService);
  private router = inject(Router);
  sair() {
    this.auth.logout();
    void this.router.navigateByUrl("/login");
  }
}
