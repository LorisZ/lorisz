var field = null;
var y = 22;
var x = 79;

var curx;
var cury;

var highscore=0;
var score=1;
var fstatus=0;
var highlighting=true;

var lastmove=null;

//div-number:	0=@		1		2	  3		  4		  5			6		7		 8		9
var colors = ["white","orange","red","green","cyan","magenta","yellow","#f66","#0f0","#abf"];

function init()
{
	//load highscore from cookie
	var hs = +getCookie("highscore");
	if(!isNaN(hs) && hs>0)
		highscore=hs;

	var m = document.getElementsByTagName("main")[0];
	//var y= Math.floor(window.innerWidth/divsize);
	//var x= Math.floor(window.innerHeight/divsize);

	field = [];
	for (var i = 0; i<y; i++) 
	{
		field[i] = [];
		for(var j=0; j<x; j++)
		{
			var r = Math.floor(Math.random()*9)+1;
			field[i][j] = r;
			var d = document.createElement("div");
			d.innerHTML = r;
			d.setAttribute("style","color:"+colors[r]);
			d.setAttribute("id","f"+i+"_"+j);
			d.setAttribute("onclick","moveByClick("+i+","+j+");");
			m.appendChild(d);
		}
		var br  = document.createElement("br");
		br.setAttribute("class","clear");
		m.appendChild(br);
	}

	// find starting point
	setNewPos(Math.floor(Math.random()*y),Math.floor(Math.random()*x));
	highlight();
	updateScore();
}

function saveLastMove()
{
	var jsonfield = JSON.parse(JSON.stringify(field));
	lastmove = { field:jsonfield, cury:cury, curx:curx , score:score};
}

//Undo/redo last move.
function undo()
{
	if(lastmove)
	{
		console.log(lastmove.field);
		console.log(field);

		var l = lastmove;
		saveLastMove();
		score = l.score;
		var m = document.getElementsByTagName("main")[0];
		m.innerHTML="";
		field = l.field;
		for (var i = 0; i<y; i++) 
		{
			for(var j=0; j<x; j++)
			{
				var r = field[i][j];
				var d = document.createElement("div");
				if(r!=-1)
				{
					d.innerHTML = r;
					d.setAttribute("style","color:"+colors[r]);
				}
				d.setAttribute("id","f"+i+"_"+j);
				d.setAttribute("onclick","moveByClick("+i+","+j+");");
				m.appendChild(d);
			}
			var br  = document.createElement("br");
			br.setAttribute("class","clear");
			m.appendChild(br);
		}
		setNewPos(l.cury,l.curx);
		highlight();
		updateScore();
	}
	return true;
}

window.onload=init;

var keymap = { 13:undo, 55:upleft, 56:up, 57:upright, 52:left, 53:toggleHighlight, 54:right, 49:downleft, 50:down, 51:downright };

function toggleHighlight()
{ 
	highlighting=!highlighting; 
	highlight();
	return true;
}
function upleft()
{ return move(-1,-1); }

function up()
{ return move(-1,0); }

function upright()
{ return move(-1,1); }

function left()
{ return move(0,-1); }

function right()
{ return move(0,1); }

function downleft()
{ return move(1,-1); }

function down()
{ return move(1,0); }

function downright()
{ return move(1,1); }

window.onkeypress = function(e)
{
	e = e || event;
	var code = e.keyCode || e.charCode || e.which;
	if(typeof keymap[code] !== 'undefined')
	{
		updateStatus("");
		var status = keymap[code]();
		updateGame(status);
	}
};

function updateGame(status)
{
	if(!status)
	{
		clearTimeout(fstatus);
		updateStatus("Can't go there!");
		fstatus = setTimeout(function(){updateStatus("");},1500);
	}
	if(isGameOver())
	{
		clearTimeout(fstatus);
		updateStatus("Game Over!");

		//save highscore if higher
		if(score>highscore)
		{
			highscore = score;
			setCookie("highscore",highscore,356);
		}
	}
	highlight();
}

function moveByClick(y,x)
{
	var dy=0;
	var dx=0;

	if(y<cury)
		dy=-1;
	else if(y>cury)
		dy=1;
	
	if(x<curx)
		dx=-1;
	else if(x>curx)
		dx=1;

	if((dy!=0 || dx!=0) && (dx==0 || dy==0 || Math.abs(cury-y)==Math.abs(curx-x) ))
	{
		var status = move(dy,dx);
		updateGame(status);
	}

}


function isGameOver()
{
	for(var i=-1;i<=1;i++)
		for(var j=-1;j<=1;j++)
		{
			if(i!=0 || j!=0)
				if(canIGoThere(i,j))
					return false;
		}
	return true;
}

function canIGoThere(y,x)
{
	if(typeof field[cury+1*y] !== 'undefined' && typeof field[cury+1*y][curx+1*x] !== 'undefined' && field[cury+1*y][curx+1*x] != -1)
	{
		var step = field[cury+1*y][curx+1*x];
		if(typeof field[cury+step*y] !== 'undefined' && typeof field[cury+step*y][curx+step*x] !== 'undefined' && field[cury+step*y][curx+step*x] != -1)
		{
			for(var i=1; i<step;i++)
				if(isEmpty(cury+i*y,curx+i*x))
					return false;
		}else
		{
			return false;
		}
	}else
	{
		return false;
	}
	return true;
}

// y = 0 for same row, -1:up, +1:down
// x = 0 for same column, -1:left, +1:right
function move(y,x)
{
	if(!canIGoThere(y,x))
		return false;
	else
	{
		saveLastMove();
		var step = field[cury+1*y][curx+1*x];
		for(var i=0; i<step;i++)
		{
			clearField(cury+i*y,curx+i*x);
			score++;
		}
		setNewPos(cury+step*y,curx+step*x);
		console.log(step,"felder nach ",y,x);
		updateScore();
	}
	return true;
}

function highlight()
{
	var d = document.getElementsByClassName("hl");
	while(d.length>0)
		d[0].setAttribute("class","");

	if(highlighting)
		for(i=-1;i<=1;i++)
			for(var j=-1;j<=1;j++)
				if(i!=0 || j!=0)
					if(canIGoThere(i,j))
					{
						var step = field[cury+1*i][curx+1*j];
						for(var k=0;k<=step;k++)
							highlightField(cury+k*i,curx+k*j);
					}
}

function highlightField(y,x)
{
	var div = document.getElementById("f"+y+"_"+x);
	div.setAttribute("class","hl");
}

function isEmpty(y,x)
{
	if(field[y][x] ==-1)
		return true;
}
function clearField(y,x)
{
	field[y][x]=-1;
	var div = document.getElementById("f"+y+"_"+x);
	div.innerHTML="";
}
function setNewPos(y,x)
{
	field[y][x] = 0;
	var div = document.getElementById("f"+y+"_"+x);
	div.innerHTML="@";
	div.setAttribute("style","color:"+colors[0]);
	cury=y;
	curx=x;
}
function updateScore()
{
	var s = document.getElementById("score");
	s.innerHTML = "Score: "+score+" - "+getPercentScore(score)+"%&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Highscore: "+highscore+ " - "+getPercentScore(highscore)+"%";
}

function getPercentScore(score)
{
	return Math.round(score/(x*y)*10000).toFixed(2)/100;
}
function updateStatus(s)
{
	var status = document.getElementById("status");
	status.innerHTML = s;
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toGMTString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i].trim();
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return "";
}
