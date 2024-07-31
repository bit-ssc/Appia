export type Upload = {
	readonly id: string;
	readonly name: string;
	readonly percentage: number;
	readonly file: File;
	readonly error?: Error;
	readonly description?: string;
	readonly ts?: Date;
	readonly statusCode?: number;
};

export const UploadState = {
	uploading: 'uploading',
	fail: 'fail',
	success: 'success',
};
