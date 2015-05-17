var recommendedParameters = {
    general: {
	soil_humidity: {
	    min: 40,
	    max: 80,
	    weight: 1
	},
	air_humidity: {
	    min: 40,
	    max: 80,
	    weight: 0.5
	},
	air_temperature: {
	    min: 15,
	    max: 35,
	    weight: 1
	},
	illuminance: {
	    min: 50,
	    max: 90,
	    weight: 1
	}
    },
    kannabis: {
	soil_humidity: {
	    min: 40,
	    max: 80,
	    weight: 1
	},
	air_humidity: {
	    min: 40,
	    max: 80,
	    weight: 0.5
	},
	air_temperature: {
	    min: 15,
	    max: 35,
	    weight: 1
	},
	illuminance: {
	    min: 50,
	    max: 90,
	    weight: 1
	}
    },
};

module.exports.recommendedParameters = recommendedParameters;