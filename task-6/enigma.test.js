const { Enigma } = require('./enigma');

describe('Enigma Machine', () => {
  // Test case from README
  test('encrypts HELLOWORLD correctly with given settings', () => {
    const enigma = new Enigma(
      [0, 1, 2],  // Rotor IDs
      [0, 0, 0],  // Rotor positions
      [0, 0, 0],  // Ring settings
      [['Q', 'W'], ['E', 'R']]  // Plugboard pairs
    );
    expect(enigma.process('HELLOWORLD')).toBe('VDACACJJRA');
  });

  // Test decryption (should be same as encryption)
  test('decrypts previously encrypted message', () => {
    const enigma = new Enigma(
      [0, 1, 2],
      [0, 0, 0],
      [0, 0, 0],
      [['Q', 'W'], ['E', 'R']]
    );
    const message = 'HELLOWORLD';
    const encrypted = enigma.process(message);
    enigma.reset();
    const decrypted = enigma.process(encrypted);
    expect(decrypted).toBe(message);
  });

  // Test rotor stepping mechanism
  test('rotor stepping mechanism works correctly', () => {
    const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
    // Process enough characters to trigger middle rotor movement
    const result = enigma.process('A'.repeat(26));
    expect(result).not.toBe('A'.repeat(26));
  });

  // Test plugboard swapping
  test('plugboard swaps letters correctly', () => {
    const enigma = new Enigma(
      [0, 1, 2],
      [0, 0, 0],
      [0, 0, 0],
      [['A', 'B']]
    );
    const result = enigma.process('A');
    expect(result).not.toBe(enigma.process('B'));
  });

  // Test non-alphabetic characters
  test('preserves non-alphabetic characters', () => {
    const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
    expect(enigma.process('HELLO, WORLD!')).toMatch(/[A-Z]+, [A-Z]+!/);  
  });

  // Test case sensitivity
  test('handles lowercase input correctly', () => {
    const settings = {
      rotorIds: [0, 1, 2],
      positions: [0, 0, 0],
      rings: [0, 0, 0],
      plugboard: []
    };
    const upperResult = new Enigma(
      settings.rotorIds,
      settings.positions,
      settings.rings,
      settings.plugboard
    ).process('HELLO');
    const lowerResult = new Enigma(
      settings.rotorIds,
      settings.positions,
      settings.rings,
      settings.plugboard
    ).process('hello');
    expect(upperResult).toBe(lowerResult);
  });

  // Test different rotor positions
  test('different rotor positions produce different output', () => {
    const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
    const enigma2 = new Enigma([0, 1, 2], [1, 0, 0], [0, 0, 0], []);
    expect(enigma1.process('HELLO')).not.toBe(enigma2.process('HELLO'));
  });

  // Test ring settings
  test('different ring settings produce different output', () => {
    const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
    const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [1, 0, 0], []);
    expect(enigma1.process('HELLO')).not.toBe(enigma2.process('HELLO'));
  });
});
