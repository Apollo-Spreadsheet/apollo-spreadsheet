import React, {useState} from 'react'
import {GridRow} from "../types/row.interface"

interface IEditorState {
	isEditing: boolean
	editor?: {
		node: JSX.Element
		/** @todo Not sure if necessary having the row because it might change during editor being active **/
		row: GridRow;
		rowIndex: number;
		colIndex: number;
		initialValue: string
	}
}
/**
 * Provides a way to manage the editors and also returns the active editor node
 * This hook controls the editing states, interacts with useNavigation hook and also manages the commit/cancel cycle of
 * an editor
 */
export function useEditorManager() {
	const [editorState, setEditorState] = useState<IEditorState>({
		isEditing: false,
	})

	/** @todo Returns utils and other methods necessary **/
	return [editorState]
}