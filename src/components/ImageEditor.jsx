import React, { useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import Modal from '@mui/material/Modal';
import { useForm } from 'react-hook-form';
import { toast, Toaster } from 'sonner';
import { ClipLoader } from 'react-spinners';
import axios from 'axios';
import ReactCrop, { centerCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const ImageEditor = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [selfie, setSelfie] = useState(null);
    const [crop, setCrop] = useState(null);
    const [completedCrop, setCompletedCrop] = useState(null);
    const [scale, setScale] = useState(1);
    const [rotate, setRotate] = useState(0);
    const canvasRef = useRef(null);
    const imgRef = useRef(null);

    const {
        register,
        handleSubmit,
        setError,
        reset, // Destructure reset from react-hook-form to reset form fields
        formState: { errors },
    } = useForm();

    const [previewImage, setPreviewImage] = useState(null)



    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const { getRootProps, getInputProps } = useDropzone({
        accept: 'image/*',
        onDrop: (acceptedFiles) => {
            const file = acceptedFiles[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelfie(reader.result);
                setCrop(null);
            };
            reader.readAsDataURL(file);
        },
    });

    const onImageLoad = (e) => {
        const { width, height } = e.currentTarget;
        setCrop(centerCrop(width, height, 16 / 9));
    };

    const onCropChange = (crop) => {
        setCrop(crop);
    };

    const onCropComplete = (crop) => {
        setCompletedCrop(crop);
    };


    const createImage = async () => {
        if (!canvasRef.current || !selfie || !completedCrop) return;
    
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
    
        const baseImage = new Image();
        baseImage.src = selfie;
    
        await new Promise((resolve) => {
            baseImage.onload = resolve;
        });
    
        // Set the canvas size to the crop dimensions
        canvas.width = completedCrop.width;
        canvas.height = completedCrop.height;
    
        // Draw the cropped section on the canvas
        ctx.drawImage(
            baseImage,
            completedCrop.x,
            completedCrop.y,
            completedCrop.width,
            completedCrop.height,
            0,
            0,
            canvas.width,
            canvas.height
        );
    
        // Draw the rounded image after cropping
        await drawRoundImage(ctx, selfie, canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 2);
    
        // Convert canvas to data URL for preview
        setPreviewImage(canvas.toDataURL('image/png'));
        handleOpen();
    };
    


    const drawRoundImage = (ctx, imageSrc, x, y, radius) => {
    return new Promise((resolve) => {
        const image = new Image();
        image.src = imageSrc;

        image.onload = () => {
            ctx.save();
            // Draw a circular clipping path
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();

            // Draw the image within the circular path
            ctx.drawImage(
                image,
                x - radius,
                y - radius,
                radius * 2,
                radius * 2
            );

            ctx.restore();
            resolve();
        };

        image.onerror = () => {
            console.error("Failed to load image");
            resolve();
        };
    });
};
const onSubmit = async (data) => {
    if (isLoading) return;

    // Validate email format
    const regex = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
    if (!regex.test(data.email)) {
        setError("email", {
            type: "manual",
            message: "Please enter a valid E-Mail address",
        });
        return;
    }

    setIsLoading(true);

    // If cropping is active, use the canvas to crop the image
    if (completedCrop && selfie) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const image = imgRef.current;
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        canvas.width = completedCrop.width * scaleX;
        canvas.height = completedCrop.height * scaleY;

        ctx.drawImage(
            image,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            canvas.width,
            canvas.height
        );

        // Convert the cropped image to a Blob and then a File
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
        const file = new File([blob], 'cropped-image.png', { type: 'image/png' });

        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('email', data.email);
        formData.append('images', file);

        axios
            .post(`${import.meta.env.VITE_API_URL}/game`, formData)
            .then((res) => {
                toast(res.data.message, {
                    style: {
                        color: 'white',
                        background: 'green',
                    },
                });
                setIsLoading(false);
                getData();
                setSelfie(null); // Clear selfie image after successful submission
                handleClose();
            })
            .catch((err) => {
                toast(`${err?.response?.data?.message || 'Server busy, please try again later'}`, {
                    style: {
                        color: 'white',
                        background: 'red',
                    },
                });
                setIsLoading(false);
                handleClose();
                setSelfie(null); // Optionally clear on error
            });
    } else if (previewImage) {
        // If cropping is not applied, handle base64 image conversion directly
        const file = dataURLtoFile(previewImage, 'wellingtonImage.png');
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('email', data.email);
        formData.append('images', file);

        axios
            .post(`${import.meta.env.VITE_API_URL}/game`, formData)
            .then((res) => {
                toast(res.data.message, {
                    style: {
                        color: 'white',
                        background: 'green',
                    },
                });
                setIsLoading(false);
                getData();
                setSelfie(null); // Clear selfie image after successful submission
                handleClose();
            })
            .catch((err) => {
                toast(`${err?.response?.data?.message || 'Server busy, please try again later'}`, {
                    style: {
                        color: 'white',
                        background: 'red',
                    },
                });
                setIsLoading(false);
                handleClose();
                setSelfie(null); // Optionally clear on error
            });
    }
};


    return (
        <>
            <Toaster />
            <div className='flex flex-col gap-4 py-10 space-y-10'>
                <h1 className='pacifico-font text-3xl md:text-4xl'>Wellington Sign Game</h1>
                <div className='flex flex-col gap-5 w-full justify-center items-center'>
                    {!selfie && (
                        <div {...getRootProps({ className: 'dropzone w-[300px] h-[300px] font-medium flex justify-center items-center relative' })}>
                            <input {...getInputProps()} />
                            <p>Drag 'n' drop your image here, or click to select one</p>
                        </div>
                    )}
                    {selfie && (
                        <ReactCrop
                            src={selfie}
                            crop={crop}
                            onChange={onCropChange}
                            onComplete={onCropComplete}
                            aspect={16 / 9}
                        >
                            <img
                                ref={imgRef}
                                src={selfie}
                                style={{
                                    transform: `scale(${scale}) rotate(${rotate}deg)`,
                                
                                }}
                                onLoad={onImageLoad}
                                className='w-[600px] h-48' 
                            />
                        </ReactCrop>
                    )}
                <div className={`${!selfie && 'hidden'}  text-sm transition duration-300`}>Click on the box again to change selected image</div>
                    <button
                        onClick={createImage}
                        className={`${!selfie && 'hidden'} rounded-md text-center px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black hover:shadow-[0_0_0_1px#000000] transition duration-500`}>
                        Start Generation
                    </button>
                    {/* {selfie && (
                        <div className='flex flex-col items-center'>
                            <label className='text-sm mb-2'>Zoom</label>
                            <input
                                type='range'
                                min='1'
                                max='3'
                                step='0.1'
                                value={scale}
                                onChange={(e) => setScale(e.target.value)}
                                className='w-full'
                            />
                        </div>
                    )} */}

                    <button
                        onClick={() => setRotate(rotate + 90)}
                        className={`${!selfie && 'hidden'} rounded-md text-center px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black hover:shadow-[0_0_0_1px#000000] transition duration-500`}
                    >
                        Rotate
                    </button>

                  
                </div>

                <div className='overflow-hidden w-full absolute -z-1'>
                    <canvas ref={canvasRef} width={1050} height={650} style={{ border: '1px solid black', display: "none" }} />
                </div>

                <Modal
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <div className='relative w-[95vw] md:w-[70vw] !h-[90vh] overflow-y-auto bg-white shadow-[0_0_0_1px#ffdd00] rounded-md left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-3'>
                        <div className='flex flex-col gap-3 justify-center items-center'>
                            <div>Your Preview:</div>
                            {previewImage && <img src={previewImage} alt="Preview" className='w-full md:w-[80%]' />}


                            <form class="w-full md:w-[60%] mx-auto py-4" onSubmit={handleSubmit(onSubmit)}>
                                <div className='text-center font-base text-base'>
                                    Enter your Details:
                                </div>
                                <div class="mb-5">
                                    <label for="name" class="block mb-2 text-sm font-medium text-gray-900 ">Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        class="bg-gray-50 border border-gray-400 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5     "
                                        placeholder="Full Name"
                                        {...register('name', { requried: true })}
                                        required
                                    />
                                </div>
                                <div class="mb-5">
                                    <label for="email" class="block mb-2 text-sm font-medium text-gray-900 ">E-Mail:</label>
                                    <input
                                        type="email"
                                        id="email"
                                        class="bg-gray-50 border border-gray-400 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5     "
                                        placeholder="name@xyz.com"
                                        {...register('email', { requried: true })}
                                        required

                                    />
                                    {errors.email && <span className='pt-1 text-sm text-red-500'>{errors.email.message}</span>}
                                </div>
                                <div className='flex justify-center'>
                                    <button type="submit" class="text-black bg-yellow-400 hover:bg-yellow-500 hover:shadow-[0_0_0_2px#000000] font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center ">
                                        {isLoading ? <ClipLoader color="#000000" /> : <>Submit</>}

                                    </button>
                                </div>
                            </form>


                        </div>
                    </div>


                </Modal>
            </div>
        </>
    );
};

export default ImageEditor;
