import type { FC } from 'react';
import React from 'react';

import BaseAvatar from '../../../avatar/BaseAvatar';

const AuthorAvatar: FC<{ url: string }> = ({ url }) => <BaseAvatar {...({ url, size: 'x24' } as any)} />;

export default AuthorAvatar;
