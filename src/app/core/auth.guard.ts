import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "./auth.service";
export const authGuard: CanActivateFn = (_route, state) => {
  return (
    inject(AuthService).autenticado() ||
    inject(Router).createUrlTree(["/login"], {
      queryParams: { retorno: state.url },
    })
  );
};
