import type { LDAPLoginResult } from '@rocket.chat/core-typings';

export interface ISmsCodeLoginService {
	loginRequest(phone: string, areaCode: string, code: string): Promise<LDAPLoginResult>;
}
