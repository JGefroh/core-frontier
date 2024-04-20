export let isPointInRotatedRect = (pointX, pointY, rectX, rectY, rectWidth, rectHeight, rectAngleDegrees, isCentered = true) => {
    if (isCentered) {
        rectX -= rectWidth / 2;
        rectY -= rectHeight / 2;
    }

    let rectAngle = rectAngleDegrees * Math.PI / 180;
    let cosAngle = Math.cos(rectAngle);
    let sinAngle = Math.sin(rectAngle);

    // Calculate the coordinates of the point relative to the center of the rectangle
    let centerX = rectX + rectWidth / 2;
    let centerY = rectY + rectHeight / 2;
    let localX = pointX - centerX;
    let localY = pointY - centerY;

    // Apply rotation to the coordinates relative to the center of the rectangle
    let rotatedX = localX * cosAngle - localY * sinAngle;
    let rotatedY = localX * sinAngle + localY * cosAngle;

    // Check if the rotated point is within the bounds of the rotated rectangle
    if (rotatedX >= -rectWidth / 2 && rotatedX <= rectWidth / 2 && rotatedY >= -rectHeight / 2 && rotatedY <= rectHeight / 2) {
        return true;
    } else {
        return false;
    }
}
export const areRectanglesColliding = (
    rect1X, rect1Y, rect1Width, rect1Height, rect1AngleDegrees,
    rect2X, rect2Y, rect2Width, rect2Height, rect2AngleDegrees
) => {
    // Helper function to rotate a point around a center
    const rotatePoint = (point, angle, center) => {
        const radians = angle * Math.PI / 180;
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);
        // Calculate the rotated coordinates
        const x = cos * (point.x - center.x) - sin * (point.y - center.y) + center.x;
        const y = sin * (point.x - center.x) + cos * (point.y - center.y) + center.y;
        return { x, y };
    };

    // Helper function to calculate the projection of a rectangle onto an axis
    const projectRectangle = (rectCorners, axis) => {
        let min = Number.POSITIVE_INFINITY;
        let max = Number.NEGATIVE_INFINITY;
        rectCorners.forEach(corner => {
            const dotProduct = corner.x * axis.x + corner.y * axis.y;
            if (dotProduct < min) min = dotProduct;
            if (dotProduct > max) max = dotProduct;
        });
        return { min, max };
    };

    // Calculate the corners of each rectangle
    const calculateCorners = (x, y, width, height) => [
        { x, y },
        { x: x + width, y },
        { x: x + width, y: y + height },
        { x, y: y + height }
    ];

    // Calculate the center points of each rectangle
    const rect1Center = { x: rect1X + rect1Width / 2, y: rect1Y + rect1Height / 2 };
    const rect2Center = { x: rect2X + rect2Width / 2, y: rect2Y + rect2Height / 2 };

    // Calculate the corners of each rectangle
    const rect1Corners = calculateCorners(rect1X, rect1Y, rect1Width, rect1Height);
    const rect2Corners = calculateCorners(rect2X, rect2Y, rect2Width, rect2Height);

    // Rotate the corners of each rectangle around their center
    const rotateRectCorners = (corners, angle, center) => {
        return corners.map(corner => rotatePoint(corner, angle, center));
    };

    const rotatedRect1Corners = rotateRectCorners(rect1Corners, rect1AngleDegrees, rect1Center);
    const rotatedRect2Corners = rotateRectCorners(rect2Corners, rect2AngleDegrees, rect2Center);

    // Check for intersection along each axis of both rectangles
    const axes = [
        { x: rotatedRect1Corners[1].x - rotatedRect1Corners[0].x, y: rotatedRect1Corners[1].y - rotatedRect1Corners[0].y },
        { x: rotatedRect1Corners[2].x - rotatedRect1Corners[1].x, y: rotatedRect1Corners[2].y - rotatedRect1Corners[1].y },
        { x: rotatedRect2Corners[1].x - rotatedRect2Corners[0].x, y: rotatedRect2Corners[1].y - rotatedRect2Corners[0].y },
        { x: rotatedRect2Corners[2].x - rotatedRect2Corners[1].x, y: rotatedRect2Corners[2].y - rotatedRect2Corners[1].y },
    ];

    for (const axis of axes) {
        const projRect1 = projectRectangle(rotatedRect1Corners, axis);
        const projRect2 = projectRectangle(rotatedRect2Corners, axis);

        // If projections do not overlap, rectangles are not colliding
        if (projRect1.max < projRect2.min || projRect2.max < projRect1.min) {
            return false;
        }
    }

    // If all axes overlap, rectangles are colliding
    return true;
};
