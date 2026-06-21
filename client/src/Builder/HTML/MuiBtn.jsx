import {Button,Box} from "@mui/material"

const MuiBtn = ({handleClick,sx,label=null,icon=null,})=>{

    const Icon = icon?.Icon
    const iconClass = icon?.className
    const strokeWidth = icon?.strokeWidth

  
    return(  <Button
      onClick={handleClick}
      sx={sx}
    >
      <Box
        component="span"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "5px",
        }}
      >
        {icon ? (
          <Icon
            className={iconClass}
            strokeWidth={strokeWidth}
            aria-hidden
          />
        ) : null}
        {label}
      </Box>
    </Button>)
  }


  export default MuiBtn