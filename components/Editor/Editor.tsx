import React from 'react'
import { SafeAreaView, ScrollView } from 'react-native'
import { RichTextEditor, RichTextEditorRef } from './RichTextEditor'
import { RichTextEditorToolbar } from './RichTextEditorToolbar'

export default function Editor ({texto, setTexto}) {
	var richTextEditorRef = React.createRef<RichTextEditorRef>()

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<ScrollView contentContainerStyle={{ flex: 1 }} >
				<RichTextEditorToolbar onButtonPress = {(event, customJS) => richTextEditorRef.current?.passToEditor(event, customJS)} toolbarAlignLeftButton = {true} toolbarAlignCenterButton = {true} toolbarAlignJustifyButton ={ true } toolbarAlignRightButton = {true} toolbarListUlButton = {true} toolbarListOlButton = {true}/>
				<RichTextEditor texto={texto} ref={richTextEditorRef} onContentChange = {(event) => setTexto(event.data)} />
			</ScrollView>
		</SafeAreaView>
	)
}
