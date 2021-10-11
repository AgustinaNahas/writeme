export const RichEditorHtml = `<!DOCTYPE html>
<html>

<head>
    <meta name="viewport" content="initial-scale=1.0, user-scalable: 1.0, minimum-scale: 0.8, maximum-scale: 2.0" />
    <style>
        * {
            outline: 0px;
            overflow-x: hidden;
        }

        ::-webkit-scrollbar {
            display: none;
            overflow-x: hidden;
        }

        body {
            overflow-x: hidden;
            outline: 0;
            padding: 1em;
            padding-left: 1em;
            padding-right: 1em;
            min-height: 100%;
            width: 90%;
            border-color: #ADB5BD;
        }
    </style>
</head>

<body>
    <div id="textEditor" contenteditable="true" spellcheck="true"></div>
</body>

<script>
    const observer = new MutationObserver(mutations => {
        window.ReactNativeWebView.postMessage(textEditor.innerHTML)
    })
    observer.observe(textEditor, {
        childList: true,
        attributes: true,
        characterData: true,
        subtree: true,
    })
</script>

</html>`
