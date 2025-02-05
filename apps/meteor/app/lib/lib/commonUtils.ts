export const getDepartment = (str: string): string => {
	const arr = [] as string[];

	str.split(',').forEach((id) => {
		if (id.includes('OU=')) {
			arr.push(id.replace('OU=', ''));
		}
	});

	arr.reverse();

	return arr.join('/');
};
