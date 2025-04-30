import { css } from '@rocket.chat/css-in-js';
import { Box } from '@rocket.chat/fuselage';
import type * as MessageParser from '@rocket.chat/message-parser';
import type { ReactElement } from 'react';

import InlineElements from '../elements/InlineElements';

type UnorderedListBlockProps = {
	items: MessageParser.ListItem[];
	level?: number;
};

const unorderedListStyle = css`
	> li {
		&::before {
			content: '';
			display: none;
		}
	}

	.appia-order-list-li {
		display: flex;
		list-style: none;
	}

	.appia-unordered-list-item {
		white-space: nowrap;
		display: inline;
		font-weight: bold;
		padding-left: 4px;
	}
	.appia-nested-list-li {
			padding: 0 0 0 20px;
	}
`;

export const UnorderedListBlock = ({ items }: UnorderedListBlockProps): ReactElement => (
	<Box is='ul' className={unorderedListStyle}>
		{items.map((item, index) => {
			const firstChild = item.value[0];
			if (firstChild.type === 'UNORDERED_LIST') {
					return (
						<li key={index} className='appia-nested-list-li'>
							<UnorderedListBlock items={firstChild.value} level={firstChild.level} />
						</li>
					)
			}

			if (firstChild.type === 'ORDERED_LIST') {
					return (
						<li key={index} className='appia-nested-list-li'>
							<OrderedListBlock items={firstChild.value} level={firstChild.level} />
						</li>
					)
			}

			return (
				<li key={index} className='appia-order-list-li'>
					<span
						className='appia-unordered-list-item'
						dangerouslySetInnerHTML={{
							__html: '•&nbsp;',
						}}
					></span>
					<div style={{ display: 'inline' }}>
						<InlineElements children={item.value as MessageParser.Inlines[]} />
					</div>
				</li>
			)
		})}
	</Box>
);

type OrderedListBlockProps = {
	items: MessageParser.ListItem[];
	level?: number;
};

const orderedListStyle = css`
	> li {
		&::before {
			content: '';
			display: none;
		}
	}

	.appia-order-list-li {
		display: flex;
		list-style: none;
	}

	.appia-order-list-item {
		white-space: nowrap;
		display: inline;
		font-weight: bold;
		padding-left: 4px;
	}
    .appia-nested-list-li {
				padding: 0 0 0 20px;
		}
`;
// @todo add auto numbering for ordered list
export const ORDERED_NUMBERS = [
	'1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20'.split(','),
	'A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z'.split(','),
	'a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z'.split(','),
	'I,II,III,IV,V,VI,VII,VIII,IX,X,XI,XII,XIII,XIV,XV,XVI,XVII,XVIII,XIX,XX'.split(','),
	'i,ii,iii,iv,v,vi,vii,viii,ix,x,xi,xii,xiii,xiv,xv,xvi,xvii,xviii,xix,xx'.split(','),
]
export const OrderedListBlock = ({ items, level = 0 }: OrderedListBlockProps): ReactElement => (
	<Box is='ol' className={orderedListStyle}>
		{items.map(({ value, number = 1 }, index) => {
			const firstChild = value[0]
			if (firstChild.type === 'UNORDERED_LIST') {
				return (
					<li key={index} className='appia-nested-list-li'>
						<UnorderedListBlock items={firstChild.value} level={firstChild.level} />
					</li>
				)
			}

			if (firstChild.type === 'ORDERED_LIST') {
				return (
					<li key={index} className='appia-nested-list-li'>
						<OrderedListBlock items={firstChild.value} level={firstChild.level} />
					</li>
				)
			}

			const ordered = ORDERED_NUMBERS[level % ORDERED_NUMBERS.length];

			return (
				<li key={index} value={number} className='appia-order-list-li'>
					<span
						className="appia-order-list-item"
						dangerouslySetInnerHTML={{
							__html: `${ordered[(number ? number - 1 : 0) % ordered.length]}.&nbsp;`,
						}}
					></span>
					<div style={{ display: 'inline' }}>
						<InlineElements children={value as MessageParser.Inlines[]} />
					</div>
				</li>
			)
		})}
	</Box>
);
