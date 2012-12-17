function cssRotate($obj,degree) {
      // For webkit browsers: e.g. Chrome
           $obj.css({
               '-webkit-transform': 'rotate(' + degree + 'deg)',
               '-moz-transform': 'rotate(' + degree + 'deg)',
               '-ms-transform': 'rotate(' + degree + 'deg)',
               '-o-transform': 'rotate(' + degree + 'deg)',
               'transform': 'rotate(' + degree + 'deg)',
               'zoom': 1
           });
}


function go(difficulty) {
	var winWidth = $(window).width();
	var winHeight = $(window).height();
	var unit = winHeight / 100;
	var playerX = 0;
	var playerY = 0;
	
	var keysDown = [];
	var enemies = [];
	var numFloors = 20+(10*difficulty);
	var rotateMultiplier = 1 + (0.003*difficulty);
	var floorShiftSize = [];
	var floorShift = [];
	var percentage = winWidth / 100;
	var gameStart = new Date().getTime();
	var shiftStart = 0;
	var shiftTime = 8000 - (1000*difficulty);
	var shiftAmount = 40 + (20*difficulty);
	var enemyImages = ['tv','person','sofa','vase'];
	var pathGap = 20+(difficulty*5);
	var rotateForce = 0;
	var rotateTime = 8000 - (1000*difficulty);
	var rotateStart = 0;
	var rotatePercent = 0;
	var roomRotate = 0;
	
	
	var Item = Class.extend( {
		init : function(x, y, floor) {
			this.floor = floor;
			this.x = x;
			this.y = y;
		}
	});

	var Enemy = Item.extend( {
		init : function(x, y, floor, image) {
			this.floor = floor;
			this.x = x;
			this.y = y;
			this.originX = x;
			this.shiftX = x;
			if (image=='sofa') {
				this.width=40;
				this.height=(361/324)*this.width;
			} else if (image=='tv') {
				this.width=20;
				this.height=(147/150)*this.width;
			} else if (image=='person') {
				this.width=30;
				this.height=(222/349)*this.width;
			} else if (image=='vase') {
				this.width=10;
				this.height=(304/165)*this.width;
			} 
				
				this.hitHeight=10;
			this.$element = $('<img class="enemy" src="img/' + image + '.png"  />');
			$('#roomObjects').append(this.$element);
			this.$element.css( {
				top : (this.y-this.height) * unit + 'px',
				width : this.width*unit,
				'z-index':10+floor
			});
		}
	});

	$('#game').width(winHeight);
	$('#game').height(winHeight);
	$('#room').css({height:(unit*10*numFloors),
	width: winHeight*3,
	padding: (winHeight) + 'px'
	});
	
	
	$('#roomRotator').css({
		width:winHeight*3,
		left:-winHeight,
		height:winHeight*3,
		top:-winHeight
	});
	
	/*
	 * $('#roomRotator').css({ width:winHeight*unit, height:winHeight*unit*3,
	 * top:-winHeight*unit });
	 */
	for ( var i = 3; i < numFloors; i++) {
		if (i % 3 == 0) {
			var floor = Math.floor(i * 1.3);
			var img = enemyImages[Math.floor(Math.random()*4)];
			var x;
			if (Math.random()>0.5)
				x=Math.random()*pathGap;
			else
				x=(Math.random()*pathGap)+(100-pathGap);
			var enemy = new Enemy(x, i * 10, i, img);
			enemies.push(enemy);
		}
	}

	$('#intro').hide();
	$('#game').fadeIn('slow');
	$('#player').css( {
		width: unit*20,
		left:unit*40
	});
	var playerHeight = (600/389)*(unit*20);
	$('#player').css( {
		top : ((50 * unit) - playerHeight) + 'px'
	});
	var lastFrame = 0;
	var interval = window.setInterval(function() {
		
		
		var time = new Date().getTime();
		console.log(1000/(time-lastFrame));
		lastFrame = time;
		if (time > shiftStart + shiftTime) {
			for ( var i = 0; i < numFloors; i++) {
				floorShift[i] = (Math.random() * shiftAmount) - (shiftAmount/2);
			}
			shiftStart = time;
		}
		shiftUnit = Math.sin(((((time - shiftStart) / shiftTime)+1) * Math.PI));

		
		if (time > rotateStart + rotateTime) {
			rotateForce = (Math.random()*0.2)-0.1;
			rotateStart = time;
		}
		roomRotate=roomRotate+(15*rotatePercent);
		roomRotate=roomRotate+(5*rotateForce);
		roomRotate=roomRotate*rotateMultiplier;
		//cssRotate($('#roomRotator'),roomRotate);
		cssRotate($('#player'),roomRotate);
		if (roomRotate>90 || roomRotate<-90) {
			clearInterval(interval);
			alert('Aw, you fell over. No gin for you.');
			restart();	
		}
		if (playerY>(numFloors+2)*10) {
			clearInterval(interval);
			$('#game').hide();
			$('#success').fadeIn('slow');
		}
		
		if (keysDown[40]) {
			playerY++;
		}
		if (keysDown[38] && playerY>0) {
			playerY--;
		}
		if (keysDown[37]) {
			rotatePercent-=0.01;
		}
		if (keysDown[39]) {
			rotatePercent+=0.01;
		}
		
		$('#room').css({
			top:(((-playerY+50)*unit)) + 'px'
		});
		$('#player').css({'z-index':11+Math.floor(playerY*0.1)});
		$('#player img').hide();
		for ( var i = 0; i < 3; i++)
			if (i == Math.floor((playerY*0.5) % 3))
				$('#player .frame' + i).show();
			else
				$('#player .frame' + i).hide();

		for ( var i = 0; i < enemies.length; i++) {
			var e = enemies[i];
			e.x = e.originX + (floorShift[e.floor] * shiftUnit);
			e.$element.css( {
				left : (e.x-e.width/2) * unit + 'px'
			});
			if (playerY<e.y && playerY>e.y-e.height/2 && e.x+e.width/2>50 && e.x-e.width/2<50) {
				clearInterval(interval);
				alert('Oof! You\'ve been spotted. Try again!');
				restart();
			}
		}
	}, 1000 / 30);
	$(document).keydown(function(e) {
		keysDown[e.keyCode] = true;
	});
	$(document).keyup(function(e) {
		keysDown[e.keyCode] = false;
	});
	
}
function restart() {
	
	$('#roomObjects *').remove();
	$('#game,#success').hide();
	$('#intro').show('slow');
}
