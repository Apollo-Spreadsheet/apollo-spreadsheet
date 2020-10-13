/**
 * Review a way of using this indexes constants
 * to help giving meanings on the zIndex
 */
const MERGED_CELL_ZINDEX = 5
const NORMAL_CELL_ZINDEX = 1
const DUMMY_CELL_ZINDEX = 0
const GRID_CONTAINER_ZINDEX = 10 //not sure yet
const EDITOR_ZINDEX = 4 //not also sure yet

/**
 @todo Urgent note
  When we are building the navigation that triggers the editor to open we
 need to check the column type, for example if it is a text any key can open it
 except the special ones but if it is a numeric, only numbers can trigger the opening or the other special

 Return key = delete all the cell content by invoking onCellChange empty
 Escape closes if editor is open and cancels the commit
 Enter saves if editor is open and create new line if is closed

 Also we provide a feature that is a delayOpen that triggers the open of the cell editor when you
 enter the cell for the first time (which is used for second arms) and if you enable it, it will dispatch the editor
 after the cell is being focused
 */
