// src/components/ImageEditor.js
import React, { useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';

import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '70vw', // Increased width for better visibility
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    overflow: 'auto', // Ensure content inside the modal can scroll if necessary
};

const ImageEditor = () => {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const [selfie, setSelfie] = useState(null);
    const canvasRef = useRef(null);

    const [previewImage, setPreviewImage] = useState(null)

    const { getRootProps, getInputProps } = useDropzone({
        accept: 'image/*',
        onDrop: (acceptedFiles) => {
            const file = acceptedFiles[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelfie(reader.result);
            };
            reader.readAsDataURL(file);
        }
    });

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


    const publicImages = [
        {
            name: 'Jai',
            image: '/download.png'
        },
        {
            name: 'Jai',
            image: '/download.png'
        },
        {
            name: 'Jai',
            image: '/download.png'
        },
        {
            name: 'Jai',
            image: '/download.png'
        },
        {
            name: 'Jai',
            image: '/download.png'
        },
        {
            name: 'Jai',
            image: '/download.png'
        },
    ]




    return (
        <div className='flex flex-col gap-4'>
            <div className='flex  flex-col gap-5 w-full pt-20 justify-center items-center'>
                <h1 className='text-2xl font-semibold'>Wellington Sign Game</h1>
                <div {...getRootProps({ className: 'dropzone h-[300px] font-medium flex justify-center items-center relative' })}>
                    <input {...getInputProps()} />
                    <p>Drag 'n' drop your selfie here, or click to select one</p>
                    {selfie && <img src={selfie} className='absolute w-full h-full rounded-md ' />}
                </div>
                <button onClick={createImage} className='rounded-md text-center px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black hover:shadow-[0_0_0_1px#000000] transition duration-500'>Generate Your Image</button>
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
                <Box sx={style}>
                    <div className='flex flex-col justify-center items-center'>
                        {previewImage && <img src={previewImage} alt="Preview" className='w-[80%]' />}


                        <form class="w-[80%] md:w-[60%] mx-auto py-4">
                            <div className='text-center font-base text-xl'>
                                Enter your Details
                            </div>
                            <div class="mb-5">
                                <label for="email" class="block mb-2 text-sm font-medium text-gray-900 ">Your email</label>
                                <input type="email" id="email" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5     " placeholder="name@xyz.com" required />
                            </div>
                            <div class="mb-5">
                                <label for="password" class="block mb-2 text-sm font-medium text-gray-900 ">Your password</label>
                                <input type="password" id="password" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5     " required />
                            </div>
                            <div class="flex items-start mb-5">
                                <div class="flex items-center h-5">
                                    <input id="remember" type="checkbox" value="" class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300   " required />
                                </div>
                                <label for="remember" class="ms-2 text-sm font-medium text-gray-900 ">Remember me</label>
                            </div>
                            <button type="submit" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center ">Submit</button>
                        </form>


                    </div>
                </Box>


            </Modal>

            <div className='flex flex-col gap-5 mt-4 '>
                <div className='w-full flex justify-center'>
                    <span className='w-fit text-lg shadow-[0_3px#ffdd00] '>
                    What other users generated:
                    </span>
                </div>
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3'>

                    {publicImages && publicImages.map((item) => (
                        <div className='rounded-md shadow-[0_0_0_1px#ffff00] hover:shadow-[0_0_0_3px#ffff00]  hover:-translate-y-1 transition duration-300'>
                            <img src={item.image} alt={`${item.name} wellington sign image`} className='rounded-md' />
                        </div>
                    ))}
                </div>
            </div>


        </div>
    );
};

export default ImageEditor;
