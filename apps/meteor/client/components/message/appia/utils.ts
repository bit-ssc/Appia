export type IClassNameValue = string | number | boolean | undefined | null;
export type IClassNameMap = Record<string | number, unknown>;
export type IClassNameArray = Array<IClassName>;
export type IClassName = IClassNameValue | IClassNameMap | IClassNameArray;

export const classNames = (...args: IClassNameArray): string => {
	const names: (string | number)[] = [];

	args.forEach((value) => {
		if (!value) {
			return;
		}

		const type = typeof value;

		if (type === 'string' || type === 'number') {
			names.push(value as string | number);
		} else if (Array.isArray(value)) {
			names.push(classNames(...value));
		} else if (type === 'object') {
			Object.keys(value as IClassNameMap).forEach((key) => {
				if ((value as IClassNameMap)[key]) {
					names.push(key);
				}
			});
		}
	});

	return names.join(' ');
};
