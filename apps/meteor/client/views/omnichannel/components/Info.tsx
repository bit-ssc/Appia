import { css } from '@rocket.chat/css-in-js';
import type { CSSProperties, FC } from 'react';
import React from 'react';

import UserCard from '../../../components/UserCard';

const wordBreak = css`
	word-break: break-word;
`;

const Info: FC<{ className?: string; style?: CSSProperties }> = ({ className, ...props }) => (
	<UserCard.Info className={[className, wordBreak]} flexShrink={0} {...props} />
);

export default Info;
