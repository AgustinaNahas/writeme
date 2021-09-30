import React from 'react'
import { SafeAreaView, ScrollView } from 'react-native'
import { RichTextEditor, RichTextEditorRef } from './richtext/RichTextEditor'
import { RichTextEditorToolbar } from './richtext/RichTextEditorToolbar'

export default function Editor ({texto}) {
	var richTextEditorRef = React.createRef<RichTextEditorRef>()

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<ScrollView contentContainerStyle={{ flex: 1 }} >
				<RichTextEditor texto={texto} ref={richTextEditorRef} onContentChange = {(event) => console.log(event.data)} />
				<RichTextEditorToolbar onButtonPress = {(event, customJS) => richTextEditorRef.current?.passToEditor(event, customJS)} toolbarAlignLeftButton = {true} toolbarAlignCenterButton = {true} toolbarAlignJustifyButton ={ true } toolbarAlignRightButton = {true} toolbarListUlButton = {true} toolbarListOlButton = {true}/>
			</ScrollView>
		</SafeAreaView>
	)
}
