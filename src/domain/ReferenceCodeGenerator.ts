/**
 * Interface & Implementation for Reference Code Generation.
 * Adheres to SRP: Solely responsible for minting opaque, non-sequential reference codes.
 */
export interface IReferenceCodeGenerator {
  generate(): string;
}

export class ReferenceCodeGenerator implements IReferenceCodeGenerator {
  private static readonly LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Exclude ambiguous chars like I, O

  public generate(): string {
    const num = Math.floor(1000 + Math.random() * 9000); // 4-digit number between 1000 and 9999
    const letter1 = ReferenceCodeGenerator.LETTERS[Math.floor(Math.random() * ReferenceCodeGenerator.LETTERS.length)];
    const letter2 = ReferenceCodeGenerator.LETTERS[Math.floor(Math.random() * ReferenceCodeGenerator.LETTERS.length)];
    return `CA-${num}-${letter1}${letter2}`;
  }
}
