import type { ReactElement } from 'react';
import React, { forwardRef } from 'react';

import ScrollableContentWrapper from '../../components/ScrollableContentWrapper';

const ScrollerWithCustomProps = forwardRef(function ScrollerWithCustomProps(props, ref: React.Ref<HTMLDivElement>) {
	return (
		<ScrollableContentWrapper
			{...props}
			ref={ref}
			renderView={({ style, ...props }): ReactElement => <div {...props} style={{ ...style }} />}
			renderTrackHorizontal={(props): ReactElement => <div {...props} style={{ display: 'none' }} className='track-horizontal' />}
		/>
	);
});

export default ScrollerWithCustomProps;
