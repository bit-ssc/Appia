import { Icon, Throbber } from '@rocket.chat/fuselage';
import { useUser, useSetting, useTranslation } from '@rocket.chat/ui-contexts';
import type { MutableRefObject } from 'react';
import React, { useCallback, useMemo, useEffect, useState, useRef } from 'react';

import { Affix, Watermark } from '../../components/AppiaUI';
import companyKV from '../../components/Contacts/companyKV';
import { appLayout } from '../../lib/appLayout';
import { useContactContext } from './ContactContext';
import ContactItem from './ContactItem';
import { useCurrentContext } from './CurrentContext';
import Department from './Department';
import FederatedDepartment from './FederatedDepartment';
import FederatedUser from './FederatedUser';
import Search from './Search';
import User from './User';
import CopTreeList from './coptree';
import CopDetailInfo from './coptree/component/CopDetailInfo';

export const transformData = (data) => {
	const result = [];

	for (const org in data) {
		if (data.hasOwnProperty(org)) {
			const orgData = {
				type: 'federatedDepartment',
				users: data[org].usersArray.map((user) => {
					return { ...user, pId: org };
				}),
				name: org,
				_id: org,
			};
			result.push(orgData);
		}
	}

	return result;
};

const Contact: React.FC<{ hidden?: boolean }> = ({ hidden = false }) => {
	const { getDepartmentById, loading, root, rootTree, partners } = useContactContext();
	const { current, setCurrent } = useCurrentContext();
	const user = useUser();
	const t = useTranslation();
	const companyId = root?._id;
	const companyName = useSetting('Enterprise_Name') as string;

	const [showInfoPanel, setShowInfoPanel] = useState(true);
	const pmtRef = useRef<HTMLDivElement | null>(null);
	const partnerRef = useRef<HTMLDivElement | null>(null);
	const l1dRef = useRef<HTMLDivElement | null>(null);
	const [ref, setRef] = useState<MutableRefObject<HTMLDivElement | null>>();

	const onClickFullScreen = useCallback(() => {
		appLayout.updateActiveModule({
			name: 'home',
		});
	}, []);

	// 查找 type 为 L2D 的值
	const findOtherRoot = (): string[] => {
		const results: string[] = [];
		// 使用 forEach 遍历 Map
		rootTree.forEach((item) => {
			if (item !== companyId) {
				const department = getDepartmentById(item);
				if (department.children?.length > 0) {
					results.push(item);
				}
			}
		});

		return results;
	};

	const realityRootData = useMemo(() => {
		if (!rootTree) return [];
		return findOtherRoot();
	}, [rootTree]);

	const handleClick = (type: 'user' | 'department' | 'federatedUser' | 'company' | 'emt' | 'cop', value: any) => {
		if (value) {
			setCurrent({ type, value });
		}
	};

	const renderFederatedMembers = useMemo(() => {
		const federatedData = transformData(partners);

		return (
			<div
				className={`contact-content-container ${ref === partnerRef ? 'contact-content-container-hover' : ''}`}
				ref={partnerRef}
				onMouseEnter={() => setRef(partnerRef)}
			>
				<Affix offsetTop={0} target={() => partnerRef?.current}>
					<div className='contact-content-header'>{t('Ext_member_add_disc_member')}</div>
				</Affix>
				{federatedData.map((item, index) => {
					const companyKey = item.name;
					let companyName = item.name;
					const companyItem = companyKV[companyKey];
					if (companyItem) {
						companyName = companyItem.name;
					}
					return (
						<ContactItem
							key={`${item.type}-${index}`}
							department={{ name: companyName, type: item.type, _id: item?.name }}
							federationUsers={item.users}
						/>
					);
				})}
			</div>
		);
	}, [partners, ref, partnerRef]);

	const renderCopTree = () => {
		return <CopTreeList currentRef={ref} setRef={setRef} />;
	};

	useEffect(() => {
		// 当current.value存在时，显示信息面板
		setShowInfoPanel(
			Boolean(current?.value) &&
				(current?.type === 'user' ||
					current?.type === 'department' ||
					current?.type === 'federatedUser' ||
					current?.type === 'emt' ||
					current?.type === 'cop' ||
					current?.type === 'federatedDepartment'),
		);
	}, [current]);

	if (!companyId) {
		return null;
	}

	const resetSelected = () => {
		setCurrent({ type: 'company', value: companyId });
	};

	return (
		<Watermark
			rotate={-45}
			gap={[200, 200]}
			content={user?.username || user?.name}
			style={{ position: 'static', width: '100%', display: hidden ? 'none' : 'block' }}
			font={{ color: 'rgba(0, 0, 0, 0.08)' }}
			zIndex={5}
		>
			<div
				className='contact-header-wrapper'
				style={{
					boxSizing: 'border-box',
					display: 'flex',
					flexDirection: 'row',
					justifyContent: 'space-between',
					alignItems: 'center',
					padding: '8px 20px',
					gap: '8px',
					isolation: 'isolate',
					width: '100%',
					height: '54px',
					background: '#FFFFFF',
					borderBottom: '1px solid #E5E6EB',
					borderRadius: '4px',
					flex: 'none',
					order: 0,
					alignSelf: 'stretch',
					flexGrow: 0,
				}}
			>
				<div style={{ display: 'flex', cursor: 'pointer', alignItems: 'center' }} onClick={() => onClickFullScreen()}>
					<Icon name={'chevron-right'} size={24} />
					<div>{t('Back')}</div>
				</div>
				<div
					className='contact-header'
					style={{
						display: 'flex',
						width: '516px',
						height: '32px',
						gap: '4px',
						alignItems: 'center',
						position: 'relative',
						zIndex: 9000,
						margin: '0 auto',
					}}
				>
					<div
						style={{
							flex: 1,
							borderRadius: '100px',
							border: '1px solid #86909C',
							height: '32px',
							padding: '5px 12px',
							display: 'flex',
							alignItems: 'center',
							backgroundColor: '#FFFFFF',
							position: 'relative',
							zIndex: 9000,
						}}
					>
						<Search onClick={handleClick} resetSelected={resetSelected} />
					</div>
				</div>

				<div
					className='company-name-wrapper'
					onClick={() => handleClick('company', companyId)}
					style={{
						display: 'flex',
						alignItems: 'center',
						cursor: 'pointer',
					}}
				>
					<div
						className='company-name'
						style={{
							flex: 1,
							padding: '0 0 0 16px',
							fontWeight: 600,
						}}
					>
						{companyName}
					</div>
				</div>
			</div>

			<div className='contact-wrapper'>
				<div className={`contact-sidebar`}>
					<div className='contact-content-wrapper'>
						<div
							className={`contact-content-container ${ref === pmtRef ? 'contact-content-container-hover' : ''}`}
							ref={pmtRef}
							onMouseEnter={() => setRef(pmtRef)}
						>
							<Affix offsetTop={0} target={() => pmtRef?.current}>
								<div className='contact-content-header'>PMT</div>
							</Affix>
							<ContactItem key={companyId} department={getDepartmentById(companyId)} />
						</div>

						{realityRootData?.length ? (
							<div
								className={`contact-content-container ${ref === l1dRef ? 'contact-content-container-hover' : ''}`}
								ref={l1dRef}
								onMouseEnter={() => setRef(l1dRef)}
							>
								<Affix offsetTop={0} target={() => l1dRef?.current}>
									<div className='contact-content-header'>L1D</div>
								</Affix>
								{realityRootData.map((id) => {
									return <ContactItem key={id} department={getDepartmentById(id)} />;
								})}
							</div>
						) : null}
						{renderFederatedMembers}
						{renderCopTree()}
						{loading && (
							<div className='contact-content-loading'>
								<Throbber elevation='0' />
							</div>
						)}
					</div>
					{showInfoPanel && (
						<div className='info-panel-container info-panel-animation' style={{ marginRight: 0 }}>
							{Boolean(current?.type === 'user' && current?.value) && (
								<div
									style={{
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
										height: 'fit-content',
										minWidth: 370,
										background: '#FFFFFF',
										borderRadius: '8px',
										flex: 'none',
										order: 0,
										flexGrow: 0,
										overflowY: 'auto',
									}}
								>
									<User id={current?.value as string} />
								</div>
							)}
							{Boolean(current?.type === 'federatedUser' && current?.value) && (
								<div
									style={{
										display: 'flex',
										flexDirection: 'column',
										height: 'fit-content',
										minWidth: 370,
										background: '#FFFFFF',
										borderRadius: '8px',
										flex: 'none',
										order: 0,
										flexGrow: 0,
										overflowY: 'auto',
									}}
								>
									<FederatedUser name={current?.value?.name || ''} username={current?.value?.username || ''} />
								</div>
							)}
							{Boolean(current?.type === 'department' && current?.value) && (
								<div
									style={{
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
										padding: '20px',
										maxHeight: 'calc(100vh - 86px)',
										height: 'auto',
										minWidth: 370,
										background: '#FFFFFF',
										borderRadius: '8px',
										flex: 'none',
										order: 0,
										flexShrink: 0,
										overflowY: 'auto',
										maxWidth: '700px',
										boxSizing: 'border-box',
									}}
								>
									<Department id={current?.value as string} />
								</div>
							)}
							{Boolean(current?.type === 'emt' && current?.value) && (
								<div
									style={{
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
										padding: '20px',
										maxHeight: 'calc(100vh - 86px)',
										height: 'auto',
										minWidth: 370,
										background: '#FFFFFF',
										borderRadius: '8px',
										flex: 'none',
										order: 0,
										flexShrink: 0,
										overflowY: 'auto',
										maxWidth: '700px',
										boxSizing: 'border-box',
									}}
								>
									<Department id={current?.value as string} departmentType={2} />
								</div>
							)}
							{Boolean(current?.type === 'federatedDepartment' && current?.value) && (
								<div
									style={{
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
										padding: '20px',
										maxHeight: 'calc(100vh - 86px)',
										height: 'auto',
										minWidth: 370,
										background: '#FFFFFF',
										borderRadius: '8px',
										flex: 'none',
										order: 0,
										flexShrink: 0,
										overflowY: 'auto',
										maxWidth: '700px',
										boxSizing: 'border-box',
									}}
								>
									<FederatedDepartment name={current?.value} />
								</div>
							)}
							{Boolean(current?.value && current?.type === 'cop') && <CopDetailInfo />}
						</div>
					)}
				</div>
			</div>
		</Watermark>
	);
};

export default Contact;
