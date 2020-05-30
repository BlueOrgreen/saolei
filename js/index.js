function Mine(tr, td, mineNum){
    this.tr = tr
    this.td = td
    this.mineNum = mineNum

    this.squares = []  // 二维数组，存储所以方块信息，[行， 列]
    this.tds = []      // 存储所有单元格的DOM对象
    this.surplusMine = mineNum       // 剩余雷的数量
    this.allRight = false            // 用来判断游戏是否成功

    this.parent = document.querySelector('.gameBox')
}

// 生成 n 个不重复的数字，即雷在格子里的位置
Mine.prototype.randomNum = function(){
    var square = new Array(this.tr * this.td)  
    for(var i = 0; i < square.length; i++){
        square[i] = i
    }
    square.sort(function(){return 0.5 - Math.random()})  // 对数组随机排序
    return square.slice(0, this.mineNum)
}

Mine.prototype.init = function(){
    // console.log(this.randomNum())
    var rn = this.randomNum()
    var n = 0
    for(var i = 0; i < this.tr; i++){
        this.squares[i] = []
        for(var j = 0; j < this.td; j++){
            /* 取一个方块在数组里的数据要使用行和列的形式去取；
               找方块周围的方块的时候要使用坐标的形式，
               行和列的形式与坐标的形式(x, y)刚好相反 */
            n++
            if(rn.indexOf(n) != -1){
                this.squares[i][j] = {type: "mine", x: j, y: i}
            }else{
                this.squares[i][j] = {type: "number", x: j, y: i, value: 0}
            }
        }
    }
    document.querySelector('.gameBox').oncontextmenu = function(){
        return false
    }
    this.updateNum()
    this.createDOM()

    this.mineNumDom = document.querySelector('.mineNum')
    this.mineNumDom.innerHTML = this.surplusMine
}

// 创建表格
Mine.prototype.createDOM = function(){
    var This = this
    var table = document.createElement('table')
    for(var i = 0; i < this.tr; i++){
        var domTr = document.createElement('tr')
        this.tds[i] = []
        for(var j = 0; j < this.td; j++){
            var domTd = document.createElement('td')
            domTd.pos = [i ,j]            // 把格子对应的行和列存到格子身上，为了下面通过这个值去对应的数组取得数据
            domTd.onmousedown = function(){
                This.play(event, this)    // This指实例对象，this指点击的td
            }
            this.tds[i][j] = domTd     // 把所有创建的td添加到数组
            
            // if(this.squares[i][j].type === 'mine'){
            //     domTd.className = 'mine'
            // }
            // if(this.squares[i][j].type === 'number'){
            //     domTd.innerHTML = this.squares[i][j].value
            // }
            domTr.appendChild(domTd )
        }
        table.appendChild(domTr)
    }
    this.parent.innerHTML = ''
    this.parent.appendChild(table)
}

// 获取某个各自周围8个方格
Mine.prototype.getArround = function(square){
    var x = square.x
    var y = square.y
    var result = []    // 把找到的格子坐标返回（二维数组）
    // 通过坐标循环九宫格
    for(var i = x-1; i <= x+1; i++){
        for(var j = y-1; j <= y+1; j++){
            if(
                i < 0 ||
                j < 0 ||
                i > this.td-1 ||
                j > this.tr-1 ||
                (i==x && j==y) ||
                this.squares[j][i].type === 'mine'
            ){continue}
            result.push([j, i])   // 要以行和列的方式返回，因为需要以它去取数组里的数据
        }
    }

    return result
} 

// 更新所有的数字
Mine.prototype.updateNum = function(){
    for(var i=0; i < this.tr; i++){
        for(var j=0; j < this.td; j++){
            // 只更新雷周围的数字
            if(this.squares[i][j].type === 'number'){
                continue
            } 
            var num = this.getArround(this.squares[i][j])
            // console.log(num)
            for(var k=0; k < num.length; k++){
                this.squares[num[k][0]][num[k][1]].value += 1
            }
        }
    }
    // console.log(this.squares)
}

Mine.prototype.play = function(event, obj){
    var This = this
    if(event.which == 1 && obj.className != 'flag'){
        var curSquare = this.squares[obj.pos[0]][obj.pos[1]]
        var cl = ['zero', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight']
        // console.log(curSquare)
        if(curSquare.type === 'number'){
            obj.innerHTML = curSquare.value
            obj.className = cl[curSquare.value]

            if(curSquare.value == 0){
                obj.innerHTML = ''  // 数字为零不显示
                function getAllZero(square){
                    var arround = This.getArround(square) // 返回周围的格子
                    for(var i=0; i < arround.length; i++){
                        var x = arround[i][0]  // 行
                        var y = arround[i][1]  // 列

                        This.tds[x][y].className = cl[This.squares[x][y].value]

                        if(This.squares[x][y].value == 0){
                            if(!This.tds[x][y].check){
                                // 给td增加属性，用于决定这个格子是否被找过
                                This.tds[x][y].check = true
                                getAllZero(This.squares[x][y])
                            }
                        }else {
                            // 如果以某个格子为中心所找到的格子不为零，则显示出来
                            This.tds[x][y].innerHTML = This.squares[x][y].value
                        }
                    }
                }
                getAllZero(curSquare)
            }
        }else{
            // console.log('点到雷')
            this.gameOver(obj)
        }
    }
    // 点击右键
    if(event.which == 3){
        if(obj.className && obj.className != 'flag'){
            return
        }
        obj.className = obj.className=='flag'?'':'flag'
        if(this.squares[obj.pos[0]][obj.pos[1]].type == 'mine'){
            this.allRight = true
        }else{
            this.allRight = false
        }

        if(obj.className == 'flag'){
            this.mineNumDom.innerHTML = --this.surplusMine
        }else{
            this.mineNumDom.innerHTML = ++this.surplusMine
        }
        if(this.surplusMine==0){  // 与用户标完红旗
            if(this.allRight){
                alert('游戏通关')
            }else{
                alert('游戏失败')
                this.gameOver()
            }
        }
    }
}

Mine.prototype.gameOver = function(clickTd){
    for(var i=0; i < this.tr; i++){
        for(var j=0; j < this.td; j++){
            if(this.squares[i][j].type === 'mine'){
                this.tds[i][j].className = 'mine'
            }
            this.tds[i][j].onmousedown = null
        }
    }
    if(clickTd){
        clickTd.style.backgroundColor = '#f00'
    }
}

var btns = document.querySelectorAll('.level button')
var mine = null    // 存储生成的实例
var ln = 0         // 决定当前的状态
var arr = [[9, 9, 10], [16, 16, 40], [28, 28, 99]]

for(let i=0; i < btns.length-1; i++){
    btns[i].onclick = function(){
        btns[ln].className = ''
        this.className = 'active'

        mine = new Mine(...arr[i])
        mine.init()

        ln = i
    }
}
btns[0].onclick()
btns[3].onclick=function(){
    mine.init()
}
// var mine = new Mine(28, 28, 99)
// mine.init()

// console.log(mine.getArround(mine.squares[0][0]))
