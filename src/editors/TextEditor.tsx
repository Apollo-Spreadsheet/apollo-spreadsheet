import React, { CSSProperties, useRef, useState } from "react";
import {
  Popover,
  TextField,
  TextareaAutosize,
  Fade,
  Grow,
} from "@material-ui/core";
import { NavigationKey } from ".//navigation-key.enum";
import { isCaretAtEndPosition } from "./utils";

interface Props {
  value: string;
  onCommit: (value: string, navigationKey?: NavigationKey) => void;
  onCommitCancel: (navigationKey?: NavigationKey) => void;
  anchorRef: Element;
  cellWidth: React.ReactText;
  cellHeight: React.ReactText;
  maxLength: number;
}
const textAreaStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  resize: "none",
  overflow: "auto",
};


export function TextEditor({
  value,
  onCommit,
  onCommitCancel,
  anchorRef,
  cellWidth,
  cellHeight,
  maxLength,
}: Props) {
  const changedValue = useRef<string>(value);
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    /**
     * @todo Needs a review and moved into base editor for better support
     */
    if (e.key === "Enter" || NavigationKey[e.key]) {
      const cursorStart = e.target["selectionStart"];
      const cursorEnd = e.target["selectionEnd"];
      // console.log({
      //   cursorStart,
      //   cursorEnd,
      // });
      //Only navigate if we are in the end
      if (
        (e.key === NavigationKey.ArrowRight || NavigationKey.ArrowDown) &&
        !isCaretAtEndPosition(cursorEnd, e.target["value"].length)
      ) {
        return;
      }
      //Only navigate if we are in the left
      if (
        (e.key === NavigationKey.ArrowLeft ||
          e.key === NavigationKey.ArrowUp) &&
        cursorStart > 0
      ) {
        return console.warn("YAY");
      }

      e.preventDefault();
      dispatchUpdate(NavigationKey[e.key]);
    }
  };

  const dispatchUpdate = (navigationKey?: NavigationKey) => {
    if (changedValue.current !== value) {
      return onCommit(changedValue.current, navigationKey);
    }

    return onCommitCancel(navigationKey);
  };

  return (
    <Popover
      anchorEl={anchorRef}
      open
      elevation={1}
      TransitionProps={{ timeout: 0 }}
      onClose={(event, reason) => {
        if (reason === "backdropClick") {
          return dispatchUpdate();
        }
        onCommitCancel();
      }}
      anchorOrigin={{
        vertical: "center",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: "center",
        horizontal: "center",
      }}
      PaperProps={{
        style: {
          overflow: "hidden",
        },
      }}
    >
      <div style={{ width: cellWidth, height: cellHeight }}>
        <TextareaAutosize
          defaultValue={changedValue.current}
          onChange={(e) => (changedValue.current = e.target["value"])}
          autoFocus={true}
          onKeyDown={onKeyDown}
          aria-label="cell editor"
          rowsMin={1}
          maxLength={maxLength ?? 500}
          style={textAreaStyle}
        />
      </div>
    </Popover>
  );
}

export default TextEditor;
