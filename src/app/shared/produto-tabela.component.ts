import { Component, input, output } from "@angular/core";
import { CurrencyPipe } from "@angular/common";
import { RouterLink } from "@angular/router";
import { Produto } from "../core/models";
@Component({
  selector: "app-produto-tabela",
  imports: [CurrencyPipe, RouterLink],
  template: `
    @if (produtos().length) {
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Categoria</th>
              <th>Cor</th>
              <th>Preço</th>
              <th>Estoque</th>
              <th class="right">Ações</th>
            </tr>
          </thead>
          <tbody>
            @for (p of produtos(); track p.id) {
              <tr>
                <td>
                  <a class="product-name" [routerLink]="['/produtos', p.id]">{{
                    p.nome
                  }}</a
                  ><small class="subtext">#{{ p.id }}</small>
                </td>
                <td>
                  <span class="badge">{{ p.categoria.nome }}</span>
                </td>
                <td>{{ p.cor }}</td>
                <td class="money">{{ p.preco | currency: "BRL" }}</td>
                <td>
                  <span class="stock" [class.low]="p.estoque < 10"
                    >{{ p.estoque }} un.</span
                  >
                </td>
                <td>
                  <div class="actions">
                    <a class="text-button" [routerLink]="['/produtos', p.id]"
                      >Detalhes</a
                    ><a
                      class="text-button"
                      [routerLink]="['/produtos', p.id, 'editar']"
                      >Editar</a
                    ><button
                      class="text-button danger"
                      [disabled]="ocupado()"
                      (click)="excluir.emit(p)"
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    } @else {
      <div class="empty">
        <span class="empty-icon" aria-hidden="true">▦</span>
        <h3>Nenhum produto encontrado</h3>
        <p>Cadastre um produto ou ajuste os filtros da consulta.</p>
      </div>
    }
  `,
})
export class ProdutoTabelaComponent {
  produtos = input.required<Produto[]>();
  ocupado = input(false);
  excluir = output<Produto>();
}
