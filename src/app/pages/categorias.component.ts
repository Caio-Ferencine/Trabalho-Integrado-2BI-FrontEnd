import { Component, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { finalize } from "rxjs";
import { Categoria } from "../core/models";
import { CategoriasService } from "../core/categorias.service";
import {
  FeedbackService,
  mensagemErro,
  textoObrigatorio,
} from "../core/feedback.service";
@Component({
  selector: "app-categorias",
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="page-heading">
      <div>
        <p class="eyebrow">ORGANIZAÇÃO</p>
        <h1>Categorias</h1>
        <p class="muted">Agrupe seus produtos e consulte cada coleção.</p>
      </div>
      <span class="pill">{{ categorias().length }} categorias</span>
    </div>
    @if (erro()) {
      <div class="alert error" role="alert">{{ erro() }}</div>
    }
    <div class="category-layout">
      <section class="panel">
        <div class="section-title table-title">
          <h2>Suas categorias</h2>
          <span class="muted">Relacionamento com produtos</span>
        </div>
        @if (carregando()) {
          <div class="empty" role="status">Carregando categorias...</div>
        } @else {
          @for (c of categorias(); track c.id) {
            <article class="category-row">
              <span class="category-symbol" aria-hidden="true">◫</span>
              <div class="category-name">
                <h3>{{ c.nome }}</h3>
                <a [routerLink]="['/categorias', c.id, 'produtos']"
                  >Ver produtos da categoria →</a
                >
              </div>
              <div class="actions">
                <button
                  class="text-button"
                  (click)="editar(c)"
                  [disabled]="ocupado()"
                >
                  Editar</button
                ><button
                  class="text-button danger"
                  (click)="excluir(c)"
                  [disabled]="ocupado()"
                >
                  Excluir
                </button>
              </div>
            </article>
          } @empty {
            <div class="empty">
              <h3>Nenhuma categoria cadastrada</h3>
              <p>Crie a primeira categoria no formulário.</p>
            </div>
          }
        }
      </section>
      <form
        class="panel category-form"
        [formGroup]="form"
        (ngSubmit)="salvar()"
        novalidate
      >
        <h2>{{ editando() ? "Editar categoria" : "Nova categoria" }}</h2>
        <p class="muted">Use um nome simples para facilitar a organização.</p>
        <label for="nomeCategoria">Nome da categoria</label
        ><input
          id="nomeCategoria"
          formControlName="nome"
          maxlength="80"
          placeholder="Ex.: Papelaria"
        />
        @if (form.controls.nome.touched && form.controls.nome.invalid) {
          <small class="field-error"
            >Informe um nome de até 80 caracteres.</small
          >
        }
        <button class="button full" [disabled]="ocupado()">
          {{ ocupado() ? "Aguarde..." : "Salvar categoria" }}
        </button>
        @if (editando()) {
          <button
            type="button"
            class="button secondary full"
            (click)="cancelar()"
            [disabled]="ocupado()"
          >
            Cancelar edição
          </button>
        }
        <p class="form-tip">
          Categorias com produtos vinculados não podem ser excluídas.
        </p>
      </form>
    </div>
  `,
})
export class CategoriasComponent {
  private api = inject(CategoriasService);
  private fb = inject(FormBuilder);
  private feedback = inject(FeedbackService);
  categorias = signal<Categoria[]>([]);
  editando = signal<number | null>(null);
  carregando = signal(false);
  ocupado = signal(false);
  erro = signal("");
  form = this.fb.nonNullable.group({
    nome: ["", [textoObrigatorio, Validators.maxLength(80)]],
  });
  constructor() {
    this.carregar();
  }
  carregar() {
    this.carregando.set(true);
    this.api
      .listar()
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: (c) => this.categorias.set(c),
        error: (e) => this.erro.set(mensagemErro(e)),
      });
  }
  editar(c: Categoria) {
    this.editando.set(c.id);
    this.form.setValue({ nome: c.nome });
    this.erro.set("");
    document.getElementById("nomeCategoria")?.focus();
  }
  cancelar() {
    this.editando.set(null);
    this.form.reset();
  }
  salvar() {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.ocupado()) return;
    this.ocupado.set(true);
    this.erro.set("");
    const id = this.editando();
    const nome = this.form.getRawValue().nome;
    (id !== null ? this.api.atualizar(id, nome) : this.api.criar(nome))
      .pipe(finalize(() => this.ocupado.set(false)))
      .subscribe({
        next: () => {
          this.feedback.sucesso(
            id
              ? "Categoria atualizada com sucesso."
              : "Categoria cadastrada com sucesso.",
          );
          this.cancelar();
          this.carregar();
        },
        error: (e) => this.erro.set(mensagemErro(e)),
      });
  }
  excluir(c: Categoria) {
    if (this.ocupado() || !confirm(`Excluir a categoria "${c.nome}"?`)) return;
    this.ocupado.set(true);
    this.erro.set("");
    this.api
      .excluir(c.id)
      .pipe(finalize(() => this.ocupado.set(false)))
      .subscribe({
        next: () => {
          this.feedback.sucesso("Categoria excluída com sucesso.");
          if (this.editando() === c.id) this.cancelar();
          this.carregar();
        },
        error: (e) => this.erro.set(mensagemErro(e)),
      });
  }
}
