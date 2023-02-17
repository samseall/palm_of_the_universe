//Name: Palm of the Universe

/* 
My project uses a machine learning model which recognizes your right hand. I built this model using Teachable Machine and imported it (line 22).
If you close your fist (Fast), you will accelerate through space (which is just the stars moving faster), if you go too fast for too long, it will caution you and reset your speed
If you open your fist (Slow), the stars will reset back to their initial position value, and your acceleration will be reset,
If you show three fingers with your palm faced inwards (Burst), the stars congregate in the middle and burst continously,
If you show two fingers with your palm faced outwards (Split), the stars will seperate into right and left directions, and continue to travel.
If you cross your fingers with both hands (Disperse), the stars will disperse into random directions and branch off.
*/

let video;
let label = 'bzzt... initializing';
let classifier;
const numOfStars = 550;
let stars = [];
let change = 300;
let timer = 5;
let img;

function preload() {
	classifier = ml5.imageClassifier("https://teachablemachine.withgoogle.com/models/y3WbOACgH/");
	song = loadSound('interstellar-space-117482.mp3');
}

function setup() {
	createCanvas(windowWidth, windowHeight);
	stroke(255);
	strokeWeight(2);
	img = loadImage('warning.png');

	for (let i = 0; i < numOfStars; i++) {
		stars.push(new Star(random(width), random(height)));
	}

	//=======================================Teachable Machine========================================
	// Create the video
	video = createCapture(VIDEO);
	video.hide();

	// STEP 2: Start classifying
	classifyVideo()
}

// STEP 2 classify!
function classifyVideo() {
	classifier.classify(video, gotResults);
	//================================================================================================	

} //end of setup

function draw() {
	background(0, 50);

	let dist0 = map(change, 0, width, 0.001, 0.09);
	let dist1 = map(change, 0, width, 0.001, 0.09);
	let dist2 = map(change, 0, width, 0.001, 0.09);

	// stars = stars.map(star => {
	// 	star.draw();
	// 	star.update(dist0);
	// 	return star.isActive() ? star : new Star(random(width), random(height));
	// });

	stars = stars.filter(star => { //filter parses through each object in the array (the stars) and applies the draw and update functions
		star.draw();
		star.update(dist0);
		return star.isActive();
	});

	while (stars.length < numOfStars) { //the while loop pushes new stars infinitely 
		stars.push(new Star(random(width), random(height)));
	}

	//=======================================Teachable Machine========================================	
	textSize(32);
	textAlign(CENTER, CENTER);
	fill(255);
	text(label, width / 2, height - 16);


	if (label == 'Burst') {
		change -= 5;
		if (change == -1500) {
			change = -5;
		}
	} else if (label == 'Split') {
		//Split and Disperse are calling different update functions with different distance modes that use the same position variables for the stars and changes their directions. 
		stars = stars.filter(star => {
			star.update1(dist1);
			return star.isActive();
		});
	} else if (label == 'Slow') {
		change = 0;
	} else if (label == 'Fast') {
		change += 600;
		if (frameCount % 60 == 0 && timer > 0) { // if the frameCount is divisible by 60, then a second has passed. it will stop at 0
			timer--;
		}
		if (timer == 0) {
			text("CAUTION!", width / 2, height / 2);
			image(img, width / 2 - 200, height / 2 - 200);
			change = 0;
			timer++;
		} else if (label == 'Disperse') {
			stars = stars.filter(star => {
				star.update2(dist2);
				return star.isActive();
			})
		}

	} else { //label = nothing
		change = 0;
	}

	//==============================================================================================	
} //end of draw

class Star {
	constructor(x, y) {
		this.pos = createVector(x, y);
		this.prevPos = createVector(x, y);
		this.vel = createVector(0, 0); //initial velocity is zero
		this.ang = atan2(y - (height / 2), x - (width / 2)); // inverse tan function to find the angle between the center of the screen and random points of stars
	}

	isActive() {
		return onScreen(this.prevPos.x, this.prevPos.y);
	}

	update(dist0) { //distance mode 0
		this.vel.x += cos(this.ang) * dist0; //how far we need to move in the x
		this.vel.y += sin(this.ang) * dist0; //how far we need to move in the y

		//save where the star currently is on the x and y positions
		this.prevPos.x = this.pos.x;
		this.prevPos.y = this.pos.y;

		//update the position of the x and y by adding the velocity
		this.pos.x += this.vel.x;
		this.pos.y += this.vel.y;
	}

	update1(dist1) { //distance mode 1
		this.vel.x += cos(this.ang) * 10 * dist1; //how far we need to move in the x
		this.vel.y += sin(this.ang) * dist1; //how far we need to move in the y

		//save where the star currently is on the x and y positions
		this.prevPos.x = this.pos.x;
		this.prevPos.y = this.pos.y;

		//update the position of the x and y by adding the velocity
		this.pos.x += this.vel.x;
		this.pos.y += this.vel.y;
	}

	update2(dist2) { //distance mode 2
		this.vel.x += tan(this.ang) * dist2; //how far we need to move in the x
		this.vel.y += sin(this.ang) * dist2; //how far we need to move in the y

		//save where the star currently is on the x and y positions
		this.prevPos.x = this.pos.x;
		this.prevPos.y = this.pos.y;

		//update the position of the x and y by adding the velocity
		this.pos.x += this.vel.x;
		this.pos.y += this.vel.y;
	}

	draw() {
		const alpha = map(this.vel.mag(), 0, 3, 0, 255); //mag calculates the length of the vel vector so that we know the stars become more opaque as it reaches the end of the screen
		stroke(255, 244, 234, alpha);
		line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y); //line will stretch out creating the light speed effect
	}
}

function keyPressed() { //resets the timer for the caution sign if any key is pressed
	timer = 5;
}

//=======================================Teachable Machine========================================	
function gotResults(error, results) {
	if (error) {
		console.error(error);
		return;
	}
	label = results[0].label;
	classifyVideo();
}
//================================================================================================	

function onScreen(x, y) { //collision detection function between a point and the screen. Returns true if x and y coordinate are inside the bounds of the screen otherwise returns false.
	return x >= 0 && y >= 0 && y <= height && x <= width;
}

function mousePressed() { //interstellar music
  if (song.isPlaying()) {
    song.pause(); 
  } else {
    song.play();
  }
}
