import { Component, inject, signal } from "@angular/core";
import { CurrencyPipe } from "@angular/common";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { finalize } from "rxjs";
import { Produto } from "../core/models";
import { ProdutosService } from "../core/produtos.service";
import { FeedbackService, mensagemErro } from "../core/feedback.service";
@Component({
  selector: "app-produto-detalhe",
  imports: [CurrencyPipe, RouterLink],
  template: `
    <a class="back-link" routerLink="/produtos">← Voltar para produtos</a>
    @if (erro()) {
      <div class="alert error" role="alert">{{ erro() }}</div>
    }
    @if (carregando()) {
      <div class="panel empty" role="status">Carregando produto...</div>
    }
    @if (produto(); as p) {
      <div class="page-heading">
        <div>
          <p class="eyebrow">CATÁLOGO / PRODUTO #{{ p.id }}</p>
          <h1>{{ p.nome }}</h1>
          <p class="muted">Informações completas do produto.</p>
        </div>
        <a class="button" [routerLink]="['/produtos', p.id, 'editar']"
          >Editar produto</a
        >
      </div>
      <section class="panel detail-panel">
        <div class="detail-banner">
          <span class="badge">{{ p.categoria.nome }}</span
          ><span class="detail-price">{{ p.preco | currency: "BRL" }}</span>
        </div>
        <dl class="detail-grid">
          <div>
            <dt>Nome</dt>
            <dd>{{ p.nome }}</dd>
          </div>
          <div>
            <dt>Categoria</dt>
            <dd>
              <a [routerLink]="['/categorias', p.categoria.id, 'produtos']"
                >{{ p.categoria.nome }} →</a
              >
            </dd>
          </div>
          <div>
            <dt>Cor</dt>
            <dd>{{ p.cor }}</dd>
          </div>
          <div>
            <dt>Estoque disponível</dt>
            <dd>{{ p.estoque }} unidades</dd>
          </div>
          <div class="span-2">
            <dt>Descrição</dt>
            <dd class="description">{{ p.descricao }}</dd>
          </div>
        </dl>
        <div class="detail-bottom">
          <span class="muted">Código do produto: {{ p.id }}</span
          ><button
            class="button danger-outline"
            (click)="excluir(p)"
            [disabled]="excluindo()"
          >
            {{ excluindo() ? "Excluindo..." : "Excluir produto" }}
          </button>
        </div>
      </section>
    }
  `,
})
export class ProdutoDetalheComponent {
  private api = inject(ProdutosService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private feedback = inject(FeedbackService);
  produto = signal<Produto | null>(null);
  erro = signal("");
  carregando = signal(true);
  excluindo = signal(false);
  constructor() {
    this.api
      .buscar(Number(this.route.snapshot.paramMap.get("id")))
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: (p) => this.produto.set(p),
        error: (e) => this.erro.set(mensagemErro(e)),
      });
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
          void this.router.navigateByUrl("/produtos");
        },
        error: (e) => this.erro.set(mensagemErro(e)),
      });
  }
}
