import { UploadOutlined } from '@ant-design/icons';
import { Modal } from '@rocket.chat/fuselage';
import { useTranslation, useEndpoint } from '@rocket.chat/ui-contexts';
import React, { useState, useMemo } from 'react';

import { Input, Radio, Button, Form, Upload, message } from '../../../components/AppiaUI';
import { getTimestamp } from '../../room/Appia/Announcement/Meeting/TimeUtils';
import type { ICopNode } from '../context/CopTreeContext';
import SearchRoom from './SearchRoom';
import { addOrEditModalStyle } from './styles';

interface IProps {
	onOk: (data: any) => void;
	onClose: () => void;
	parentNode: ICopNode;
	node?: ICopNode;
	created?: boolean;
	nodeMap?: Record<string, ICopNode>;
}

const AddOrEditModal = ({ onOk, onClose, node, parentNode, created = false, nodeMap }: IProps) => {
	const t = useTranslation();
	const [form] = Form.useForm();
	const user = Meteor.user();
	const [loading, setLoading] = useState(false);
	const [roomType, setRoomType] = useState('existing'); // 默认选中“使用已有频道”
	const uploadFileApi = useEndpoint('POST', 'v1/file.uploadMultipartFile');
	const initForm = useMemo(() => {
		let nodeCode;
		let parentCode;
		// FIL-C-20230915-EID-IT-X
		if (node) {
			const strs1 = node.code.split('-');
			nodeCode = { copPrefix: 'FIL', copMiddle: 'C', copDate: strs1?.[2], copEID: strs1?.[3], copDepartment: strs1?.[4] };
		}

		if (parentNode) {
			const strs2 = parentNode.code.split('-');
			parentCode = { copPrefix: 'FIL', copMiddle: 'C', copDate: strs2?.[2], copEID: strs2?.[3], copDepartment: strs2?.[4] };
		}

		return {
			name: created ? '' : node?.name,
			copPrefix: nodeCode?.copPrefix || 'FIL',
			copMiddle: nodeCode?.copMiddle || 'C',
			copDate: created ? getTimestamp(new Date().toDateString())._ymd : nodeCode?.copDate,
			copEID: created ? user?.employeeId : nodeCode?.copEID,
			copDepartment: created ? '' : nodeCode?.copDepartment,
			parentName: parentNode?.name,
			parentPrefix: parentCode?.copPrefix || 'FIL',
			parentMiddle: parentCode?.copMiddle || 'C',
			parentDate: parentCode?.copDate,
			parentEID: parentCode?.copEID,
			parentDepartment: parentCode?.copDepartment,
			relatedRoom: created ? '' : node?.rid,
			uploadFile: created
				? undefined
				: [{ ...node?.uploadFile, uid: node?.uploadFile?.id, fileName: node?.uploadFile?.name, fileUrl: node?.uploadFile?.path }],
		};
	}, [node, parentNode]);

	const constructData = (value: any) => {
		const code = `FIL-C-${value.copDate}-${value.copEID}-${value.copDepartment}`;
		const parentCode = `FIL-C-${value.parentDate}-${value.parentEID}-${value.parentDepartment}`;
		const parentId = nodeMap?.[parentCode]?.id;
		const copFile = value?.uploadFile?.[0];
		console.log('dxd======', nodeMap, parentId, parentCode);
		return {
			name: value.name,
			rid: form.getFieldValue('relatedRoom'),
			code,
			parentCode,
			id: created ? '' : node?.id,
			parentId: created ? parentNode?.id : parentId,
			uploadFile: { name: copFile?.name, id: copFile?.id, path: copFile?.path, ossKey: copFile?.ossKey },
			createdRoom: roomType !== 'existing',
			rp: node?.rp,
		};
	};

	const handleOk = async () => {
		setLoading(true);
		let data;
		let canRequest = false;
		await form
			.validateFields()
			.then((values) => {
				console.log('表单值:', values);
				data = constructData(values);
				canRequest = true;
			})
			.catch((info) => {
				console.log('校验失败:', info);
				canRequest = false;
			});

		if (!canRequest) return setLoading(false);

		try {
			await onOk?.(data);
			setLoading(false);
			onClose?.();
		} catch (e) {
			setLoading(false);
			console.error(e);
		}
	};

	const uploadFile = async ({ file }) => {
		const formData = new FormData();
		formData.append('multipartFile', file);

		// @ts-ignore
		uploadFileApi(formData)
			.then((response) => {
				const { data } = response;
				const uploadFile = {
					id: data.id,
					uid: data.id,
					name: data.name,
					ossKey: data.ossKey,
					path: data.path,
					status: 'done',
					fileUrl: data.path,
					fileName: data.name,
				};
				form.setFieldValue('uploadFile', [uploadFile]);
			})
			.catch((err: any) => {
				message.error(err.error);
			});
	};

	const handleFileChange = (info: any) => {
		// @ts-ignore
		if (info.file.status === 'removed') {
			form.setFieldValue('file', null); // 更新文件列表
		}
	};

	// 文件上传限制
	const beforeUpload = (file: File) => {
		const allowedTypes = [
			'application/msword', // .doc
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
			'application/pdf',
		];
		const isAllowedType = allowedTypes.includes(file.type);
		if (!isAllowedType) {
			message.error('只能上传 doc/docx/pdf 格式文件');
		}
		const isLt20M = file.size / 1024 / 1024 < 20; // 文件大小限制为 2MB
		if (!isLt20M) {
			message.error('文件大小不能超过 20MB');
		}
		return isAllowedType && isLt20M;
	};

	const formItemLayout = {
		labelCol: {
			xs: { span: 6 },
			sm: { span: 4 },
		},
		wrapperCol: {
			xs: { span: 34 },
			sm: { span: 20 },
		},
	};

	return (
		<Modal className={addOrEditModalStyle}>
			<Modal.Header>
				<Modal.Title>{created ? t('Create_COP_Node') : t('Update_COP_Node')}</Modal.Title>
			</Modal.Header>
			<Modal.Content>
				<Form form={form} scrollToFirstError={true} {...formItemLayout} initialValues={initForm} autoComplete='off'>
					{/* COP 名称 */}
					<Form.Item label='名称' name='name' rules={[{ required: true, message: '请输入COP名称' }]}>
						<Input placeholder='请输入COP名称' />
					</Form.Item>

					{/* COP 编号 */}
					<Form.Item label='COP编号' required>
						<div style={{ display: 'flex', gap: '8px' }}>
							<Form.Item name='copPrefix' noStyle>
								<Input style={{ width: '20%' }} disabled={true} />
							</Form.Item>
							<Form.Item name='copMiddle' noStyle>
								<Input style={{ width: '20%' }} disabled={true} />
							</Form.Item>
							<Form.Item name='copDate' noStyle rules={[{ required: true, message: '请输入文件编号' }]}>
								<Input style={{ width: '30%' }} placeholder={'YYMMDD'} />
							</Form.Item>
							<Form.Item name='copEID' noStyle rules={[{ required: true, message: '请输入文件编号' }]}>
								<Input style={{ width: '30%' }} placeholder={'EID'} />
							</Form.Item>
							<Form.Item name='copDepartment' noStyle rules={[{ required: true, message: '请输入文件编号' }]}>
								<Input style={{ width: '30%' }} placeholder={'ZZX'} />
							</Form.Item>
						</div>
					</Form.Item>

					{parentNode ? (
						<Form.Item label='上级名称' name='parentName'>
							<Input disabled />
						</Form.Item>
					) : null}

					{parentNode ? (
						<Form.Item label='上级编号' required>
							<div style={{ display: 'flex', gap: '8px' }}>
								<Form.Item name='parentPrefix' noStyle>
									<Input style={{ width: '20%' }} disabled />
								</Form.Item>
								<Form.Item name='parentMiddle' noStyle>
									<Input style={{ width: '20%' }} disabled />
								</Form.Item>
								<Form.Item name='parentDate' noStyle rules={[{ required: true, message: '请输入上级文件编号' }]}>
									<Input style={{ width: '30%' }} disabled={created} placeholder={'YYMMDD'} />
								</Form.Item>
								<Form.Item name='parentEID' noStyle rules={[{ required: true, message: '请输入上级文件编号' }]}>
									<Input style={{ width: '30%' }} disabled={created} placeholder={'EID'} />
								</Form.Item>
								<Form.Item name='parentDepartment' noStyle rules={[{ required: true, message: '请输入上级文件编号' }]}>
									<Input style={{ width: '30%' }} disabled={created} placeholder={'ZZX'} />
								</Form.Item>
							</div>
						</Form.Item>
					) : null}

					{/* 频道选择 */}
					<Form.Item label='频道'>
						<Radio.Group onChange={(e) => setRoomType(e.target.value)} value={roomType}>
							<Radio value='existing'>使用已有频道</Radio>
							<Radio value='new'>创建新频道</Radio>
						</Radio.Group>
					</Form.Item>

					{/* 关联频道 */}
					{roomType === 'existing' && (
						<Form.Item label={'关联频道'} name='relatedRoom'>
							<SearchRoom selectRoom={(rid) => form.setFieldValue('relatedRoom', rid)} room={node?.room} />
						</Form.Item>
					)}

					<Form.Item
						label='上传文件'
						name='uploadFile'
						valuePropName='fileList'
						getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList)}
						rules={[{ required: true, message: '请上传文件' }]}
					>
						<Upload
							name='file'
							accept={'.doc,.docx,.pdf'}
							beforeUpload={beforeUpload}
							customRequest={uploadFile}
							onChange={handleFileChange}
							maxCount={1}
							listType='text'
						>
							<Button icon={<UploadOutlined />}>点击上传 (doc/docx/pdf)</Button>
						</Upload>
					</Form.Item>
				</Form>

				<div className='create-cop-node'>
					<Button onClick={onClose}>{t('Cancel')}</Button>
					<Button style={{ marginLeft: 20 }} type='primary' loading={loading} onClick={handleOk}>
						{t('Confirm')}
					</Button>
				</div>
			</Modal.Content>
		</Modal>
	);
};

export default AddOrEditModal;
