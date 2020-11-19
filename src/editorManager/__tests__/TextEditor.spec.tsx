import { mount, shallow } from 'enzyme'
import TextEditor from '../components/TextEditor'
import { EditorProps } from '../editorProps'
import React, { useRef } from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { useApiFactory, useApiRef } from '../../api'

describe('<TextEditor />', () => {
	const { result: { current: apiRefMock }} = renderHook(() => {
		const ref = useApiRef()
		const divRef = useRef(document.createElement('div'))
		useApiFactory(divRef, ref)
		return ref
	})
	const stopEditingMock = jest.fn()
	const props: EditorProps = {
		additionalProps: undefined,
		apiRef: apiRefMock,
		value: '',
		stopEditing: stopEditingMock,
		anchorRef: document.body,
		maxLength: 500
	}
	const wrapper = mount(<TextEditor {...props} />)
	it('should match snapshot', () => {
		expect(wrapper).toMatchSnapshot()
	})

	it('should close on ESC', () => {
		console.log(wrapper.find('#apollo-textarea'))
		wrapper.find('#apollo-textarea').simulate('keydown', { key: 'Escape' })
		console.log()
	})

	it.todo('should push caret to the end when there is already text (on mount)')
	it.todo('should not push the caret after text length change')
	it.todo('should save when pressed enter')
	it.todo('should save when clicked away')
})