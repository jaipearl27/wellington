import React, { useState, useEffect } from "react";
import { Toaster } from "sonner";
import { ClipLoader } from "react-spinners";
import InfiniteScroll from "react-infinite-scroll-component";
import { BiUpArrowCircle } from "react-icons/bi";
import Modal from "@mui/material/Modal";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const Schrolling = (props) => {
  const { publicImages, fetchMoreData, isLoading, hasMore } = props;
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openModal = (image) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  return (
    <>
      <Toaster />
      <div className="flex flex-col gap-4 py-10 space-y-10">
        <h1 className="pacifico-font text-3xl md:text-4xl">
          Wellington Sign Game
        </h1>
        <div className="flex flex-col gap-5 mt-4">
          <div className="w-full flex justify-center">
            <span className="w-fit text-lg shadow-[0_3px#ffdd00]">
              What other users generated:
            </span>
          </div>

          {isLoading && (
            <div className="flex justify-center">
              <ClipLoader color="#ffdd00" loading={isLoading} size={50} />
            </div>
          )}

          <InfiniteScroll
            dataLength={publicImages.length}
            next={fetchMoreData}
            hasMore={hasMore}
            loader={<h4>Loading more images...</h4>}
            endMessage={
              <p style={{ textAlign: "center" }}>
                <b>All images loaded</b>
              </p>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 justify-center">
              {publicImages?.map((item) => (
                <div
                  key={item?.id}
                  className="rounded-md hover:-translate-y-1 transition duration-300 cursor-pointer"
                  onClick={() =>
                    item?.image &&
                    item.image[0]?.url &&
                    openModal(item.image[0].url)
                  }
                >
                  {item?.image && item.image[0]?.url ? (
                    <img
                      src={item.image[0].url}
                      alt={`${item?.name} wellington sign image`}
                      className="rounded-md shadow-[0_0_0_1px#ffff00] hover:shadow-[0_0_0_3px#ffff00] w-[350px] h-[200px] object-cover"
                    />
                  ) : (
                    <p>No Image Available</p>
                  )}
                  <div className="text-left text-sm italic p-1">
                    By {item?.name}
                  </div>
                </div>
              ))}
            </div>
          </InfiniteScroll>
        </div>

        {showScrollButton && (
          <div className="fixed bottom-5 right-5">
            <BiUpArrowCircle
              onClick={scrollToTop}
              size="50"
              className="bg-yellow-500 text-white p-3 rounded-full shadow-lg hover:bg-yellow-600 transition duration-300 cursor-pointer"
            />
          </div>
        )}

        {/* Modal for Image Zoom */}
        <Modal
          open={isModalOpen}
          onClose={closeModal}
          aria-labelledby="image-modal"
          className=" relative"
        >
          <div className="flex items-center justify-center h-screen ">
            <div className="relative bg-white rounded-lg p-5 shadow-lg w-full md:w-[60%] lg:w-[50%] max-h-screen">
              <div className="flex flex-col gap-2">
                {selectedImage && (
                  <TransformWrapper
                    initialScale={1}
                    minScale={1}
                    wheel={{ step: 0.1 }}
                    doubleClick={{ mode: "zoomIn" }}
                    pinch={{ step: 0.1 }}
                  >
                    <TransformComponent>
                      <img
                        src={selectedImage}
                        alt="Zoomable Wellington Sign"
                        className="w-full rounded-md object-contain "
                      />
                    </TransformComponent>
                  </TransformWrapper>
                )}
                <div className="mt-3 text-sm text-center w-full">
                  Scroll or pinch to zoom
                </div>
              </div>
              <button
                onClick={closeModal}
                className=" text-white bg-red-500 hover:bg-yellow-600 h-6 w-6  rounded-md absolute top-1 -right-6 mr-[28px] text-center "
              >
                x
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default Schrolling;
