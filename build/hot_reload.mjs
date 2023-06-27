import chokidar from 'chokidar'
import path from 'path'
import {debounce} from 'lodash-es'
import WebSocket, { WebSocketServer } from 'ws';
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
    }, 1000),
  )
  ws.on('close', () => {
    watcher.close()
  })
})
console.log('hot reload server started.')
