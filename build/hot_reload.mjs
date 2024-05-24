import chokidar from 'chokidar'
import path from 'path'
import debounce from 'lodash-es/debounce'
import WebSocket, { WebSocketServer } from 'ws';
import {spawn} from 'child_process'

const port = process.env.PORT || 8181

const killPortProcess = (port) => {
  return new Promise((resolve, reject) => {
    const cmd = `lsof -i tcp:${port} | grep LISTEN | awk '{print $2}' | xargs kill -9`
    const child = spawn(cmd, { shell: true })
    child.on('close', (code) => {
      if (code === 0) {
        resolve(code)
      } else {
        reject(code)
      }
    })
  })
}

killPortProcess(port).then(() => {
  const wss = new WebSocketServer({ port: 8181 })
  const directoryPath = path.resolve('dist')
  wss.on('listening', () => {
    console.log('hot reload server is listening...')
  })
  wss.on('close', () => {
    console.log('hot reload server closed.')
  })
  wss.on('connection', (ws) => {
    // console.log('hot reload server connected.')
    const watcher = chokidar.watch(directoryPath, {
      ignoreInitial: true,
    })
    watcher.on(
      'all',
      debounce((_, path) => {
        // console.log(`File change detected. Path: ${path}`)
        ws.send('hot_reload_message')
      }, 2000),
    )
    ws.on('close', () => {
      watcher.close()
    })
  })
  console.log('hot reload server started.')
})
