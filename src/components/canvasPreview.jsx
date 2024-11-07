import React, { useState, useRef, useEffect } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop, Crop, convertToPixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

// Helper functions
const TO_RADIANS = Math.PI / 180;

function CanvasPreview({ image, crop, scale = 1, rotate = 0 }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const drawImageOnCanvas = async () => {
            if (!image || !crop || !canvasRef.current) return;

            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                console.error('No 2d context');
                return;
            }

            const scaleX = image.naturalWidth / image.width;
            const scaleY = image.naturalHeight / image.height;
            const pixelRatio = window.devicePixelRatio;

            canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
            canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

            ctx.scale(pixelRatio, pixelRatio);
            ctx.imageSmoothingQuality = 'high';

            const cropX = crop.x * scaleX;
            const cropY = crop.y * scaleY;
            const rotateRads = rotate * TO_RADIANS;
            const centerX = image.naturalWidth / 2;
            const centerY = image.naturalHeight / 2;

            ctx.save();
            ctx.translate(-cropX, -cropY);
            ctx.translate(centerX, centerY);
            ctx.rotate(rotateRads);
            ctx.scale(scale, scale);
            ctx.translate(-centerX, -centerY);

            ctx.drawImage(
                image,
                0,
                0,
                image.naturalWidth,
                image.naturalHeight,
                0,
                0,
                image.naturalWidth,
                image.naturalHeight
            );
            ctx.restore();
        };

        drawImageOnCanvas();
    }, [image, crop, scale, rotate]);

    return <canvas ref={canvasRef} style={{ maxWidth: '100%', height: 'auto' }} />;
}

export default CanvasPreview;