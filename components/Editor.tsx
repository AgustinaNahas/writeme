import React from 'react'
import { SafeAreaView, ScrollView } from 'react-native'
import { RichTextEditor, RichTextEditorRef } from './richtext/RichTextEditor'
import { RichTextEditorToolbar } from './richtext/RichTextEditorToolbar'

export default function Editor ({mensaje}) {
	var richTextEditorRef = React.createRef<RichTextEditorRef>()

    if (mensaje && mensaje.length>0){
        richTextEditorRef.current?.onLoad(mensaje);
    }

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<ScrollView contentContainerStyle={{ flex: 1 }} >
				<RichTextEditorToolbar onButtonPress = {(event, customJS) => richTextEditorRef.current?.passToEditor(event, customJS)} toolbarAlignLeftButton = {true} toolbarAlignCenterButton = {true} toolbarAlignJustifyButton ={ true } toolbarAlignRightButton = {true} toolbarListUlButton = {true} toolbarListOlButton = {true}/>
				<RichTextEditor ref={richTextEditorRef} onContentChange = {(event) => console.log(event.data)} />
			</ScrollView>
		</SafeAreaView>
	)
}
