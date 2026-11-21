import { Component, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { finalize } from "rxjs";
import { AuthService } from "../core/auth.service";
import { mensagemErro } from "../core/feedback.service";
@Component({
  selector: "app-login",
  imports: [ReactiveFormsModule],
  template: `
    <div class="login-page">
      <section class="login-intro">
        <div class="brand">
          <span class="brand-mark">L</span><span>loja.</span>
        </div>
        <div>
          <p class="eyebrow light">MENOS COMPLICAÇÃO. MAIS CONTROLE.</p>
          <h1>Seu catálogo<br />em boas mãos.</h1>
          <p>
            Produtos, categorias e estoque em um só lugar.<br />Entre para
            cuidar do que faz sua loja acontecer.
          </p>
          <div class="login-art" aria-hidden="true">
            <div class="art-card">
              <span>Catálogo</span><i></i><i></i><i></i>
            </div>
            <div class="art-label">Tudo no lugar.</div>
          </div>
        </div>
        <span class="login-foot">Gestão simples, do cadastro à consulta.</span>
      </section>
      <section class="login-form">
        <div class="login-box">
          <p class="eyebrow">BEM-VINDO DE VOLTA</p>
          <h2>Acesse sua loja</h2>
          <p class="muted">Informe seus dados para continuar.</p>
          @if (expirada) {
            <div class="alert info" role="status">
              Sua sessão expirou. Faça login novamente.
            </div>
          }
          @if (erro()) {
            <div class="alert error" role="alert">{{ erro() }}</div>
          }
          <form [formGroup]="form" (ngSubmit)="entrar()" novalidate>
            <label for="email">E-mail</label
            ><input
              id="email"
              type="email"
              formControlName="email"
              autocomplete="username"
              placeholder="seu@email.com"
            />
            @if (form.controls.email.touched && form.controls.email.invalid) {
              <small class="field-error">Informe um e-mail válido.</small>
            }
            <label for="senha">Senha</label
            ><input
              id="senha"
              type="password"
              formControlName="senha"
              autocomplete="current-password"
              placeholder="Sua senha"
            />
            @if (form.controls.senha.touched && form.controls.senha.invalid) {
              <small class="field-error">Informe a senha.</small>
            }
            <button class="button full" type="submit" [disabled]="ocupado()">
              {{ ocupado() ? "Entrando..." : "Entrar na loja" }}
              <span aria-hidden="true">→</span>
            </button>
          </form>
          <p class="login-note">Acesso restrito à equipe de gestão.</p>
        </div>
        <span class="login-copyright">Loja · UNIPAR · 2º Bimestre</span>
      </section>
    </div>
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  erro = signal("");
  ocupado = signal(false);
  expirada = this.route.snapshot.queryParamMap.has("expirada");
  form = this.fb.nonNullable.group({
    email: [
      "",
      [Validators.required, Validators.email, Validators.maxLength(180)],
    ],
    senha: ["", [Validators.required, Validators.maxLength(100)]],
  });
  entrar() {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.ocupado()) return;
    this.ocupado.set(true);
    this.erro.set("");
    const { email, senha } = this.form.getRawValue();
    this.auth
      .login(email, senha)
      .pipe(finalize(() => this.ocupado.set(false)))
      .subscribe({
        next: () => {
          const retorno = this.route.snapshot.queryParamMap.get("retorno");
          void this.router.navigateByUrl(
            retorno?.match(/^\/(produtos|categorias)(\/|\?|$)/)
              ? retorno
              : "/produtos",
          );
        },
        error: (e) => this.erro.set(mensagemErro(e)),
      });
  }
}
