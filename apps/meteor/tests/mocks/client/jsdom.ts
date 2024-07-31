import globalJsdom from 'jsdom-global';

const testUrl = process.env.TEST_API_URL || 'http://localhost:3000';

export const enableJsdom = (): void => {
	globalJsdom('<!doctype html><html><head><meta charset="utf-8"></head><body></body></html>', {
		url: testUrl,
	});
};
