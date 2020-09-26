import React from "react";
import { Popover } from "@material-ui/core";

interface Props {
  anchorElement: Element | null;
}
export function NavigationMask({
  anchorElement,
}: Props) {
	if (!anchorElement){
		return <></>
	}
  return (
    <Popover
      anchorEl={anchorElement}
      open
      anchorOrigin={{
        vertical: "center",
        horizontal: "center",
      }}
      hideBackdrop
      disableAutoFocus
      disableBackdropClick
      disableScrollLock
      transformOrigin={{
        vertical: "center",
        horizontal: "center",
      }}
      style={{
        zIndex: -2,
      }}
      PaperProps={{
      	elevation: 0
      }}
    >
      <div
        style={{
          width: anchorElement["style"].width,
          height: anchorElement["style"].height,
          border: "1px solid blue",
        }}
      />
    </Popover>
  );
}

export default NavigationMask;
