export interface RefreshToken{token:string;userId:string;expiresAt:number;revoked:boolean;}
export class RefreshTokenStore{private static tokens=new Map<string,RefreshToken>();static save(t:RefreshToken){this.tokens.set(t.token,t);}static get(token:string){return this.tokens.get(token);}static revoke(token:string){const t=this.tokens.get(token);if(t)t.revoked=true;}}
