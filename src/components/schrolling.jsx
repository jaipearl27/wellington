// src/components/ImageEditor.js
import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Modal from '@mui/material/Modal';
import { useForm } from 'react-hook-form';
import { toast, Toaster } from 'sonner';
import { ClipLoader } from "react-spinners";
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component'; // Import the library

const Schrolling= () => {
    const [isLoading, setIsLoading] = useState(false);
    const [publicImages, setPublicImages] = useState([]);
    const [hasMore, setHasMore] = useState(true); // To track if more images are available
    const [page, setPage] = useState(1); // Current page

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm()



    const getData = async (currentPage) => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/game`, {
                params: {
                    page: currentPage,
                    limit: 12,
                },
            });
            const fetchedImages = res.data.result;
            
            if (fetchedImages.length < 12) {
                setHasMore(false);
            }

            setPublicImages((prevImages) => [...prevImages, ...fetchedImages]);
        } catch (err) {
            console.error(err);
            setHasMore(false); 
        }
    };

    useEffect(() => {
        getData(page);
    }, [page]);

    const fetchMoreData = () => {
        setPage((prevPage) => prevPage + 1);
    };


    return (
        <>
            <Toaster />
            <div className='flex flex-col gap-4 py-10 space-y-10'>
                <h1 className='pacifico-font text-3xl md:text-4xl'>Wellington Sign Game</h1>


                <div className='flex flex-col gap-5 mt-4 '>
                    <div className='w-full flex justify-center'>
                        <span className='w-fit text-lg shadow-[0_3px#ffdd00] '>
                            What other users generated:
                        </span>
                    </div>
                 
                    <InfiniteScroll
                        dataLength={publicImages.length} 
                        next={fetchMoreData}
                        hasMore={hasMore}
                        loader={<h4>Loading...</h4>}
                        endMessage={
                            <p style={{ textAlign: 'center' }}>
                                <b>data completed</b>
                            </p>
                        }
                       
                    >
                        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 justify-center'>
                            {publicImages.map((item) => (
                                <div key={item.id} className='rounded-md hover:-translate-y-1 transition duration-300'>
                                    <img 
                                        src={item.image[0].url} 
                                        alt={`${item.name} wellington sign image`} 
                                        className='rounded-md shadow-[0_0_0_1px#ffff00] hover:shadow-[0_0_0_3px#ffff00 ]' 
                                    />
                                    <div className='text-left text-sm italic p-1'>By {item.name}</div>
                                </div>
                            ))}
                        </div>
                    </InfiniteScroll>
                </div>
            </div>
        </>
    );
};

export default Schrolling;
