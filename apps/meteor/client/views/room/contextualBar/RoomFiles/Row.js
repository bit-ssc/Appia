import React, { memo } from 'react';

import FileItem from './components/FileItem';

const Row = ({ item, data, index,message }) => {
	const { onClickDelete, isDeletionAllowed } = data;

	return item && <FileItem index={index} fileData={item} onClickDelete={onClickDelete} isDeletionAllowed={isDeletionAllowed} message={message}/>;
};

export default memo(Row);
