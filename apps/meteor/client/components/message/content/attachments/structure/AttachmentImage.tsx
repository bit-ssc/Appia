import type { Dimensions } from '@rocket.chat/core-typings';
import { Box } from '@rocket.chat/fuselage';
import { useAttachmentDimensions } from '@rocket.chat/ui-contexts';
import type { FC } from 'react';
import React, { memo, useState, useMemo,useEffect } from 'react';

import ImageBox from './image/ImageBox';
import Load from './image/Load';
import Retry from './image/Retry';
import {selectedMessageStore} from '../../../../../views/room/providers/SelectedMessagesProvider'
import EnlargeIcon from '../../../../AppiaIcon/PreviewImgTool/EnlargeIcon'
import NarrowIcon from '../../../../AppiaIcon/PreviewImgTool/NarrowIcon'
import RotateLeftIcon from '../../../../AppiaIcon/PreviewImgTool/RotateLeftIcon'
import RotateRightIcon from '../../../../AppiaIcon/PreviewImgTool/RotateRightIcon'
import CloseIcon from '../../../../AppiaIcon/PreviewImgTool/CloseIcon'


type AttachmentImageProps = {
	previewUrl?: string;
	dataSrc?: string;
	src: string;
	loadImage?: boolean;
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

const AttachmentImage: FC<AttachmentImageProps> = ({ previewUrl, dataSrc, loadImage = true, setLoadImage, src, ...size }) => {
	const limits = useAttachmentDimensions();

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

	const [preview,setPreview] = useState(false)
	const modalRef = selectedMessageStore.modalRef

	useEffect(() => {
		if(modalRef.current){
			setIsModal(true)
		} else {
			setIsModal(false)
		}
	},[modalRef.current])


	if (!loadImage) {
		return <Load width={dimensions.width || limits.width} height={dimensions.height || limits.height} load={setLoadImage} />;
	}

	if (error) {
		return <Retry width={dimensions.width} height={dimensions.height} retry={setHasNoError} />;
	}


	if(isModal){
		return (
			<>
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
								cursor:"pointer"
							}}
						>
							<img data-src={dataSrc || src} src={src} width={dimensions.width} height={dimensions.height} onClick={() => setPreview(true)}/>
						</ImageBox>
					</Box>
				</Box>
				{
					preview ? <ImgPreview src={dataSrc || src} onClose={() => setPreview(false)} width={dimensions.width * 2.5} height={dimensions.height * 2.5}/> : null
				}
			</>
		);
	}


	return (
		<Box width={dimensions.width} maxWidth='full' position='relative' className={"message-file-todo"}>
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
				>
					<img className='gallery-item' data-src={dataSrc || src} src={src} width={dimensions.width} height={dimensions.height} />
				</ImageBox>
			</Box>
		</Box>
	);
};

export default memo(AttachmentImage);


interface PreviewProps {
	src:string
	onClose:() => void,
	width:number
	height:number
}

const ImgPreview = (props:PreviewProps) => {
	const {src,onClose,width,height} = props
	const [scale, setScale] = useState(1);
	const [rotate, setRotate] = useState(0);
	const [visible,setVisible] = useState(false)

	const style = {
		position:"fixed",
		left:0,
		top:0,
		zIndex:10000,
		width:"100vw",
		height:"100vh",
		background:"rgba(0,0,0,50%)",
		display:"flex",
		justifyContent:"center",
		alignItems:"center",
	}

	const toolsBar ={
		position:"absolute",
		bottom:"6%",
		display:"flex",
		justifyContent: "center",
		zIndex:10001,
	}

	const toolProps = {
		color:"#fff",
		fontSize:16
	}

	const toolWrapper = {
		cursor:"pointer",
		display:"flex",
		justifyContent: "center",
		alignItems:"center",
		background:"rgba(0,0,0,50%)",
		width:24,
		height:24,
		borderRadius:"50%",
		margin:"0 5px"
	}

	const closeStyle = {
		display: "flex",
		background: "rgba(0, 0, 0, 50%)",
		position:"absolute",
		top:-40,
		right:-40,
		width:80,
		height:80,
		overflow:"hidden",
		borderRadius:"50%",
		cursor:"pointer",
		zIndex:10001
	}

	const percentLayerStyle = {
		position:"absolute",
		padding: '10px',
		display:"flex",
		justifyContent: "center",
		alignItems:"center",
		backgroundColor: 'rgba(0,0,0,0.6)',
		color:"#fff",
		fontSize:16,
		borderRadius:20,
		zIndex:10001
	}
	const imageStyle = {
		transform: `scale(${scale}) rotate(${rotate}deg)`,
		transition: 'transform 0.2s',
	};

	const delay = (timeout:number) => new Promise((resolve) => setTimeout(resolve,timeout))

	const zoom = async (type:string) => {
		setVisible(true)
		if(type === "add"){
			setScale(scale + 0.1)
		} else {
			setScale(scale - 0.1)
		}
		await delay(1000)
		setVisible(false)
	}


	const rotateLeft = () => setRotate(rotate - 90)

	const rotateRight = () => setRotate(rotate + 90)

	return (
		<div style={style}>
			<div style={closeStyle} onClick={onClose}>
				<CloseIcon fontSize={16} color={"#fff"} style={{position:"absolute",top:48,right:48}}/>
			</div>
			{
				visible ? <div style={percentLayerStyle} >{Math.trunc(scale * 100) + "%" }</div> : null
			}
			<img src={src} width={width} height={height} style={imageStyle}/>
			<div style={toolsBar}>
				<div onClick={() => zoom('add')} style={toolWrapper}>
					<EnlargeIcon {...toolProps}/>
				</div>
				<div onClick={() => zoom('sub')} style={toolWrapper}>
					<NarrowIcon {...toolProps}/>
				</div>
				<div onClick={rotateLeft} style={toolWrapper}>
					<RotateLeftIcon {...toolProps}/>
				</div>
				<div onClick={rotateRight} style={toolWrapper}>
					<RotateRightIcon {...toolProps}/>
				</div>
			</div>
		</div>
	)

}
