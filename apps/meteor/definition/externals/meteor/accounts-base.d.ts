declare module 'meteor/accounts-base' {
	namespace Accounts {
		function createUser(
			options: {
				username?: string;
				email?: string;
				password?: string;
				profile?: Record<string, unknown>;
				joinDefaultChannelsSilenced?: boolean;
			},
			callback?: (error?: Error | Meteor.Error | Meteor.TypedError) => void,
		): string;

		function _bcryptRounds(): number;

		function _getLoginToken(connectionId: string): string | undefined;

		function insertUserDoc(options: Record<string, any>, user: Record<string, any>): string;

		function _generateStampedLoginToken(): { token: string; when: Date };

		function _insertLoginToken(userId: string, token: { token: string; when: Date }): void;

		function _runLoginHandlers<T>(methodInvocation: T, loginRequest: Record<string, any>): LoginMethodResult | undefined;

		function registerLoginHandler(name: string, handler: (options: any) => undefined | Object): void;

		function _storedLoginToken(): unknown;

		function _unstoreLoginToken(): void;

		function _setAccountData(connectionId: string, key: string, token: string): void;

		function updateOrCreateUserFromExternalService(
			serviceName: string,
			serviceData: Record<string, unknown>,
			options: Record<string, unknown>,
		): Record<string, unknown>;

		function _clearAllLoginTokens(userId: string | null): void;

		class ConfigError extends Error {}

		class LoginCancelledError extends Error {
			public static readonly numericError: number;
		}

		const USER_ID_KEY: string;

		const LOGIN_TOKEN_KEY: string;

		const _accountData: Record<string, any>;
	}
}
