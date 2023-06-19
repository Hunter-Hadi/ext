window.onload = () => {
  let tempRange = null
  const markButton = document.createElement('button')
  markButton.innerText = 'Mark'
  markButton.style = 'position: fixed; top: 40px; right: 16px; z-index: 9999;'
  document.body.appendChild(markButton)
  markButton.addEventListener('click', () => {
    const selection = window.getSelection()
    if (selection.rangeCount) {
      tempRange = selection.getRangeAt(0).cloneRange()
    }
  })
  const button = document.createElement('button')
  button.innerText = 'Click me'
  button.style = 'position: fixed; top: 16px; right: 16px; z-index: 9999;'
  document.body.appendChild(button)
  button.addEventListener('click', async () => {
    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(tempRange)
    let old = await navigator.clipboard.readText()
    await navigator.clipboard.writeText('\nhi\nmy name is jerry')
    document.execCommand('paste', null, null)
    await navigator.clipboard.writeText(old)
  })
  const onlyPasteButton = document.createElement('button')
  onlyPasteButton.innerText = 'Only paste'
  onlyPasteButton.style =
    'position: fixed; top: 64px; right: 16px; z-index: 9999;'
  document.body.appendChild(onlyPasteButton)
  onlyPasteButton.addEventListener('click', async () => {
    await navigator.clipboard.writeText('hi!')
    document.execCommand('paste', null, null)
  })
  const hoverButton = document.createElement('button')
  hoverButton.innerText = 'Hover'
  hoverButton.style = 'position: fixed; top: 88px; right: 16px; z-index: 9999;'
  document.body.appendChild(hoverButton)
  hoverButton.addEventListener('mouseenter', async () => {
    await navigator.clipboard.writeText('hi!\nmy name is jerry\ntkx')
    document.execCommand('paste', null, null)
  })
  console.log('???3')

  const makeSelectionButton = document.createElement('button')
  makeSelectionButton.innerText = 'Make selection'
  makeSelectionButton.style =
    'position: fixed; top: 112px; right: 16px; z-index: 9999;'
  document.body.appendChild(makeSelectionButton)
  makeSelectionButton.addEventListener('click', async () => {
    const startMarker = document.querySelector(
      'span[data-usechatgpt-marker-start-id]',
    )
    const endMarker = document.querySelector(
      'span[data-usechatgpt-marker-end-id]',
    )
    console.log(startMarker, endMarker)
    const range = document.createRange()
    range.selectNode(document.body)
    range.setStart(startMarker, 0)
    range.setEnd(endMarker, 0)
    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
  })
  console.log('???4')
  const makeSelectionButton2 = document.createElement('button')
  makeSelectionButton2.innerText = 'Make selection 2'
  makeSelectionButton2.style =
    'position: fixed; top: 136px; right: 16px; z-index: 9999;'
  document.body.appendChild(makeSelectionButton2)
  makeSelectionButton2.addEventListener('click', async () => {
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
    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
  })
  console.log('???5')
  const makeSelectionButton3 = document.createElement('button')
  makeSelectionButton3.innerText = 'Make selection 3'
  makeSelectionButton3.style =
    'position: fixed; top: 160px; right: 16px; z-index: 9999;'
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
}
