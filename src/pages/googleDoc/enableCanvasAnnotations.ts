const extId = document.currentScript?.getAttribute('data-ext-id')

;(window as any)._docs_annotate_canvas_by_ext = extId

// 以下方式往Google Doc白名单内插入extId
// 但每次Google Doc更新后全局变量名可能会变
// Object.defineProperty(window, '_docs_annotate_canvas_by_ext', {
//   get: function () {
//     const global = window as any
//     ;['uFe', 'GEe'].forEach((key) => {
//       if (Array.isArray(global[key]) && !global[key].includes(extId)) {
//         global[key].push(extId)
//       }
//     })
//     return `${extId}`
//   },
// })
