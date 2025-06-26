local CELL    = 30           
local COLS    = 10           
local ROWS    = 20           
local DROP_MS = 500         



local SHAPES = {
  { {1,1,1,1} },
  { {1,1},{1,1} },
  { {0,1,0},{1,1,1} },
  { {1,0},{1,0},{1,1} },
}


local board = {}
local piece = {}
local px, py = 0, 0
local timer = 0


local function deepcopy(t)
    local r = {}; 
    for i,v in ipairs(t) do
        r[i] = type(v) == "table" and deepcopy(v) or v
    end
    return r
end


local function rotate(shape)
    local h, w = #shape, #shape[1]
    local res = {};
    for x=1,w do
        res[x] = {}
        for y=1,h do
            res[x][y] = shape[h-y+1][x]
        end
    end
    return res
end



local function collides(nx, ny, shape)
    for y,row in ipairs(shape) do
        for x,cell in ipairs(row) do
            if cell == 1 then
                local gx, gy = nx+x-1, ny+y-1
                if gx<1 or gx>COLS or gy>ROWS or (gy>=1 and board[gy][gx]==1) then
                    return true
                end
            end
        end
    end
end



local function merge_piece()
    for y,row in ipairs(piece) do
        for x,cell in ipairs(row) do
            if cell == 1 then
                local by = py + y - 1
                if by < 1 then 
                    love.event.quit()
                    return 
                end
                board[by][px + x - 1] = 1
            end
        end
    end
end



local function clear_lines() 
    for y=ROWS, 1, -1 do 
        local full = true 
        for x=1, COLS do
            if board[y][x] == 0 then
                full = false
                break
            end
        end
        if full then 
            table.remove(board, y)
            table.insert(board, 1, {})
            for x=1, COLS do
                board[1][x] = 0
            end
        end
    end
end


local function new_piece()
    piece = deepcopy(SHAPES[love.math.random(#SHAPES)])
    px = math.floor(COLS / 2) - math.floor(#piece[1] / 2)
    py = 0
    if collides(px, py, piece) 
        then love.event.quit() 
    end 
end




function love.load()
    love.window.setMode(COLS * CELL, ROWS * CELL)
    love.math.setRandomSeed(os.time())
    for y = 1, ROWS do
        board[y] = {}
        for x = 1, COLS do
            board[y][x] = 0
        end
    end

    new_piece()
end


function love.update(dt)
    timer = timer + dt*1000
    if timer >= DROP_MS then
        timer = timer - DROP_MS
        if not collides(px, py + 1, piece) then
            py = py + 1
        else
            merge_piece()
            clear_lines()
            new_piece()
        end
    end
end



function love.keypressed(key)
    if key == "left" then
        if not collides(px - 1, py, piece) then
            px = px - 1
        end
    elseif key == "right" then
        if not collides(px + 1, py, piece) then
            px = px + 1
        end
    elseif key == "down" then
        if not collides(px, py + 1, piece) then
            py = py + 1
        end
    elseif key == "up" then
        if not collides(px, py, rotate(piece)) then
            piece = rotate(piece)
        end
    elseif key == "escape" then
        love.event.quit()
    end
end



function love.draw()


    for y,row in ipairs(board) do
        for x,cell in ipairs(row) do
            if cell == 1 then
                love.graphics.rectangle("fill", (x-1)*CELL, (y-1)*CELL, CELL-1, CELL-1)
            end
        end
    end
    
    for y,row in ipairs(piece) do 
        for x,cell in ipairs(row) do
            if cell == 1 then
                love.graphics.rectangle("fill", (px+x-2)*CELL, (py+y-2)*CELL, CELL-1, CELL-1)
            end
        end
    end


end