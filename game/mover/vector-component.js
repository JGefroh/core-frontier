import { default as Component} from '@core/component'

export default class VectorComponent extends Component {
    constructor(payload = {}) {
        super();
        this.vectors = []
        this.componentType = "VectorComponent"
        this.accelerationMagnitude = payload.accelerationMagnitude || 0;

        if (payload.xDelta && payload.yDelta) {
            this.addVectorUsingDeltas(payload.xDelta, payload.yDelta, payload.magnitude)
        }
        else if (payload.magnitude && payload.angle) {
            this.addVector(payload.magnitude, payload.angle)
        }

        this.maxMagnitude = payload.maxMagnitude;
        this.turnSpeed = payload.turnSpeed || 3;
    }

    removeAllVectors() {
        this.vectors = []
    }

    addVector(magnitude, angleDegrees) {
        let coordinates = this._calculateCoordinates(magnitude, angleDegrees);
        this.vectors.push({
            xDelta: coordinates.xDelta,
            yDelta: coordinates.yDelta,
            angleDegrees: angleDegrees,
            magnitude: magnitude,
        });
    }

    addVectorUsingDeltas(xDelta, yDelta, magnitude) {
        if (magnitude) {
            this.addVector(magnitude, this._calculateAngleDegrees(xDelta, yDelta));
        }
        else {
            this.vectors.push({
                xDelta: xDelta,
                yDelta: yDelta,
                angleDegrees: this._calculateAngleDegrees(xDelta, yDelta),
                magnitude: this._calculateMagnitude(xDelta, yDelta),
            });
        }
    }

    calculateTotalVector() {
        let totalVector = {
            xDelta: 0,
            yDelta: 0,
            magnitude: 0,
            angleDegrees: 0,
        }
        if (!this.vectors.length) {
            return totalVector;
        }
        this.vectors.forEach((vector) => {
            totalVector.xDelta += vector.xDelta;
            totalVector.yDelta += vector.yDelta;
        });

        totalVector.angleDegrees = this._calculateAngleDegrees(totalVector.xDelta, totalVector.yDelta);
        totalVector.magnitude = this._calculateMagnitude(totalVector.xDelta, totalVector.yDelta);

        if (this.vectors.length > 5) {
            this.vectors = [totalVector]
        }

        if (this.maxMagnitude) {
            totalVector.magnitude = Math.min(totalVector.magnitude, this.maxMagnitude)
        }
        return totalVector;
    }

    _calculateCoordinates(magnitude, angleDegrees) {
        let angleRadians = angleDegrees * Math.PI / 180;
        return {
            xDelta: Math.cos(angleRadians) * magnitude,
            yDelta: Math.sin(angleRadians) * magnitude
        }
    }

    _calculateAngleDegrees(xDelta, yDelta) {
        if (xDelta === 0 && yDelta === 0) {
            return 0;
        }
        let angle = Math.atan2(yDelta, xDelta) * 180 / Math.PI;
        angle = (angle >= 0) ? angle : (360 + angle);
        return angle % 360; 
    }

    _calculateMagnitude(xDelta, yDelta) {
        return Math.sqrt(xDelta*xDelta + yDelta*yDelta)
    }

    getAccelerationMagnitude() {
        return this.accelerationMagnitude;
    }

    setAccelerationMagnitude(magnitude) {
        this.accelerationMagnitude = magnitude;
    }
}