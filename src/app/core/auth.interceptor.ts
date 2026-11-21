import { inject } from "@angular/core";
import { HttpInterceptorFn } from "@angular/common/http";
import { Router } from "@angular/router";
import { catchError, throwError } from "rxjs";
import { environment } from "../../environments/environment";
import { AuthService } from "./auth.service";
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const protegida =
    req.url.startsWith(environment.apiUrl + "/") &&
    !req.url.endsWith("/auth/login");
  const token = auth.sessao()?.token;
  const request =
    protegida && token
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;
  return next(request).pipe(
    catchError((erro) => {
      if (protegida && erro.status === 401) {
        auth.logout();
        void router.navigate(["/login"], { queryParams: { expirada: "1" } });
      }
      return throwError(() => erro);
    }),
  );
};
