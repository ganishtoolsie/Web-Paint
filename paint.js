function randint(n){
	return Math.round(Math.random()*n);
}

function Paint(canvas){
	this.canvas=canvas; // The canvas this instance of Paint is working on
	this.context=this.canvas.getContext("2d");

 	// Strategy design pattern. 
	// strategy is used to map some canvas events to operations on a command being constructed
	// change strategies to construct a SquiggleCommand, a RectangleCommand, a CircleCommand, ...
	this.strategy=null;

	// The Command design pattern
 	// a list of commands which can be used to repaint the whole canvas. 
	this.commands=[];

	// Paint holds the strategies information as well, so when strategy
	// is changed the colour changes to the current colour
	this.lineWidth=2;
	this.strokeStyle = document.getElementById('colourSelected').style.backgroundColor;
	this.filled=false;

}

Paint.prototype.draw=function(){
	for(var i=0;i<this.commands.length;i++){
		this.commands[i].draw(this.context);
	}
}
Paint.prototype.undo=function(){
	// context.clearRect ( 0 , 0 , this.width , this.height ); // clear the canvas
	this.canvas.width=this.canvas.width; // clear the canvas
	this.strategy.command=null;
	this.commands.pop();
	this.draw();
}

// Changed this to ask for a canvas as well.
// I chaged this because it did exactly what I needed it to, I just made it work for any canvas
Paint.prototype.mapToCanvas=function(curCanvas, e){
	// From: http://www.html5canvastutorials.com/advanced/html5-canvas-mouse-coordinates/
	var rect = curCanvas.getBoundingClientRect();
	// decided I would modify the event, by adding some attributes
       e.canvasX=e.clientX - rect.left;
       e.canvasY=e.clientY - rect.top;
	return e;
}

// Set the colour for the strategy, for paint, and on the html page
Paint.prototype.setColour=function(event){
	var selected = document.getElementById("colourSelected");
	var chooserCanvas=document.getElementById("colourChooser");
	event=this.mapToCanvas(chooserCanvas, event);
	var colourData = chooserCanvas.getContext('2d').getImageData(event.canvasX,event.canvasY,1,1).data;
	var colour = 'rgba('+colourData[0]+','+colourData[1]+','+colourData[2]+','+colourData[3]+')';
	selected.style.background = colour;
	this.strategy.strokeStyle=colour;
	this.strokeStyle=colour;
}

// changes the colour preview on the html page. When mouse is out of the colour chooser canvas, the preview is white.
Paint.prototype.setColourPreview=function(event){
	var preview = document.getElementById("colourPreview");
	var chooserCanvas=document.getElementById("colourChooser");

	event=this.mapToCanvas(chooserCanvas, event);
	var colourData = chooserCanvas.getContext('2d').getImageData(event.canvasX,event.canvasY,1,1).data;
	preview.style.background = 'rgba('+colourData[0]+','+colourData[1]+','+colourData[2]+','+colourData[3]+')';;
	

}

// Clears the preview;
Paint.prototype.clearPreview=function(){
	document.getElementById('colourPreview').style.background="white";
}

//Change the width of the strategy and on the instance on paint
Paint.prototype.addWidth=function(amount){
	if(this.lineWidth>1 && this.lineWidth<20){
		this.lineWidth+=amount;
		this.strategy.lineWidth+=amount;
		document.getElementById("width").innerHTML='Line width: <input type="button" value="-" onclick="paint.addWidth(-1);"/> '+this.lineWidth+' <input type="button" value="+" onclick="paint.addWidth(1);"/>'
	}
}

//Changes the current strategy. Also enables/disables fill button
Paint.prototype.changeStrategy=function(type){
	if(type=='l'){
		document.getElementById('fill').disabled=true;
		this.strategy=new SquiggleStrategy(this);
	} else if (type=='r'){
		document.getElementById('fill').disabled=false;
		this.strategy=new RectangleStrategy(this);
	}  else if (type=='o'){
		document.getElementById('fill').disabled=false;
		this.strategy=new OvalStrategy(this);
	} else if (type=='p') {
		document.getElementById('fill').disabled=false;
		this.strategy=new PolygonStrategy(this);
	} else { 
		this.strategy=new SymmetryStrategy(this);
	}
}

//Change the fill option.
Paint.prototype.setFill=function(element){
	if(element.value=="No Fill"){
		element.value="Filled";
		this.filled=true;
		this.strategy.fill=true;
	} else {
		element.value="No Fill";
		this.filled=false;
		this.strategy.fill=false;
	}
}

//Clear the canvas
Paint.prototype.clear=function(){
	this.canvas.width=this.canvas.width;
	this.commands=[];
}


/** A strategy used to capture events and construct a Squiggle command **/
function SquiggleStrategy(paint){
	this.command=null; // the current command this is building
	this.paint=paint; // the instance of paint this.command is being added to
	this.strokeStyle = paint.strokeStyle;
	this.lineWidth=paint.lineWidth;
}
SquiggleStrategy.prototype.mousedown=function(event){
	// Create a new SquiggleCommand, for now, just create a random
	// line description, you should modify this so that the line description
	// comes from any user interface elements.

	// for now, create a random line description and add it to the 

	this.command=new SquiggleCommand(this.strokeStyle, this.lineWidth);
	this.command.addPoint({x:event.canvasX, y:event.canvasY});
	this.paint.commands.push(this.command);
}


SquiggleStrategy.prototype.mouseup=function(event){
	if(this.command!=null){
		this.command.draw(this.paint.context);
		this.command=null;
	}
} 
SquiggleStrategy.prototype.mousemove=function(event){
	if(this.command!=null){
		this.command.addPoint({x:event.canvasX, y:event.canvasY});
		this.command.draw(this.paint.context);
	}
}
SquiggleStrategy.prototype.mouseout=function(event){
	this.mouseup(event);
}
function SquiggleCommand(strokeStyle, lineWidth){
	// has color and line width
	// has a collection of points
	// knows how to draw itself on a canvas

	this.strokeStyle=strokeStyle;
	this.lineWidth=lineWidth;
	this.points=[];
}
SquiggleCommand.prototype.addPoint=function(point){
	this.points.push(point);
}

SquiggleCommand.prototype.draw=function(context){
	// All commands understand draw, paint may ask us to do this.

	if(this.points.length==0){
		return;
	}
	context.beginPath(); 
	context.strokeStyle = this.strokeStyle;
	context.lineWidth=this.lineWidth;
	context.moveTo(this.points[0].x,this.points[0].y);
	for(var i=1;i<this.points.length;i++){
		context.lineTo(this.points[i].x, this.points[i].y);
	}
	context.stroke();
}

/* Rectangle Strategy, used to capture and construct Rectangle Commands */
function RectangleStrategy(paint){
	this.command=null;
	this.paint=paint;
	this.strokeStyle = paint.strokeStyle;
	this.lineWidth=paint.lineWidth;
	this.fill = paint.filled;
}

RectangleStrategy.prototype.mousedown=function(event){
	//create the new command and give it the start coordinates
	this.command=new RectangleCommand(this.strokeStyle, this.lineWidth, event.canvasX, event.canvasY, this.fill);
	this.paint.commands.push(this.command);

}

RectangleStrategy.prototype.mouseup=function(event){
	if(this.command!=null){
		//get the end coordinates and draw the rectangle
		this.command.setDim(event.canvasX,event.canvasY);
		this.command.draw(this.paint.context);
		this.command=null;
	}
}

RectangleStrategy.prototype.mousemove=function(event){
	if(this.command!=null){
		this.command.setDim(event.canvasX,event.canvasY);
	}
}

RectangleStrategy.prototype.mouseout=function(event){
	this.mouseup(event);
}

function RectangleCommand(strokeStyle, lineWidth, x, y, fill){
	this.strokeStyle=strokeStyle;
	this.lineWidth=lineWidth;
	this.beginX=x;
	this.beginY=y;
	this.width=null;
	this.height=null;
	this.fill=fill;
}

RectangleCommand.prototype.draw=function(context){
	if(this.width!=null && this.height !=null){
		context.beginPath(); //needed so colours of previous items don't mess up
		context.strokeStyle=this.strokeStyle;
		context.lineWidth=this.lineWidth;
		context.rect(this.beginX, this.beginY, this.width, this.height);
		context.stroke();
		//check to see if we need to fill in the area
		if(this.fill){
			context.fillStyle=this.strokeStyle;
			context.fill();
		}
	}
}

//The width and height for the rectangle are calculated here.
RectangleCommand.prototype.setDim=function(x, y){
	this.width=x-this.beginX;
	this.height=y-this.beginY;
}

/* Oval Strategy used to capture and construct Oval Commands*/
function OvalStrategy(paint){
	this.command=null;
	this.paint=paint;
	this.strokeStyle = paint.strokeStyle;
	this.lineWidth= paint.lineWidth;
	this.fill=paint.filled;
}

OvalStrategy.prototype.mousedown=function(event){
	this.command=new OvalCommand(this.strokeStyle, this.lineWidth, event.canvasX, event.canvasY, this.fill);
	this.paint.commands.push(this.command);
}

OvalStrategy.prototype.mouseup=function(event){
	if ( !(this.command == null) )
	{
		this.command.calculateRatio(event.canvasX, event.canvasY);
		this.command.setRadius(event.canvasX, event.canvasY);
		this.command.draw(this.paint.context);
		this.command=null;
	}
}

OvalStrategy.prototype.mousemove=function(event){
	if(this.command!=null){
		this.command.setRadius(event.canvasX, event.canvasY);
	}
}

OvalStrategy.prototype.mouseout=function(event){
	this.mouseup(event);
}

function OvalCommand(strokeStyle, lineWidth, x, y,fill){
	this.strokeStyle=strokeStyle;
	this.lineWidth=lineWidth;
	this.x=x;
	this.y=y;
	this.radius= -1;
	this.fill=fill;
	this.rx=null;
	this.ry=null;
}

OvalCommand.prototype.draw=function(context){
	if(this.radius>0){
		context.save();
		context.scale(this.rx,this.ry);
		context.beginPath();
		context.arc(this.x*(1/this.rx),this.y*(1/this.ry),this.radius,0,2*Math.PI);
		context.restore();
		context.strokeStyle=this.strokeStyle;
		context.lineWidth=this.lineWidth;
		context.stroke();
		if(this.fill){
			context.fillStyle=this.strokeStyle;
			context.fill();
		}
	}
}

OvalCommand.prototype.setRadius=function(radiusX,radiusY){
	//Use pythagoreans thm to get radius
	var a = this.x - radiusX;
	var b = this.y - radiusY;
	var c =  Math.sqrt(Math.pow(a,2) + Math.pow(b,2));
	this.radius = c;
}

OvalCommand.prototype.calculateRatio=function(newX, newY){
	// I was very confused on how to set the ratio, so I did it prett simply.
	if(Math.abs(this.x-newX)>Math.abs(this.y-newY)){
		this.rx=1;
		this.ry=0.5;
	} else {
		this.rx=0.5;
		this.ry=1;
	}
}


function PolygonStrategy(paint){
	this.command=null;
	this.paint=paint;
	this.strokeStyle = paint.strokeStyle;
	this.lineWidth = paint.lineWidth
	this.fill=paint.filled;
}

PolygonStrategy.prototype.mousedown=function(event){
	if(this.command==null){
		this.command = new PolygonCommand(this.strokeStyle, this.lineWidth, event.canvasX, event.canvasY, this.fill);
		this.command.points.push({x:event.canvasX,y:event.canvasY});
		this.paint.commands.push(this.command);
	} else if (event.which==2) {
		// middle button was pressed. Close the polygon and see if it needs to be filled
		this.command.points.push({x:this.command.beginX, y:this.command.beginY});
		this.command.draw(this.paint.context);
		if(this.fill){
			this.paint.context.fillStyle=this.strokeStyle;
			this.paint.context.fill();
		}
		this.command=null;
	} 
}

PolygonStrategy.prototype.mouseup=function(event){
	if(this.command!=null){
		this.command.points.push({x:event.canvasX,y:event.canvasY});
		this.command.draw(this.paint.context);
	}
}

// No Need to do anything
PolygonStrategy.prototype.mousemove=function(event){
	return;
}

// No Need to do anything
PolygonStrategy.prototype.mouseout=function(event){
	return;
}

function PolygonCommand(strokeStyle, lineWidth, x, y, fill){
	this.strokeStyle=strokeStyle;
	this.lineWidth=lineWidth;
	this.points=[]; // A collection of points to make lines to
	this.beginX=x;
	this.beginY=y;
	this.fill=fill;
}

PolygonCommand.prototype.draw=function(context){
	if(this.points.length==0){
		return;
	}

	//go through each point and make a line to it from the previous
	context.beginPath(); 
	context.strokeStyle = this.strokeStyle;
	context.lineWidth=this.lineWidth;
	context.moveTo(this.points[0].x,this.points[0].y);
	for(var i=1;i<this.points.length;i++){
		context.lineTo(this.points[i].x, this.points[i].y);
	}
	context.stroke();
}

PolygonCommand.prototype.addPoint=function(point){
	this.points.push(point);
}

/* Symmetry Strategy contructs and caputres SymmertyCommands. This is much like SquiggleStrategy*/
function SymmetryStrategy(paint){

	//This is like a squiggle, you draw a squiggle like normal, then repeat on the other side
	this.command=null;
	this.paint=paint;
	this.strokeStyle=paint.strokeStyle;
	this.lineWidth=paint.lineWidth;
}

SymmetryStrategy.prototype.mousedown=function(event){
	this.command=new SymmetryCommand(this.strokeStyle, this.lineWidth, this.paint.canvas);
	this.command.addPoint({x:event.canvasX, y:event.canvasY});
	this.paint.commands.push(this.command);
}

SymmetryStrategy.prototype.mouseup=function(event){
	if(this.command!=null){
		this.command.addPoint({x:event.canvasX, y:event.canvasY});
		this.command.draw(this.paint.context);
		this.command=null;
	}
}

SymmetryStrategy.prototype.mousemove=function(event){
	if(this.command!=null){
		this.command.addPoint({x:event.canvasX, y:event.canvasY});
		this.command.draw(this.paint.context, this.paint.canvas);
	}
}

SymmetryStrategy.prototype.mouseout=function(event){
	this.mouseup(event);
}

function SymmetryCommand(strokeStyle, lineWidth, canvas){
	this.strokeStyle=strokeStyle;
	this.lineWidth=lineWidth;
	this.points=[]
	this.canvas=canvas; // canvas needed for width
}

SymmetryCommand.prototype.addPoint=function(point){
	this.points.push(point);
}

SymmetryCommand.prototype.draw=function(context){
	
	if(this.points.length==0){
		return;
	}
	context.beginPath(); 
	context.strokeStyle = this.strokeStyle;
	context.lineWidth=this.lineWidth;
	context.moveTo(this.points[0].x,this.points[0].y);
	for(var i=1;i<this.points.length;i++){
		context.lineTo(this.points[i].x, this.points[i].y);
	}
	context.stroke();
	// Draw the symmetrical line
	context.moveTo(this.canvas.width-this.points[0].x,this.points[0].y);
	for(var i=1;i<this.points.length;i++){
		context.lineTo(this.canvas.width-this.points[i].x, this.points[i].y);
	}
	
	context.stroke();
}

function ol(){
	// NOTE: An even better approach than the one below would be to actually
	// attach the instance of Paint to a div, complete with a UI and the canvas.
	// The div itself could be a complete package, allowing us to easily
	// have many different Paint instances on a single page.

	//Create the colour pallete
	var c=document.getElementById("colourChooser");
	var ctx=c.getContext("2d");
	var grd=ctx.createLinearGradient(0,0,150,0);
	grd.addColorStop(0.02,"white");
	grd.addColorStop(0.180,"red");
	grd.addColorStop(0.296,"orange");
	grd.addColorStop(0.439,"yellow");
	grd.addColorStop(0.582,"green");
	grd.addColorStop(0.725,"blue");
	grd.addColorStop(0.868,"purple");
	grd.addColorStop(1,"black");
	ctx.fillStyle=grd;
	ctx.fillRect(0,0,150,50);

	var canvas=document.getElementById("theCanvas");
	paint=new Paint(canvas);
	paint.strategy=new SquiggleStrategy(paint);

	//The paint program starts off in a SquiggleStrategy then changes from UI after user clicks it.
	
	canvas.addEventListener("mousedown", function(event){ paint.strategy.mousedown(paint.mapToCanvas(canvas,event)); }, false);
	canvas.addEventListener("mouseup",   function(event){ paint.strategy.mouseup(paint.mapToCanvas(canvas,event)); }, false);
	canvas.addEventListener("mousemove", function(event){ paint.strategy.mousemove(paint.mapToCanvas(canvas,event)); }, false);
	canvas.addEventListener("mouseout",  function(event){ paint.strategy.mouseout(paint.mapToCanvas(canvas,event)); }, false);

	// QUESTION: Why does the following NOT work
	// canvas.addEventListener("mouseout",  paint.strategy.mouseout,  false);
	// Because paint.strategy.mouseout wouldn't be passed as a function, just as a value
	// You would probably get undefined because paint.strategy.mouseout doesn't exists
}
