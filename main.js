function SimpleTiles(parent){
	// Setup canvas and rendering context
	this.canvas = document.createElement('canvas');
	this.canvas.width = 150;
	this.canvas.height = 150;
	this.ctx = this.canvas.getContext("2d");
	console.debug('ctx created with sucess');
	parent.appendChild(this.canvas);

	// Temporary setup
	this.tileLines = [
		{ key: 'a', color: '#f00', tiles: [ { pos: 0 } ] },
		{ key: 's', color: '#0f0', tiles: [ { pos: 40 } ] },
		{ key: 'd', color: '#00f', tiles: [ { pos: 60 } ] },
		{ key: 'f', color: '#ff0', tiles: [ { pos: 90 } ] }
	];
	this.tileHeight = 40;
	this.tileWidth = this.canvas.width / this.tileLines.length;
	this.tileVelocity = 150;

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
	const deltaTime = (performance.now() - this.lastTick) / 1000;

	// Actual game logic
	console.debug(`game loop, deltaTime: ${deltaTime}, gameLoop: ${this.gameLoop}`);
	for (const tileLine of this.tileLines) {
		tileLine.tiles = tileLine.tiles.filter(t => t.pos < this.canvas.height);
		for (const tile of tileLine.tiles) {
			tile.pos += deltaTime * this.tileVelocity;
		}
	}

	// Recapture performance.now() so we don't consider the time it took to execute game loop
	this.lastTick = performance.now();
	this.gameLoop++;
}

SimpleTiles.prototype.draw = function(timestamp){
	// Do not render if there is no update
	if (this.gameLoop <= this.renderLoop) {
		console.debug('render skipped');
		return;
	}

	// Actual rendering
	console.debug('render');
	this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

	// Render keyTiles
	let xOffset = 0;
	for (const tileLine of this.tileLines) {

		this.ctx.fillStyle = tileLine.color;

		// Render tiles
		for (const tile of tileLine.tiles) {
			// Assumes color is correct
			this.ctx.fillRect(xOffset + 2, tile.pos, this.tileWidth - 4, this.tileHeight - 4);
		}

		// Render keyTile
		const drawHeight = this.canvas.height - this.tileHeight;
		this.ctx.fillRect(xOffset, drawHeight, this.tileWidth, this.tileHeight);

		// Render keys
		const key = tileLine.key.toUpperCase();
		this.ctx.font = '12px Verdana';
		this.ctx.textBaseline = 'middle';
		const keySize = this.ctx.measureText(key);
		this.ctx.fillStyle = '#fff';
		this.ctx.fillText(key,
			(xOffset + (this.tileWidth / 2)) - (keySize.width / 2),
			(drawHeight + (this.tileHeight / 2)));

		xOffset += this.tileWidth;
	}

	// Updates last rendered loop
	this.renderLoop = this.gameLoop;
}
