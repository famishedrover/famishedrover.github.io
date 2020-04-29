function findDominantColor(hexColors) {
    let colors = [];
    for(let i=0; i<hexColors.length; i++) {
        colors.push(hexToRgb(hexColors[i]))
    }

    let clusters = getClusters(colors, getK(colors.length));

    // find the largest centroid
    let dominantColor = [0, 0, 0];
    let maxClusterSize = 0;
    for(let i=0; i<clusters.length; i++) {
        if(clusters[i].data.length > maxClusterSize) {
            maxClusterSize = clusters[i].data.length;
            dominantColor = clusters[i].mean;
        }
    }
    return rgbToHex(dominantColor);
}

function getK(nColor) {
    if (nColor < 3) {
        return 1;
    }
    if (nColor < 6) {
        return 2;
    }
    if (nColor < 15) {
        return 3;
    }
    if (nColor < 30) {
        return 5;
    }
}


function componentToHex(c) {
    c = Math.floor(c);
    let hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}


function rgbToHex(rgb) {
    let r = rgb[0];
    let g = rgb[1];
    let b = rgb[2];
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}


function hexToRgb(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    let r = parseInt(result[1], 16);
    let g= parseInt(result[2], 16);
    let b = parseInt(result[3], 16);
    return [r, g, b];
}

function getClusters(data, options) {
    let numberOfClusters, distanceFunction, vectorFunction, minMaxValues, maxIterations;

    if (!options || !options.numberOfClusters) { numberOfClusters = getNumberOfClusters(data.length); }
    else { numberOfClusters = options.numberOfClusters; }

    if (!options || !options.distanceFunction) { distanceFunction = getDistance; }
    else { distanceFunction = options.distanceFunction; }

    if (!options || !options.vectorFunction) { vectorFunction = defaultVectorFunction; }
    else { vectorFunction = options.vectorFunction; }

    if (!options || !options.maxIterations) { maxIterations = 50; }
    else { maxIterations = options.maxIterations; }

    let numberOfDimensions = getNumnerOfDimensions(data, vectorFunction);
    minMaxValues = getMinAndMaxValues(data, numberOfDimensions, vectorFunction);
    return getClustersWithParams(data, numberOfDimensions, numberOfClusters, distanceFunction, vectorFunction, minMaxValues, maxIterations).clusters;
}


function getClustersWithParams(data, numberOfDimensions ,numberOfClusters, distanceFunction, vectorFunction, minMaxValues, maxIterations) {
    let means = createRandomMeans(numberOfDimensions, numberOfClusters, minMaxValues);
    let clusters = createClusters(means);
    let prevMeansDistance = 999999;
    let numOfInterations = 0;
    let iterations = [];

    while(numOfInterations < maxIterations) {
        initClustersData(clusters);
        assignDataToClusters(data, clusters, distanceFunction, vectorFunction);
        updateMeans(clusters, vectorFunction);
        let meansDistance = getMeansDistance(clusters, vectorFunction, distanceFunction);
        numOfInterations++;
    }
    return { clusters: clusters, iterations: iterations };
}

function defaultVectorFunction(vector) {
    return vector;
}

function getNumnerOfDimensions(data, vectorFunction) {
    if (data[0]) {
        return vectorFunction(data[0]).length;
    }
    return 0;
}

function getNumberOfClusters(n) {
    return Math.ceil(Math.sqrt(n/2));
}

function getMinAndMaxValues(data, numberOfDimensions, vectorFunction) {
    let minMaxValues = initMinAndMaxValues(numberOfDimensions);
    data.forEach(function (vector) {
        for (let i = 0; i < numberOfDimensions; i++) {
            if (vectorFunction(vector)[i] < minMaxValues.minValue[i]) {
                minMaxValues.minValue[i] = vectorFunction(vector)[i];
            }
            if(vectorFunction(vector)[i] > minMaxValues.maxValue[i]) {
                minMaxValues.maxValue[i] = vectorFunction(vector)[i];
            }
        }
    });
    return minMaxValues;
}


function initMinAndMaxValues(numberOfDimensions) {

    let result = { minValue : [], maxValue : [] };

    for (let i = 0; i < numberOfDimensions; i++) {
        result.minValue.push(9999);
        result.maxValue.push(-9999);
    }

    return result;
}


function printMeans(clusters) {
    let means = '';
    clusters.forEach(function (cluster) {
        means = means + ' [' + cluster.mean + ']'
    });
    console.log(means);
}

function getMeansDistance(clusters, vectorFunction, distanceFunction) {
    let meansDistance = 0;
    clusters.forEach(function (cluster) {
        cluster.data.forEach(function (vector) {
            meansDistance = meansDistance + Math.pow(distanceFunction(cluster.mean, vectorFunction(vector)), 2);
        });
    });
    return meansDistance;
}

function updateMeans(clusters, vectorFunction) {
    clusters.forEach(function (cluster) {
        updateMean(cluster, vectorFunction);
    });
}


function updateMean(cluster, vectorFunction) {
    let newMean = [];
    for (let i = 0; i < cluster.mean.length; i++) {
        newMean.push(getMean(cluster.data, i, vectorFunction));
    }
    cluster.mean = newMean;
}

function getMean(data, index, vectorFunction) {
    let sum =  0;
    let total = data.length;

    if(total == 0) return 0;

    data.forEach(function (vector) {

        sum = sum + vectorFunction(vector)[index];
    });
    return sum / total;
}

function assignDataToClusters(data, clusters, distanceFunction, vectorFunction) {
    data.forEach(function (vector) {
        let cluster = findClosestCluster(vectorFunction(vector), clusters, distanceFunction);

        if(!cluster.data) cluster.data = [];

        cluster.data.push(vector);
    });
}


function findClosestCluster(vector, clusters, distanceFunction) {
    let closest = {};
    let minDistance = 9999999;

    clusters.forEach(function (cluster) {
        let distance = distanceFunction(cluster.mean, vector);
        if (distance < minDistance) {
            minDistance = distance;
            closest = cluster;
        }
    });

    return closest;
}

function initClustersData(clusters) {
    clusters.forEach(function (cluster) {
        cluster.data = [];
    });
}

function createClusters(means) {
    let clusters = [];
    means.forEach(function (mean) {
        let cluster = { mean : mean, data : []};
        clusters.push(cluster);
    });
    return clusters;
}

function createRandomMeans(numberOfDimensions, numberOfClusters, minMaxValues) {
    let means = [];
    for(let i = 0; i < numberOfClusters; i++) {
        means.push(createRandomPoint(numberOfDimensions, minMaxValues.minValue[i], minMaxValues.maxValue[i]));
    }
    return means;
}

function createRandomPoint(numberOfDimensions, minValue, maxValue) {
    let point = [];
    for (let i = 0; i < numberOfDimensions; i++) {
        point.push(random(minValue, maxValue));
    }
    return point;
}

function random (low, high) {
    return Math.random() * (high - low) + low;
}

function getDistance(vector1, vector2) {
    let sum = 0;
    for (let i = 0; i < vector1.length; i++) {
        sum = sum + Math.pow(vector1[i] - vector2[i],2)
    }
    return Math.sqrt(sum);
}