function SimpleTiles(parent){
	// Setup canvas and rendering context
	this.canvas = document.createElement('canvas');
	this.canvas.width = 160;
	this.canvas.height = 160;
	this.ctx = this.canvas.getContext("2d");
	console.debug('ctx created with sucess');
	parent.appendChild(this.canvas);

	// Game setup
	this.lastTile = { pos: -160 };
	this.tileLines = [
		{ key: 'a', color: '#f00', tiles: [ { pos: -40 } ] },
		{ key: 's', color: '#0f0', tiles: [ { pos: -80 } ] },
		{ key: 'd', color: '#00f', tiles: [ { pos: -120 } ] },
		{ key: 'f', color: '#ff0', tiles: [ this.lastTile ] }
	];
	this.tileHeight = 40;
	this.tileWidth = this.canvas.width / this.tileLines.length;
	this.tileVelocity = 160;

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

	// Iterating each tile in each tileLine
	for (let tli = this.tileLines.length - 1; tli >= 0; tli--) {
		const tileLine = this.tileLines[tli];

		for (let ti = tileLine.tiles.length - 1; ti >= 0; ti--) {
			const tile = tileLine.tiles[ti];

			if (tile.pos + this.tileHeight >= this.canvas.height) {
				// Remove tile if position is lower than the canvas
				tileLine.tiles.splice(ti, 1);

				// Add another tile just above the last positioned tile on a random tileLine
				// this shuld guarantee (if game state is maintained correctly) that only one tile is to pressed at a time, at a fixed time rate,
				// thus making the game difficulty almost constant
				const spawnTileLine = this.tileLines[Math.floor(Math.random() * this.tileLines.length)];
				const newTile = { pos: this.lastTile.pos - 40 };
				spawnTileLine.tiles.push(newTile);
				this.lastTile = newTile;
			}
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
