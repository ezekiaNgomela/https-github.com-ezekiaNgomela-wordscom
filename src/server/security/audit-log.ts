export type AuditEventType='LOGIN_SUCCESS'|'LOGIN_FAILURE'|'OTP_SENT'|'OTP_VERIFIED'|'PASSWORD_CHANGED'|'EMAIL_CHANGED'|'PLAN_UPGRADED';
export interface AuditEvent{type:AuditEventType;userId?:string;timestamp:number;metadata?:Record<string,unknown>;}
export class AuditLogger{private static events:AuditEvent[]=[];static log(event:AuditEvent){this.events.push(event);}static list(){return this.events;}}
