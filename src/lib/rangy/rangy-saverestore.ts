// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
const initRangySaveRestore = (rangy: any) => {
  /**
   * Selection save and restore module for Rangy.
   * Saves and restores user selections using marker invisible elements in the DOM.
   *
   * Part of Rangy, a cross-browser JavaScript range and selection library
   * https://github.com/timdown/rangy
   *
   * Depends on Rangy core.
   *
   * Copyright %%build:year%%, Tim Down
   * Licensed under the MIT license.
   * Version: %%build:version%%
   * Build date: %%build:date%%
   */
  /* build:modularizeWithRangyDependency */
  rangy.createModule(
    'SaveRestore',
    ['WrappedSelection'],
    function (api, module) {
      const dom = api.dom
      const removeNode = dom.removeNode
      const isDirectionBackward = api.Selection.isDirectionBackward
      const markerTextChar = '\ufeff'

      function gEBI(id, doc) {
        return (doc || document).getElementById(id)
      }

      function insertRangeBoundaryMarker(range, atStart) {
        const markerId =
          'selectionBoundary_' +
          +new Date() +
          '_' +
          ('' + Math.random()).slice(2)
        let markerEl: any
        const doc = dom.getDocument(range.startContainer)

        // Clone the Range and collapse to the appropriate boundary point
        const boundaryRange = range.cloneRange()
        boundaryRange.collapse(atStart)

        // Create the marker element containing a single invisible character using DOM methods and insert it
        // eslint-disable-next-line prefer-const
        markerEl = doc.createElement('span')
        markerEl.id = markerId
        markerEl.style.lineHeight = '0'
        markerEl.style.display = 'none'
        markerEl.className = 'rangySelectionBoundary'
        markerEl.appendChild(doc.createTextNode(markerTextChar))

        boundaryRange.insertNode(markerEl)
        return markerEl
      }

      function setRangeBoundary(doc, range, markerId, atStart) {
        const markerEl = gEBI(markerId, doc)
        if (markerEl) {
          range[atStart ? 'setStartBefore' : 'setEndBefore'](markerEl)
          removeNode(markerEl)
        } else {
          module.warn(
            'Marker element has been removed. Cannot restore selection.',
          )
        }
      }

      function compareRanges(r1, r2) {
        return r2.compareBoundaryPoints(r1.START_TO_START, r1)
      }

      function saveRange(range, direction) {
        let startEl,
          endEl,
          // eslint-disable-next-line prefer-const
          doc = api.DomRange.getRangeDocument(range),
          // eslint-disable-next-line prefer-const
          text = range.toString()
        const backward = isDirectionBackward(direction)

        if (range.collapsed) {
          endEl = insertRangeBoundaryMarker(range, false)
          return {
            document: doc,
            markerId: endEl.id,
            collapsed: true,
          }
        } else {
          endEl = insertRangeBoundaryMarker(range, false)
          startEl = insertRangeBoundaryMarker(range, true)

          return {
            document: doc,
            startMarkerId: startEl.id,
            endMarkerId: endEl.id,
            collapsed: false,
            backward: backward,
            toString: function () {
              return (
                "original text: '" +
                text +
                "', new text: '" +
                range.toString() +
                "'"
              )
            },
          }
        }
      }

      function restoreRange(rangeInfo, normalize) {
        const doc = rangeInfo.document
        if (typeof normalize == 'undefined') {
          normalize = true
        }
        const range = api.createRange(doc)
        if (rangeInfo.collapsed) {
          const markerEl = gEBI(rangeInfo.markerId, doc)
          if (markerEl) {
            markerEl.style.display = 'inline'
            const previousNode = markerEl.previousSibling

            // Workaround for issue 17
            if (previousNode && previousNode.nodeType == 3) {
              removeNode(markerEl)
              range.collapseToPoint(previousNode, previousNode.length)
            } else {
              range.collapseBefore(markerEl)
              removeNode(markerEl)
            }
          } else {
            module.warn(
              'Marker element has been removed. Cannot restore selection.',
            )
          }
        } else {
          setRangeBoundary(doc, range, rangeInfo.startMarkerId, true)
          setRangeBoundary(doc, range, rangeInfo.endMarkerId, false)
        }

        if (normalize) {
          range.normalizeBoundaries()
        }

        return range
      }

      function saveRanges(ranges, direction) {
        // eslint-disable-next-line prefer-const
        let rangeInfos = [],
          range,
          doc
        const backward = isDirectionBackward(direction)

        // Order the ranges by position within the DOM, latest first, cloning the array to leave the original untouched
        ranges = ranges.slice(0)
        ranges.sort(compareRanges)
        let i = 0
        const len = ranges.length
        for (i, len; i < len; ++i) {
          rangeInfos[i] = saveRange(ranges[i], backward)
        }

        // Now that all the markers are in place and DOM manipulation over, adjust each range's boundaries to lie
        // between its markers
        for (i = len - 1; i >= 0; --i) {
          range = ranges[i]
          doc = api.DomRange.getRangeDocument(range)
          if (range.collapsed) {
            range.collapseAfter(gEBI(rangeInfos[i].markerId, doc))
          } else {
            range.setEndBefore(gEBI(rangeInfos[i].endMarkerId, doc))
            range.setStartAfter(gEBI(rangeInfos[i].startMarkerId, doc))
          }
        }

        return rangeInfos
      }

      function saveSelection(win) {
        if (!api.isSelectionValid(win)) {
          module.warn(
            'Cannot save selection. This usually happens when the selection is collapsed and the selection document has lost focus.',
          )
          return null
        }
        const sel = api.getSelection(win)
        const ranges = sel.getAllRanges()
        const backward = ranges.length == 1 && sel.isBackward()

        const rangeInfos = saveRanges(ranges, backward)

        // Ensure current selection is unaffected
        if (backward) {
          sel.setSingleRange(ranges[0], backward)
        } else {
          sel.setRanges(ranges)
        }

        return {
          win: win,
          rangeInfos: rangeInfos,
          restored: false,
        }
      }

      function restoreRanges(rangeInfos) {
        const ranges = []

        // Ranges are in reverse order of appearance in the DOM. We want to restore earliest first to avoid
        // normalization affecting previously restored ranges.
        const rangeCount = rangeInfos.length

        for (let i = rangeCount - 1; i >= 0; i--) {
          ranges[i] = restoreRange(rangeInfos[i], true)
        }

        return ranges
      }

      function restoreSelection(savedSelection, preserveDirection) {
        if (!savedSelection.restored) {
          const rangeInfos = savedSelection.rangeInfos
          const sel = api.getSelection(savedSelection.win)
          const ranges = restoreRanges(rangeInfos),
            rangeCount = rangeInfos.length

          if (
            rangeCount == 1 &&
            preserveDirection &&
            api.features.selectionHasExtend &&
            rangeInfos[0].backward
          ) {
            sel.removeAllRanges()
            sel.addRange(ranges[0], true)
          } else {
            sel.setRanges(ranges)
          }

          savedSelection.restored = true
        }
      }

      function removeMarkerElement(doc, markerId) {
        const markerEl = gEBI(markerId, doc)
        if (markerEl) {
          removeNode(markerEl)
        }
      }

      function removeMarkers(savedSelection) {
        const rangeInfos = savedSelection.rangeInfos
        for (let i = 0, len = rangeInfos.length, rangeInfo; i < len; ++i) {
          rangeInfo = rangeInfos[i]
          if (rangeInfo.collapsed) {
            removeMarkerElement(savedSelection.doc, rangeInfo.markerId)
          } else {
            removeMarkerElement(savedSelection.doc, rangeInfo.startMarkerId)
            removeMarkerElement(savedSelection.doc, rangeInfo.endMarkerId)
          }
        }
      }

      api.util.extend(api, {
        saveRange: saveRange,
        restoreRange: restoreRange,
        saveRanges: saveRanges,
        restoreRanges: restoreRanges,
        saveSelection: saveSelection,
        restoreSelection: restoreSelection,
        removeMarkerElement: removeMarkerElement,
        removeMarkers: removeMarkers,
      })
    },
  )
  /* build:modularizeEnd */
}
export default initRangySaveRestore
