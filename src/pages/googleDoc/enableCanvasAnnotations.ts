const extId = document.currentScript?.getAttribute('data-ext-id');

(window as any)._docs_annotate_canvas_by_ext = extId;

Object.defineProperty(window, '_docs_annotate_canvas_by_ext', {
  get: function() {
    const global = window as any;
    if (global.uFe && !global.uFe.includes(extId)) {
      global.uFe.push(extId);
    }
    return `${extId}`;
  }
});
