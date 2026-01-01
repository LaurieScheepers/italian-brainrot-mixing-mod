/**
 * MersenneTwister
 * Pseudorandom number generator implementing the Mersenne Twister algorithm.
 *
 * This implementation matches the original from vendor.92a689d9.js:1310-1358
 * to ensure identical output for daily puzzle generation.
 */
export class MersenneTwister {
    constructor(seed) {
        // MT19937 constants
        this.N = 624;
        this.M = 397;
        this.MATRIX_A = 2567483615;
        this.UPPER_MASK = 2147483648;
        this.LOWER_MASK = 2147483647;

        this.mt = new Array(this.N);
        this.mti = this.N + 1;

        if (seed !== undefined) {
            this.init_seed(seed);
        }
    }

    init_seed(seed) {
        this.mt[0] = seed >>> 0;
        for (this.mti = 1; this.mti < this.N; this.mti++) {
            const s = this.mt[this.mti - 1] ^ (this.mt[this.mti - 1] >>> 30);
            this.mt[this.mti] = (((((s & 0xffff0000) >>> 16) * 1812433253) << 16) +
                                (s & 0x0000ffff) * 1812433253) + this.mti;
            this.mt[this.mti] >>>= 0;
        }
    }

    random_int() {
        let y;
        const mag01 = [0, this.MATRIX_A];

        if (this.mti >= this.N) {
            let kk;

            if (this.mti === this.N + 1) {
                this.init_seed(5489);
            }

            for (kk = 0; kk < this.N - this.M; kk++) {
                y = (this.mt[kk] & this.UPPER_MASK) | (this.mt[kk + 1] & this.LOWER_MASK);
                this.mt[kk] = this.mt[kk + this.M] ^ (y >>> 1) ^ mag01[y & 1];
            }

            for (; kk < this.N - 1; kk++) {
                y = (this.mt[kk] & this.UPPER_MASK) | (this.mt[kk + 1] & this.LOWER_MASK);
                this.mt[kk] = this.mt[kk + (this.M - this.N)] ^ (y >>> 1) ^ mag01[y & 1];
            }

            y = (this.mt[this.N - 1] & this.UPPER_MASK) | (this.mt[0] & this.LOWER_MASK);
            this.mt[this.N - 1] = this.mt[this.M - 1] ^ (y >>> 1) ^ mag01[y & 1];

            this.mti = 0;
        }

        y = this.mt[this.mti++];

        // Tempering
        y ^= (y >>> 11);
        y ^= (y << 7) & 2636928640;
        y ^= (y << 15) & 4022730752;
        y ^= (y >>> 18);

        return y >>> 0;
    }

    random_int31() {
        return this.random_int() >>> 1;
    }
}
