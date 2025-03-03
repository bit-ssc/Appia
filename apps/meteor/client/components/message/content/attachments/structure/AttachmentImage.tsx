import type { Dimensions } from '@rocket.chat/core-typings';
import { Box, MessageToolboxWrapper } from '@rocket.chat/fuselage';
import { useAttachmentDimensions, useLayout } from '@rocket.chat/ui-contexts';
import type { FC } from 'react';
import React, { memo, useState, useMemo, useEffect, useCallback, useRef } from 'react';
import Viewer from 'viewerjs';

import { ChatRoom, MessageSetting } from '../../../../../../app/models/client';
import { selectedMessageStore } from '../../../../../views/room/providers/SelectedMessagesProvider';
import { DeploymentUnitIcon } from '../../../../AppiaIcon';
import CloseIcon from '../../../../AppiaIcon/PreviewImgTool/CloseIcon';
import EnlargeIcon from '../../../../AppiaIcon/PreviewImgTool/EnlargeIcon';
import NarrowIcon from '../../../../AppiaIcon/PreviewImgTool/NarrowIcon';
import RotateLeftIcon from '../../../../AppiaIcon/PreviewImgTool/RotateLeftIcon';
import RotateRightIcon from '../../../../AppiaIcon/PreviewImgTool/RotateRightIcon';
import { useMessageContent } from '../../../hooks/useMessage';
import { useMessageListRegion } from '../../../list/MessageListContext';
import ImageBox from './image/ImageBox';
import Load from './image/Load';
import Retry from './image/Retry';

import 'viewerjs/dist/viewer.css';
import 'viewerjs/dist/viewer.js';

type AttachmentImageProps = {
	previewUrl?: string;
	dataSrc?: string;
	src: string;
	loadImage?: boolean;
	appiaSummary?: string;
	setLoadImage: () => void;
} & Dimensions &
	({ loadImage: true } | { loadImage: false; setLoadImage: () => void });

const getDimensions = (
	originalWidth: Dimensions['width'],
	originalHeight: Dimensions['height'],
	limits: { width: number; height: number },
): { width: number; height: number; ratio: number } => {
	const widthRatio = originalWidth / limits.width;
	const heightRatio = originalHeight / limits.height;

	if (widthRatio > heightRatio) {
		const width = Math.min(originalWidth, limits.width);
		const height = (width / originalWidth) * originalHeight;
		return { width, height, ratio: (height / width) * 100 };
	}

	const height = Math.min(originalHeight, limits.height);
	const width = (height / originalHeight) * originalWidth;
	return { width, height, ratio: (height / width) * 100 };
};

const useShowImageSummary = () => {
	const { showImageSummary: userShowImageSummary } = useLayout();
	const [showImageSummary, setShowImageSummary] = useState<boolean | null>(null);
	const { message } = useMessageContent();
	const { _id, rid } = message || {};

	useEffect(() => {
		if (_id) {
			MessageSetting.getMessageSettingById(_id).then((res) => {
				setShowImageSummary(res?.showImageSummary ?? userShowImageSummary);
			});
		}
	}, [userShowImageSummary, _id]);

	return [showImageSummary, setShowImageSummary, _id, rid];
};

const SummaryButton = ({ summary, setShowImageSummary, _id }) => {
	const toggleImageSummary = useCallback(async () => {
		setShowImageSummary((value) => {
			MessageSetting.setMessageSettingById(_id, { showImageSummary: !value });

			return !value;
		});
	}, [_id]);

	if (!summary) {
		return null;
	}

	return (
		<MessageToolboxWrapper>
			<Box
				fontSize='16px'
				lineHeight='1'
				position='absolute'
				style={{
					bottom: '0',
					right: '0',
					cursor: 'pointer',
					background: 'rgba(0, 0, 0, 0.3)',
					color: '#fff',
					width: '24px',
					padding: '3px 0',
					borderRadius: '8px',
					textAlign: 'center',
				}}
				onClick={toggleImageSummary}
			>
				<DeploymentUnitIcon />
			</Box>
		</MessageToolboxWrapper>
	);
};

const Summary: React.FC<{
	summary: string | null | undefined;
	showImageSummary: boolean | null;
	setShowImageSummary: React.Dispatch<boolean>;
	_id: string;
}> = ({ summary, showImageSummary, _id }) => {
	if (!summary || showImageSummary === null) {
		return null;
	}

	return (
		<Box p='8px 0 0'>
			{showImageSummary && (
				<Box fontSize='12px' lineHeight='20px' color='#86909C' style={{ whiteSpace: 'break-spaces' }}>
					{summary}
				</Box>
			)}
		</Box>
	);
};

// eslint-disable-next-line react/no-multi-comp
const AttachmentImage: FC<AttachmentImageProps> = ({ previewUrl, dataSrc, loadImage = true, setLoadImage, src, appiaSummary, ...size }) => {
	const limits = useAttachmentDimensions();
	const region = useMessageListRegion();
	const [showImageSummary, setShowImageSummary, _id, rid] = useShowImageSummary();

	const imgRef = useRef(null);

	const [error, setError] = useState(false);
	const [isModal, setIsModal] = useState(false);

	const { width = limits.width, height = limits.height } = size;

	const { setHasNoError } = useMemo(
		() => ({
			setHasNoError: (): void => setError(false),
		}),
		[],
	);

	const dimensions = getDimensions(width, height, limits);

	const background = previewUrl && `url(${previewUrl}) center center / cover no-repeat fixed`;

	const [preview, setPreview] = useState(false);
	const { modalRef } = selectedMessageStore;

	useEffect(() => {
		if (modalRef.current) {
			setIsModal(true);
		} else {
			setIsModal(false);
		}
	}, [modalRef.current]);

	if (!loadImage) {
		return <Load width={dimensions.width || limits.width} height={dimensions.height || limits.height} load={setLoadImage} />;
	}

	if (error) {
		return <Retry width={dimensions.width} height={dimensions.height} retry={setHasNoError} />;
	}
	const showImageSummaryIcon = Boolean(appiaSummary && !showImageSummary);
	const alignItems = showImageSummaryIcon ? 'flex-end' : 'normal';

	if (isModal) {
		return (
			<>
				<Box padding='8px' mbs='8px' borderRadius='4px' backgroundColor='#F7F8FA'>
					<Box width={dimensions.width} maxWidth='full' position='relative'>
						<Box pbs={`${dimensions.ratio}%`} position='relative'>
							<ImageBox
								is='picture'
								position='absolute'
								onError={() => setError(true)}
								style={{
									...(previewUrl && { background, boxSizing: 'content-box' }),
									top: 0,
									left: 0,
									bottom: 0,
									right: 0,
									cursor: 'pointer',
								}}
							>
								<img
									data-src={dataSrc || src}
									src={src}
									style={{
										width: '100%',
										maxWidth: dimensions.width,
										maxHeight: dimensions.height,
									}}
									onClick={() => setPreview(true)}
								/>
							</ImageBox>

							<SummaryButton summary={appiaSummary} setShowImageSummary={setShowImageSummary} _id={_id} />
						</Box>
					</Box>

					<Summary summary={appiaSummary} showImageSummary={showImageSummary} setShowImageSummary={setShowImageSummary} _id={_id} />
				</Box>

				{preview ? (
					<ImgPreview
						src={dataSrc || src}
						onClose={() => setPreview(false)}
						width={dimensions.width * 2.5}
						height={dimensions.height * 2.5}
					/>
				) : null}
			</>
		);
	}

	const createViewer =
		(className: string) =>
		async (event: JQuery.ClickEvent): Promise<void> => {
			event.preventDefault();
			event.stopPropagation();
			let container = document.getElementById('messages-list');
			if (region === 'search') {
				container = document.getElementById('j-search-message-lists');
			}

			let index = Array.from(container.querySelectorAll(className)).indexOf(imgRef.current);
			if (index === -1) {
				index = 0;
			}
			const viewer = new Viewer(container as HTMLElement, {
				navbar: false,
				initialViewIndex: index,
				toolbar: {
					zoomIn: 0,
					zoomOut: 0,
					oneToOne: 0,
					reset: 0,
					prev: {
						show: 1,
						size: 'large',
					},
					play: 0,
					next: {
						show: 1,
						size: 'large',
					},
					rotateLeft: 0,
					rotateRight: 0,
					customRotateRight: {
						show: true,
						size: 'large',
						click: () => {
							viewer.rotate(90);
						},
					},
					flipHorizontal: 0,
					flipVertical: 0,
				},
				shown() {
					// 在工具栏渲染完成后，插入自定义图标
					const customButton = document.querySelector('.viewer-toolbar li[class="viewer-custom-rotate-right viewer-large"]');
					if (customButton) {
						customButton.innerHTML =
							'<svg t="1737617236174" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1507" width="16" height="16"><path d="M512 96l160 128-160 128V257.44C332.576 273.6 192 424.384 192 608H128C128 389.024 297.216 209.568 512 193.216V96z" fill="#fff" p-id="1508"></path><path d="M896 416H320v480h576V416z m-64 64v352H384V480h448z" fill="#fff" p-id="1509"></path></svg>'; // 使用 Font Awesome 图标
					}
				},
				url(image: HTMLElement) {
					return image.dataset.src;
				},
				hidden() {
					viewer.destroy();
				},
			});
			viewer.show();
		};

	return (
		<Box padding='8px' mbs='8px' borderRadius='4px' backgroundColor='#F7F8FA'>
			<Box width={dimensions.width} maxWidth='full' position='relative' className='message-file-todo'>
				<Box pbs={`${dimensions.ratio}%`} position='relative'>
					<ImageBox
						is='picture'
						position='absolute'
						onError={() => setError(true)}
						style={{
							...(previewUrl && { background, boxSizing: 'content-box' }),
							top: 0,
							left: 0,
							bottom: 0,
							right: 0,
						}}
						onClick={createViewer('.gallery-item')}
					>
						<img
							ref={imgRef}
							className='gallery-item'
							data-src={dataSrc || src}
							src={src}
							style={{
								width: '100%',
								maxWidth: dimensions.width,
								maxHeight: dimensions.height,
							}}
						/>
					</ImageBox>

					<SummaryButton summary={appiaSummary} setShowImageSummary={setShowImageSummary} _id={_id} />
				</Box>
			</Box>

			<Summary summary={appiaSummary} showImageSummary={showImageSummary} setShowImageSummary={setShowImageSummary} _id={_id} />
		</Box>
	);
};

export default memo(AttachmentImage);

interface PreviewProps {
	src: string;
	onClose: () => void;
	width: number;
	height: number;
}

const ImgPreview = (props: PreviewProps) => {
	const { src, onClose, width, height } = props;
	const [scale, setScale] = useState(1);
	const [rotate, setRotate] = useState(0);
	const [visible, setVisible] = useState(false);

	const style = {
		position: 'fixed',
		left: 0,
		top: 0,
		zIndex: 10000,
		width: '100vw',
		height: '100vh',
		background: 'rgba(0,0,0,50%)',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
	};

	const toolsBar = {
		position: 'absolute',
		bottom: '6%',
		display: 'flex',
		justifyContent: 'center',
		zIndex: 10001,
	};

	const toolProps = {
		color: '#fff',
		fontSize: 16,
	};

	const toolWrapper = {
		cursor: 'pointer',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		background: 'rgba(0,0,0,50%)',
		width: 24,
		height: 24,
		borderRadius: '50%',
		margin: '0 5px',
	};

	const closeStyle = {
		display: 'flex',
		background: 'rgba(0, 0, 0, 50%)',
		position: 'absolute',
		top: -40,
		right: -40,
		width: 80,
		height: 80,
		overflow: 'hidden',
		borderRadius: '50%',
		cursor: 'pointer',
		zIndex: 10001,
	};

	const percentLayerStyle = {
		position: 'absolute',
		padding: '10px',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0,0,0,0.6)',
		color: '#fff',
		fontSize: 16,
		borderRadius: 20,
		zIndex: 10001,
	};
	const imageStyle = {
		transform: `scale(${scale}) rotate(${rotate}deg)`,
		transition: 'transform 0.2s',
	};

	const delay = (timeout: number) => new Promise((resolve) => setTimeout(resolve, timeout));

	const zoom = async (type: string) => {
		setVisible(true);
		if (type === 'add') {
			setScale(scale + 0.1);
		} else {
			setScale(scale - 0.1);
		}
		await delay(1000);
		setVisible(false);
	};

	const rotateLeft = () => setRotate(rotate - 90);

	const rotateRight = () => setRotate(rotate + 90);

	return (
		<div style={style}>
			<div style={closeStyle} onClick={onClose}>
				<CloseIcon fontSize={16} color={'#fff'} style={{ position: 'absolute', top: 48, right: 48 }} />
			</div>
			{visible ? <div style={percentLayerStyle}>{`${Math.trunc(scale * 100)}%`}</div> : null}
			<img src={src} width={width} height={height} style={imageStyle} />
			<div style={toolsBar}>
				<div onClick={() => zoom('add')} style={toolWrapper}>
					<EnlargeIcon {...toolProps} />
				</div>
				<div onClick={() => zoom('sub')} style={toolWrapper}>
					<NarrowIcon {...toolProps} />
				</div>
				<div onClick={rotateLeft} style={toolWrapper}>
					<RotateLeftIcon {...toolProps} />
				</div>
				<div onClick={rotateRight} style={toolWrapper}>
					<RotateRightIcon {...toolProps} />
				</div>
			</div>
		</div>
	);
};
