var points = [];
var dragging = false;
var startDragX = 0;
var startDragY = 0;
var endDragX = 0;
var endDragY = 0;
var objects = [];
var fill = '#00FF00';
var svgDiv = document.createElement('div');
var mode = 'circle';

function Distance(x,y,x2,y2){
    return Math.sqrt((x2-x)*(x2-x) + (y2-y)*(y2-y));
}

function ColorPicker(){
    var input = document.createElement('input');
    input.type = 'color';
    input.value = fill;
    input.oninput = ()=>fill = input.value;
    return input;
}

function Button(innerHTML,onclick){
    var button = document.createElement('button');
    button.innerHTML = innerHTML;
    button.onclick = onclick;
    return button;
}

function SetAbsolutePosition(element, x,y,width,height){
    element.style.position = 'absolute';
    element.style.left = x+'px';
    element.style.width = width+'px';
    element.style.top = y+'px';
    element.style.height = height+'px';
}

var colorPicker = ColorPicker();
SetAbsolutePosition(colorPicker, 0, 0, 100, 50);
var circleButton = Button('circle', ()=>mode = 'circle');
SetAbsolutePosition(circleButton, 0, 50, 100, 50);
var polygonButton = Button('polygon', ()=>mode = 'polygon');
SetAbsolutePosition(polygonButton, 0, 100, 100, 50);

function Field(name, value){
    return name+'="'+value+'" ';
}

function CreateSVG(){
    if(mode == 'polygon'){
        var svg = '<polygon points="';
        for(var p of points){
            svg+=p.x+','+p.y+' ';
        }
        svg+=endDragX+','+endDragY;
        svg+='"';
        svg+=Field('fill', fill)+'"/>';
        return svg;
    }
    else if(mode == 'circle' && dragging){
        return'<circle '+Field('cx', startDragX)+Field('cy', startDragY)+Field('r', Distance(startDragX,startDragY,endDragX,endDragY))+Field('fill', fill)+'/>';
    }
}

function Draw(){
    var svg = '<svg width="'+window.innerWidth+'" height="'+window.innerHeight+'">';
    for(var o of objects){
        svg+=o.svg;
    }
    svg+=CreateSVG();
    svg+='</svg>';
    svgDiv.innerHTML = svg;
}

function KeyDown(e){
    if(e.key == 'Enter'){
        if(mode == 'polygon'){
            objects.push({svg:CreateSVG()});
            points = [];
        }
        Draw();
    }
}

function MouseDown(e){
    if(e.clientX > 100){
        if(mode == 'polygon'){
            points.push({x:e.clientX, y:e.clientY});
        }
        else if(mode == 'circle'){
            dragging = true;
            startDragX = e.clientX;
            startDragY = e.clientY;
            endDragX = e.clientX;
            endDragY = e.clientY;
        }
        Draw();
    }
}

function MouseMove(e){
    endDragX = e.clientX;
    endDragY = e.clientY;
    Draw();
}

function MouseUp(){
    console.log(dragging);
    if(dragging){
        if(mode == 'circle'){
            objects.push({svg:CreateSVG()});
            console.log(objects);
            dragging = false;
            Draw();
        }
    }
}

document.addEventListener('mousedown', MouseDown);
document.addEventListener('mouseup', MouseUp);
document.addEventListener('keydown', KeyDown);
document.addEventListener('mousemove', MouseMove);
document.body.appendChild(svgDiv);
document.body.appendChild(colorPicker);
document.body.appendChild(circleButton);
document.body.appendChild(polygonButton);
Draw();