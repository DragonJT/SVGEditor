var points = [];
var dragging = false;
var startDragX = 0;
var startDragY = 0;
var mouseX = 0;
var mouseY = 0;
var objects = [];
var fill = '#00FF00';
var svgDiv = document.createElement('div');
var mode = 'circle';

function SaveFile(filename, text){
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

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
var editButton = Button('edit', ()=>mode = 'edit');
SetAbsolutePosition(editButton, 0, 150, 100, 50);

function Field(name, value){
    return name+'="'+value+'" ';
}

function CreatePathSVG(points, output){
    function GetPoint(id){
        if(id<0){
            id+=points.length;
        }
        if(id>=points.length){
            id-=points.length;
        }
        return points[id];
    }

    function LineToOrMoveTo(id){
        return id==0?'M':'L';
    }

    if(points.length == 0){
        return '';
    }
    var svg = '<path d="';
    for(var i=0;i<points.length;i++){
        if(points[i].type == 'curve'){
            var ppoint = GetPoint(i-1);
            var npoint = GetPoint(i+1);
            svg+=LineToOrMoveTo(i)+(ppoint.x+points[i].x)/2+' '+(ppoint.y+points[i].y)/2+' ';
            svg+='Q'+points[i].x+' '+points[i].y+' ';
            svg+=(npoint.x+points[i].x)/2+' '+(npoint.y+points[i].y)/2+' ';
        }
        else{
            svg+=LineToOrMoveTo(i)+points[i].x+' '+points[i].y+' ';
        }
    }
    svg+='" ';
    svg+=Field('fill', fill)+'/>';
    return svg;
}

function CreateCircleSVG(){
    return '<circle '+Field('cx', startDragX)+Field('cy', startDragY)+Field('r', Distance(startDragX,startDragY,mouseX,mouseY))+Field('fill', fill)+'/>';
}

function CreatePolygonSVG(){
    return CreatePathSVG(points);
}

function CreateObjectSVG(){
    if(mode == 'polygon'){
        return CreatePathSVG(points);
    }
    else if(mode == 'circle' && dragging){
        return CreateCircleSVG();
    }
    return '';
}

function CreateSVG(){
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="'+window.innerWidth+'" height="'+window.innerHeight+'">';
    for(var o of objects){
        svg+=o.svg;
    }
    svg+=CreateObjectSVG();
    svg+='</svg>';
    return svg;
}

function Draw(){
    svgDiv.innerHTML = CreateSVG();
}

function FindSelectedPoint(points, x, y){
    for(var i=0;i<points.length;i++){
        if(Distance(points[i].x, points[i].y, x, y) < 20){
            return i;
        }
    }
    return -1;
}

function KeyDown(e){
    if(e.key == 'Enter'){
        if(mode == 'polygon'){
            objects.push({shape:'polygon', svg:CreatePolygonSVG(), points});
            points = [];
        }
        Draw();
    }
    else if(e.key == 'c'){
        if(mode == 'edit' && objects.length>0 && objects[objects.length-1].shape == 'polygon'){
            var polygon = objects[objects.length-1];
            var selectedPoint = FindSelectedPoint(polygon.points, mouseX, mouseY);
            if(selectedPoint>=0){
                polygon.points[selectedPoint].type = 'curve';
                polygon.svg = CreatePathSVG(polygon.points);
                Draw();
            }
        }
    }
    else if(e.key == 'Escape'){
        if(objects.length > 0){
            objects.splice(objects.length-1);
            Draw();
        }
    }
    else if(e.key == 's'){
        SaveFile('file.svg', CreateSVG());
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
            mouseX = e.clientX;
            mouseY = e.clientY;
        }
        Draw();
    }
}

function MouseMove(e){
    mouseX = e.clientX;
    mouseY = e.clientY;
    Draw();
}

function MouseUp(){
    if(dragging){
        if(mode == 'circle'){
            objects.push({shape:'circle', svg:CreateCircleSVG()});
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
document.body.appendChild(editButton);
Draw();