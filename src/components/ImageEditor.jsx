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

    const drawDiagonalOvalImage = (ctx, image, x, y, width, height, angle) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = image;
            img.onload = () => {
                const centerX = x + width / 2;
                const centerY = y + height / 2;
                const radiusX = width / 2;
                const radiusY = height / 2;

                ctx.save();
                ctx.translate(centerX, centerY); // Move to the center of the image
                ctx.rotate(angle); // Rotate the canvas
                ctx.translate(-centerX, -centerY); // Move back to the top-left corner

                // Draw the image on the canvas
                ctx.drawImage(img, x, y, width, height);

                // Apply elliptical clipping path
                ctx.beginPath();
                ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
                ctx.clip();

                // Redraw the image to fit the clipping path
                ctx.drawImage(img, x, y, width, height);

                ctx.restore();
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
        await drawDiagonalOvalImage(ctx, selfie, 690, 260, 100, 105, Math.PI / 4); // Adjust values as needed
    };

    return (
        <div>
            <div {...getRootProps({ className: 'dropzone' })}>
                <input {...getInputProps()} />
                <p>Drag 'n' drop your selfie here, or click to select one</p>
            </div>
            <button onClick={createImage}>Create Image</button>
            <canvas ref={canvasRef} width={800} height={600} style={{ border: '1px solid black' }} />
            <div>
                {selfie && <img src={selfie} alt="Preview" style={{ maxWidth: '200px' }} />}
            </div>
        </div>
    );
};

export default ImageEditor;
