
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
  const input = document.createElement('input')
  input.type = 'file'
  input.style.cssText = 'position: fixed;top: 0px;left:0px;overflow: hidden; z-index: -1;'
  input.addEventListener('change', async (event) => {
    const files = event.target.files
    if (!files || files.length === 0) {
      return
    }
    const file = files[0]
    // 通过 FileReader API 读取二进制文件内容
    var reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = function() {
      var fileContent = reader.result;
      // 创建 Blob 对象
      var blob = new Blob([fileContent], { type: file.type });
      var blobUrl = URL.createObjectURL(blob);
      var fileInfo = {
        name: file.name,
        type: file.type,
        url: blobUrl,
        lastModified: file.lastModified
      };
      chrome.runtime.sendMessage({
        data: fileInfo
      })
    };

  })
  document.body.appendChild(input)
  createButton('input file', 280, 'click', async () => {
    input.click()
  })
  let free= false
  let cacheFile = null
  // 监听来自 A 页面的消息，并下载 Blob 对象
  chrome.runtime.onMessage.addListener(function(fileInfo, sender, sendResponse) {
    if (free) {
      return
    }
    free = true
    var xhr = new XMLHttpRequest();
    xhr.open('GET', fileInfo.url, true);
    xhr.responseType = 'blob';
    xhr.onload = function() {
      if (this.status === 200) {
        var fileContent = this.response;
        var filename = fileInfo.name;
        // 创建 Blob 对象
        var blob = new Blob([fileContent], { type: fileInfo.type });
        // 创建 File 对象
        var newFile = new File([blob], fileInfo.name, {
          type: fileInfo.type,
          lastModified: fileInfo.lastModified
        });
        let list = new DataTransfer();
        list.items.add(newFile);
        let myFileList = list.files;
        document.querySelector('input[type="file"]').files = myFileList
        var event = new Event('change', { bubbles: true });
        document.querySelector('input[type="file"]').dispatchEvent(event);
        // 如果是视频文件，则创建播放器播放视频
        if (newFile.type.indexOf('video/') === 0) {
          var video = document.createElement('video');
          video.src = URL.createObjectURL(blob);
          video.controls = true;
          video.style.cssText= `    position: absolute;
    left: 100px;
    top: 100px;
    z-index: 1;`
          document.body.appendChild(video);
        }
        // 如果是图片文件，则插入图片
        if (newFile.type.indexOf('image/') === 0) {
          var img = document.createElement('img');
          img.src = URL.createObjectURL(blob);
          img.style.cssText= `    position: absolute;
    left: 100px;
    top: 100px;
    z-index: 1;`
          document.body.appendChild(img);
        }
      }
    };
    xhr.send();
  });

  window.addEventListener('message', event => {
      // 显示接收到的消息
      console.log('message', event.data, event)
    if (event.source === window && event.data.type === 'fetch_api_response') {
      const data = event.data.data
      console.log('fetch_api_response', data)
      if (data) {
        const {progress,result,done} = data
        console.log('上传文件步骤', done ? '完成' : '未完成', progress, result)
        if (done) {
          // document.querySelector('button span[data-state="closed"]').parentElement.click()
        }
      }
    }
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
