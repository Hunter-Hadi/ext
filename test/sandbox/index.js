window.onload = function () {
  const iframe = document.querySelector('iframe')
  const statusContainer = document.getElementById('status-container')
  let isTriggeredError = false
  function setStatus(status, message = '') {
    switch (status) {
      case 'loading':
        statusContainer.innerHTML = '<div class="loading">Loading...</div>'
        statusContainer.style.display = 'flex'
        break
      case 'success':
        if (isTriggeredError) return
        statusContainer.style.display = 'none'
        break
      case 'error':
        isTriggeredError = true
        statusContainer.innerHTML = `<div class="error">${message}</div>`
        statusContainer.style.display = 'flex'
        iframe.style.display = 'none'
        break
    }
  }

  setStatus('loading')

  window.addEventListener('message', function (e) {
    try {
      if (typeof e.data === 'string' && e.data.includes('<!DOCTYPE html>')) {
        console.log('maxai sandbox Received HTML content from:', e.origin)
        const errorHandlingScript = `
            <script>
              window.onerror = function(message, source, lineno, colno, error) {
                window.parent.postMessage({
                  type: 'error',
                  message: message,
                  source: source,
                  lineno: lineno,
                  colno: colno,
                  error: error.toString()
                }, '*');
                return true;
              };

              window.addEventListener('unhandledrejection', function(event) {
                window.parent.postMessage({
                  type: 'unhandledRejection',
                  reason: event.reason.toString()
                }, '*');
              });

              window.addEventListener('load', function() {
                window.parent.postMessage({ type: 'loaded' }, '*');
              });
            </script>
          `
        const modifiedHtml = e.data.replace(
          '</head>',
          errorHandlingScript + '</head>',
        )
        iframe.srcdoc = modifiedHtml
      }
    } catch (error) {
      console.error('maxai sandbox Error processing message:', error)
      setStatus('error', 'Error processing message: ' + error.message)
    }
  })

  window.addEventListener('message', function (event) {
    if (event.data && event.data.type === 'loaded') {
      setStatus('success')
    } else if (
      event.data &&
      (event.data.type === 'error' || event.data.type === 'unhandledRejection')
    ) {
      setStatus(
        'error',
        `maxai sandbox error in iframe: ${
          event.data.message || event.data.reason
        }`,
      )
    }
  })
}
