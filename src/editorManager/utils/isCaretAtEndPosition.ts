/**
 * Determinates if caret is in the end
 * @param targetPos
 * @param textLength
 */
export const isCaretAtEndPosition = (targetPos: number, textLength: number) =>
  targetPos === textLength
