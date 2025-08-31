// Auto-generated NGXS scaffolding (beginner-friendly). Keep logic simple.
export namespace AuthActions {
  export class Login {
    static readonly type = '[Auth] Login';
    constructor(public email: string, public password: string) { }
  }
  export class Logout {
    static readonly type = '[Auth] Logout';
  }
  export class RefreshToken {
    static readonly type = '[Auth] Refresh Token';
  }
}
