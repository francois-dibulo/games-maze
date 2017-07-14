var MazeID = {
    SPACE: { value: 1 },
    WALL: { value: 0 }
};

var Maze = function(width, height) {
    this.mazeStart;
    this.mazeEnd;
    this.mazeWidth = width;
    this.mazeHeight = height;
    this.maze;

    this.isInBounds = function(x, y) {
        return (x >= 0 && x < this.mazeWidth && y >= 0 && y < this.mazeHeight);
    }

    this.createMazeBranches = function() {
        var side = Math.floor(Math.random() * 2);
        this.mazeStart = this.randomBorderTile(side);
        do {
            this.mazeEnd = this.randomBorderTile(side);
        } while (this.mazeEnd.equals(this.mazeStart) || this.mazeEnd.x == this.mazeStart.x || this.mazeEnd.y == this.mazeStart.y);

        this.maze[this.mazeStart.x][this.mazeStart.y].type = MazeID.SPACE;
        this.maze[this.mazeEnd.x][this.mazeEnd.y].type = MazeID.SPACE;

        var sX = 0;
        var sY = 0;
        if (this.mazeStart.x == 0)
            sX = 1;
        else if (this.mazeStart.x == this.mazeWidth - 1)
            sX = this.mazeWidth - 2;
        else
            sX = this.mazeStart.x;
        if (this.mazeStart.y == 0)
            sY = 1;
        else if (this.mazeStart.y == this.mazeHeight - 1)
            sY = this.mazeHeight - 2;
        else
            sY = this.mazeStart.y;

        var tree = [];
        var startTree = new this.Coordinate(sX, sY);
        tree.push(startTree);
        this.maze[sX][sY].visited = true;
        this.maze[sX][sY].type = MazeID.SPACE;
        while (tree.length > 0) {
            var visit = this.findNeighboor(tree[tree.length - 1]);
            if (visit != null) {
                visit.visited = true;
                visit.type = MazeID.SPACE;
                tree.push(visit);
            } else {
                tree.pop();
            }
        }

    }

    this.findNeighboor = function(p) {
        var canLeft = p.x - 2 > 0 && !this.maze[p.x - 2][p.y].visited;
        var canRight = p.x + 2 < this.mazeWidth - 1 && !this.maze[p.x + 2][p.y].visited;
        var canUp = p.y - 2 > 0 && !this.maze[p.x][p.y - 2].visited;
        var canDown = p.y + 2 < this.mazeHeight - 1 && !this.maze[p.x][p.y + 2].visited;
        var around = [0, 1, 2, 3];
        around = this.randomizeArray(around);
        for (var i = 0; i < 4; i++)
            switch (around[i]) {
                case 0:
                    if (canLeft) {
                        this.maze[p.x - 1][p.y].type = MazeID.SPACE;
                        return this.maze[p.x - 2][p.y];
                    }
                    break;
                case 1:
                    if (canRight) {
                        this.maze[p.x + 1][p.y].type = MazeID.SPACE;
                        return this.maze[p.x + 2][p.y];
                    }
                    break;
                case 2:
                    if (canUp) {
                        this.maze[p.x][p.y - 1].type = MazeID.SPACE;
                        return this.maze[p.x][p.y - 2];
                    }
                    break;
                case 3:
                    if (canDown) {
                        this.maze[p.x][p.y + 1].type = MazeID.SPACE;
                        return this.maze[p.x][p.y + 2];
                    }
                    break;
            }
        return null;
    }

    this.randomizeArray = function(a) {
        for (var i = a.length - 1; i > 0; i--) {
            var rnd = Math.floor(Math.random() * (i + 1));
            var temp = a[i];
            a[i] = a[rnd];
            a[rnd] = temp;
        }
        return a;
    }

    this.randomBorderTile = function(side) {
        var pos = 0;
        var ret = new this.Coordinate(0, 0);
        if (side > 1)
            var side = Math.floor(Math.random() * 2);
        switch (side) {
            case 0://width
                pos = (Math.floor(Math.random() * (this.mazeWidth - 5) / 2) * 2) + 3;
                ret.x = pos;
                ret.y = Math.floor(Math.random() * 2) == 0 ? 0 : this.mazeHeight - 1;
                return ret;
            case 1://height
                pos = (Math.floor(Math.random() * (this.mazeHeight - 5) / 2) * 2) + 3;
                ret.x = Math.floor(Math.random() * 2) == 0 ? 0 : this.mazeWidth - 1;
                ret.y = pos;
                return ret;
        }
    }

    this.initMaze = function() {
        this.mazeStart = new this.Coordinate(0, 0);
        this.mazeEnd = new this.Coordinate(0, 0);
        this.maze = new Array(this.mazeWidth);
        for (var i = 0; i < this.mazeWidth; i++) {
            this.maze[i] = new Array(this.mazeHeight);
            for (var j = 0; j < this.maze[i].length; j++) {
                this.maze[i][j] = new this.Coordinate(i, j);
            }
        }
    }


    this.drawMaze = function() {
        //console.log(maze);
        /*for (var w = 0; w < mazeWidth; w++)
            for (var h = 0; h < mazeHeight; h++) {
                console.log(maze[w][h].visited);
            }*/
    }

    this.getColor = function(id) {
        switch(id) {
            case MazeID.SPACE:
                return Color.white;
            case MazeID.WALL:
                return Color.black;
        }
        return Color.red;
    }

    this.Coordinate = function(x, y) {
        this.x = x;
        this.y = y;
        this.visited = false;
        this.type = MazeID.WALL;

        this.equals = function(c) {
            return (c.x == x && c.y == y);
        }

        this.toString = function() {
            return "x: " + x + " y:" + y;
        }
    }

    this.initMaze();
    this.createMazeBranches();
    //drawMaze();

}

if (module && module.exports) {
  module.exports = Maze;
}
