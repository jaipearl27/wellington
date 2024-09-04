// src/components/ImageEditor.js
import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Modal from '@mui/material/Modal';
import { useForm } from 'react-hook-form';
import { toast, Toaster } from 'sonner';
import { ClipLoader } from "react-spinners";
import axios from 'axios';

const ImageEditor = () => {

    const [isLoading, setIsLoading] = useState(false);
    const [publicImages, setPublicImages] = useState(null)
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm()


    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const [selfie, setSelfie] = useState(null);
    const canvasRef = useRef(null);

    const [previewImage, setPreviewImage] = useState(null)

    const getData = () => {
        axios.get(`${import.meta.env.VITE_API_URL}/game`).then((res) => {
            setPublicImages(res.data.result)
        }).catch(err => console.log(err))
    }


    const { acceptedFiles, getRootProps, fileRejections, getInputProps } = useDropzone({
        accept: {
            'image/*': [],
        },
        onDrop: (acceptedFiles) => {
            const file = acceptedFiles[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelfie(reader.result);
            };
            reader.readAsDataURL(file);
        }
    });

    function dataURLtoFile(dataurl, filename) {
        var arr = dataurl.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[arr.length - 1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    }

    const drawRoundImage = (ctx, image, x, y, radius) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = image;
            img.onload = () => {
                const diameter = radius * 2;

                ctx.save();
                // Create circular clipping path
                ctx.beginPath();
                ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2);
                ctx.clip();
                // Draw the image to fit the clipping path
                ctx.drawImage(img, x, y, diameter, diameter);
                // ctx.restore();
                resolve();
            };
        });
    };


    const createImage = async () => {
        if (!canvasRef.current || !selfie) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const baseImage = new Image();
        baseImage.src = '/wellington.jfif'; // Replace with your image path
        await new Promise((resolve) => {
            baseImage.onload = resolve;
        });

        // Draw the base image
        ctx.drawImage(baseImage, 0, 0);

        // Draw the selfie in a diagonal oval crop
        await drawRoundImage(ctx, selfie, 678, 262, 64); // Adjust values as needed

        setPreviewImage(canvasRef.current.toDataURL())
        //open modal

        handleOpen()

    };


    const onSubmit = (data) => {
        if (isLoading) return
        const regex = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/
        if (!regex.test(data.email)) {
            setError("email", {
                type: "manual",
                message: "Please enter a valid E-Mail address",
            })
            return
        }
        setIsLoading(true)
        // converting base64 image to blob
        const file = dataURLtoFile(previewImage, 'wellingtonImage.png')
        const formData = new FormData()

        formData.append('name', data.name)
        formData.append('email', data.email)
        formData.append('images', file)

        axios.post(`${import.meta.env.VITE_API_URL}/game`, formData).then((res) => {
            toast(res.data.message, {
                style: {
                    color: 'white',
                    background: 'green',
                },
            })
            setIsLoading(false)
            handleClose()
        }).catch(err => {
            toast(`${err?.response?.data?.message ? err?.response?.data?.message : 'Server busy, please try again later'}`, {
                style: {
                    color: 'white',
                    background: 'red',
                },
            })
            setIsLoading(false)
            handleClose()

        }

        )

    }

    useLayoutEffect(() => {
        getData()
    }, [])



    return (
        <>
            <Toaster />
            <div className='flex flex-col gap-4 py-10 space-y-10'>
                <h1 className='pacifico-font text-3xl md:text-4xl'>Wellington Sign Game</h1>

                <div className='flex  flex-col gap-5 w-full justify-center items-center'>
                    <div className={`text-sm`}>Tip: If it fits the box below well, it will look better.</div>

                    <div {...getRootProps({ className: 'dropzone w-[300px] h-[300px] font-medium flex justify-center items-center relative' })}>
                        <input {...getInputProps()} />
                        <p>Drag 'n' drop your image here, or click to select one</p>

                        {selfie && (
                            <div className='absolute flex items-center object-contain'>
                                <img src={selfie} className='rounded-md object-contain max-w-[300px] max-h-[300px]' width={'300px'} height={'300px'} />
                            </div>
                        )
                        }

                    </div>

                    <div className={`${!selfie && 'hidden'}  text-sm transition duration-300`}>Click on the box again to change selected image</div>
                    <button
                        onClick={createImage}
                        className={`${!selfie && 'hidden'} rounded-md text-center px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black hover:shadow-[0_0_0_1px#000000] transition duration-500`}>
                        Start Generation
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

                <div className='flex flex-col gap-5 mt-4 '>
                    <div className='w-full flex justify-center'>
                        <span className='w-fit text-lg shadow-[0_3px#ffdd00] '>
                            What other users generated:
                        </span>
                    </div>
                    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 justify-center'>

                        {publicImages && publicImages.map((item) => (
                            <div className='rounded-md hover:-translate-y-1 transition duration-300'>
                                <img src={item.image[0].url} alt={`${item.name} wellington sign image`} className='rounded-md shadow-[0_0_0_1px#ffff00] hover:shadow-[0_0_0_3px#ffff00]' />
                                <div className='text-left text-sm italic p-1'>By {item.name}</div>
                            </div>
                        ))}
                    </div>
                </div>


            </div>
        </>
    );
};

export default ImageEditor;
