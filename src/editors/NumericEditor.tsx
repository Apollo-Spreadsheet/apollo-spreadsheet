import React, { CSSProperties, useState } from "react";
import { Popover, TextField, TextareaAutosize } from "@material-ui/core";
import { NavigationKey } from "@components/RTable/Editors/navigation-key.enum";
import ReactNumberFormat from "react-number-format";
interface Props {
  value: string;
  onCommit: (value: string, navigationKey?: NavigationKey) => void;
  onCommitCancel: (navigationKey?: NavigationKey) => void;
  anchorRef: Element;
  cellStyle: CSSProperties;
  maxHeight: number;
  maxLength: number;
}
const textAreaStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  resize: "none",
  overflow: "auto",
};

export function NumericEditor({
  value,
  maxHeight,
  cellStyle,
  onCommit,
  onCommitCancel,
  anchorRef,
  maxLength,
}: Props) {
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" || NavigationKey[e.key]) {
      e.preventDefault();
      const newValue = e.target["value"];
      if (newValue !== value) {
        return onCommit(newValue, NavigationKey[e.key]);
      }
      return onCommitCancel(NavigationKey[e.key]);
    }
  };

  const parsedValue = isNaN(Number(value)) ? 0 : Number(value);

  return (
    <Popover
      anchorEl={anchorRef}
      open
      onClose={onCommitCancel}
      anchorOrigin={{
        vertical: "center",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: "center",
        horizontal: "center",
      }}
    >
      <div style={{ width: cellStyle.width, height: maxHeight }}>
        <ReactNumberFormat
          defaultValue={parsedValue}
          autoFocus={true}
          maxLength={10}
          thousandSeparator
          suffix={"€"}
          style={{ height: "100%", width: "100%" }}
        />
        {/*<TextareaAutosize*/}
        {/*	defaultValue={value}*/}
        {/*	autoFocus={true}*/}
        {/*	onKeyDown={onKeyDown}*/}
        {/*	aria-label='cell editor'*/}
        {/*	rowsMin={1}*/}
        {/*	maxLength={maxLength ?? 500}*/}
        {/*	style={textAreaStyle}*/}
        {/*/>*/}
      </div>
    </Popover>
  );
}

export default NumericEditor;
