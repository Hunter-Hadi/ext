window.onload = () => {
  let tempRange = null
  let tempSelectedText = ''
  const markButton = document.createElement('button')
  markButton.innerText = 'Mark'
  markButton.style =
    'position: fixed; top: 20px; right: 16px; z-index: 9999;cursor: pointer;user-select: auto;'
  document.body.appendChild(markButton)
  markButton.addEventListener('click', (event) => {
    event.stopPropagation()
    event.preventDefault()
    const selection = window.getSelection()
    if (selection.rangeCount) {
      const range = selection.getRangeAt(0)
      const partOfRangeSelected = range.cloneRange()
      partOfRangeSelected.selectNodeContents(range.startContainer.parentElement)
      partOfRangeSelected.setStart(range.startContainer, range.startOffset)
      partOfRangeSelected.setEnd(range.endContainer, range.endOffset)
      console.log(partOfRangeSelected.toString())
      tempSelectedText = partOfRangeSelected.toString()
      let boundaryRange = range.cloneRange()
      boundaryRange.collapse(true)
      const startMarker = document.createElement('span')
      startMarker.id = 'a'
      startMarker.style.lineHeight = '0'
      startMarker.style.display = 'none'
      startMarker.textContent = ''
      // startMarker.className = 'UrtAp'
      // startMarker.style = `--darkmode-color: rgb(115, 115, 115); --lightmode-color: rgb(140, 140, 140);`
      startMarker.setAttribute('data-usechatgpt-marker', 'usechatgpt-marker')
      startMarker.setAttribute('contenteditable', 'false')
      startMarker.setAttribute('data-usechatgpt-marker-start-id', 'a')
      boundaryRange.insertNode(startMarker)
      boundaryRange = range.cloneRange()
      boundaryRange.collapse(false)
      const endMarker = document.createElement('span')
      endMarker.id = 'b'
      endMarker.style.lineHeight = '0'
      endMarker.style.display = 'none'
      endMarker.textContent = ''
      // endMarker.className = 'UrtAp'
      // endMarker.style = `--darkmode-color: rgb(115, 115, 115); --lightmode-color: rgb(140, 140, 140);`
      endMarker.setAttribute('data-usechatgpt-marker', 'usechatgpt-marker')
      endMarker.setAttribute('contenteditable', 'false')
      endMarker.setAttribute('data-usechatgpt-marker-end-id', 'b')
      boundaryRange.insertNode(endMarker)
    }
  })
  const makeSelectionButton3 = document.createElement('button')
  makeSelectionButton3.innerText = 'Make selection with pure'
  makeSelectionButton3.style =
    'position: fixed; top: 40px; right: 16px; z-index: 9999;cursor: pointer;user-select: auto;'
  document.body.appendChild(makeSelectionButton3)
  makeSelectionButton3.addEventListener('click', async (event) => {
    event.stopPropagation()
    event.preventDefault()
    const startMarker = document.querySelector(
      'span[data-usechatgpt-marker-start-id]',
    )
    const endMarker = document.querySelector(
      'span[data-usechatgpt-marker-end-id]',
    )
    console.log(startMarker, endMarker)
    const range = document.createRange()
    range.setStartAfter(startMarker)
    range.setEndBefore(endMarker)
    let selectedText = range.toString()
    let parent = startMarker.parentElement
    startMarker.remove()
    endMarker.remove()
    const textNode = document.createTextNode(selectedText)
    parent.innerHTML = ''
    parent.appendChild(textNode)
    const startIndex = Math.max(parent.innerText.indexOf(selectedText), 0)
    const endIndex = startIndex + selectedText.length
    range.setStart(parent.firstChild, startIndex)
    range.setEnd(parent.firstChild, endIndex)
    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
  })
  console.log('inject!!!!!!')
  const mark2Button = document.createElement('button')
  mark2Button.innerText = 'Mark 2'
  mark2Button.style =
    'position: fixed; top: 60px; right: 96px; z-index: 9999;cursor: pointer;user-select: auto;'
  document.body.appendChild(mark2Button)
  mark2Button.addEventListener('click', () => {
    const selection = window.getSelection()
    if (selection.rangeCount) {
      const range = selection.getRangeAt(0)
      const partOfRangeSelected = range.cloneRange()
      partOfRangeSelected.selectNodeContents(range.startContainer.parentElement)
      partOfRangeSelected.setStart(range.startContainer, range.startOffset)
      partOfRangeSelected.setEnd(range.endContainer, range.endOffset)
      console.log(partOfRangeSelected.toString())
      tempRange = partOfRangeSelected.cloneRange()
      tempSelectedText = partOfRangeSelected.toString()
    }
  })
  const pasteInsertButton = document.createElement('button')
  pasteInsertButton.innerText = 'paste insert'
  pasteInsertButton.style =
    'position: fixed; top: 80px; right: 96px; z-index: 9999;cursor: pointer;user-select: auto;'
  document.body.appendChild(pasteInsertButton)
  pasteInsertButton.addEventListener('click', async (event) => {
    event.stopPropagation()
    event.preventDefault()
    if (tempRange) {
      const selection = window.getSelection()
      // let parent = tempRange.startContainer.parentElement
      // const range = document.createRange()
      // const startIndex = parent.innerText.indexOf(tempSelectedText)
      // const endIndex = startIndex + tempSelectedText.length
      // range.setStart(parent.firstChild, startIndex)
      // range.setEnd(parent.firstChild, endIndex)
      // const selection = window.getSelection()
      selection.removeAllRanges()
      selection.addRange(tempRange)
      selection.collapseToEnd()
      await navigator.clipboard.writeText('Hi\nWorld\nJerry!!!')
      document.execCommand('paste', false, '')
    }
  })
  const pasteReplaceButton = document.createElement('button')
  pasteReplaceButton.innerText = 'paste replace'
  pasteReplaceButton.style =
    'position: fixed; top: 100px; right: 96px; z-index: 9999;cursor: pointer;user-select: auto;'
  document.body.appendChild(pasteReplaceButton)
  pasteReplaceButton.addEventListener('click', async (event) => {
    event.stopPropagation()
    event.preventDefault()
    if (!tempRange) {
      tempRange = window.getSelection().getRangeAt(0).cloneRange()
    }
    if (tempRange) {
      const selection = window.getSelection()
      // let parent = tempRange.startContainer.parentElement
      // const range = document.createRange()
      // const startIndex = parent.innerText.indexOf(tempSelectedText)
      // const endIndex = startIndex + tempSelectedText.length
      // range.setStart(parent.firstChild, startIndex)
      // range.setEnd(parent.firstChild, endIndex)
      // const selection = window.getSelection()
      selection.removeAllRanges()
      selection.addRange(tempRange)
      document.execCommand('Delete')
      await navigator.clipboard.writeText('Hi\nWorld\nJerry!!!')
      document.execCommand('paste', false, '')
    }
  })
  const inserSelectionButton = document.createElement('button')
  inserSelectionButton.innerText = 'Insert selection'
  inserSelectionButton.style =
    'position: fixed; top: 120px; right: 96px; z-index: 9999;cursor: pointer;user-select: auto;'
  document.body.appendChild(inserSelectionButton)
  inserSelectionButton.addEventListener('click', async (event) => {
    event.stopPropagation()
    event.preventDefault()
    if (!tempRange) {
      tempRange = window.getSelection().getRangeAt(0).cloneRange()
    }
    if (tempRange) {
      const selection = window.getSelection()
      // let parent = tempRange.startContainer.parentElement
      // const range = document.createRange()
      // const startIndex = parent.innerText.indexOf(tempSelectedText)
      // const endIndex = startIndex + tempSelectedText.length
      // range.setStart(parent.firstChild, startIndex)
      // range.setEnd(parent.firstChild, endIndex)
      // const selection = window.getSelection()
      selection.removeAllRanges()
      selection.addRange(tempRange)
      selection.collapseToEnd()
      // await navigator.clipboard.writeText('Hi\nWorld\nJerry!!!')
      document.execCommand('insertText', false, `Hi\nWorld\nJerry!!!`)
    }
  })
  const replaceSelection = document.createElement('button')
  replaceSelection.innerText = 'Replace selection'
  replaceSelection.style =
    'position: fixed; top: 140px; right: 96px; z-index: 9999;cursor: pointer;user-select: auto;'
  document.body.appendChild(replaceSelection)
  replaceSelection.addEventListener('click', async (event) => {
    event.stopPropagation()
    event.preventDefault()
    if (tempRange) {
      const selection = window.getSelection()
      // let parent = tempRange.startContainer.parentElement
      // const range = document.createRange()
      // const startIndex = parent.innerText.indexOf(tempSelectedText)
      // const endIndex = startIndex + tempSelectedText.length
      // range.setStart(parent.firstChild, startIndex)
      // range.setEnd(parent.firstChild, endIndex)
      // const selection = window.getSelection()
      selection.removeAllRanges()
      selection.addRange(tempRange)
      // delete
      // document.execCommand('delete', false, '')
      // await navigator.clipboard.writeText('Hi\nWorld\nJerry!!!')
      document.execCommand('Delete')
      document.execCommand('insertText', false, `Hi\nWorld\nJerry!!!`)
    }
  })
  const replaceWithWriteSelection = document.createElement('button')
  replaceWithWriteSelection.innerText = 'Replace selection permission'
  replaceWithWriteSelection.style =
    'position: fixed; top: 160px; right: 96px; z-index: 9999;cursor: pointer;user-select: auto;'
  document.body.appendChild(replaceWithWriteSelection)
  replaceWithWriteSelection.addEventListener('click', async (event) => {
    event.stopPropagation()
    event.preventDefault()
    if (tempRange) {
      const selection = window.getSelection()
      // let parent = tempRange.startContainer.parentElement
      // const range = document.createRange()
      // const startIndex = parent.innerText.indexOf(tempSelectedText)
      // const endIndex = startIndex + tempSelectedText.length
      // range.setStart(parent.firstChild, startIndex)
      // range.setEnd(parent.firstChild, endIndex)
      // const selection = window.getSelection()
      selection.removeAllRanges()
      selection.addRange(tempRange)
      // delete
      const permission = await navigator.permissions.query({
        name: 'clipboard-write',
      })
      console.log('permission.state', permission.state)
      document.execCommand('delete', false, '')
      await navigator.clipboard.writeText('Hi\nWorld\nJerry!!!')
      document.execCommand('paste', false, '')
    }
  })

  const script = document.createElement('script')
  script.src = chrome.runtime.getURL('aa.js')
  document.head.appendChild(script)
}
