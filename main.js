function SimpleTiles(parent){
	// Game logic and animation should run separetly

	// Setup tick loop
	const fps = 1000 / 45;	// 30 is the desired fps, setInterval will cause 15ms 
	this.gameLoop = 0;
	this.renderLoop = 0;
	this.lastTick = performance.now();
	this.tick();
	setInterval(() => this.tick(), fps);

	// Setup animation loop
	const drawLoop = () => {
		this.draw();
		requestAnimationFrame(drawLoop);
	};
	requestAnimationFrame(drawLoop);
}

SimpleTiles.prototype.tick = function(){
	if (document.hidden) {
		// Do not run main game logic if tab is hidden
		// Keep tracking last tick, we need this in case user changes tab
		this.lastTick = performance.now();
		return;
	}

	// The actual interval of calling the function is never going to be precise
	// So we calculate the time difference between now and the last execution
	const deltaTime = performance.now() - this.lastTick;

	// Actual game logic
	console.log(`game loop, deltaTime: ${deltaTime}, gameLoop: ${this.gameLoop}`);

	// Recapture performance.now() so we don't consider the time it took to execute game loop
	this.lastTick = performance.now();
	this.gameLoop++;
}

SimpleTiles.prototype.draw = function(timestamp){
	// Do not render if there is no update
	if (this.gameLoop <= this.renderLoop) {
		console.warn('render skipped');
		return;
	}

	// Actual rendering
	console.log('render');

	// Updates last rendered loop
	this.renderLoop = this.gameLoop;
}
