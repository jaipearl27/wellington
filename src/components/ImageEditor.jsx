// src/components/ImageEditor.js
import React, { useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';

const ImageEditor = () => {
    const [selfie, setSelfie] = useState(null);
    const canvasRef = useRef(null);

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
    };

    return (
        <div>
            <div {...getRootProps({ className: 'dropzone' })}>
                <input {...getInputProps()} />
                <p>Drag 'n' drop your selfie here, or click to select one</p>
            </div>
            <button onClick={createImage}>Create Image</button>
            <canvas ref={canvasRef} width={1280} height={720} style={{ border: '1px solid black' }} />
            <div>
                {selfie && <img src={selfie} alt="Preview" style={{ maxWidth: '200px' }} />}
            </div>
        </div>
    );
};

export default ImageEditor;
