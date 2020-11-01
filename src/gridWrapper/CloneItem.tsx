import React, { CSSProperties, memo } from 'react'
import { DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
	container: {
		borderRadius: '2px',
		border: '2px solid transparent',
		borderColor: 'green',
		backgroundColor: 'white',
		boxSizing: 'border-box',
		padding: '10px',
		minHeight: (props: { minHeight: number}) => props.minHeight,
		marginBottom: '8px',
		userSelect: 'none',
		'&&:hover': {
			textDecoration: 'none',
			color: 'blue',
		},
		display: 'flex',
	},
	cell: {
		display: 'flex',
		boxSizing: 'border-box',
		'&:focus': {
			outline: 0,
			border: 0,
		},
	},
}))

interface Props {
	value: string
	snapshot: DraggableStateSnapshot
	provided: DraggableProvided
	index: number
	minHeight: number
}

function getStyle(
	provided: DraggableProvided,
	snapshot: DraggableStateSnapshot,
	style?: CSSProperties,
) {
	/** @todo If the draggableProps does not set the width and height correctly, we can get from the cache via col/row index **/
	return {
		...provided.draggableProps.style,
		// width: '100%', //Enable this if you want to simulate a row
		...style,
		margin: 0,
	}
}

const CloneItem = memo(({ snapshot, index, provided, value, minHeight }: Props) => {
	const classes = useStyles({ minHeight })
	return (
		<div
			ref={provided.innerRef}
			{...provided.draggableProps}
			{...provided.dragHandleProps}
			style={getStyle(provided, snapshot)}
			data-is-dragging={snapshot.isDragging}
			// data-testid={row.id}
			data-index={index}
			// aria-label={`${row.name} quote ${row.content}`}
			className={classes.container}
		>
			<div className={classes.cell}>{value}</div>
		</div>
	)
})

export default CloneItem
