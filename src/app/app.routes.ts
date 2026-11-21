import { Routes } from "@angular/router";
import { authGuard } from "./core/auth.guard";
import { LayoutComponent } from "./shared/layout.component";
export const routes: Routes = [
  {
    path: "login",
    loadComponent: () =>
      import("./pages/login.component").then((m) => m.LoginComponent),
  },
  {
    path: "",
    component: LayoutComponent,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      { path: "", pathMatch: "full", redirectTo: "produtos" },
      {
        path: "produtos",
        loadComponent: () =>
          import("./pages/produtos.component").then((m) => m.ProdutosComponent),
      },
      {
        path: "produtos/novo",
        loadComponent: () =>
          import("./pages/produto-form.component").then(
            (m) => m.ProdutoFormComponent,
          ),
      },
      {
        path: "produtos/:id/editar",
        loadComponent: () =>
          import("./pages/produto-form.component").then(
            (m) => m.ProdutoFormComponent,
          ),
      },
      {
        path: "produtos/:id",
        loadComponent: () =>
          import("./pages/produto-detalhe.component").then(
            (m) => m.ProdutoDetalheComponent,
          ),
      },
      {
        path: "categorias",
        loadComponent: () =>
          import("./pages/categorias.component").then(
            (m) => m.CategoriasComponent,
          ),
      },
      {
        path: "categorias/:id/produtos",
        loadComponent: () =>
          import("./pages/categoria-produtos.component").then(
            (m) => m.CategoriaProdutosComponent,
          ),
      },
      {
        path: "**",
        loadComponent: () =>
          import("./pages/nao-encontrada.component").then(
            (m) => m.NaoEncontradaComponent,
          ),
      },
    ],
  },
];
