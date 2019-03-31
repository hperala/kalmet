
/**
 * Constants used with the Language class.
 */
export const languageConstants = {
  STRESS_UNSTRESSED: 0,
  STRESS_MONOSYLLABIC: 1,
  STRESS_MAIN: 2
};

/**
 * A specification of the properties of (a variant of) the Finnish language.
 */
export class Language {
  constructor (vowels, consonants, normalDiphthongs, specialDiphthongs) {
    this._vowels = vowels 
      || ['a', 'e', 'i', 'o', 'u', 'y', 'ä', 'ö'];
    this._consonants = consonants 
      || ['\'', 'b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 
          'v', 'w', 'x', 'z'];
    this._normalDiphthongs = normalDiphthongs 
      || ['ai', 'ei', 'oi', 'ui', 'yi', 'äi', 'öi', 'uo', 'yö'];
    this._specialDiphthongs = specialDiphthongs 
      || ['ie', 'au', 'eu', 'iu', 'ou', 'ey', 'iy', 'äy', 'öy'];
    this._diphthongs = this._normalDiphthongs.concat(this._specialDiphthongs);
    this._longVowels = this._vowels.map(v => v + v);

    // Special meta characters. When an "input" character is encountered, a word boundary is 
    // inserted after it. It may also be replaced by the "display" character in some output 
    // formats (not currently supported).
    this._wordSeparators = [{ input: '+', display: '-' }, { input: '-', display: '-' }];
  }

  isWhitespace(ch) {
    return /\s/.test(ch);
  }

  isConsonant(ch) {
    return this._consonants.indexOf(ch.toLowerCase()) !== -1;
  }

  isVowel(ch) {
    return this._vowels.indexOf(ch.toLowerCase()) !== -1;
  }

  isWordCharacter(ch) {
    return this.isConsonant(ch) || this.isVowel(ch);
  }

  isNormalDiphthong(pair) {
    return this._normalDiphthongs.indexOf(pair.toLowerCase()) !== -1;
  }

  isSpecialDiphthong(pair) {
    return this._specialDiphthongs.indexOf(pair.toLowerCase()) !== -1;
  }

  containsDiphthong(syllable) {
    const syllableLower = syllable.toLowerCase();
    return this._diphthongs.some(d => syllableLower.indexOf(d) !== -1);
  }

  containsLongVowel(syllable) {
    const syllableLower = syllable.toLowerCase();
    return this._longVowels.some(v => syllableLower.indexOf(v) !== -1);
  }

  endsInConsonant(syllable) {
    const syllableLower = syllable.toLowerCase();
    for (var i = syllableLower.length - 1; i >= 0; i--) {
      if (this.isConsonant(syllableLower[i])) {
        return true;
      }
      if (this.isVowel(syllableLower[i])) {
        return false;
      }
    }
    return false;
  }

  /**
   * Checks whether a character corresponds to a word separator. Returns the found separator 
   * object or undefined.
   */
  getWordSeparator(inputChar) {
    return this._wordSeparators.find(separator => separator.input === inputChar);
  }

  hasMainStress(syllables, syllIndex) {
    return this.stressType(syllables, syllIndex) === languageConstants.STRESS_MAIN;
  }

  /**
   * Determines the type of stress a syllable in a word has.
   * 
   * @param {string[]} syllables - syllables of a word
   * @param {number} syllIndex - 0-based index of the syllable
   * @returns {number} a constant such as languageConstants.STRESS_MAIN
   */
  stressType(syllables, syllIndex) {
    if (syllables.length === 0) {
      throw new Error('Invalid parameter');
    }
    if (syllables.length === 1) {
      return languageConstants.STRESS_MONOSYLLABIC;
    }
    if (syllIndex === 0) {
      return languageConstants.STRESS_MAIN;
    }
    return languageConstants.STRESS_UNSTRESSED;
  }
}