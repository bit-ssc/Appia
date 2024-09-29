import { Random } from '@rocket.chat/random';

export const getLogId = function () {
	return Random._randomString(12, 'abcdefghrjklmnopqistuvwxyz');
};
