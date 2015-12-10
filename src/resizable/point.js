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
