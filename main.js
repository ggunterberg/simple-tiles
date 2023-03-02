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
		{ isPressed: false, key: 'a', color: '#f00', tiles: [ { pos: -40 } ] },
		{ isPressed: false, key: 's', color: '#0f0', tiles: [ { pos: -80 } ] },
		{ isPressed: false, key: 'd', color: '#00f', tiles: [ { pos: -120 } ] },
		{ isPressed: false, key: 'f', color: '#ff0', tiles: [ this.lastTile ] }
	];
	this.commandsMapping = {
		KeyA: this.tileLines[0],
		KeyS: this.tileLines[1],
		KeyD: this.tileLines[2],
		KeyF: this.tileLines[3]
	};
	this.tileLineHighlightColor = '#000';
	this.tileHeight = 40;
	this.tileWidth = this.canvas.width / this.tileLines.length;
	this.tileVelocity = 160;

	// There should be no game logic in input capturing system
	const inputEventHandler = (event) => {
		let t = this.commandsMapping[event.code];
		if (event.type === 'keydown' && event.repeat) return;
		if (t) {
			console.debug(`dispatch command event, type: ${event.type}, tileLine key: ${t.key}`);
			this.commandHandler({ event: event.type, tileLine: t });	
		} 
	};
	window.addEventListener('keydown', inputEventHandler);
	window.addEventListener('keyup', inputEventHandler);

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

// Game input system, simply update game state isPressed based on tileLine and event Type 
SimpleTiles.prototype.commandHandler = function({ event, tileLine }){
	switch (event) {
		case 'keydown':
			tileLine.isPressed = true;
			const tile = tileLine.tiles[0];
			if (tile && tile.pos + this.tileHeight >= this.canvas.height - this.tileHeight)
				this.removeTile(tileLine);
			break;
		case 'keyup':
			tileLine.isPressed = false;
			break;
	}
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
		// Updates tiles positions
		for (const tile of tileLine.tiles) {
			tile.pos += deltaTime * this.tileVelocity;
		}

		// Remove tile if position is lower than the canvas
		// Assumes first tile is always the next to check
		const tile = tileLine.tiles[0];
		if (tile && tile.pos + this.tileHeight >= this.canvas.height) {
			this.removeTile(tileLine);
		}
	}

	// Recapture performance.now() so we don't consider the time it took to execute game loop
	this.lastTick = performance.now();
	this.gameLoop++;
}

SimpleTiles.prototype.removeTile = function(tileLine){
	tileLine.tiles.shift();
	// Adding another tile when we delete one makes game difficulty more constant
	this.addTile();
}

SimpleTiles.prototype.addTile = function(tileLine){
	// Chooses randomly if not specified
	const spawnTileLine = tileLine ?? this.tileLines[Math.floor(Math.random() * this.tileLines.length)];

	// Check if its on time to add to grid, if not then simply add
	const nextGridPos = this.lastTile.pos - this.tileHeight;
	const pos = nextGridPos > this.tileHeight / 2 ? -this.tileHeight : nextGridPos;
	const newTile = { pos };

	// Adds to tiles list and updates lastTile
	spawnTileLine.tiles.push(newTile);
	this.lastTile = newTile;
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
		if (tileLine.isPressed) this.ctx.fillStyle = this.tileLineHighlightColor;
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
