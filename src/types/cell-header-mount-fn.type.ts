import { ICellMountedRegisterData } from "../core/GridWrapper"

export type OnCellOrHeaderMount = (
  data: ICellMountedRegisterData,
  type: "header" | "body"
) => void;
