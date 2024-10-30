import React, { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { ClipLoader } from "react-spinners";
import InfiniteScroll from 'react-infinite-scroll-component';
import { BiUpArrowCircle } from "react-icons/bi";

const Schrolling = (props) => {
    const {publicImages,fetchMoreData, isLoading, hasMore } = props;
    const [showScrollButton, setShowScrollButton] = useState(false); // State to track button visibility


    useEffect(() => {
        

        // Event listener for scroll event
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setShowScrollButton(true); // Show button if scrolled more than 300px
            } else {
                setShowScrollButton(false); // Hide button if at the top
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll); // Cleanup on unmount
        };
    }, []);



    // Scroll to the top function

  
    
        const handleScroll = () => {
            // Show button when scrolled down 300 pixels
            if (window.scrollY > 300) {
                setShowScrollButton(true);
            } else {
                setShowScrollButton(false);
            }
        };
    
        const scrollToTop = () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth', // Smooth scrolling
            });
        };
    
        useEffect(() => {
            window.addEventListener('scroll', handleScroll);
            // Clean up the event listener on component unmount
            return () => {
                window.removeEventListener('scroll', handleScroll);
            };
        }, []);

    return (
        <>
            <Toaster />
            <div className='flex flex-col gap-4 py-10 space-y-10'>
                <h1 className='pacifico-font text-3xl md:text-4xl'>Wellington Sign Game</h1>

                <div className='flex flex-col gap-5 mt-4'>
                    <div className='w-full flex justify-center'>
                        <span className='w-fit text-lg shadow-[0_3px#ffdd00]'>
                            What other users generated:
                        </span>
                    </div>

                    {isLoading && (
                        <div className='flex justify-center'>
                            <ClipLoader color="#ffdd00" loading={isLoading} size={50} />
                        </div>
                    )}

                    <InfiniteScroll
                        dataLength={publicImages.length}
                        next={fetchMoreData}
                        hasMore={hasMore}
                        loader={<h4>Loading more images...</h4>}
                        endMessage={
                            <p style={{ textAlign: 'center' }}>
                                <b>All images loaded</b>
                            </p>
                        }
                    >
                        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 justify-center'>
                            {publicImages?.map((item) => (
                                <div key={item?.id} className='rounded-md hover:-translate-y-1 transition duration-300'>
                                    <img 
                                        src={item?.image[0].url} 
                                        alt={`${item?.name} wellington sign image`} 
                                        className='rounded-md shadow-[0_0_0_1px#ffff00] hover:shadow-[0_0_0_3px#ffff00] w-[350px] h-[200px] object-cover' 
                                    />
                                    <div className='text-left text-sm italic p-1'>By {item?.name}</div>
                                </div>
                            ))}
                        </div>
                    </InfiniteScroll>
                </div>
                {showScrollButton && (
                <div className='fixed bottom-5 right-5'>
                    <BiUpArrowCircle
                        onClick={scrollToTop}
                        size="50"
                        className='bg-yellow-500 text-white p-3 rounded-full shadow-lg hover:bg-yellow-600 transition duration-300 cursor-pointer'
                    />
                </div>
            )}
            </div>
        </>
    );
};

export default Schrolling;
