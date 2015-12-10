this.createjs = this.createjs || {};

(function() {

    (createjs.Graphics.Polygon = function(x, y, points) {
        this.x = x;
        this.y = y;
        this.points = points;
    }).prototype.exec = function(ctx) {
        // Start at the end to simplify loop
        var end = this.points[this.points.length - 1];
        ctx.moveTo(end.x, end.y);
        this.points.forEach(function(point) {
            ctx.lineTo(point.x, point.y);
        });
    };

    createjs.Graphics.prototype.drawPolygon = function(x, y, args) {
        var points = [];
        if (Array.isArray(args)) {
            args.forEach(function(point) {
                point = Array.isArray(point) ? {x: point[0], y: point[1]} : point;
                points.push(point);
            });
        }
        else {
            args = Array.prototype.slice.call(arguments).slice(2);
            var px = null;
            args.forEach(function(val) {
                if (px === null) {
                    px = val;
                }
                else {
                    points.push({x: px, y: val});
                    px = null;
                }
            });
        }
        return this.append(new createjs.Graphics.Polygon(x, y, points));
    };

}());

this.createjs = this.createjs || {};

(function() {
    function Point(x, y) {
        this.Shape_constructor();

        this.update = true;
        this.selected = false;
        this.active = false;

        this.x = x;
        this.y = y;

        this.radius = 5;
        this.color = 'Blue';
        this.selectedColor = 'Pink';
        this.activeColor = 'Green';
        this.alpha = 0.7;

        //this.addEventListener('tick', this.onTick.bind(this));
        //this.addEventListener('mousedown', this.onMouseDown.bind(this));
    }

    var p = createjs.extend(Point, createjs.Shape);

    p.onTick = function() {
        var color = this.color;

        if (this.selected) {
            color = this.selectedColor;
        }
        if (this.active) {
            color = this.activeColor;
        }

        this.graphics.clear().beginFill(color).drawCircle(0, 0, this.radius);
    };

    /*p.onMouseDown = function(e) {
        this.initX = this.x;
        this.initY = this.y;
        this.startX = e.stageX;
        this.startY = e.stageY;

        this.mouseDown = true;

        this.addEventListener('pressup', this.onMouseUp.bind(this));
        this.addEventListener('pressmove', this.onMouseMove.bind(this));

        e.stopPropagation();
    };

    p.onMouseMove = function(e) {
        if(this.mouseDown) {
            this.x = this.initX + (e.stageX - this.startX);
            this.y = this.initY + (e.stageY - this.startY);

            //this.update = true;
            this.dispatchEvent(new createjs.Event('changed', true));

            e.stopPropagation();
        }
    };

    p.onMouseUp = function (e) {
        console.log('mouse up');

        this.mouseDown = false;
        this.initX = this.initY = this.startX = this.startY = null;

        this.removeEventListener('pressup', this.onMouseUp);
        this.removeEventListener('pressmove', this.onMouseMove);

        e.stopPropagation();
    };*/

    p.toObject = function() {
        return {
            x: this.x,
            y: this.y
        };
    };

    this.createjs.Point = createjs.promote(Point, 'Shape');
}());

this.createjs = this.createjs || {};

(function(document) {
    /**
     * @param {Array} points
     * @constructor
     */
    function ResizableShape(points) {
        this.Container_constructor();

        this.update = true;
        this.selected = [];

        this.color = 'Red';

        this.ctrlKeyDown = false;

        this.shape = new createjs.Shape();
        this.addChild(this.shape);

        this.points = points.map(function(point){
            var p;
            if(point instanceof createjs.Point) {
                p = point;
            } else {
                p = Array.isArray(point) ?
                    new createjs.Point(point[0], point[1]) :
                    new createjs.Point(point.x, point.y);
            }

            if(!p) {
                throw new Error('Invalid point added');
            }

            return p;
        });

        this.addChild.apply(this, this.points);

        this.addEventListener('tick', this.onTick.bind(this));
        this.addEventListener('mousedown', this.onMouseDown.bind(this));

        this.onMouseUpBind = this.onMouseUp.bind(this);
        this.onMouseMoveBind = this.onMouseMove.bind(this);

        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('keyup', this.onKeyUp.bind(this));
    }

    var p = createjs.extend(ResizableShape, createjs.Container);

    /**
     * @param {createjs.Rectangle} rect
     */
    p.selectPointsInRect = function(rect) {
        this.deselectAllPoints();

        if(!rect) {
            return;
        }

        // some correction on the measurements if dragged to the left or to the top
        if(rect.width < 0) {
            rect.width = Math.abs(rect.width);
            rect.x -= rect.width;
        }

        if(rect.height < 0) {
            rect.height = Math.abs(rect.height);
            rect.y -= rect.height;
        }

        this.points.forEach(function(point) {
            if(rect.contains(this.x + point.x, this.y + point.y)) {
                point.selected = true;
                this.selected.push(point);
            }
        }, this);

        this.update = true;
    };

    /**
     * @returns {ResizableShape}
     */
    p.deselectAllPoints = function() {
        this.selected.forEach(function(item) {
            item.active = false;
            item.selected = false;
        });

        this.selected = [];

        return this;
    };

    p.onTick = function() {
        if(this.update) {
            this.points.forEach(function(point) {
                point.onTick();
            });

            this.shape.graphics.clear().beginFill(this.color).drawPolygon(0, 0, this.points.map(function(point) {
                return point.toObject();
            }));

            this.update = false;
        }
    };

    /**
     * @param {KeyboardEvent} e
     */
    p.onKeyDown = function(e) {
        this.ctrlKeyDown = e.ctrlKey;
    };

    /**
     * @param {KeyboardEvent} e
     */
    p.onKeyUp = function(e) {
        this.ctrlKeyDown = e.ctrlKey;
    };

    /**
     * @param {MouseEvent} e
     */
    p.onMouseDown = function(e) {
        if(e.target instanceof createjs.Point) {
            if(this.selected.indexOf(e.target) < 0) {
                this.deselectAllPoints();

                e.target.selected = true;
                this.selected = [e.target];
            }
        } else {
            this.deselectAllPoints();
            this.selected = [this];
        }

        this.selected.forEach(function(item) {
            item.active = true;
            item.initX = item.x;
            item.initY = item.y;
        });

        this.startX = e.stageX;
        this.startY = e.stageY;

        this.mouseDown = true;

        this.addEventListener('pressup', this.onMouseUpBind);
        this.addEventListener('pressmove', this.onMouseMoveBind);

        e.stopPropagation();
    };

    /**
     * @param {MouseEvent} e
     */
    p.onMouseMove = function(e) {
        if(this.mouseDown) {
            this.selected.forEach(function(item) {
                var moveX = true;
                var moveY = true;

                if(this.ctrlKeyDown) {
                    if(Math.abs(e.stageX - this.startX) > Math.abs(e.stageY - this.startY)) {
                        moveY = false;
                    } else {
                        moveX = false;
                    }
                }

                item.x = moveX ? item.initX + (e.stageX - this.startX) : item.initX;
                item.y = moveY ? item.initY + (e.stageY - this.startY) : item.initY;
            }, this);

            this.update = true;
            this.dispatchEvent(new createjs.Event('changed', true));

            e.stopPropagation();
        }
    };

    /**
     * @param {MouseEvent} e
     */
    p.onMouseUp = function (e) {
        console.log(e);
        this.mouseDown = false;

        this.selected.forEach(function(item) {
            item.active = false;
            item.initX = item.initY = null;
        });

        if(!(e.target instanceof createjs.Point)) {
            this.selected = [];
        }

        /*this.target = */
        this.startX = this.startY = null;

        this.removeEventListener('pressup', this.onMouseUpBind);
        this.removeEventListener('pressmove', this.onMouseMoveBind);

        this.update = true;

        e.stopPropagation();
    };

    this.createjs.ResizableShape = createjs.promote(ResizableShape, 'Container');
}(document));

this.createjs = this.createjs || {};

(function() {
    function ResizableRect(width, height) {
        this.ResizableShape_constructor([
            {x: 0, y: 0},
            {x: width, y: 0},
            {x: width, y: height},
            {x: 0, y: height}
        ]);
    }

    var p = createjs.extend(ResizableRect, createjs.ResizableShape);

    p.init = function() {
        console.log('asdasd');
    };

    this.createjs.ResizableRect = createjs.promote(ResizableRect, 'ResizableShape');
}());
