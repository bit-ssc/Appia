import { Tile } from '@rocket.chat/fuselage';
import type { Placements } from '@rocket.chat/fuselage-hooks';
import { useMergedRefs, usePosition } from '@rocket.chat/fuselage-hooks';
import type { ReactNode, Ref, RefObject } from 'react';
import React, { useMemo, useRef, forwardRef } from 'react';

const getDropdownContainer = (descendant: HTMLElement | null) => {
	for (let element = descendant ?? document.body; element !== document.body; element = element.parentElement ?? document.body) {
		if (
			getComputedStyle(element).transform !== 'none' ||
			getComputedStyle(element).position === 'fixed' ||
			getComputedStyle(element).willChange === 'transform'
		) {
			return element;
		}
	}

	return document.body;
};

const useDropdownPosition = (reference: RefObject<HTMLElement>, target: RefObject<HTMLElement>, isLastMessage?: boolean) => {
	const innerContainer = getDropdownContainer(reference.current);
	const boundingRect = innerContainer.getBoundingClientRect();

	let placement = 'bottom-end';
	if (isLastMessage) {
		const element = document.getElementById('messages-list');
		if (element) {
			const rect = element.getBoundingClientRect();
			// console.info('rect', rect);
			// console.info('boundingRect', boundingRect);
			if (rect.bottom - boundingRect.bottom < 80) {
				placement = 'top-end';
			}
		}
	}

	const { style } = usePosition(reference, target, {
		watch: true,
		placement: placement as Placements,
		container: innerContainer,
	});

	const left = `${parseFloat(String(style?.left ?? '0')) - boundingRect.left}px`;
	let top = `${parseFloat(String(style?.top ?? '0')) - boundingRect.top - 5}px`;

	if (placement === 'top-end') {
		top = `${parseFloat(String(style?.top ?? '0')) - boundingRect.top + 5}px`;
	}
	return useMemo(() => ({ ...style, left, top, bottom: 'auto' }), [style, left, top]);
};

type DesktopToolboxDropdownProps = {
	children: ReactNode;
	reference: RefObject<HTMLElement>;
	isLastMessage?: boolean;
};

const DesktopToolboxDropdown = forwardRef(function ToolboxDropdownDesktop(
	{ reference, children, isLastMessage }: DesktopToolboxDropdownProps,
	ref: Ref<HTMLElement>,
) {
	const targetRef = useRef<HTMLElement>(null);
	const mergedRef = useMergedRefs(ref, targetRef);

	const style = useDropdownPosition(reference, targetRef, isLastMessage);

	return (
		<Tile is='ul' padding={0} paddingBlock={6} zIndex={9999} paddingInline={0} elevation='2' ref={mergedRef} style={style}>
			{children}
		</Tile>
	);
});

export default DesktopToolboxDropdown;
