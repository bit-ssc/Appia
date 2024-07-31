import type { TranslationKey } from '@rocket.chat/ui-contexts';
import { useSetting, useTranslation } from '@rocket.chat/ui-contexts';
import React, { useEffect, useState } from 'react';

import { AgentIcon, CalendarIcon, RobotIcon } from './icon';
import { APIClient } from '../../../../../app/utils/client';

interface IRoomSideMenuButtonProps {
	rid?: string;
	name?: string;
}

enum AssignType {
	urobot = 'urobot',
	agent = 'agent',
}

const icons = {
	[AssignType.urobot]: {
		icon: RobotIcon,
		label: 'ToAgent',
	},
	[AssignType.agent]: {
		icon: AgentIcon,
		label: 'ToRobot',
	},
};

interface IMenu {
	name: string;
	type: number;
	url: string;
	icon?: string;
}

const useSideMenus = () => {
	const data = (useSetting('Appia_Room_Side_Menus_Web') as string) || '{}';
	const [menus, setMenus] = useState<Record<string, IMenu[]>>({});

	useEffect(() => {
		try {
			const d1 = JSON.parse(data);
			const d2 = {};

			Object.keys(d1).forEach((k) => {
				d2[k.toLowerCase()] = d1[k];
			});

			setMenus(d2);
		} catch (e) {
			console.log(e);
		}
	}, [data]);

	return menus;
};

const RoomSideMenuButton: React.FC<IRoomSideMenuButtonProps> = ({ name, rid }) => {
	const [type, setType] = useState<AssignType | null>(null);
	const t = useTranslation();
	const sideMenus = useSideMenus();

	const staffServiceNames = useSetting('Staff_Service_Names') as string;

	useEffect(() => {
		const names = (staffServiceNames || '')
			.split(',')
			.filter((v) => v)
			.map((n) => n.toLowerCase());

		if (name && names.includes(name)) {
			APIClient.get('/v1/robot/staffService/assign_type', {
				rid,
			})
				.then((res) => {
					const assignType = res.data.assign_type;

					if (assignType) {
						setType(assignType as unknown as AssignType);
					}
				})
				.catch(() => {
					setType(null);
				});
		} else {
			setType(null);
		}
	}, [name, rid, staffServiceNames]);

	const clickHandler = async () => {
		let url;
		let assignType = null;

		if (type === AssignType.urobot) {
			url = 'robot/staffService/agent';
			assignType = AssignType.agent;
		} else if (type === AssignType.agent) {
			url = 'robot/staffService/agent_close';
			assignType = AssignType.urobot;
		}

		if (url) {
			await APIClient.post(`/v1/${url}`, {
				rid,
			});

			setType(assignType);
		}
	};

	if (name && sideMenus[name]?.length) {
		return (
			<div className='appia-side-menu-wrapper'>
				{sideMenus[name].map((data, index) => (
					<div
						className='appia-side-menu'
						key={index}
						onClick={() => {
							window.open(data.url);
						}}
					>
						<div className='appia-side-menu-icon-wrapper'>
							{data.icon ? <img src={data.icon} className='appia-side-menu-icon' /> : <CalendarIcon />}
						</div>
						<div>{data.name}</div>
					</div>
				))}
			</div>
		);
	}

	if (type && icons[type]) {
		const { icon: Icon, label } = icons[type];

		return (
			<div className='appia-side-menu-wrapper'>
				<div className='appia-side-menu' onClick={clickHandler}>
					<div className='appia-side-menu-icon-wrapper'>
						<Icon />
					</div>
					<div>{t(label as unknown as TranslationKey)}</div>
				</div>
			</div>
		);
	}

	return null;
};

export default RoomSideMenuButton;
