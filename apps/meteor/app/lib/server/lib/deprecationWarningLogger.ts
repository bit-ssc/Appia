import { Logger } from '../../../logger/server';

const deprecationLogger = new Logger('DeprecationWarning');

export const apiDeprecationLogger = deprecationLogger.section('API');
export const methodDeprecationLogger = deprecationLogger.section('METHOD');
export const streamDeprecationLogger = deprecationLogger.section('STREAM');
