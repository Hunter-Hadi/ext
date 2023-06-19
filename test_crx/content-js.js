window.onload = () => {
  let tempRange = null
  let tempSelectedText = ''
  const markButton = document.createElement('button')
  markButton.innerText = 'Mark'
  markButton.style =
    'position: fixed; top: 20px; right: 16px; z-index: 9999;cursor: pointer;user-select: auto;'
  document.body.appendChild(markButton)
  markButton.addEventListener('click', () => {
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
  makeSelectionButton3.addEventListener('click', async () => {
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
    parent.innerHTML = parent.innerText
    const startIndex = parent.innerText.indexOf(selectedText)
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
  const makeSelectionButton = document.createElement('button')
  makeSelectionButton.innerText = 'Make selection2'
  makeSelectionButton.style =
    'position: fixed; top: 80px; right: 96px; z-index: 9999;cursor: pointer;user-select: auto;'
  document.body.appendChild(makeSelectionButton)
  makeSelectionButton.addEventListener('click', async () => {
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
      await navigator.clipboard.writeText('Hi\nWorld\nJerry!!!')
      document.execCommand('paste', false, '')
    }
  })
}
