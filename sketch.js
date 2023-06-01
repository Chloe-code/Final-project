//let r=0, g=0, b=0;    //Previously we wanted to randomly color each star point, but later decided to use white as the main color, which is more like a star point.
//The text that appears at the very beginning tells the user how to start generating artworks and see the emergent arts.
let texta = '" Drag your mouse to create your starry sky "\n↓'; 
let introtext='\n\nwhere the captivating beauty of the night sky comes alive! Immerse yourself in a mesmerizing journey through the cosmos.\n\nWith just a click of your cursor, you can bring stars to life.\nIf you’d like to generate more stars, you can simply drag the cursor.';
let introtext2 = ' And then, you will see these stars move and twinkle.\nAs you move your mouse across the screen, you will see stars steer clear of your path.\n\nThe possibilities are endless, we hope you enjoy the beauty of the universe created by yourself. Have fun!';

let startImage;   //The first picture, but it will disappear when users start their own emergent designs.
let upperImage;   //The upperImage is like a hint image, I picked the black and white constellation picture that our final design will be based on this.
//The idea is from Scott Garner's example, I based on this and hope to put most of the stars over black pixels in our upperImage, so the new design will vaguely look like constellation. 
let skyImage;   //Background image
let stars = [];   //Store new grnerative particles
let particles = [];   //Store startImage's particles
let down=0;

function preload() {
    //Preload the startImage, I choose to directly use url, not load image to file, because this reduces the many error of our testing between different devices.
    startImage = loadImage("https://static.wikia.nocookie.net/scribblenauts/images/c/c9/Big_Dipper.png/revision/latest?cb=20130410214250")
}

function setup() {
    createCanvas(windowWidth,windowHeight);  //Create a fullscreen size canvas
    noCursor();  //Hides the cursor from view.
    noStroke();  //Every object has no stroke.
    placeParticles();  
    upperImage =loadImage("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLKgq_YlsM4eBO7f_2w8wW-4uZbRvLX7f6dhY3yp4znlb_bDOo66GhCqUrVByEo3NHCBQ&usqp=CAU")
    skyImage = loadImage("https://cdn.mos.cms.futurecdn.net/ETA52G4HKjMfE6Si3XWR5e-1200-80.jpg");
}

function draw() {
    background(skyImage)  //Let the skyImage as background
    if(down==0) {
        //Set the introduction content text style
        //Set the text size to be (e.g.(windowWidth*0.02)), and scale with the width so that the text will not exceed the screen width.
        background(0);
        fill(255,255,255); 
        textStyle(NORMAL);
        image(skyImage, 0, -(height/2),width,height);
        textFont("Courier");  //Set the text's font
        textSize(windowWidth*0.03);
        textAlign(LEFT,BOTTOM);
        text('Hi! Welcome to the Big Bang Cursor,', 50, windowHeight/2);
        textSize(windowWidth*0.012);
        textAlign(LEFT,TOP);
        text(introtext+introtext2, 70, windowHeight/2);
        textSize(windowWidth*0.022);
        textStyle(BOLD);
        textAlign(CENTER,CENTER);
        text(texta, windowWidth/2, windowHeight/7*6);
    }else { 
        image(skyImage, 0, 0,width,height);  //Set the skyImage’s width to always be the window width when drawn.
    }
  
    let position = createVector(mouseX, mouseY);  //Get the mouse position
    fill(255,255,255);  //Let the mouse white colour
    ellipse(position.x, position.y, 20, 20);  //Create an ellise on mouse's location like a cursor
    if (mouseIsPressed) {
        texta='';  //If click the mouse, then the hint text will disappear
        down=1;
        particles=[];  //The startImage's particle will also clear, let the whole screen clean
        let target = findPixel();  //Find the target position
        stars.push(new Star(position, target))
        if (stars.length > 1000) {
            //If the number of stars over 1000, then start discarding from the oldest star.
            stars.shift();
        }
    }

    for (let i = 0; i < stars.length; i++) { 
        //Check all points in stars[], and call update() and draw()
        stars[i].update();
        stars[i].draw();
    }

    for(let i = 0; i < particles.length; i++) {
        //Check all points in particles[], and call update() and draw()
        particles[i].update();
        particles[i].draw();
    }
}

function findPixel() {  //Find a target position for each new star. 
    //The upperImage is a white background and have some black constellation lines. 
    //Based on the upperImage, I want to let most of the random target position on the the black pixels of upperImage.
    //So I used get() to check if this target position's x-y value in upperImage black or white. 
    //I only have to check one value of RGB, because if both of the red value of x and y value are <255 means they are non-white. Then I return them.
    //If cannot find the non-white pixel until for loop ends, then return the last value.
    //So I set the for loop to run up to 200 times to find non-white pixels as much as possible
    let x, y;
    for (let i = 0; i < 200; i++) {
        x = floor(random(windowWidth+1000));
        if(upperImage.height<windowHeight) {
            y = floor(random(windowHeight));
        }else{
            y = floor(random(upperImage.height));
        }
        if (red(upperImage.get(x,y)) < 255) break;
    }
    //Prevents the target position of the star point from falling on non-sky parts.
    return createVector(x,y-100); 
}

class Star {
    constructor(position,target) {
        this.homeX = target.x;
        this.homeY = target.y;
        this.position = position;
        this.target = target;
        this.diameter = random(2,10);  //Randomly generate points of different diameters.
    }

    update() {
        //Calculate between the current and target position. 
        //And I set 2% of the remaining distance for every draw, producing like an ease-out effect.
        this.position =p5.Vector.lerp(this.position,this.target,0.02);
        //The distance and angle between this particle and the mouse.
        let mouseD = dist(this.position.x, this.position.y, mouseX, mouseY);
        let mouseA = atan2(this.position.y - mouseY, this.position.x - mouseX);

        //The distance and angle between this particle and original point location.
        let homeD = dist(this.position.x, this.position.y, this.homeX, this.homeY);
        let homeA = atan2(this.homeY - this.position.y, this.homeX - this.position.x);

        //Calculate the particle movement, I set the movement is the particle 150 pixels away from the mouse
        let mouseF = constrain(map(mouseD, 0, 200, 10, 0), 0, 10);
        let homeF = map(homeD, 0, 200, 0, 10);

        let vx = cos(mouseA) * mouseF;
        vx += cos(homeA) * homeF;

        let vy = sin(mouseA) * mouseF;
        vy += sin(homeA) * homeF

        this.position.x += vx;
        this.position.y += vy;
    }

    draw() {
        //Set the alpha value, I use p5.js’s noise() to randomly return the alpha value to the target point, 
        //set the alpha value of each point to change every 50 milliseconds, which means that the colour of each point will change every 50 milliseconds to feel like a twinkle star. 
        let alpha2 = noise(this.target.x,this.target.y,millis()/50.0);
        fill(255,alpha2 * 255);  //Fill the particle white colour and with the alpha value
        ellipse(this.position.x, this.position.y,this.diameter, this.diameter); 
    }
}

function placeParticles() {
    //Analyze the startImage into pixel points
    for(let i = 0; i < width; i += 8) {
        for(let j = 0; j < height; j += 8) {
            let x = (i/width) * startImage.width*2;
            let y = (j/height) * startImage.height*2;
            let c = startImage.get(x, y);
            if(c[3] != 0) {
                particles.push(new Particle(i+width/4, j))
            }
        }
    }
}

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.diameter = random(2,10);  //Randomly generate points of different diameters.
        this.homeX = x;
        this.homeY = y;
    }
  
    update() {
        //The distance and angle between this particle and the mouse.
        let mouseD = dist(this.x, this.y, mouseX, mouseY);
        let mouseA = atan2(this.y - mouseY, this.x - mouseX);
        
        //The distance and angle between this particle and original point location.
        let homeD = dist(this.x, this.y, this.homeX, this.homeY);
        let homeA = atan2(this.homeY - this.y, this.homeX - this.x);
        
        //Calculate the particle movement, I set the movement is the particle 150 pixels away from the mouse
        let mouseF = constrain(map(mouseD, 0, 150, 10, 0), 0, 10);
        let homeF = map(homeD, 0, 150, 0, 10);

        let vx = cos(mouseA) * mouseF;
        vx += cos(homeA) * homeF;

        let vy = sin(mouseA) * mouseF;
        vy += sin(homeA) * homeF;
        
        this.x += vx;
        this.y += vy;
    }
  
    draw() {
        //Set the alpha value, I use p5.js’s noise() to randomly return the alpha value to the target point, 
        //set the alpha value of each point to change every 50 milliseconds, which means that the colour of each point will change every 50 milliseconds to feel like a twinkle star. 
        let alpha = noise(this.x,this.y,millis()/50.0);
        fill(255,alpha*255);  //Fill the particle white colour and with the alpha value
        ellipse(this.x, this.y, this.diameter, this.diameter);
    }
}

function windowResized() {
    //Resize canvas
    resizeCanvas(windowWidth, windowHeight);
    //Resize startImage
    if(down==0) {
      particles=[];
      placeParticles(); 
    }
}