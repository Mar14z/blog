(function () {
  // 在图表页里引入本脚本：被博客文章以 iframe 嵌入时，把自身高度上报给父页面
  var lastHeight = 0;

  function report() {
    var height = Math.ceil(document.documentElement.scrollHeight);
    if (height === lastHeight) return;
    lastHeight = height;
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'diagram-height', height: height }, '*');
    }
  }

  window.addEventListener('load', report);

  if (window.ResizeObserver) {
    new ResizeObserver(report).observe(document.documentElement);
  } else {
    window.setInterval(report, 500);
  }
})();
