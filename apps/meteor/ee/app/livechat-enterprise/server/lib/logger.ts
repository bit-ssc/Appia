import { Logger } from '../../../../../app/logger/server';

export const logger = new Logger('LivechatEnterprise');

export const queriesLogger = logger.section('Queries');
export const queueLogger = logger.section('Queue');
export const helperLogger = logger.section('Helper');
export const cbLogger = logger.section('Callbacks');
export const bhLogger = logger.section('Business-Hours');
