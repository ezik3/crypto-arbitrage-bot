"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricePredictor = void 0;
class PricePredictor {
    async predictPrice(token) {
        const features = await this.extractFeatures(token);
        const prediction = this.model.predict(features);
        return {
            predictedPrice: prediction.price,
            timeframe: prediction.timeframe,
            reliability: this.calculateReliability(prediction)
        };
    }
}
exports.PricePredictor = PricePredictor;
