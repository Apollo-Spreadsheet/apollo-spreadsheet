import { CoreApi } from "./coreApi"
import { RowApi } from "./rowsApi"
import { RowSelectionApi } from "./rowSelectionApi"
import { EditorManagerApi } from "./editorManagerApi"
import { MergeCellsApi } from "./mergeCellsApi"
import { NavigationApi } from "./navigationApi";

export type GridApi<TRow = unknown> = CoreApi & RowApi<TRow> & RowSelectionApi & EditorManagerApi & MergeCellsApi & NavigationApi