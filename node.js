
function fromBase(str, base) {
    if (base <= 10) {
        return parseInt(str, base);
    }
    
    const digits = '0123456789abcdefghijklmnopqrstuvwxyz';
    let result = BigInt(0);
    for (let i = 0; i < str.length; i++) {
        const digit = digits.indexOf(str[i].toLowerCase());
        if (digit === -1 || digit >= base) {
            throw new Error(`Invalid digit for base ${base}`);
        }
        result = result * BigInt(base) + BigInt(digit);
    }
    return result;
}

// Lagrange basis polynomial
function lagrangeBasis(points, j, x) {
    let result = BigInt(1);
    for (let i = 0; i < points.length; i++) {
        if (i !== j) {
            const [xi, _] = points[i];
            const [xj, _] = points[j];
            result *= (x - BigInt(xi)) * modInverse(BigInt(xj) - BigInt(xi), PRIME);
            result %= PRIME;
        }
    }
    return result;
}

// Extended Euclidean Algorithm for modular multiplicative inverse
function extendedGCD(a, b) {
    if (a === BigInt(0)) {
        return [b, BigInt(0), BigInt(1)];
    }
    
    const [gcd, x1, y1] = extendedGCD(b % a, a);
    const x = y1 - (b / a) * x1;
    const y = x1;
    
    return [gcd, x, y];
}

// Calculate modular multiplicative inverse
function modInverse(a, m) {
    a = ((a % m) + m) % m;
    const [gcd, x, _] = extendedGCD(a, m);
    
    if (gcd !== BigInt(1)) {
        throw new Error('Modular inverse does not exist');
    }
    
    return ((x % m) + m) % m;
}

// Large prime number for finite field arithmetic (256-bit prime)
const PRIME = BigInt('115792089237316195423570985008687907853269984665640564039457584007913129639747');

// Main function to reconstruct the secret using Lagrange interpolation
function reconstructSecret(inputData) {
    const { keys: { k }, ...points } = inputData;
    delete points.n;  // Remove n from points
    
    // Convert points to [x, y] pairs and decode y values from their respective bases
    const decodedPoints = Object.entries(points).map(([x, data]) => {
        const y = fromBase(data.value, parseInt(data.base));
        return [parseInt(x), y];
    });
    
    // Need exactly k points for interpolation
    if (decodedPoints.length < k) {
        throw new Error('Not enough points provided');
    }
    
    // Take first k points for interpolation
    const selectedPoints = decodedPoints.slice(0, k);
    
    // Evaluate polynomial at x = 0 to get the constant term (secret)
    let secret = BigInt(0);
    for (let j = 0; j < k; j++) {
        const [_, yj] = selectedPoints[j];
        const basis = lagrangeBasis(selectedPoints, j, BigInt(0));
        secret = (secret + (yj * basis)) % PRIME;
    }
    
    // Ensure positive result
    secret = ((secret % PRIME) + PRIME) % PRIME;
    return secret.toString();
}

// Read and process test cases
const testCase1 = {
    "keys": {
        "n": 4,
        "k": 3
    },
    "1": {
        "base": "10",
        "value": "4"
    },
    "2": {
        "base": "2",
        "value": "111"
    },
    "3": {
        "base": "10",
        "value": "12"
    },
    "6": {
        "base": "4",
        "value": "213"
    }
};

const testCase2 = {
    "keys": {
        "n": 10,
        "k": 7
    },
    "1": {
        "base": "6",
        "value": "13444211440455345511"
    },
    "2": {
        "base": "15",
        "value": "aed7015a346d63"
    },
    "3": {
        "base": "15",
        "value": "6aeeb69631c227c"
    },
    "4": {
        "base": "16",
        "value": "e1b5e05623d881f"
    },
    "5": {
        "base": "8",
        "value": "316034514573652620673"
    },
    "6": {
        "base": "3",
        "value": "2122212201122002221120200210011020220200"
    },
    "7": {
        "base": "3",
        "value": "20120221122211000100210021102001201112121"
    },
    "8": {
        "base": "6",
        "value": "20220554335330240002224253"
    },
    "9": {
        "base": "12",
        "value": "45153788322a1255483"
    },
    "10": {
        "base": "7",
        "value": "1101613130313526312514143"
    }
};

// Process both test cases and output results
console.log("Secret for Test Case 1:", reconstructSecret(testCase1));
console.log("Secret for Test Case 2:", reconstructSecret(testCase2));
