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
