import { Throbber } from '@rocket.chat/fuselage';
import React from 'react';

// import { useCurrentContext } from '../../views/contact/CurrentContext';
import ContactItem from './ContactItem';
import type { IOrgPros } from './IOrganization';
import { useContactContext } from '../../views/contact/ContactContext';

const Contact: React.FC<IOrgPros> = (props) => {
	const { getDepartmentsByParentId, loading, root } = useContactContext();
	// const { setCurrent } = useCurrentContext();
	const companyId = root?._id;
	// const companyName = useSetting('Enterprise_Name') as string;

	// const handleClick = useCallback(() => {
	// 	if (companyId) {
	// 		setCurrent({
	// 			type: 'department',
	// 			value: companyId,
	// 		});
	// 	}
	// }, [setCurrent, companyId]);

	if (!companyId) {
		return null;
	}

	return (
		<div style={props.style} className='org-wrapper'>
			<div className='org-sidebar'>
				{/* <div className='org-company-name' onClick={handleClick}>
					{props.hasCheckbox && <CheckBox disabled={true} />}
					<div className='company-name'>{companyName}</div>
				</div> */}

				<div className='org-content-wrapper'>
					<div className='org-content'>
						{getDepartmentsByParentId(companyId).map((department) => (
							<ContactItem key={department._id} department={department} {...props} />
						))}
					</div>

					{loading && (
						<div className='org-content-loading'>
							<Throbber elevation='0' />
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Contact;
