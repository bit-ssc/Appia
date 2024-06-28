import debounce from 'lodash/debounce';
// eslint-disable-next-line
import throttle from 'lodash/throttle';
import type { CSSProperties } from 'react';
import React, { useEffect, useRef, useState } from 'react';

// eslint-disable-next-line
export const useDebounce = <T extends (...args: any) => any>(fn: T, timeout = 50) => useRef(debounce(fn, timeout))

// eslint-disable-next-line
export const useThrottle = <T extends (...args: any) => any>(fn: T, timeout = 50) => useRef(throttle(fn, timeout))

interface IProps<T> {
	data: T[];
	itemRender: (item: T, index: number) => React.ReactElement;
	itemHeight: number;
	className?: string;
	innerClassName?: string;
	height?: string | number;
	itemWidth?: number | string;
	itemKey?: string | number;
	style?: CSSProperties;
}

interface ICursor {
	start: number;
	size: number;
}
// eslint-disable-next-line
const InfiniteScroll = <T extends unknown>({
	itemHeight,
	className,
	innerClassName,
	itemWidth = '100%',
	itemRender,
	data,
	style = {},
	itemKey = 'id',
	height = 'auto',
}: IProps<T>) => {
	const wrapperRef = useRef<HTMLDivElement>(null);
	const [cursor, setCursor] = useState<ICursor>({
		start: 0,
		size: 0,
	});

	const resize = useDebounce(() => {
		setCursor((prevState) => ({
			...prevState,
			size: Math.ceil(outerHeight / itemHeight),
		}));
	}, 30);

	const scroll = useThrottle((evt) => {
		setCursor((prevState) => ({
			...prevState,
			start: Math.floor(evt.target.scrollTop / itemHeight),
		}));
	}, 30);

	useEffect(() => {
		const wrapper = wrapperRef.current;
		const onResize = resize.current;
		const onScroll = scroll.current;

		window.addEventListener('resize', onResize, false);
		wrapper.addEventListener('scroll', onScroll, false);

		onResize();

		return () => {
			wrapper.removeEventListener('scroll', onScroll, false);
			window.removeEventListener('resize', onResize, false);
		};
	}, [resize, scroll]);

	return (
		<div style={{ ...style, overflow: 'auto', height }} className={className} ref={wrapperRef}>
			<div style={{ height: itemHeight * data.length, position: 'relative' }} className={innerClassName}>
				{data.slice(cursor.start, cursor.start + cursor.size).map((item, index) => (
					<div
						key={item[itemKey]}
						style={{
							position: 'absolute',
							top: (cursor.start + index) * itemHeight,
							left: 0,
							width: itemWidth,
							height: itemHeight,
						}}
					>
						{itemRender(item, index)}
					</div>
				))}
			</div>
		</div>
	);
};

export default InfiniteScroll;
