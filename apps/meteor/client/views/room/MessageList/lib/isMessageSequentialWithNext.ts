import type { IMessage } from '@rocket.chat/core-typings';
import { differenceInSeconds } from 'date-fns';
import { MessageTypes } from '../../../../../app/ui-utils/lib/MessageTypes';
import { isMessageNewDay } from './isMessageNewDay';

export const isMessageSequentialWithNext = (
  current: IMessage,
  next: IMessage | undefined,
  groupingRange: number,
): boolean => {
  if (!next) {
    return false;
  }

  if (MessageTypes.isSystemMessage(current) || MessageTypes.isSystemMessage(next)) {
    return false;
  }

  if (current.tmid) {
    return [next.tmid, next._id].includes(current.tmid);
  }

  if (next.tmid) {
    return false;
  }

  // if (current.groupable === false) {
  //   return false;
  // }

  if (current.u._id !== next.u._id) {
    return false;
  }

  if (current.alias !== next.alias) {
    return false;
  }

  return (
    differenceInSeconds(next.ts, current.ts) < groupingRange &&
    !isMessageNewDay(current, next)
  );
};
