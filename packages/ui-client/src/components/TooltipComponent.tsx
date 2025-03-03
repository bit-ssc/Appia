import { Tooltip, PositionAnimated, AnimatedVisibility } from '@rocket.chat/fuselage';
import type { Placements } from '@rocket.chat/fuselage-hooks';
import type { ReactElement, ReactNode } from 'react';
import { useRef } from 'react';

type TooltipComponentProps = {
	title: ReactNode;
	anchor: Element;
	placement?: Placements;
};

export const TooltipComponent = ({ title, anchor, placement = 'top-middle' }: TooltipComponentProps): ReactElement => {
	const ref = useRef(anchor);

	return (
		<PositionAnimated anchor={ref} placement={placement} margin={8} visible={AnimatedVisibility.UNHIDING}>
			<Tooltip>{title}</Tooltip>
		</PositionAnimated>
	);
};
