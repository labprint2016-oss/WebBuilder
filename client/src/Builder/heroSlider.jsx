import {useState,useEffect,useRef} from 'react'
import { Button } from '@mui/material'
import { LogIn } from 'lucide-react'
import { repeat } from 'lodash';
import IconLucide from "../IconLucide";




function HeroSlider({data,divider,dividerColor,dividerPosition,type,theme}) {

    if(!data) return null


    const opacity_2_hex = (opcy) => {
      const hex = opcy?.toString(16).toUpperCase().padStart(2, 0);
      return hex;
    };


    const {
        title,isTitle,
        subTitle,isSubTitle,
        text,isText,
        button,isButton,
        isImageTopLayer,imageTopLayer1,imageTopLayer2,
        backgroundColor,backgroundGradient,isGradient,degree,
        opacity,opacityGradient,
        backgroundImage,
        layout,

    } = data

    const {image:img1,positionX:x1,positionY:y1,size:s1} = imageTopLayer1
    const {image:img2,positionX:x2,positionY:y2,size:s2} = imageTopLayer2 || imageTopLayer1


    const {text:titleText,color:titleColor,size:titleSize,bold:titleBold} = title
    const {text:subTitleText,color:subTitleColor,size:subTitleSize,bold:subTitleBold} = subTitle
    const {text:Text,color:Color,size,bold} = text
    const {text:btnText,color:btnColor,size:btnSize,bold:btnBold,backgroundColor:btnBG,icon,url,target} = button


 
    const ImgTopLayer = ({img=img1,x=x1,y=y1,size=s1})=>{



      const setValue = (n)=>{
        if(n === ""){
          return 0
        }else if(n === "-"){
          return -1
        }else{
          return n
        }
      }

      return (
        <div className={` relative`} style={{
          transform: `translate(${setValue(x)}px, ${setValue(y)}px)`,
          marginLeft:type==="mobile" && layout === "left"?"-20px":"0px",
          marginRight:type==="mobile" && layout === "right"?"-20px":"0px",
        }}>
        <img
          src={img}
          style={{
            width: `${setValue(size)}px`, // 👈 คุมขนาดด้วย px
            height: "auto",                            // รักษาอัตราส่วน
            maxWidth: "none",                          // ให้เกิน parent ได้ถ้าตั้งใหญ่
          }}
        />
      </div>
      )
    }


    const Elements = ()=>{

        const setFont = (font) => {
            let isFirst = false;
            const cutFont_ = font?.replace("font-", "");
            let newFont = "";
            for (let i = 0; i < cutFont_?.length; i++) {
              if (cutFont_[i] === "-" && !isFirst) {
                newFont += " ";
                isFirst = true;
              } else if (cutFont_[i] === "-" && isFirst) {
                newFont += "";
              } else if ((cutFont_[i] !== "-" && isFirst) || i === 0) {
                newFont += cutFont_[i].toUpperCase();
                isFirst = false;
              } else {
                newFont += cutFont_[i];
              }
            }
            return newFont;
          };





          const setColor = (color)=>{
            if(typeof color === "string"){
              return color
            }else{
              return theme[color.type][color.index]
            }
          }


          const position = {
            left:"text-start",
            center:"text-center",
            right:"text-end",
          }


        return (
            <div  className={`
            w-full max-w-full
            px-5            /* ซ้าย-ขวาเว้น 20px */
            grid grid-flow-row-dense
            auto-rows-[minmax(auto,auto)]
            gap-2           /* ระยะห่างแต่ละบรรทัดเล็กน้อย */
          `}>
                {isSubTitle && (
                     <div className={`${subTitleBold?"font-bold":""} ${theme.textHeading.value} ${position[layout]}`} style={{fontSize:subTitleSize,color:setColor(subTitleColor)}}>
                     {subTitleText}
                     </div>
                )}
                       {isTitle && (
                                <div className={`${titleBold?"font-bold":""} ${theme.textHeading.value} ${position[layout]}`} style={{fontSize:titleSize,color:setColor(titleColor)}}>
                                {titleText}
                                </div>
                       )}
                    {isText && (
                          <div className={`${bold?"font-bold":""} ${theme.text.value} ${position[layout]}`} style={{fontSize:size,color:setColor(Color)}}>
                          {Text}
                          </div>
                    )}
                     {isButton && (
                            <div className={`${position[layout]}`}>
                                  <Button sx={{color:setColor(btnColor),marginTop:1,fontFamily:setFont(theme.text.value),paddingLeft:2,paddingRight:2,backgroundColor:setColor(btnBG),fontSize:btnSize,fontWeight:btnBold?800:200,textTransform: "none"}} href={url} target={target}>
                                    <IconLucide iconName={icon} size={btnSize} color={setColor(btnColor)} className={`mr-2`} strokeWidth={btnBold?3:2}/>
                                {btnText}
                                    </Button>
                            </div>
                        
                    )} 
                      
                    </div>
        )
    }


    const Wave1 = ()=>{


      const bgColor = typeof dividerColor === "string" ? dividerColor : theme[dividerColor.type][dividerColor.index]

      const position = ()=>{
        switch(dividerPosition){
          case "":
            return 0
          case "-":
            return -1
          default:
            return dividerPosition
        }
      }




        return (<>

{/* Custom Wave Divider at the bottom - High frequency, sharp wave */}
            <div className="absolute left-0 right-0 z-20 w-full h-[100px] overflow-hidden" style={{bottom:position()}}>
            <svg width="100%"  viewBox={`0 0 ${type === "desktop"?"1440":"720"} 100`} height="100px" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path
                                    d={`M0 15 
                                        Q22.5 0 45 15 T90 15 T135 15 T180 15 T225 15 T270 15 T315 15 T360 15 T405 15 T450 15 T495 15 T540 15 T585 15 T630 15 T675 15 T720 15 
                                        T765 15 T810 15 T855 15 T900 15 T945 15 T990 15 T1035 15 T1080 15 T1125 15 T1170 15 T1215 15 T1260 15 T1305 15 T1350 15 T1395 15 T1440 15 
                                        L1440 100 
                                        L0 100 Z`}
            fill={bgColor}
            />
             </svg>
            </div>
        </>
            
        )
    }


    const BgColor = () => {


      let color

      if (isGradient) {
        let color1 =
          typeof backgroundGradient[0] === "string"
            ? backgroundGradient[0]
            : theme?.[backgroundGradient?.[0]?.type]?.[
                backgroundGradient?.[0]?.index
              ] 
        color1 += opacity_2_hex(opacityGradient[0])
        let color2 =
          typeof backgroundGradient[1] === "string"
            ? backgroundGradient[1]
            : theme[backgroundGradient[1].type][
                backgroundGradient[1].index
              ] 
              color2 += opacity_2_hex(opacityGradient[1])
        color = `linear-gradient(${degree}deg, ${color1} 0%, ${color2} 100%)`;
      } else if (!isGradient) {
        color =
          typeof backgroundColor === "string"
            ? backgroundColor 
            : theme[backgroundColor.type][backgroundColor.index] 
  
        color += opacity_2_hex(opacity)
      }

        return (
          <div
            className=" absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none "
            style={{
              background: color,

            }}
          />
        );
    
    };


    const Left = () => {

      if(type === "mobile"){
        return (
          <div className="z-[999] flex flex-col w-full items-stretch">
          {isImageTopLayer && img1 && (
            <div className="w-full flex justify-start">
              <ImgTopLayer />
            </div>
          )}
  
          <div className="w-full flex justify-start">
            <Elements />
          </div>
        </div>
        )
      }

      return (
        <>
          {/* ตัวหนังสือ 2 ส่วน */}
          <div className={`flex-[2] z-[999] flex items-center justify-start`}>
            <Elements />
          </div>
    
          {/* รูป 1 ส่วน */}
          {isImageTopLayer && img1 && (
            <div className="flex-1 z-[999] flex items-center justify-end">
              <ImgTopLayer />
            </div>
          ) }
        </>
      );


    };

    const Right = () => {

      if(type === "mobile"){
        return (
          <div className="z-[999] flex flex-col w-full items-stretch">
          {isImageTopLayer && img1 && (
            <div className="w-full flex justify-end ">
              <ImgTopLayer />
            </div>
          )}
  
          <div className="w-full flex justify-end">
            <Elements />
          </div>
        </div>
        )
      }
      return (
        <>
          {/* รูป 1 ส่วน */}
          {isImageTopLayer && img1 ? (
            <div className="flex-1 z-[999] flex items-center justify-start">
              <ImgTopLayer />
            </div>
          ) : (
            <div className="flex-1" />
          )}
    
          {/* ตัวหนังสือ 2 ส่วน ดันไปชิดขวา */}
          <div className="flex-[2] z-[999] flex items-center justify-end">
            <Elements />
          </div>
        </>
      );
    };

    const Center = () => {

      if(type === "mobile"){
        return (
          <div className="z-[999] flex flex-col w-full items-stretch">
          {isImageTopLayer && img1 && (
            <div className="w-full flex justify-center ">
              <ImgTopLayer />
            </div>
          )}
  
          <div className="w-full flex justify-center ">
            <Elements />
          </div>
        </div>
        )
      }
      return (
        <>
          {/* รูปซ้าย */}
          {isImageTopLayer && img1 ? (
            <div className="flex-1 z-[999] flex items-center justify-center">
              <ImgTopLayer />
            </div>
          ) : (
            <div className="flex-1" />
          )}
    
          {/* ตัวหนังสือตรงกลาง */}
          <div className="flex-[2] z-[999] flex items-center justify-center">
            <Elements />
          </div>
    
          {/* รูปขวา */}
          {isImageTopLayer && img2 ? (
            <div className="flex-1 z-[999] flex items-center justify-center">
              <ImgTopLayer img={img2} x={x2} y={y2} size={s2}/>
            </div>
          ) : (
            <div className="flex-1" />
          )}
        </>
      );
    };


    const paddingElement = ()=>{
      if(layout === "left"){
        if(type === "desktop"){
          return "pl-[120px]"
        }else if(type === "mobile"){
          return "pl-[20px]"+!isImageTopLayer && ((!["left","right"].includes(layout) && !img1) || layout !== "center")?"pr-[20px]":""
        }
      }
      else if(layout === "right"){
        if(type === "desktop"){
          return "pr-[120px]"
        }else if(type === "mobile"){
          return "pr-[20px]"+!isImageTopLayer && ((!["left","right"].includes(layout) && !img1) || layout !== "center")?"pl-[20px]":""
        }
      }else{
        return ""
      }
    }

    const paddingImg = ()=>{
      if(layout === "left"){
   if(type === "desktop"){
          return "pr-[100px]"
        }
        else{
          return ""
        }
      }
      else if(layout === "right"){
        return "pl-[100px]"
      }

      else if(type === "desktop" && layout === "center"){
        return "px-[100px]"
      }else{
        return ""
      }
    }

    console.log(backgroundImage);
    console.log(imageTopLayer1);



  return (
    <div className='relative w-full h-full overflow-hidden' style={{
      backgroundImage: backgroundImage ?`url(${backgroundImage})`: undefined,
      backgroundPosition: "center",   
      backgroundRepeat: "no-repeat",  
      backgroundSize: "cover",        
    }}>
       <BgColor/>
        <div className='absolute inset-0 flex items-center'>
        <div
        className={`
          w-full h-full
          mx-auto        /* จัดให้อยู่กลางแนวนอน */
          flex items-center gap-8
          ${paddingElement()}  ${paddingImg()} 
        `}
      >
             {layout === "left" && (
              <Left/>
          )}
          {layout === "center" && (
            <Center/>
          )}
          {layout === "right" && (
            <Right/>
          )}

      </div>
     
     
        
                {divider !== "-" && (
                    <Wave1/>
                )}
        </div>
    </div>
  )
}

export default HeroSlider