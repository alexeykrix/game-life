const btnPlay = document.querySelector('.play')
const btnPause = document.querySelector('.pause')
const btnReset = document.querySelector('.reset')
const range = document.querySelector('#size')
const canvas = document.querySelector('#canvas')
const c = canvas.getContext('2d')
canvas.width = canvas.height = 500

c.fillStyle = '#eeeeee'
c.strokeStyle = '#000'
c.lineWidth = '1'

let gameData = []
let cellSize = 10
let cellsCount = canvas.width / cellSize

const makeRow = (w, h) => {
  let row = []
  for (let i=0; i<w; i++) {
    row.push({'x': i, 'y': h, state: 0})
  }
  return row
}

const makeArray = (w, h) => {
  let arr = []
  for (let i=0; i<h; i++) {
    arr.push(makeRow(w, i))
  }
  gameData = arr
}

const renderCell = (x, y, isLive, id) => {
  if (!isLive) return
  c.fillStyle = id%2 === 0 ? '#f39c12' : '#e67e22'
  c.beginPath()
  c.rect(x*cellSize, y*cellSize, cellSize, cellSize)
  c.fill()
  c.closePath()
}

const renderCells = () => {
  c.fillStyle = '#2e2d2e'
  c.beginPath()
  c.rect(0, 0, canvas.width, canvas.width)
  c.fill()
  c.closePath()
  gameData.flat().forEach((el, id) => {
    renderCell(el.x, el.y, el.state, id)
  })
}

const init = () => {
  makeArray(cellsCount, cellsCount)

  c.fillStyle = '#2e2d2e'
  c.beginPath()
  c.rect(0,0,c.width,c.height)
  c.closePath()
  c.fill()

  renderCells()
}

init()

const gameRun = (t) => {
  let newData = [... gameData]
  let alive = []
  let willLive = []
  let toBorn = []
  let time = t || 0

  gameData.flat().forEach(el => {
    if (el.state) alive.push(el)
    else willLive.push(el)
  })

  let toKill = []  
  alive.forEach(el => {
    let near = 0
    if (el.y-1 >= 0 && el.x-1 >= 0 &&
      el.y+1 < cellsCount && el.x+1 < cellsCount) {
      if (gameData[el.y-1][el.x-1].state) near++
      if (gameData[el.y-1][el.x].state) near++
      if (gameData[el.y-1][el.x+1].state) near++
      if (gameData[el.y][el.x-1].state) near++
      if (gameData[el.y][el.x+1].state) near++
      if (gameData[el.y+1][el.x-1].state) near++
      if (gameData[el.y+1][el.x].state) near++
      if (gameData[el.y+1][el.x+1].state) near++
    }
    if (near >= 0) {
      if (near === 2 || near === 3) ''
      else toKill.push(newData[el.y][el.x])
    }
  })

  willLive.forEach(el => {
    let near = 0
    if (el.y-1 >= 0 && el.x-1 >= 0 &&
        el.y+1 < cellsCount && el.x+1 < cellsCount) {
      if (gameData[el.y-1][el.x].state) near++
      if (gameData[el.y-1][el.x+1].state) near++
      if (gameData[el.y-1][el.x-1].state) near++
      if (gameData[el.y][el.x-1].state) near++
      if (gameData[el.y][el.x+1].state) near++
      if (gameData[el.y+1][el.x-1].state) near++
      if (gameData[el.y+1][el.x].state) near++
      if (gameData[el.y+1][el.x+1].state) near++
    }
    
    if (near === 3) {
      toBorn.push(newData[el.y][el.x])
    }
  })

  toKill.forEach((el) => {
    el.state = 0  
  })
  toBorn.forEach((el) => {
    el.state = 1
  })

  gameData = newData
  renderCells()
}

canvas.addEventListener('contextmenu', e => {
  e.preventDefault()
  let x = Math.floor(e.layerX/cellSize)
  let y = Math.floor(e.layerY/cellSize)
  
  let target = gameData[y][x]
  target.state = 0

  renderCells()
})


const mouseHandler = e => {
  let x = Math.floor(e.layerX/cellSize)
  let y = Math.floor(e.layerY/cellSize)
  
  let target = gameData[y][x]
  target.state = !target.state

  renderCells()
}

const mousemoveHandler = e => {
  let x = Math.floor(e.layerX/cellSize)
  let y = Math.floor(e.layerY/cellSize)
  
  let target = gameData[y][x]
  target.state = 1

  renderCells()
}

canvas.addEventListener('mousedown', e => {
  mouseHandler(e)
  canvas.addEventListener('mousemove', mousemoveHandler)
})

canvas.addEventListener('mouseup', e => {
  canvas.removeEventListener('mousemove', mousemoveHandler)
})

let timeout

btnPlay.addEventListener('click', () => {
  timeout = setInterval(() => {
    gameRun()
  }, 50)
})
btnPause.addEventListener('click', () => {
  clearInterval(timeout)
})
btnReset.addEventListener('click', () => {
  clearInterval(timeout)
  init()
})

range.addEventListener('change', e => {
  canvas.width = canvas.height = e.target.value*50
  cellsCount = canvas.width / cellSize
  makeArray( e.target.value*5,  e.target.value*5)
  renderCells()
})