import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
@Component({
  selector: "app-nao-encontrada",
  imports: [RouterLink],
  template: `<section class="panel empty">
    <p class="eyebrow">404</p>
    <h1>Página não encontrada</h1>
    <p>Confira o endereço ou volte para o catálogo.</p>
    <a class="button" routerLink="/produtos">Ir para produtos</a>
  </section>`,
})
export class NaoEncontradaComponent {}
