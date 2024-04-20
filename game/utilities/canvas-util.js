export let renderToViewport = (canvas, offScreenCanvas) => {
    let {ratio, boxWidth, boxHeight, boxX, boxY} = calculateDimensions(offScreenCanvas)

    // Calculate scale to fit the content within the box
    var offScreenCtx = offScreenCanvas.getContext('2d');
    var canvasCtx = canvas.getContext("2d");

    let scale = Math.min(boxWidth / offScreenCanvas.width, boxHeight / offScreenCanvas.height);

    // Calculate scaled dimensions
    let scaledWidth = offScreenCanvas.width * scale;
    let scaledHeight = offScreenCanvas.height * scale;

    // Calculate position to center the scaled content within the box
    let offsetX = (boxWidth - scaledWidth) / 2;
    let offsetY = (boxHeight - scaledHeight) / 2;

    // Draw the scaled content onto the main canvas within the box
    canvasCtx.fillStyle= 'rgb(0,0,0,1)'
    canvasCtx.fillRect(boxX, boxY, boxWidth, boxHeight)
    canvasCtx.drawImage(offScreenCanvas, 0, 0, offScreenCanvas.width, offScreenCanvas.height, boxX + offsetX, boxY + offsetY, scaledWidth, scaledHeight);
}

export let calculateDimensions = (offScreenCanvas) => {
    let ratio = 16/9
    let boxWidth = 324;
    let boxHeight = boxWidth / ratio;
    let boxX = offScreenCanvas.width - 325;
    let boxY = 48;
    return {
        ratio,
        boxWidth,
        boxHeight,
        boxX,
        boxY
    }
}
