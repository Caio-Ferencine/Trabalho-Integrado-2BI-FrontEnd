import { Component, DestroyRef, inject, signal } from "@angular/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { catchError, forkJoin, of, switchMap } from "rxjs";
import { Categoria, Produto } from "../core/models";
import { CategoriasService } from "../core/categorias.service";
import { ProdutosService } from "../core/produtos.service";
import { FeedbackService, mensagemErro } from "../core/feedback.service";
import { ProdutoTabelaComponent } from "../shared/produto-tabela.component";
@Component({
  selector: "app-categoria-produtos",
  imports: [RouterLink, ProdutoTabelaComponent],
  template: `
    <a class="back-link" routerLink="/categorias">← Voltar para categorias</a>
    <div class="page-heading">
      <div>
        <p class="eyebrow">CONSULTA POR CATEGORIA</p>
        <h1>{{ categoria()?.nome || "Produtos da categoria" }}</h1>
        <p class="muted">Produtos vinculados à categoria selecionada.</p>
      </div>
      <a class="button" routerLink="/produtos/novo">+ Novo produto</a>
    </div>
    <section class="panel category-select">
      <label for="categoriaConsulta">Consultar outra categoria</label
      ><select id="categoriaConsulta" [value]="id()" (change)="trocar($event)">
        @for (c of categorias(); track c.id) {
          <option [value]="c.id">{{ c.nome }}</option>
        }
      </select>
    </section>
    @if (erro()) {
      <div class="alert error" role="alert">{{ erro() }}</div>
    }
    <section class="panel">
      <div class="section-title table-title">
        <h2>
          Produtos vinculados <span class="count">{{ produtos().length }}</span>
        </h2>
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
export class CategoriaProdutosComponent {
  private api = inject(CategoriasService);
  private produtoApi = inject(ProdutosService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private feedback = inject(FeedbackService);
  private destroyRef = inject(DestroyRef);
  categoria = signal<Categoria | null>(null);
  categorias = signal<Categoria[]>([]);
  produtos = signal<Produto[]>([]);
  id = signal(0);
  carregando = signal(true);
  excluindo = signal(false);
  erro = signal("");
  constructor() {
    this.api
      .listar()
      .subscribe({
        next: (c) => this.categorias.set(c),
        error: (e) => this.erro.set(mensagemErro(e)),
      });
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          this.id.set(Number(params.get("id")));
          this.carregando.set(true);
          this.erro.set("");
          this.produtos.set([]);
          this.categoria.set(null);
          return forkJoin({
            categoria: this.api.buscar(this.id()),
            produtos: this.api.produtos(this.id()),
          }).pipe(
            catchError((e) => {
              this.erro.set(mensagemErro(e));
              return of(null);
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((resultado) => {
        if (resultado) {
          this.categoria.set(resultado.categoria);
          this.produtos.set(resultado.produtos);
        }
        this.carregando.set(false);
      });
  }
  trocar(e: Event) {
    void this.router.navigate([
      "/categorias",
      (e.target as HTMLSelectElement).value,
      "produtos",
    ]);
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
    this.produtoApi.excluir(p.id).subscribe({
      next: () => {
        this.produtos.update((ps) => ps.filter((item) => item.id !== p.id));
        this.feedback.sucesso("Produto excluído com sucesso.");
        this.excluindo.set(false);
      },
      error: (e) => {
        this.erro.set(mensagemErro(e));
        this.excluindo.set(false);
      },
    });
  }
}
