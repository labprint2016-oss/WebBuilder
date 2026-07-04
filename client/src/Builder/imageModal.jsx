import { useState,useEffect,useRef } from "react";
import { Modal,Box,Fade,Backdrop,Button} from "@mui/material";
import {uploadImage,listImages,deleteImage} from "../../Functions/media";
import { Check,X } from "lucide-react";



function ImageModal({openModal,setOpenModal,handleChange,isPost=false}){


  const [hover,setHover] = useState("")
  const [isRemove,setIsRemove] = useState(false)
  const [remove,setRemove] = useState("")
  const [selectedImage,setSelectedImage] = useState("")



  const options = [
    {
      Funct:(img) => {
        handleChange(`/uploads/${img}`);
        handleClose();
      },
      Icon:Check,
      id:0
    },
    {
      Funct:(img) => {
        setIsRemove(true)
        setRemove(img)
      },
      Icon:X,
      id:1
    },
    
  ]





    const handleClose = ()=>{
        setOpenModal(isPost ? "null-0" : false);
    }


    const [images,setImage] = useState([]);


    const loadImages = ()=>{
        listImages()
        .then((res)=>{
          const nextImages = Array.isArray(res?.data) ? res.data : [];
          setImage(nextImages);
          if (selectedImage && !nextImages.includes(selectedImage)) {
            setSelectedImage("");
          }
        })
        .catch((err)=>console.log(err))
    }

    const removeOptions = [
      {
        Funct:async () => {
          if (!remove) return;
          try {
            await deleteImage(remove);
            setImage((prev) => prev.filter((img) => img !== remove));
            setHover("");
            setSelectedImage((prev) => (prev === remove ? "" : prev));
            setRemove("");
            setIsRemove(false);
            loadImages();
          } catch (err) {
            console.log(err);
          }
        },
        label:"ใช่ ...ฉันต้องการลบ",
        color:"#B91C1C",
        id:0
      },
      {
        Funct:() => {
          setIsRemove(false)
        },
        label:"ยกเลิก",
        color:"#333",
        id:1
      },
      
    ]

    useEffect(()=>{
        loadImages()
    },[])
    useEffect(() => {
      if (!openModal || isRemove) return undefined;
      const onKeyDown = (event) => {
        if (!selectedImage) return;
        const isDeleteKey =
          event.key === "Delete" ||
          event.key === "Backspace" ||
          event.code === "Delete" ||
          event.code === "Backspace" ||
          event.keyCode === 8 ||
          event.keyCode === 46;
        if (!isDeleteKey) return;
        event.preventDefault();
        event.stopPropagation();
        setRemove(selectedImage);
        setIsRemove(true);
      };
      window.addEventListener("keydown", onKeyDown, true);
      return () => window.removeEventListener("keydown", onKeyDown, true);
    }, [isRemove, openModal, selectedImage]);


    const fileInput = useRef(null);

    const THUMB_H = 90;
const GAP = 8;     // gap-2 = 0.5rem = 8px
const ROWS = 3;
const BODY_H = THUMB_H * ROWS + GAP * (ROWS - 1) + 24; // + padding เผื่อ ๆ


if(isRemove){
  return (
    <Modal
            open={Boolean(isRemove)}
            onClose={()=>setIsRemove(false)}
            aria-labelledby="basic-modal-title"
            aria-describedby="basic-modal-desc"
            disableRestoreFocus
            slotProps={{ backdrop: { timeout: 200 } }}
            closeAfterTransition
            slots={{ backdrop: Backdrop }}
          >
            <Fade in={Boolean(isRemove)} timeout={200} onExited={()=>setIsRemove(false)}>
              <Box
                sx={{
                  position: "relative",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 400,
                  height: "auto",
                  backgroundColor: "white",
                  borderRadius: 3,
                }}
                container={document.getElementById("app-root")}
              >
                <div className="flex justify-between px-4 pt-3 pb-1">
                  <div className="text-[15px] font-bold">
                    <span className="text-red-600 dark:text-emerald-300">
                      ลบรูปภาพ
                      </span>{" "}
                  </div>
                  <div>
                    <a onClick={()=>setIsRemove(false)} style={{ cursor: "pointer" }}>
                      X
                    </a>
                  </div>
                </div>
                <div
                  className={`border-b border-dotted border-gray-500/50 flex-1`}
                ></div>
                <div className="flex justify-center mt-4 text-[13px] ">
                คุณต้องการลบรูปภาพนี้ใช่หรือไม่?
                </div>
    
                <div className="flex justify-center my-4 pb-5">
                  {removeOptions.map(({Funct,color,label,id})=>(
                       <Button
                       key={id}
                       sx={{
                         backgroundColor: color,
                         color: "white",
                         fontSize: 13,
                         fontWeight: "normal",
                         height: 25,
                         padding: "15px 12px",
                         marginRight: 1,
                       }}
                       onClick={() => Funct()}
                     >
                       {label}
                     </Button>
                  ))}
                </div>
              </Box>
            </Fade>
          </Modal>
  );

}



    return (
        <Modal
        open={openModal}
        onClose={handleClose}
        aria-labelledby="basic-modal-title"
        aria-describedby="basic-modal-desc"
        disableRestoreFocus
        slotProps={{ backdrop: { timeout: 200 } }}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
      >
       
       <Fade in={openModal} timeout={200} onExited={handleClose}>
  <Box
    sx={{
      position: "absolute",            // แนะนำให้ใช้ absolute กับ Modal content
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: 800,
      bgcolor: "white",
      borderRadius: 3,

      maxHeight: "85vh",               // จำกัดความสูงของ modal
      display: "flex",
      flexDirection: "column",
      outline: "none",
    }}
  >
    {/* Header */}
    <div className="flex justify-between px-4 pt-3 pb-1">
      <div className="text-[15px] font-bold">
        <span className="text-red-600 dark:text-emerald-300">คลังรูปภาพ</span>
      </div>
      <a onClick={handleClose} style={{ cursor: "pointer" }}>X</a>
    </div>

    <div className="border-b border-dotted border-gray-500/50" />

    {/* Body (scrollable) */}
    <div
      className="grid grid-cols-4 gap-2 px-3 py-3"
      style={{
        maxHeight: BODY_H,     // สำคัญ: จำกัดให้เห็น ~3 แถว
        overflowY: "auto",     // เกินแล้วค่อย scroll
        minHeight: 0,
      }}
    >
      {images.map((img, index) => (
        <div key={index} className={`col-span-1 relative`} style={{borderRadius: 5,backgroundColor:hover === img ? "#333333":""}}  onMouseEnter={(e)=>{
          setHover(img)
        }}
        onMouseLeave={(e)=>{
          setHover("")
        }}
        onClick={() => setSelectedImage(img)}>

          {hover === img && (
            <div    className="
            absolute inset-0 z-10
            flex items-center justify-center
          ">
                <div className="grid-cols-2">
                    {options.map(({Funct,Icon,id})=>(
                        <Button onClick={()=>Funct(img)} key={id} sx={{
                          bgcolor: "#ffffffc9",
                          minWidth: 0,
                          width: 30,
                          height: 30,
                          borderRadius: "50%",
                          marginX:1,
                          p: 0,
                        }}><Icon strokeWidth={3} size={18} color="#333333"/></Button>
                    ))}
                </div>
              </div>
    
          )}
          
          <img
            src={`/uploads/${img}`}
            alt={`image-${index}`}
            style={{
              height: 120,
              width: "100%",
              opacity:hover === img ? 0.2:1,
              borderRadius: 5,
              objectFit: "cover",
              cursor:"pointer",
              outline: selectedImage === img ? "2px solid #333333" : "none",
              outlineOffset: selectedImage === img ? "2px" : "0px",
            }}
           
          />
        </div>
      ))}
    </div>

    <div className="border-b border-dotted border-gray-500/50" />

    {/* Footer */}
    <div className="flex px-4 pt-3 pb-3 items-center">
      <input
        type="file"
        ref={fileInput}
        name="image"
        onChange={(e) => {
          const image = new FormData();
          image.append("image", e.target.files[0]);
          uploadImage(image)
            .then(() => loadImages())
            .catch((err) => console.log(err));
        }}
        hidden
      />
      <button
        type="button"
        className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-white bg-gray-700 dark:bg-teal-300/80 border border-0 rounded-md hover:bg-gray-700/60 dark:hover:bg-teal-200/100 hover:text-white dark:hover:text-teal-500 focus:z-10 focus:ring-0 focus:ring-blue-400 focus:outline-none"
        onClick={() => fileInput?.current?.click()}
      >
        อัปโหลด
      </button>

      <span className="text-[12px] text-gray-400 ml-5">
        * รองรับไฟล์ .png .webp .jpg .gif
      </span>
    </div>
  </Box>
</Fade>




      </Modal>
      );

    }
export default ImageModal;