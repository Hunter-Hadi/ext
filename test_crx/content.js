
const createButton = (buttonText, top, listener, handleClick) => {
    const button = document.createElement('button')
    button.innerText = buttonText
    button.style =
      'position: fixed;background:white;color:#000; top: ' +
      top +
      'px; right: 96px; z-index: 9999;cursor: pointer;user-select: auto;'
    document.body.appendChild(button)
    button.addEventListener(listener, (event) => {
      event.stopPropagation()
      event.preventDefault()
      handleClick()
    })
  }

;(function() {
  let tempRnage = null
  createButton('Save Range', 100, 'mouseenter', async () => {
    console.log('TESTCRX Save Range')
    const selection = document.getSelection()
    tempRnage = selection.getRangeAt(0).cloneRange()
    selection.removeAllRanges()
    selection.addRange(tempRnage)
  })
  createButton('Restore Range', 130, 'mouseenter', async () => {
    console.log('TESTCRX Restore Range')
    const selection = document.getSelection()
    selection.removeAllRanges()
    selection.addRange(tempRnage)
  })
  createButton('Replace selection', 160, 'click', async () => {
    let originalRange = tempRnage.cloneRange()
    console.log('TESTCRX Replace Range', originalRange)
    const doc =
      (tempRnage.startContainer || tempRnage.endContainer).ownerDocument || document
    if (!doc) {
      return
    }
    const selection = doc.getSelection()
    // save rich text from clipboard
    const div = doc.createElement('div')
    div.setAttribute('contenteditable', 'true')
    div.style.cssText =
      'width: 1px;height: 1px;position: fixed;top: 0px;left:0px;overflow: hidden; z-index: -1;'
    doc.body.appendChild(div)
    div.addEventListener(
      'paste',
      (event) => {
        event.stopPropagation()
        console.log('replaceWithClipboard addEventListener paste div')
      },
      true,
    )
    div.addEventListener(
      'copy',
      (event) => {
        event.stopPropagation()
        console.log('replaceWithClipboard addEventListener copy div')
      },
      true,
    )
    div.focus() // 将光标定位到div中
    const divRange = doc.createRange()
    divRange.selectNodeContents(div)
    selection.removeAllRanges()
    selection.addRange(divRange)
    div.focus()
    doc.execCommand('paste', false, '')
    const { editableElement } = getEditableElement(
      (tempRnage.startContainer || tempRnage.endContainer)
    )
    editableElement && editableElement.focus()
    selection?.removeAllRanges()
    selection?.addRange(originalRange)
    await navigator.clipboard.writeText('Hi\nJerry!')
    doc.execCommand('paste', false, '')
    if (selection && selection.rangeCount > 0) {
      originalRange = selection.getRangeAt(0).cloneRange() || originalRange
    } else {
      originalRange = null
    }
    const divRange2 = doc.createRange()
    divRange2.selectNodeContents(div)
    selection.removeAllRanges()
    selection.addRange(divRange2)
    div.focus()
    doc.execCommand('copy', false, '')
    console.log('replaceWithClipboard copy success')
    div.remove()
    const selection2 = doc.getSelection()
    if (selection2 && originalRange) {
      selection2.removeAllRanges()
      selection2.addRange(originalRange)
      originalRange.collapse(false)
      selection2.collapseToEnd()
    }
  })
  createButton('delete', 190, 'click', async () => {
    let originalRange = tempRnage.cloneRange()
    const doc =
      (tempRnage.startContainer || tempRnage.endContainer).ownerDocument || document
    if (!doc) {
      return
    }
    const selection = doc.getSelection()
    console.log('TESTCRX delete Range', originalRange)
    // const { editableElement } = getEditableElement(
    //   (tempRnage.startContainer || tempRnage.endContainer)
    // )
    // editableElement && editableElement.focus()
    selection?.removeAllRanges()
    selection?.addRange(originalRange)
    document.execCommand("delete", false, null);
  })
  createButton('Replace selection with delete', 220, 'click', async () => {
    let originalRange = tempRnage.cloneRange()
    console.log('TESTCRX Replace Range', originalRange)
    const doc =
      (tempRnage.startContainer || tempRnage.endContainer).ownerDocument || document
    if (!doc) {
      return
    }
    const selection = doc.getSelection()
    // save rich text from clipboard
    const div = doc.createElement('div')
    div.id = 'USE_CHAT_GPT_AI_ROOT_Clipboard'
    div.setAttribute('contenteditable', 'true')
    div.style.cssText =
      'width: 1px;height: 1px;position: fixed;top: 0px;left:0px;overflow: hidden; z-index: -1;'
    doc.body.appendChild(div)
    div.addEventListener(
      'paste',
      (event) => {
        event.stopPropagation()
        console.log('replaceWithClipboard addEventListener paste div')
      },
      true,
    )
    div.addEventListener(
      'copy',
      (event) => {
        event.stopPropagation()
        console.log('replaceWithClipboard addEventListener copy div')
      },
      true,
    )
    div.focus() // 将光标定位到div中
    const divRange = doc.createRange()
    divRange.selectNodeContents(div)
    selection.removeAllRanges()
    selection.addRange(divRange)
    div.focus()
    doc.execCommand('paste', false, '')
    const { editableElement } = getEditableElement(
      (tempRnage.startContainer || tempRnage.endContainer)
    )
    editableElement && editableElement.focus()
    selection?.removeAllRanges()
    selection?.addRange(originalRange)
    await navigator.clipboard.writeText('Hi\nJerry!')
    doc.execCommand('paste', false, '')
    setTimeout(() => {
      const currentSelection = doc.getSelection()
      if (currentSelection && currentSelection.rangeCount > 0) {
        console.log('TESTCRX set new Range', originalRange)
        originalRange = currentSelection.getRangeAt(0).cloneRange() || originalRange
      } else {
        originalRange = null
      }
      const divRange2 = doc.createRange()
      divRange2.selectNodeContents(div)
      selection.removeAllRanges()
      selection.addRange(divRange2)
      div.focus()
      doc.execCommand('copy', false, '')
      console.log('replaceWithClipboard copy success')
      div.remove()
      const selection2 = doc.getSelection()
      if (selection2 && originalRange) {
        selection2.removeAllRanges()
        selection2.addRange(originalRange)
        originalRange.collapse(false)
        selection2.collapseToEnd()
      }
    }, 0)
  })
  createButton('hover replace', 250, 'mouseenter', async () => {
    let originalRange = tempRnage.cloneRange()
    console.log('TESTCRX hover replace', originalRange)
    const doc =
      (tempRnage.startContainer || tempRnage.endContainer).ownerDocument || document
    if (!doc) {
      return
    }
    doc.execCommand('Delete', false, '')
    await navigator.clipboard.writeText('Hi!\n\nJerry!\nThanks.')
    doc.execCommand('paste', false, '')
  })








  const getEditableElement = (element, defaultMaxLoop = 10) => {
    var _a;
    if (!element) {
      return {
        isEditableElement: false,
        editableElement: null,
      };
    }
    let parentElement = element;
    let editableElement = null;
    let maxLoop = defaultMaxLoop;
    while (parentElement && maxLoop > 0) {
      if ((parentElement === null || parentElement === void 0 ? void 0 : parentElement.tagName) === 'INPUT' ||
        (parentElement === null || parentElement === void 0 ? void 0 : parentElement.tagName) === 'TEXTAREA' ||
        ((_a = parentElement === null || parentElement === void 0 ? void 0 : parentElement.getAttribute) === null || _a === void 0 ? void 0 : _a.call(parentElement, 'contenteditable')) === 'true') {
        const type = parentElement.getAttribute('type');
        if (type &&
          [
            'password',
            'file',
            'checkbox',
            'radio',
            'submit',
            'reset',
            'button',
            'image',
            'hidden',
          ].includes(type)) {
          break;
        }
        editableElement = parentElement;
        break;
      }
      parentElement = parentElement.parentElement;
      maxLoop--;
    }
    if (editableElement) {
      return {
        isEditableElement: true,
        editableElement,
      };
    }
    return {
      isEditableElement: false,
      editableElement: null,
    };
  };
})()
