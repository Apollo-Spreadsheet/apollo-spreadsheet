import React from 'react'
import { Popover } from '@material-ui/core'

interface Props {
	anchorElement: Element | null
}

/**
 * @todo We need to use a mask instead of borders, borders will provoke a full renderer and the mask
 * can provide also multiple selection if needed or any kind
 * of operation without the need of invoking grid lifecycle methods
 * @param anchorElement
 * @constructor
 */
export function NavigationMask({ anchorElement }: Props) {
	if (!anchorElement) {
		return <></>
	}
	return (
		<Popover
			anchorEl={anchorElement}
			open
			anchorOrigin={{
				vertical: 'center',
				horizontal: 'center',
			}}
			hideBackdrop
			disableAutoFocus
			disableBackdropClick
			disableScrollLock
			transformOrigin={{
				vertical: 'center',
				horizontal: 'center',
			}}
			style={{
				zIndex: -2,
			}}
			PaperProps={{
				elevation: 0,
			}}
		>
			<div
				style={{
					width: (anchorElement as any).style.width,
					height: (anchorElement as any).style.height,
					border: '1px solid blue',
				}}
			/>
		</Popover>
	)
}

export default NavigationMask
