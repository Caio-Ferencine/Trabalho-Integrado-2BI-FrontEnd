import { Component, computed, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { finalize } from "rxjs";
import { ProdutosService } from "../core/produtos.service";
import { Produto } from "../core/models";
import { FeedbackService, mensagemErro } from "../core/feedback.service";
import { ProdutoTabelaComponent } from "../shared/produto-tabela.component";
@Component({
  selector: "app-produtos",
  imports: [ReactiveFormsModule, RouterLink, ProdutoTabelaComponent],
  template: `
    <div class="page-heading">
      <div>
        <p class="eyebrow">CATÁLOGO</p>
        <h1>Produtos</h1>
        <p class="muted">Organize os produtos e acompanhe o seu estoque.</p>
      </div>
      <a class="button" routerLink="/produtos/novo"
        ><span aria-hidden="true">+</span> Novo produto</a
      >
    </div>
    <div class="stats">
      <div class="stat">
        <span>Produtos na consulta</span><strong>{{ produtos().length }}</strong
        ><small>Registros encontrados</small>
      </div>
      <div class="stat">
        <span>Unidades em estoque</span><strong>{{ unidades() }}</strong
        ><small>Dos produtos desta consulta</small>
      </div>
      <div class="stat accent">
        <span>Estoque abaixo de 10</span><strong>{{ baixoEstoque() }}</strong
        ><small>Produtos que merecem atenção</small>
      </div>
    </div>
    <section class="panel filters">
      <div class="section-title">
        <h2>Encontre um produto</h2>
        <span class="muted">Combine os filtros</span>
      </div>
      <form [formGroup]="form" (ngSubmit)="buscar()" class="filter-grid">
        <div>
          <label for="nome">Nome do produto</label
          ><input
            id="nome"
            formControlName="nome"
            placeholder="Buscar pelo nome"
            maxlength="120"
          />
        </div>
        <div>
          <label for="cor">Cor</label
          ><input
            id="cor"
            formControlName="cor"
            placeholder="Ex.: azul"
            maxlength="40"
          />
        </div>
        <div>
          <label for="precoMax">Preço máximo (R$)</label
          ><input
            id="precoMax"
            type="number"
            min="0"
            step="0.01"
            formControlName="precoMax"
            placeholder="Sem limite"
          />
        </div>
        <div class="filter-actions">
          <button class="button" [disabled]="carregando() || form.invalid">
            Buscar</button
          ><button
            type="button"
            class="button secondary"
            (click)="limpar()"
            [disabled]="carregando()"
          >
            Limpar
          </button>
        </div>
      </form>
      @if (form.controls.precoMax.invalid) {
        <small class="field-error">O preço máximo não pode ser negativo.</small>
      }
    </section>
    @if (erro()) {
      <div class="alert error" role="alert">{{ erro() }}</div>
    }
    <section class="panel">
      <div class="section-title table-title">
        <h2>
          Catálogo de produtos
          <span class="count">{{ produtos().length }}</span>
        </h2>
        <span class="muted">Ordenado por nome</span>
      </div>
      @if (carregando()) {
        <div class="empty" role="status">Carregando produtos...</div>
      } @else {
        <app-produto-tabela
          [produtos]="produtos()"
          [ocupado]="excluindo()"
          (excluir)="excluir($event)"
        />
      }
    </section>
  `,
})
export class ProdutosComponent {
  private api = inject(ProdutosService);
  private fb = inject(FormBuilder);
  private feedback = inject(FeedbackService);
  produtos = signal<Produto[]>([]);
  carregando = signal(false);
  excluindo = signal(false);
  erro = signal("");
  unidades = computed(() => this.produtos().reduce((n, p) => n + p.estoque, 0));
  baixoEstoque = computed(
    () => this.produtos().filter((p) => p.estoque < 10).length,
  );
  form = this.fb.group({
    nome: [""],
    cor: [""],
    precoMax: [null as number | null, Validators.min(0)],
  });
  constructor() {
    this.buscar();
  }
  buscar() {
    if (this.form.invalid) return;
    this.carregando.set(true);
    this.erro.set("");
    const v = this.form.getRawValue();
    this.api
      .listar({ nome: v.nome || "", cor: v.cor || "", precoMax: v.precoMax })
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: (p) => this.produtos.set(p),
        error: (e) => {
          this.produtos.set([]);
          this.erro.set(mensagemErro(e));
        },
      });
  }
  limpar() {
    this.form.reset();
    this.buscar();
  }
  excluir(p: Produto) {
    if (
      this.excluindo() ||
      !confirm(
        `Excluir o produto "${p.nome}"? Esta ação não pode ser desfeita.`,
      )
    )
      return;
    this.excluindo.set(true);
    this.api
      .excluir(p.id)
      .pipe(finalize(() => this.excluindo.set(false)))
      .subscribe({
        next: () => {
          this.feedback.sucesso("Produto excluído com sucesso.");
          this.buscar();
        },
        error: (e) => this.erro.set(mensagemErro(e)),
      });
  }
}
