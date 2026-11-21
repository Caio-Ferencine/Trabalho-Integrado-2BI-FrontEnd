import { Component, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { finalize, forkJoin, of } from "rxjs";
import { ProdutosService } from "../core/produtos.service";
import { CategoriasService } from "../core/categorias.service";
import { Categoria } from "../core/models";
import {
  FeedbackService,
  mensagemErro,
  textoObrigatorio,
  duasCasas,
} from "../core/feedback.service";
@Component({
  selector: "app-produto-form",
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <a class="back-link" routerLink="/produtos">← Voltar para produtos</a>
    <div class="page-heading">
      <div>
        <p class="eyebrow">CATÁLOGO / {{ id ? "EDIÇÃO" : "CADASTRO" }}</p>
        <h1>{{ id ? "Editar produto" : "Novo produto" }}</h1>
        <p class="muted">
          Preencha as informações para manter o catálogo atualizado.
        </p>
      </div>
    </div>
    @if (erro()) {
      <div class="alert error" role="alert">{{ erro() }}</div>
    }
    @if (carregando()) {
      <div class="panel empty" role="status">Carregando formulário...</div>
    } @else if (pronto()) {
      @if (!categorias().length) {
        <div class="alert info">
          Cadastre uma categoria antes de criar um produto.
          <a routerLink="/categorias">Ir para categorias</a>
        </div>
      }
      <form
        class="panel form-panel"
        [formGroup]="form"
        (ngSubmit)="salvar()"
        novalidate
      >
        <h2>Informações do produto</h2>
        <p class="muted">Todos os campos são obrigatórios.</p>
        <div class="form-grid">
          <div class="span-2">
            <label for="nome">Nome do produto</label
            ><input
              id="nome"
              formControlName="nome"
              maxlength="120"
              placeholder="Ex.: Caneta esferográfica"
            />
            @if (invalido("nome")) {
              <small class="field-error"
                >Informe um nome de até 120 caracteres.</small
              >
            }
          </div>
          <div>
            <label for="categoriaId">Categoria</label
            ><select id="categoriaId" formControlName="categoriaId">
              <option [ngValue]="null">Selecione uma categoria</option>
              @for (c of categorias(); track c.id) {
                <option [ngValue]="c.id">{{ c.nome }}</option>
              }
            </select>
            @if (invalido("categoriaId")) {
              <small class="field-error">Selecione a categoria.</small>
            }
          </div>
          <div>
            <label for="cor">Cor</label
            ><input
              id="cor"
              formControlName="cor"
              maxlength="40"
              placeholder="Ex.: azul"
            />
            @if (invalido("cor")) {
              <small class="field-error"
                >Informe a cor, com até 40 caracteres.</small
              >
            }
          </div>
          <div>
            <label for="preco">Preço (R$)</label
            ><input
              id="preco"
              type="number"
              step="0.01"
              min="0.01"
              max="9999999999.99"
              formControlName="preco"
              placeholder="0,00"
            />
            @if (invalido("preco")) {
              <small class="field-error"
                >Informe um valor entre 0,01 e 9.999.999.999,99, com até 2 casas
                decimais.</small
              >
            }
          </div>
          <div>
            <label for="estoque">Quantidade em estoque</label
            ><input
              id="estoque"
              type="number"
              step="1"
              min="0"
              formControlName="estoque"
            />
            @if (invalido("estoque")) {
              <small class="field-error"
                >Informe uma quantidade inteira entre 0 e 2.147.483.647.</small
              >
            }
          </div>
          <div class="span-2">
            <label for="descricao">Descrição</label
            ><textarea
              id="descricao"
              rows="4"
              maxlength="1000"
              formControlName="descricao"
              placeholder="Descreva as características do produto"
            ></textarea>
            @if (invalido("descricao")) {
              <small class="field-error"
                >Informe a descrição, com até 1.000 caracteres.</small
              >
            }
          </div>
        </div>
        <div class="form-actions">
          <a class="button secondary" routerLink="/produtos">Cancelar</a
          ><button
            class="button"
            [disabled]="salvando() || !categorias().length"
          >
            {{ salvando() ? "Salvando..." : "Salvar produto" }}
          </button>
        </div>
      </form>
    }
  `,
})
export class ProdutoFormComponent {
  private fb = inject(FormBuilder);
  private api = inject(ProdutosService);
  private categoriaApi = inject(CategoriasService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private feedback = inject(FeedbackService);
  id = this.route.snapshot.paramMap.has("id")
    ? Number(this.route.snapshot.paramMap.get("id"))
    : null;
  categorias = signal<Categoria[]>([]);
  carregando = signal(true);
  salvando = signal(false);
  pronto = signal(false);
  erro = signal("");
  form = this.fb.group({
    nome: ["", [textoObrigatorio, Validators.maxLength(120)]],
    descricao: ["", [textoObrigatorio, Validators.maxLength(1000)]],
    cor: ["", [textoObrigatorio, Validators.maxLength(40)]],
    preco: [
      null as number | null,
      [
        Validators.required,
        Validators.min(0.01),
        Validators.max(9999999999.99),
        duasCasas,
      ],
    ],
    estoque: [
      0,
      [
        Validators.required,
        Validators.min(0),
        Validators.max(2147483647),
        Validators.pattern(/^\d+$/),
      ],
    ],
    categoriaId: [null as number | null, Validators.required],
  });
  constructor() {
    forkJoin({
      categorias: this.categoriaApi.listar(),
      produto: this.id !== null ? this.api.buscar(this.id) : of(null),
    })
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: ({ categorias, produto }) => {
          this.categorias.set(categorias);
          if (produto)
            this.form.patchValue({
              ...produto,
              categoriaId: produto.categoria.id,
            });
          this.pronto.set(true);
        },
        error: (e) => this.erro.set(mensagemErro(e)),
      });
  }
  invalido(campo: string) {
    const c = this.form.get(campo);
    return c?.touched && c.invalid;
  }
  salvar() {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.salvando()) return;
    const v = this.form.getRawValue();
    const dto = {
      nome: v.nome!.trim(),
      descricao: v.descricao!.trim(),
      cor: v.cor!.trim(),
      preco: v.preco!,
      estoque: v.estoque!,
      categoriaId: v.categoriaId!,
    };
    this.salvando.set(true);
    this.erro.set("");
    const requisicao =
      this.id !== null ? this.api.atualizar(this.id, dto) : this.api.criar(dto);
    requisicao.pipe(finalize(() => this.salvando.set(false))).subscribe({
      next: (p) => {
        this.feedback.sucesso(
          this.id
            ? "Produto atualizado com sucesso."
            : "Produto cadastrado com sucesso.",
        );
        void this.router.navigate(["/produtos", p.id]);
      },
      error: (e) => this.erro.set(mensagemErro(e)),
    });
  }
}
