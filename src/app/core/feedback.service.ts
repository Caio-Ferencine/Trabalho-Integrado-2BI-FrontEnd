import { Injectable, signal } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { AbstractControl } from "@angular/forms";
@Injectable({ providedIn: "root" })
export class FeedbackService {
  mensagem = signal("");
  private timer?: ReturnType<typeof setTimeout>;
  sucesso(texto: string) {
    clearTimeout(this.timer);
    this.mensagem.set(texto);
    this.timer = setTimeout(() => this.mensagem.set(""), 5000);
  }
}
export function mensagemErro(erro: HttpErrorResponse): string {
  if (erro.status === 0)
    return "Não foi possível conectar à API. Verifique se o back-end está em execução.";
  const campos = erro.error?.campos
    ? Object.values(erro.error.campos).join(" ")
    : "";
  return [
    erro.error?.mensagem ||
      `Não foi possível concluir a operação (HTTP ${erro.status}).`,
    campos,
  ]
    .filter(Boolean)
    .join(" ");
}
export function textoObrigatorio(control: AbstractControl) {
  return typeof control.value === "string" && control.value.trim()
    ? null
    : { required: true };
}
export function duasCasas(control: AbstractControl) {
  if (control.value == null) return null;
  const valor = Number(control.value) * 100;
  return Math.abs(valor - Math.round(valor)) < 0.00001 ? null : { casas: true };
}
