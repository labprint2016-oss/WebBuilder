import { Play } from "lucide-react";
import { setColor } from "../../../../function";
import Image from "./Image";

const Video = ({
  elementData,
  selected,
  hover,
  animationForElement,
  theme,
  builderMode,
}) => {
  const isLayoutMode = builderMode === "Layout Mode";

  const overlay = (
    <div className="pointer-events-none absolute inset-0 z-[5] grid place-items-center">
      <div
        className="grid h-[50px] w-[50px] place-items-center rounded-full"
        style={{
          backgroundColor: setColor(theme, theme?.mainColor?.[1], 200),
        }}
      >
        <Play
          className="h-7 w-7 text-white"
          strokeWidth={2.2}
          aria-hidden="true"
          
        />
      </div>
    </div>
  );

  return (
    <div className={isLayoutMode ? "select-none" : undefined}>
      <Image
        elementData={elementData}
        selected={selected}
        hover={hover}
        animationForElement={animationForElement}
        theme={theme}
        overlay={overlay}
        disableLink
        placeholderIconPosition="topRight"
        builderMode={builderMode}
      />
    </div>
  );
};

export default Video;