// Auto-generated NGXS scaffolding (beginner-friendly). Keep logic simple.
import { Injectable, inject } from '@angular/core';
import { State, Selector, Action, StateContext } from '@ngxs/store';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthActions } from './auth.actions';
import { LoginService } from '../../Services/login.service';

export interface AuthModel {
  token: string | null;
  role: 'Admin' | 'Doctor' | 'Receptionist' | null;
  userEmail: string | null;
  isAuthenticated: boolean;
}

@State<AuthModel>({
  name: 'auth',
  defaults: {
    token: null,
    role: null,
    userEmail: null,
    isAuthenticated: false
  }
})
@Injectable()
export class AuthState {
  private loginApi = inject(LoginService);

  // Selectors
  @Selector() static token(s: AuthModel) { return s.token; }
  @Selector() static role(s: AuthModel) { return s.role; }
  @Selector() static isAuthenticated(s: AuthModel) { return s.isAuthenticated; }

  // Actions
  @Action(AuthActions.Login)
  login(ctx: StateContext<AuthModel>, { email, password }: AuthActions.Login) {
    return this.loginApi.getLoginResponse(email, password).pipe(
      tap((res: any) => {
        const token = res?.token ?? null;
        const role  = res?.role ?? null;
        ctx.patchState({ token, role, userEmail: email, isAuthenticated: !!token });
      }),
      catchError((err) => {
        ctx.setState({ token: null, role: null, userEmail: null, isAuthenticated: false });
        return of(null);
      })
    );
  }

  @Action(AuthActions.Logout)
  logout(ctx: StateContext<AuthModel>) {
    ctx.setState({ token: null, role: null, userEmail: null, isAuthenticated: false });
  }

  @Action(AuthActions.RefreshToken)
  refreshToken(ctx: StateContext<AuthModel>) {
    // Simple beginner stub: implement real refresh with your API here.
    const state = ctx.getState();
    if (!state.token) return of(null);
    return of(null);
  }
}
