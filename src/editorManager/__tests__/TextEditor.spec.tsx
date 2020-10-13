import { mount, shallow } from 'enzyme'
import TextEditor from '../components/TextEditor'
import { EditorProps } from '../editorProps'
import React from 'react'

describe('<TextEditor />', () => {
	const onCommitMock = jest.fn(() => {
	})
	const onCommitCancelMock = jest.fn(() => {
	})
	// const mockAnchor = document.createElement('div')
	const props: EditorProps = {
		value: '',
		onCommit: onCommitMock,
		onCommitCancel: onCommitCancelMock,
		anchorRef: document.body,
		cellWidth: 100,
		cellHeight: 50,
		maxLength: 500,
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
})