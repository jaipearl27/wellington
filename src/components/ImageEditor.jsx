import React, { useState, useRef, useLayoutEffect } from "react";
import { useDropzone } from "react-dropzone";
import Modal from "@mui/material/Modal";
import { useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { ClipLoader } from "react-spinners";
import axios from "axios";
import ReactCrop, { centerCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import Schrolling from "./schrolling";

const ImageEditor = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selfie, setSelfie] = useState(null);
  const [crop, setCrop] = useState(null);
  const [completedCrop, setCompletedCrop] = useState(null);
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [publicImages, setPublicImages] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const {
    register,
    handleSubmit,
    setError,
    reset, // Destructure reset from react-hook-form to reset form fields
    formState: { errors },
  } = useForm();

  const [previewImage, setPreviewImage] = useState(null);

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const { acceptedFiles, getRootProps, fileRejections, getInputProps } =
    useDropzone({
      accept: {
        "image/*": [],
      },
      onDrop: (acceptedFiles) => {
        const file = acceptedFiles[0];
        const reader = new FileReader();
        reader.onloadend = () => {
          setSelfie(reader.result);
        };
        reader.readAsDataURL(file);
      },
    });
  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;

    const size = Math.min(width, height);

    const x = (width - size) / 2;
    const y = (height - size) / 2;

    const initialCrop = {
      unit: "px",
      x,
      y,
      width: size,
      height: size,
    };

    setCrop(initialCrop);
    setCompletedCrop(initialCrop);
  };

  const onCropChange = (crop) => {
    setCrop(crop);
  };

  const onCropComplete = (crop) => {
    setCompletedCrop(crop);
  };

  const createImage = async () => {
    if (!canvasRef.current || !selfie) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Load the base image
    const baseImage = new Image();
    baseImage.src = "/wellington.jfif"; // Replace with your image path
    await new Promise((resolve) => {
      baseImage.onload = resolve;
    });

    // Draw the base image
    ctx.drawImage(baseImage, 0, 0);

    // Load the selfie image
    const selfieImage = new Image();
    selfieImage.src = selfie;
    await new Promise((resolve) => {
      selfieImage.onload = resolve;
    });

    if (crop && crop?.height) {
      // Crop details if a crop is selected
      const cropX = completedCrop.x;
      const cropY = completedCrop.y;
      const cropWidth = completedCrop.width;
      const cropHeight = completedCrop.height;

      // Scale factors to map cropping coordinates correctly
      const scaleX = selfieImage.naturalWidth / imgRef.current.width;
      const scaleY = selfieImage.naturalHeight / imgRef.current.height;

      // Canvas size for the crop
      const finalWidth = cropWidth * scaleX;
      const finalHeight = cropHeight * scaleY;

      // Create an offscreen canvas to crop the selfie image
      const offscreenCanvas = document.createElement("canvas");
      const offscreenCtx = offscreenCanvas.getContext("2d");
      offscreenCanvas.width = finalWidth;
      offscreenCanvas.height = finalHeight;

      // Draw the cropped section to the offscreen canvas
      offscreenCtx.drawImage(
        selfieImage,
        cropX * scaleX,
        cropY * scaleY,
        finalWidth,
        finalHeight,
        0,
        0,
        finalWidth,
        finalHeight
      );

      // Draw the cropped selfie onto the main canvas at the desired position
      const croppedImageData = offscreenCanvas.toDataURL("image/png");
      const croppedImage = new Image();
      croppedImage.src = croppedImageData;

      await new Promise((resolve) => {
        croppedImage.onload = resolve;
      });

      // Draw the cropped image in a diagonal oval crop
      await drawRoundImage(ctx, croppedImage.src, 742, 325, 60); // Adjust values as needed
    } else {
      // Use the whole image if no crop is selected
      await drawRoundImage(ctx, selfie, 742, 325, 60); // Adjust values as needed
    }

    // Set the preview image to the final canvas
    setPreviewImage(canvas.toDataURL());

    // Open the modal
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
        ctx.drawImage(image, x - radius, y - radius, radius * 2, radius * 2);

        ctx.restore();
        resolve();
      };

      image.onerror = () => {
        console.error("Failed to load image");
        resolve();
      };
    });
  };

  function dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(","),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[arr.length - 1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  const onSubmit = (data) => {
    if (isLoading) return;
    const regex = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
    if (!regex.test(data.email)) {
      setError("email", {
        type: "manual",
        message: "Please enter a valid E-Mail address",
      });
      return;
    }
    setIsLoading(true);

    // Convert base64 image to file
    const file = dataURLtoFile(previewImage, "wellingtonImage.png");
    const formData = new FormData();

    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("images", file);

    axios
      .post(`${import.meta.env.VITE_API_URL}/game`, formData)
      .then((res) => {
        toast(res.data.message, {
          style: {
            color: "white",
            background: "green",
          },
        });
        setIsLoading(false);
        getData();
        setSelfie(null);
        handleClose();
      })
      .catch((err) => {
        toast(
          `${
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Server busy, please try again later"
          }`,
          {
            style: {
              color: "white",
              background: "red",
            },
          }
        );
        setIsLoading(false);
        handleClose();
      });
  };

  const getData = () => {
    console.log("getting data");
    axios
      .get(`${import.meta.env.VITE_API_URL}/game`, {
        params: {
          page: 1,
          limit: 12,
        },
      })
      .then((res) => {
        setPublicImages(res.data.result);
        if (res?.data?.totalPages > 1) {
          console.log("setting has more ture");
          setHasMore(true);
        }
        setPage(2);
      })
      .catch((err) => console.log(err));
  };

  const fetchMoreData = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/game`, {
        params: {
          page: page,
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
    } finally {
      setIsLoading(false);
      setPage((prevPage) => prevPage + 1);
    }
  };

  useLayoutEffect(() => {
    getData();
  }, []);

  return (
    <>
      <Toaster />
      <div className="flex flex-col gap-4 py-10 space-y-10">
        <h1 className="pacifico-font text-3xl md:text-4xl">
          Wellington Sign Game
        </h1>
        <div className="flex flex-col gap-5 w-full justify-center items-center">
          {!selfie && (
            <div
              {...getRootProps({
                className:
                  "dropzone w-[300px] h-[300px] font-medium flex justify-center items-center relative",
              })}
            >
              <input {...getInputProps()} />
              <p>Drag 'n' drop your image here, or click to select one</p>
            </div>
          )}

          {selfie && (
            <>
              <div>Crop your image:</div>
              <div
                className={
                  "w-[300px] h-[300px] font-medium flex flex-col justify-center items-center border-2 border-gray-300 border-dashed"
                }
              >
                <ReactCrop
                  src={selfie}
                  crop={crop}
                  onChange={onCropChange}
                  onComplete={onCropComplete}
                  aspect={1}
                >
                  <img
                    ref={imgRef}
                    src={selfie}
                    style={{
                      transform: `scale(${scale}) rotate(${rotate}deg)`,
                    }}
                    onLoad={onImageLoad}
                    className="w-full h-48"
                  />
                </ReactCrop>
              </div>
            </>
          )}
          <div
            className={`${
              !selfie && "hidden"
            }  text-sm transition duration-300`}
          >
            Click on the box again to change selected image
          </div>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setSelfie(null)}
              className={`${
                !selfie && "hidden"
              } rounded-md text-center px-4 py-2 bg-red-500 hover:bg-red-700 text-white hover:shadow-[0_0_0_1px#000000] transition duration-500`}
            >
              Reset
            </button>
            <button
              onClick={createImage}
              className={`${
                !selfie && "hidden"
              } rounded-md text-center px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black hover:shadow-[0_0_0_1px#000000] transition duration-500`}
            >
              Generate Image
            </button>
          </div>
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

          {/* <button
                        onClick={() => setRotate(rotate + 90)}
                        className={`${!selfie && 'hidden'} rounded-md text-center px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black hover:shadow-[0_0_0_1px#000000] transition duration-500`}
                    >
                        Rotate
                    </button> */}
        </div>

        <div className="overflow-hidden w-full absolute -z-1">
          <canvas
            ref={canvasRef}
            width={1050}
            height={650}
            style={{ border: "1px solid black", display: "none" }}
          />
        </div>

        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <div className="relative w-[95vw] md:w-[70vw] !h-[90vh] overflow-y-auto bg-white shadow-[0_0_0_1px#ffdd00] rounded-md left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-3">
            <div className="flex flex-col gap-3 justify-center items-center">
              <div>Your Preview:</div>
              {previewImage && (
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-full md:w-[80%]"
                />
              )}

              <form
                class="w-full md:w-[60%] mx-auto py-4"
                onSubmit={handleSubmit(onSubmit)}
              >
                <div className="text-center font-base text-base">
                  Enter your Details:
                </div>
                <div class="mb-5">
                  <label
                    for="name"
                    class="block mb-2 text-sm font-medium text-gray-900 "
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    class="bg-gray-50 border border-gray-400 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5     "
                    placeholder="Full Name"
                    {...register("name", { requried: true })}
                    required
                  />
                </div>
                <div class="mb-5">
                  <label
                    for="email"
                    class="block mb-2 text-sm font-medium text-gray-900 "
                  >
                    E-Mail:
                  </label>
                  <input
                    type="email"
                    id="email"
                    class="bg-gray-50 border border-gray-400 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5     "
                    placeholder="name@xyz.com"
                    {...register("email", { requried: true })}
                    required
                  />
                  {errors.email && (
                    <span className="pt-1 text-sm text-red-500">
                      {errors.email.message}
                    </span>
                  )}
                </div>
                <div className="flex justify-center">
                  <button
                    type="submit"
                    class="text-black bg-yellow-400 hover:bg-yellow-500 hover:shadow-[0_0_0_2px#000000] font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center "
                  >
                    {isLoading ? <ClipLoader color="#000000" /> : <>Submit</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Modal>

        <div className="flex flex-col gap-5 mt-4 ">
          <Schrolling
            publicImages={publicImages}
            fetchMoreData={fetchMoreData}
            hasMore={hasMore}
          />
        </div>
      </div>
    </>
  );
};

export default ImageEditor;
