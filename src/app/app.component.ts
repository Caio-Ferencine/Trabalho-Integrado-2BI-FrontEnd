import { Component, inject } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { FeedbackService } from "./core/feedback.service";
@Component({
  selector: "app-root",
  imports: [RouterOutlet],
  template: `
    <router-outlet />
    @if (feedback.mensagem()) {
      <div class="toast" role="status">
        {{ feedback.mensagem()
        }}<button
          (click)="feedback.mensagem.set('')"
          aria-label="Fechar mensagem"
        >
          ×
        </button>
      </div>
    }
  `,
})
export class AppComponent {
  feedback = inject(FeedbackService);
}
