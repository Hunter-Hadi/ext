/* eslint-disable */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/**
 * 这个文件hack Readability的方法，为了能让解析后找到网页里对应的DOM节点，更改位置为NOTE：开头的注释
 */
import { Readability } from '@mozilla/readability'

Readability.prototype._replaceBrs = function () {}

Readability.prototype._grabArticle = function (page) {
  this.log('**** grabArticle ****')
  var doc = this._doc
  var isPaging = page !== null
  page = page ? page : this._doc.body

  // We can't grab an article if we don't have a page!
  if (!page) {
    this.log('No body found in document. Abort.')
    return null
  }

  var pageCacheHtml = page.innerHTML

  while (true) {
    this.log('Starting grabArticle loop')
    var stripUnlikelyCandidates = this._flagIsActive(this.FLAG_STRIP_UNLIKELYS)

    // First, node prepping. Trash nodes that look cruddy (like ones with the
    // class name "comment", etc), and turn divs into P tags where they have been
    // used inappropriately (as in, where they contain no other block level elements.)
    var elementsToScore = []
    var node = this._doc.documentElement

    let shouldRemoveTitleHeader = true

    while (node) {
      if (node.tagName === 'HTML') {
        this._articleLang = node.getAttribute('lang')
      }

      var matchString = node.className + ' ' + node.id

      if (!this._isProbablyVisible(node)) {
        this.log('Removing hidden node - ' + matchString)
        node = this._removeAndGetNext(node)
        continue
      }

      // User is not able to see elements applied with both "aria-modal = true" and "role = dialog"
      if (
        node.getAttribute('aria-modal') == 'true' &&
        node.getAttribute('role') == 'dialog'
      ) {
        node = this._removeAndGetNext(node)
        continue
      }

      // Check to see if this node is a byline, and remove it if it is.
      if (this._checkByline(node, matchString)) {
        node = this._removeAndGetNext(node)
        continue
      }

      if (shouldRemoveTitleHeader && this._headerDuplicatesTitle(node)) {
        this.log(
          'Removing header: ',
          node.textContent.trim(),
          this._articleTitle.trim(),
        )
        shouldRemoveTitleHeader = false
        node = this._removeAndGetNext(node)
        continue
      }

      // Remove unlikely candidates
      if (stripUnlikelyCandidates) {
        if (
          this.REGEXPS.unlikelyCandidates.test(matchString) &&
          !this.REGEXPS.okMaybeItsACandidate.test(matchString) &&
          !this._hasAncestorTag(node, 'table') &&
          !this._hasAncestorTag(node, 'code') &&
          node.tagName !== 'BODY' &&
          node.tagName !== 'A'
        ) {
          this.log('Removing unlikely candidate - ' + matchString)
          node = this._removeAndGetNext(node)
          continue
        }

        if (this.UNLIKELY_ROLES.includes(node.getAttribute('role'))) {
          this.log(
            'Removing content with role ' +
              node.getAttribute('role') +
              ' - ' +
              matchString,
          )
          node = this._removeAndGetNext(node)
          continue
        }
      }

      // Remove DIV, SECTION, and HEADER nodes without any content(e.g. text, image, video, or iframe).
      if (
        (node.tagName === 'DIV' ||
          node.tagName === 'SECTION' ||
          node.tagName === 'HEADER' ||
          node.tagName === 'H1' ||
          node.tagName === 'H2' ||
          node.tagName === 'H3' ||
          node.tagName === 'H4' ||
          node.tagName === 'H5' ||
          node.tagName === 'H6') &&
        this._isElementWithoutContent(node)
      ) {
        node = this._removeAndGetNext(node)
        continue
      }

      if (this.DEFAULT_TAGS_TO_SCORE.indexOf(node.tagName) !== -1) {
        elementsToScore.push(node)
      }

      // Turn all divs that don't have children block level elements into p's
      if (node.tagName === 'DIV') {
        // Put phrasing content into paragraphs.
        var p = null
        var childNode = node.firstChild
        while (childNode) {
          var nextSibling = childNode.nextSibling
          if (this._isPhrasingContent(childNode)) {
            if (p !== null) {
              // NOTE: 更改了这里
              if (childNode.nodeType === Node.TEXT_NODE) {
                // debugger
                const span = doc.createElement('span')
                span.setAttribute(
                  'maxai-readability-id',
                  childNode.parentElement.getAttribute('maxai-readability-id'),
                )
                span.appendChild(childNode)
                p.appendChild(span)
              } else {
                p.appendChild(childNode)
              }
            } else if (!this._isWhitespace(childNode)) {
              p = doc.createElement('p')
              // NOTE: 更改了这里
              if (childNode.nodeType === Node.TEXT_NODE) {
                // debugger
                const span = doc.createElement('span')
                span.setAttribute(
                  'maxai-readability-id',
                  childNode.parentElement.getAttribute('maxai-readability-id'),
                )
                span.append(childNode.cloneNode(true))
                node.replaceChild(p, childNode)
                p.appendChild(span)
              } else {
                node.replaceChild(p, childNode)
                p.appendChild(childNode)
              }
            }
          } else if (p !== null) {
            while (p.lastChild && this._isWhitespace(p.lastChild)) {
              p.removeChild(p.lastChild)
            }
            p = null
          }
          childNode = nextSibling
        }

        // Sites like http://mobile.slate.com encloses each paragraph with a DIV
        // element. DIVs with only a P element inside and no text content can be
        // safely converted into plain P elements to avoid confusing the scoring
        // algorithm with DIVs with are, in practice, paragraphs.
        if (
          this._hasSingleTagInsideElement(node, 'P') &&
          this._getLinkDensity(node) < 0.25
        ) {
          var newNode = node.children[0]
          node.parentNode.replaceChild(newNode, node)
          node = newNode
          elementsToScore.push(node)
        } else if (!this._hasChildBlockElement(node)) {
          node = this._setNodeTag(node, 'P')
          elementsToScore.push(node)
        }
      }
      node = this._getNextNode(node)
    }

    /**
     * Loop through all paragraphs, and assign a score to them based on how content-y they look.
     * Then add their score to their parent node.
     *
     * A score is determined by things like number of commas, class names, etc. Maybe eventually link density.
     **/
    var candidates = []
    this._forEachNode(elementsToScore, function (elementToScore) {
      if (
        !elementToScore.parentNode ||
        typeof elementToScore.parentNode.tagName === 'undefined'
      )
        return

      // If this paragraph is less than 25 characters, don't even count it.
      var innerText = this._getInnerText(elementToScore)
      if (innerText.length < 25) return

      // Exclude nodes with no ancestor.
      var ancestors = this._getNodeAncestors(elementToScore, 5)
      if (ancestors.length === 0) return

      var contentScore = 0

      // Add a point for the paragraph itself as a base.
      contentScore += 1

      // Add points for any commas within this paragraph.
      contentScore += innerText.split(',').length

      // For every 100 characters in this paragraph, add another point. Up to 3 points.
      contentScore += Math.min(Math.floor(innerText.length / 100), 3)

      // Initialize and score ancestors.
      this._forEachNode(ancestors, function (ancestor, level) {
        if (
          !ancestor.tagName ||
          !ancestor.parentNode ||
          typeof ancestor.parentNode.tagName === 'undefined'
        )
          return

        if (typeof ancestor.readability === 'undefined') {
          this._initializeNode(ancestor)
          candidates.push(ancestor)
        }

        // Node score divider:
        // - parent:             1 (no division)
        // - grandparent:        2
        // - great grandparent+: ancestor level * 3
        if (level === 0) var scoreDivider = 1
        else if (level === 1) scoreDivider = 2
        else scoreDivider = level * 3
        ancestor.readability.contentScore += contentScore / scoreDivider
      })
    })

    // After we've calculated scores, loop through all of the possible
    // candidate nodes we found and find the one with the highest score.
    var topCandidates = []
    for (var c = 0, cl = candidates.length; c < cl; c += 1) {
      var candidate = candidates[c]

      // Scale the final candidates score based on link density. Good content
      // should have a relatively small link density (5% or less) and be mostly
      // unaffected by this operation.
      var candidateScore =
        candidate.readability.contentScore *
        (1 - this._getLinkDensity(candidate))
      candidate.readability.contentScore = candidateScore

      this.log('Candidate:', candidate, 'with score ' + candidateScore)

      for (var t = 0; t < this._nbTopCandidates; t++) {
        var aTopCandidate = topCandidates[t]

        if (
          !aTopCandidate ||
          candidateScore > aTopCandidate.readability.contentScore
        ) {
          topCandidates.splice(t, 0, candidate)
          if (topCandidates.length > this._nbTopCandidates) topCandidates.pop()
          break
        }
      }
    }

    var topCandidate = topCandidates[0] || null
    var neededToCreateTopCandidate = false
    var parentOfTopCandidate

    // If we still have no top candidate, just use the body as a last resort.
    // We also have to copy the body node so it is something we can modify.
    if (topCandidate === null || topCandidate.tagName === 'BODY') {
      // Move all of the page's children into topCandidate
      topCandidate = doc.createElement('DIV')
      neededToCreateTopCandidate = true
      // Move everything (not just elements, also text nodes etc.) into the container
      // so we even include text directly in the body:
      while (page.firstChild) {
        this.log('Moving child out:', page.firstChild)
        topCandidate.appendChild(page.firstChild)
      }

      page.appendChild(topCandidate)

      this._initializeNode(topCandidate)
    } else if (topCandidate) {
      // Find a better top candidate node if it contains (at least three) nodes which belong to `topCandidates` array
      // and whose scores are quite closed with current `topCandidate` node.
      var alternativeCandidateAncestors = []
      for (var i = 1; i < topCandidates.length; i++) {
        if (
          topCandidates[i].readability.contentScore /
            topCandidate.readability.contentScore >=
          0.75
        ) {
          alternativeCandidateAncestors.push(
            this._getNodeAncestors(topCandidates[i]),
          )
        }
      }
      var MINIMUM_TOPCANDIDATES = 3
      if (alternativeCandidateAncestors.length >= MINIMUM_TOPCANDIDATES) {
        parentOfTopCandidate = topCandidate.parentNode
        while (parentOfTopCandidate.tagName !== 'BODY') {
          var listsContainingThisAncestor = 0
          for (
            var ancestorIndex = 0;
            ancestorIndex < alternativeCandidateAncestors.length &&
            listsContainingThisAncestor < MINIMUM_TOPCANDIDATES;
            ancestorIndex++
          ) {
            listsContainingThisAncestor += Number(
              alternativeCandidateAncestors[ancestorIndex].includes(
                parentOfTopCandidate,
              ),
            )
          }
          if (listsContainingThisAncestor >= MINIMUM_TOPCANDIDATES) {
            topCandidate = parentOfTopCandidate
            break
          }
          parentOfTopCandidate = parentOfTopCandidate.parentNode
        }
      }
      if (!topCandidate.readability) {
        this._initializeNode(topCandidate)
      }

      // Because of our bonus system, parents of candidates might have scores
      // themselves. They get half of the node. There won't be nodes with higher
      // scores than our topCandidate, but if we see the score going *up* in the first
      // few steps up the tree, that's a decent sign that there might be more content
      // lurking in other places that we want to unify in. The sibling stuff
      // below does some of that - but only if we've looked high enough up the DOM
      // tree.
      parentOfTopCandidate = topCandidate.parentNode
      var lastScore = topCandidate.readability.contentScore
      // The scores shouldn't get too low.
      var scoreThreshold = lastScore / 3
      while (parentOfTopCandidate.tagName !== 'BODY') {
        if (!parentOfTopCandidate.readability) {
          parentOfTopCandidate = parentOfTopCandidate.parentNode
          continue
        }
        var parentScore = parentOfTopCandidate.readability.contentScore
        if (parentScore < scoreThreshold) break
        if (parentScore > lastScore) {
          // Alright! We found a better parent to use.
          topCandidate = parentOfTopCandidate
          break
        }
        lastScore = parentOfTopCandidate.readability.contentScore
        parentOfTopCandidate = parentOfTopCandidate.parentNode
      }

      // If the top candidate is the only child, use parent instead. This will help sibling
      // joining logic when adjacent content is actually located in parent's sibling node.
      parentOfTopCandidate = topCandidate.parentNode
      while (
        parentOfTopCandidate.tagName != 'BODY' &&
        parentOfTopCandidate.children.length == 1
      ) {
        topCandidate = parentOfTopCandidate
        parentOfTopCandidate = topCandidate.parentNode
      }
      if (!topCandidate.readability) {
        this._initializeNode(topCandidate)
      }
    }

    // Now that we have the top candidate, look through its siblings for content
    // that might also be related. Things like preambles, content split by ads
    // that we removed, etc.
    var articleContent = doc.createElement('DIV')
    if (isPaging) articleContent.id = 'readability-content'

    var siblingScoreThreshold = Math.max(
      10,
      topCandidate.readability.contentScore * 0.2,
    )
    // Keep potential top candidate's parent node to try to get text direction of it later.
    parentOfTopCandidate = topCandidate.parentNode
    var siblings = parentOfTopCandidate.children

    for (var s = 0, sl = siblings.length; s < sl; s++) {
      var sibling = siblings[s]
      var append = false

      this.log(
        'Looking at sibling node:',
        sibling,
        sibling.readability
          ? 'with score ' + sibling.readability.contentScore
          : '',
      )
      this.log(
        'Sibling has score',
        sibling.readability ? sibling.readability.contentScore : 'Unknown',
      )

      if (sibling === topCandidate) {
        append = true
      } else {
        var contentBonus = 0

        // Give a bonus if sibling nodes and top candidates have the example same classname
        if (
          sibling.className === topCandidate.className &&
          topCandidate.className !== ''
        )
          contentBonus += topCandidate.readability.contentScore * 0.2

        if (
          sibling.readability &&
          sibling.readability.contentScore + contentBonus >=
            siblingScoreThreshold
        ) {
          append = true
        } else if (sibling.nodeName === 'P') {
          var linkDensity = this._getLinkDensity(sibling)
          var nodeContent = this._getInnerText(sibling)
          var nodeLength = nodeContent.length

          if (nodeLength > 80 && linkDensity < 0.25) {
            append = true
          } else if (
            nodeLength < 80 &&
            nodeLength > 0 &&
            linkDensity === 0 &&
            nodeContent.search(/\.( |$)/) !== -1
          ) {
            append = true
          }
        }
      }

      if (append) {
        this.log('Appending node:', sibling)

        if (this.ALTER_TO_DIV_EXCEPTIONS.indexOf(sibling.nodeName) === -1) {
          // We have a node that isn't a common block level element, like a form or td tag.
          // Turn it into a div so it doesn't get filtered out later by accident.
          this.log('Altering sibling:', sibling, 'to div.')

          sibling = this._setNodeTag(sibling, 'DIV')
        }

        articleContent.appendChild(sibling)
        // Fetch children again to make it compatible
        // with DOM parsers without live collection support.
        siblings = parentOfTopCandidate.children
        // siblings is a reference to the children array, and
        // sibling is removed from the array when we call appendChild().
        // As a result, we must revisit this index since the nodes
        // have been shifted.
        s -= 1
        sl -= 1
      }
    }

    if (this._debug)
      this.log('Article content pre-prep: ' + articleContent.innerHTML)
    // So we have all of the content that we need. Now we clean it up for presentation.
    this._prepArticle(articleContent)
    if (this._debug)
      this.log('Article content post-prep: ' + articleContent.innerHTML)

    if (neededToCreateTopCandidate) {
      // We already created a fake div thing, and there wouldn't have been any siblings left
      // for the previous loop, so there's no point trying to create a new div, and then
      // move all the children over. Just assign IDs and class names here. No need to append
      // because that already happened anyway.
      topCandidate.id = 'readability-page-1'
      topCandidate.className = 'page'
    } else {
      var div = doc.createElement('DIV')
      div.id = 'readability-page-1'
      div.className = 'page'
      while (articleContent.firstChild) {
        div.appendChild(articleContent.firstChild)
      }
      articleContent.appendChild(div)
    }

    if (this._debug)
      this.log('Article content after paging: ' + articleContent.innerHTML)

    var parseSuccessful = true

    // Now that we've gone through the full algorithm, check to see if
    // we got any meaningful content. If we didn't, we may need to re-run
    // grabArticle with different flags set. This gives us a higher likelihood of
    // finding the content, and the sieve approach gives us a higher likelihood of
    // finding the -right- content.
    var textLength = this._getInnerText(articleContent, true).length
    if (textLength < this._charThreshold) {
      parseSuccessful = false
      page.innerHTML = pageCacheHtml

      if (this._flagIsActive(this.FLAG_STRIP_UNLIKELYS)) {
        this._removeFlag(this.FLAG_STRIP_UNLIKELYS)
        this._attempts.push({
          articleContent: articleContent,
          textLength: textLength,
        })
      } else if (this._flagIsActive(this.FLAG_WEIGHT_CLASSES)) {
        this._removeFlag(this.FLAG_WEIGHT_CLASSES)
        this._attempts.push({
          articleContent: articleContent,
          textLength: textLength,
        })
      } else if (this._flagIsActive(this.FLAG_CLEAN_CONDITIONALLY)) {
        this._removeFlag(this.FLAG_CLEAN_CONDITIONALLY)
        this._attempts.push({
          articleContent: articleContent,
          textLength: textLength,
        })
      } else {
        this._attempts.push({
          articleContent: articleContent,
          textLength: textLength,
        })
        // No luck after removing flags, just return the longest text we found during the different loops
        this._attempts.sort(function (a, b) {
          return b.textLength - a.textLength
        })

        // But first check if we actually have something
        if (!this._attempts[0].textLength) {
          return null
        }

        articleContent = this._attempts[0].articleContent
        parseSuccessful = true
      }
    }

    if (parseSuccessful) {
      // Find out text direction from ancestors of final top candidate.
      var ancestors = [parentOfTopCandidate, topCandidate].concat(
        this._getNodeAncestors(parentOfTopCandidate),
      )
      this._someNode(ancestors, function (ancestor) {
        if (!ancestor.tagName) return false
        var articleDir = ancestor.getAttribute('dir')
        if (articleDir) {
          this._articleDir = articleDir
          return true
        }
        return false
      })
      return articleContent
    }
  }
}
