# Enigma Machine Bug Fix Documentation

## Bug Description
The original implementation had an incorrect rotor stepping mechanism in the `stepRotors()` method. The bug affected the double-stepping mechanism of the middle rotor, which is a crucial part of the historical Enigma machine's operation.

### Original Code
```javascript
stepRotors() {
    if (this.rotors[2].atNotch()) this.rotors[1].step();
    if (this.rotors[1].atNotch()) this.rotors[0].step();
    this.rotors[2].step();
}
```

### Fixed Code
```javascript
stepRotors() {
    const willMiddleRotorTurn = this.rotors[2].atNotch() || this.rotors[1].atNotch();
    if (this.rotors[1].atNotch()) this.rotors[0].step();
    if (willMiddleRotorTurn) this.rotors[1].step();
    this.rotors[2].step();
}
```

## Explanation of the Fix
1. The middle rotor should step in two cases:
   - When the rightmost rotor (rotor[2]) is at its notch
   - When the middle rotor itself (rotor[1]) is at its notch (double-stepping)
2. The fix implements this by:
   - Checking both conditions before stepping the middle rotor
   - Ensuring the proper order of rotor movements

## Impact
This fix ensures that the Enigma machine's encryption/decryption process matches the historical behavior more accurately, particularly in cases where the double-stepping mechanism comes into play.
