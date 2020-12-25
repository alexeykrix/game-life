class Live {
  constructor(selector='body', name='game-live') {
    this.selector = selector
    this.name = name
    this.template = `
    <div class="app">
      <canvas></canvas>
    </div>
    <div class="controls">
      <button class="btn play"></button>
      <button class="btn pause"></button>
      <button class="btn reset"></button>
      <input type="range" step=1 class="size" min="1" max="50" value="10">
    </div>
    `
    this.container = document.createElement('div')
    this.container.classList = this.name
    this.container.innerHTML = this.template
    document.querySelector(selector).appendChild(this.container)
    this.btnPlay = this.container.querySelector('.play')
    this.btnPause = this.container.querySelector('.pause')
    this.btnReset = this.container.querySelector('.reset')
    this.range = this.container.querySelector('.size')
    this.canvas = this.container.querySelector('canvas')
    this.c = this.canvas.getContext('2d')
    this.canvas.width = this.canvas.height = 500
    this.c.fillStyle = '#eeeeee'
    this.c.strokeStyle = '#000'
    this.gameData = []
    this.cellSize = 10
    this.cellsCount = this.canvas.width / this.cellSize
    this.timeout = null
  }

  makeRow = (w, h) => {
    let row = []
    for (let i=0; i<w; i++) {
      row.push({'x': i, 'y': h, state: 0})
    }
    return row
  }
  makeArray = (w, h) => {
    let arr = []
    for (let i=0; i<h; i++) {
      arr.push(this.makeRow(w, i))
    }
    this.gameData = arr
  }
  renderCell = (x, y, isLive, id) => {
    if (!isLive) return
    this.c.fillStyle = id%2? '#e67e22': '#f39c12'
    this.c.beginPath()
    this.c.rect(x*this.cellSize, y*this.cellSize, this.cellSize, this.cellSize)
    this.c.fill()
    this.c.closePath()
  }
  renderCells = () => {
    this.c.fillStyle = '#2e2d2e'
    this.c.beginPath()
    this.c.rect(0, 0, this.canvas.width, this.canvas.width)
    this.c.fill()
    this.c.closePath()
    this.gameData.flat().forEach((el, id) => {
      this.renderCell(el.x, el.y, el.state, id)
    })
  }
  init = () => {
    this.makeArray(this.cellsCount, this.cellsCount)
  
    this.c.fillStyle = '#2e2d2e'
    this.c.beginPath()
    this.c.rect(0,0,this.c.width,this.c.height)
    this.c.closePath()
    this.c.fill()
  
    this.renderCells()
  }
  gameRun = (t) => {
    let newData = [... this.gameData]
    let alive = []
    let willLive = []
    let toBorn = []
  
    this.gameData.flat().forEach(el => {
      if (el.state) alive.push(el)
      else willLive.push(el)
    })
  
    let toKill = []  
    alive.forEach(el => {
      let near = 0
      if (el.y-1 >= 0 && el.x-1 >= 0 &&
        el.y+1 < this.cellsCount && el.x+1 < this.cellsCount) {
        if (this.gameData[el.y-1][el.x-1].state) near++
        if (this.gameData[el.y-1][el.x].state) near++
        if (this.gameData[el.y-1][el.x+1].state) near++
        if (this.gameData[el.y][el.x-1].state) near++
        if (this.gameData[el.y][el.x+1].state) near++
        if (this.gameData[el.y+1][el.x-1].state) near++
        if (this.gameData[el.y+1][el.x].state) near++
        if (this.gameData[el.y+1][el.x+1].state) near++
      }
      if (near >= 0) {
        if (near === 2 || near === 3) ''
        else toKill.push(newData[el.y][el.x])
      }
    })
  
    willLive.forEach(el => {
      let near = 0
      if (el.y-1 >= 0 && el.x-1 >= 0 &&
          el.y+1 < this.cellsCount && el.x+1 < this.cellsCount) {
        if (this.gameData[el.y-1][el.x].state) near++
        if (this.gameData[el.y-1][el.x+1].state) near++
        if (this.gameData[el.y-1][el.x-1].state) near++
        if (this.gameData[el.y][el.x-1].state) near++
        if (this.gameData[el.y][el.x+1].state) near++
        if (this.gameData[el.y+1][el.x-1].state) near++
        if (this.gameData[el.y+1][el.x].state) near++
        if (this.gameData[el.y+1][el.x+1].state) near++
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
  
    this.gameData = newData
    this.renderCells()
  }
  start() {
    this.init()

    this.canvas.addEventListener('contextmenu', e => {
      e.preventDefault()
      let x = Math.floor(e.layerX/this.cellSize)
      let y = Math.floor(e.layerY/this.cellSize)
      let target = this.gameData[y][x]
      target.state = 0
      this.renderCells()
    })

    this.canvas.addEventListener('mousedown', e => {
      this.mouseHandler(e)
      this.canvas.addEventListener('mousemove', this.mousemoveHandler)
    })
    
    this.canvas.addEventListener('mouseup', e => {
      this.canvas.removeEventListener('mousemove', this.mousemoveHandler)
    })
    
    this.btnPlay.addEventListener('click', () => {
      this.timeout = setInterval(() => {
        this.gameRun()
      }, 50)
    })
    this.btnPause.addEventListener('click', () => {
      clearInterval(this.timeout)
    })
    this.btnReset.addEventListener('click', () => {
      clearInterval(this.timeout)
      this.init()
    })
    
    this.range.addEventListener('change', e => {
      this.canvas.width = this.canvas.height = e.target.value*50
      this.cellsCount = this.canvas.width / this.cellSize
      this.makeArray( e.target.value*5,  e.target.value*5)
      this.renderCells()
    })
  }
  mouseHandler = e => {
    let x = Math.floor(e.layerX/this.cellSize)
    let y = Math.floor(e.layerY/this.cellSize)
    
    let target = this.gameData[y][x]
    target.state = !target.state
  
    this.renderCells()
  }
  mousemoveHandler = e => {
    let x = Math.floor(e.layerX/this.cellSize)
    let y = Math.floor(e.layerY/this.cellSize)
    
    let target = this.gameData[y][x]
    target.state = 1
  
    this.renderCells()
  }
}

new Live().start()