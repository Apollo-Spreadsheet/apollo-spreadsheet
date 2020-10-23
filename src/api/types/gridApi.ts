import { CoreApi } from "./coreApi"
import { RowApi } from "./rowsApi"
import { RowSelectionApi } from "./rowSelectionApi"
import { EditorManagerApi } from "./editorManagerApi"
import { MergeCellsApi } from "./mergeCellsApi"
import { NavigationApi } from "./navigationApi"
import { ColumnApi } from "./columnApi";
import { SortApi } from "./sortApi";

export type GridApi = CoreApi & RowApi & RowSelectionApi & EditorManagerApi & MergeCellsApi & NavigationApi & ColumnApi & SortApi