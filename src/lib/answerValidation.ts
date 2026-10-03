/**
 * Answer Validation Engine for Tenali Rama's Riddle Quest
 * Handles robust multi-lingual (Telugu & English) answer checking,
 * Unicode normalization, whitespace collapsing, punctuation tolerance,
 * canonicalAnswer support, and acceptedAnswers list matching.
 */

import type { Riddle } from './riddlesDatabase';

// Telugu Unicode block range: U+0C00 - U+0C7F
const TELUGU_REGEX = /[\u0C00-\u0C7F]/;

// Devanagari / Hindi Unicode block range: U+0900 - U+097F
const HINDI_REGEX = /[\u0900-\u097F]/;

/**
 * Normalizes text by:
 * 1. Canonical Unicode Normalization (NFKC)
 * 2. Stripping invisible zero-width characters (ZWNJ, ZWJ, BOM, soft hyphen)
 * 3. Lowercasing English letters (Unicode-aware)
 * 4. Standardizing quotes and apostrophes
 * 5. Standardizing dashes and hyphens
 * 6. Converting ampersand to 'and'
 * 7. Stripping leading and trailing punctuation & symbols (. , ! ? : ; " ' etc.)
 * 8. Collapsing all multiple whitespaces (including non-breaking spaces) into a single space
 * 9. Trimming leading and trailing whitespace
 */
export function normalizeText(text: string): string {
  if (!text || typeof text !== 'string') return '';

  return (
    text
      // 1. Canonical Unicode Normalization (NFKC)
      .normalize('NFKC')
      // 2. Strip invisible characters:
      // \u200B: Zero-width space
      // \u200C: Zero-width non-joiner (ZWNJ - common in Telugu mobile keyboards)
      // \u200D: Zero-width joiner (ZWJ)
      // \u200E, \u200F: Left-to-Right / Right-to-Left marks
      // \uFEFF: Zero-width no-break space / BOM
      // \u00AD: Soft hyphen
      .replace(/[\u200B-\u200F\uFEFF\u00AD]/g, '')
      // 3. Lowercase English characters (Unicode-aware)
      .toLowerCase()
      // 4. Standardize apostrophes and quotes
      .replace(/[‘’‛`]/g, "'")
      .replace(/[“”‟]/g, '"')
      // 5. Standardize dashes and hyphens
      .replace(/[\u2010-\u2015\u2212_]/g, '-')
      // 6. Standardize ampersand to 'and'
      .replace(/&/g, ' and ')
      // 7. Strip leading and trailing punctuation & symbols
      .replace(/^[\s.,!?:;'"()\[\]{}<>/\\~`*#@+=|-]+|[\s.,!?:;'"()\[\]{}<>/\\~`*#@+=|-]+$/g, '')
      // 8. Collapse all internal multiple whitespaces (including non-breaking spaces \u00A0) into a single space
      .replace(/[\s\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]+/g, ' ')
      .trim()
  );
}

/**
 * Strips common English conversational leading phrases and articles
 * e.g., "it is a mirror" -> "mirror", "the sun" -> "sun", "an egg" -> "egg"
 */
export function stripEnglishArticlesAndFillers(text: string): string {
  if (!text) return '';
  return text
    .replace(/^(it is|it's|its|the answer is|answer is|this is|i think it is)\s+/i, '')
    .replace(/^(a|an|the)\s+/i, '')
    .trim();
}

/**
 * Strips conjunctions like 'and'/'or' for flexible compound phrase matching
 * e.g., "sun and moon" -> "sun moon"
 */
export function stripConjunctions(text: string): string {
  if (!text) return '';
  return text.replace(/\b(and|or)\b/gi, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Normalizes Telugu words for interchangeable noun endings and spacing:
 * In Telugu grammar, "-ము" (mu) and "-ం" (anusvara/sunna) are fully equivalent noun endings:
 * e.g., మేఘము = మేఘం, జ్ఞానము = జ్ఞానం, సమయము = సమయం, కాలము = కాలం, మోక్షము = మోక్షం
 */
export function getTeluguVariants(text: string): string[] {
  const variants = new Set<string>();
  variants.add(text);

  // Variant without any spaces (handles compound words like తాళం చెవి vs తాళంచెవి)
  const noSpaces = text.replace(/[\s\-]+/g, '');
  variants.add(noSpaces);

  // Also variant replacing hyphens with space
  const spaceHyphen = text.replace(/-/g, ' ');
  variants.add(spaceHyphen);

  // Anusvara (-ం) vs Makaram (-ము) noun endings
  for (const t of [text, noSpaces, spaceHyphen]) {
    if (t.endsWith('ం')) {
      variants.add(t.slice(0, -1) + 'ము');
    } else if (t.endsWith('ము')) {
      variants.add(t.slice(0, -2) + 'ం');
    }
  }

  return Array.from(variants);
}

/**
 * Normalizes Hindi text:
 * - Interchangeable Anusvara (ं \u0902) and Chandrabindu (ँ \u0901)
 * - Nukta normalization (क़->क, ख़->ख, ग़->ग, ज़->ज, ड़->ड, ढ़->ढ, फ़->फ)
 * - Strip spaces and hyphens for compound words
 */
export function getHindiVariants(text: string): string[] {
  const variants = new Set<string>();
  variants.add(text);

  // 1. Chandrabindu <-> Anusvara
  // e.g. चाँद <-> चांद, आँखें <-> आंखें, मुँह <-> मुंह
  const anusvara = text.replace(/\u0901/g, '\u0902');
  const chandrabindu = text.replace(/\u0902/g, '\u0901');
  variants.add(anusvara);
  variants.add(chandrabindu);

  // 2. Nukta stripping
  // e.g. बर्फ़ <-> बर्फ, क़ैंची <-> कैंची, काग़ज़ <-> कागज
  const noNukta = text
    .replace(/\u093C/g, '')
    .replace(/क़/g, 'क')
    .replace(/ख़/g, 'ख')
    .replace(/ग़/g, 'ग')
    .replace(/ज़/g, 'ज')
    .replace(/ड़/g, 'ड')
    .replace(/ढ़/g, 'ढ')
    .replace(/फ़/g, 'फ');
  variants.add(noNukta);

  // 3. Variant without spaces or hyphens
  const noSpaces = text.replace(/[\s\-]+/g, '');
  variants.add(noSpaces);

  return Array.from(variants);
}

/**
 * Strips common Hindi conversational leading and trailing phrases
 * e.g., "यह बादल है" -> "बादल", "उत्तर है: सूरज" -> "सूरज"
 */
export function stripHindiFillers(text: string): string {
  if (!text) return '';
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^(यह|वह|एक|उत्तर है|जवाब है|सही उत्तर है|उत्तर|जवाब)[:\s\-]+/gi, '').trim();
  cleaned = cleaned.replace(/^(यह|वह|एक)[:\s\-]+/gi, '').trim();
  cleaned = cleaned.replace(/\s+(है|था|थी|थे)$/gi, '').trim();
  return cleaned;
}

/**
 * Strips hyphens, punctuation and spaces for punctuation-invariant comparison
 * e.g., "self-knowledge" -> "selfknowledge", "non-violence" -> "nonviolence", "sun, moon" -> "sunmoon"
 */
export function stripHyphensAndPunctuation(text: string): string {
  return text.replace(/[\-\s.,\/\\'"!?:;()\[\]{}]/g, '');
}

/**
 * Gets the combined list of accepted answers for a riddle,
 * supporting `riddle.canonicalAnswer` (en, te, hi), `riddle.hindi`, `riddle.telugu`, `riddle.english`,
 * `riddle.acceptedAnswers`, and `riddle.answer`.
 */
export function getAcceptedAnswers(
  riddle:
    | {
        answer?: string[];
        acceptedAnswers?: string[];
        canonicalAnswer?: { en: string; te: string; hi?: string } | string;
        hindi?: { answer?: string; acceptedAnswers?: string[] };
        telugu?: { answer?: string; acceptedAnswers?: string[] };
        english?: { answer?: string; acceptedAnswers?: string[] };
      }
    | string[]
): string[] {
  if (Array.isArray(riddle)) {
    return Array.from(new Set(riddle.map(a => a.trim()).filter(Boolean)));
  }

  const canonicalList: string[] = [];
  if (riddle.canonicalAnswer) {
    if (typeof riddle.canonicalAnswer === 'string') {
      canonicalList.push(riddle.canonicalAnswer);
    } else {
      if (riddle.canonicalAnswer.en) canonicalList.push(riddle.canonicalAnswer.en);
      if (riddle.canonicalAnswer.te) canonicalList.push(riddle.canonicalAnswer.te);
      if (riddle.canonicalAnswer.hi) canonicalList.push(riddle.canonicalAnswer.hi);
    }
  }

  if (riddle.hindi) {
    if (riddle.hindi.answer) canonicalList.push(riddle.hindi.answer);
    if (riddle.hindi.acceptedAnswers) canonicalList.push(...riddle.hindi.acceptedAnswers);
  }
  if (riddle.telugu) {
    if (riddle.telugu.answer) canonicalList.push(riddle.telugu.answer);
    if (riddle.telugu.acceptedAnswers) canonicalList.push(...riddle.telugu.acceptedAnswers);
  }
  if (riddle.english) {
    if (riddle.english.answer) canonicalList.push(riddle.english.answer);
    if (riddle.english.acceptedAnswers) canonicalList.push(...riddle.english.acceptedAnswers);
  }

  const combined = [
    ...canonicalList,
    ...(riddle.acceptedAnswers || []),
    ...(riddle.answer || []),
  ];
  return Array.from(new Set(combined.map(a => a.trim()).filter(Boolean)));
}

export interface ValidationResult {
  isCorrect: boolean;
  matchedAnswer?: string;
  normalizedUserAnswer: string;
  expectedAnswers: string[];
}

/**
 * Core validation function.
 * Matches the user's typed answer against the list of accepted answers
 * using robust normalization without loose substring matching that causes false positives.
 */
export function validateAnswer(
  userAnswer: string,
  riddleOrAnswers:
    | Riddle
    | {
        answer?: string[];
        acceptedAnswers?: string[];
        canonicalAnswer?: { en: string; te: string } | string;
      }
    | string[],
  levelId?: number
): ValidationResult {
  const rawInput = userAnswer || '';
  const normalizedUser = normalizeText(rawInput);
  const userStripped = stripEnglishArticlesAndFillers(normalizedUser);
  const userNoPunct = stripHyphensAndPunctuation(normalizedUser);
  const userStrippedNoPunct = stripHyphensAndPunctuation(userStripped);

  const accepted = getAcceptedAnswers(riddleOrAnswers);

  let isCorrect = false;
  let matchedAnswer: string | undefined = undefined;

  for (const target of accepted) {
    const normalizedTarget = normalizeText(target);
    if (!normalizedTarget) continue;

    const targetStripped = stripEnglishArticlesAndFillers(normalizedTarget);
    const targetNoPunct = stripHyphensAndPunctuation(normalizedTarget);
    const targetStrippedNoPunct = stripHyphensAndPunctuation(targetStripped);

    // 1. Direct normalized match (e.g. "Tenali Rama" == "tenali rama" == "Tenali  Rama")
    // or with leading articles/fillers stripped in either direction
    if (
      normalizedUser === normalizedTarget ||
      userStripped === targetStripped ||
      userStripped === normalizedTarget ||
      normalizedUser === targetStripped
    ) {
      isCorrect = true;
      matchedAnswer = target;
      break;
    }

    // 2. Singular / Plural English match (e.g. "cloud" vs "clouds")
    if (
      (userStripped.length >= 4 && targetStripped.length >= 4) &&
      (userStripped + 's' === targetStripped ||
        targetStripped + 's' === userStripped ||
        userStripped + 'es' === targetStripped ||
        targetStripped + 'es' === userStripped)
    ) {
      isCorrect = true;
      matchedAnswer = target;
      break;
    }

    // 3. Hyphen / Punctuation / Space invariant match (e.g. "self-knowledge" == "self knowledge" == "selfknowledge")
    if (
      userNoPunct.length >= 2 &&
      (userNoPunct === targetNoPunct ||
        userStrippedNoPunct === targetStrippedNoPunct ||
        userNoPunct === targetStrippedNoPunct ||
        userStrippedNoPunct === targetNoPunct)
    ) {
      isCorrect = true;
      matchedAnswer = target;
      break;
    }

    // 4. Conjunction-invariant match for compound answers (e.g. "sun and moon" == "sun & moon" == "sun, moon" == "sun moon")
    const userNoConj = stripHyphensAndPunctuation(stripConjunctions(userStripped));
    const targetNoConj = stripHyphensAndPunctuation(stripConjunctions(targetStripped));
    if (
      userNoConj.length >= 3 &&
      (userNoConj === targetNoConj ||
        userNoPunct === targetNoConj ||
        userNoConj === targetNoPunct)
    ) {
      isCorrect = true;
      matchedAnswer = target;
      break;
    }

    // 5. Telugu-specific normalization (handles ZWNJ, spacing in compounds, -ం vs -ము)
    if (TELUGU_REGEX.test(normalizedUser) || TELUGU_REGEX.test(normalizedTarget)) {
      const userTeluguVariants = getTeluguVariants(normalizedUser);
      const targetTeluguVariants = getTeluguVariants(normalizedTarget);

      const hasTeluguMatch = userTeluguVariants.some(uVar =>
        targetTeluguVariants.some(tVar => uVar === tVar)
      );

      if (hasTeluguMatch) {
        isCorrect = true;
        matchedAnswer = target;
        break;
      }
    }

    // 6. Hindi-specific normalization (handles Chandrabindu vs Anusvara, Nuktas, compound spacing)
    if (HINDI_REGEX.test(normalizedUser) || HINDI_REGEX.test(normalizedTarget)) {
      const userHindiBase = stripHindiFillers(normalizedUser);
      const userHindiVariants = getHindiVariants(userHindiBase);
      const targetHindiVariants = getHindiVariants(normalizedTarget);

      const hasHindiMatch = userHindiVariants.some(uVar =>
        targetHindiVariants.some(tVar => uVar === tVar || stripHyphensAndPunctuation(uVar) === stripHyphensAndPunctuation(tVar))
      );

      if (hasHindiMatch) {
        isCorrect = true;
        matchedAnswer = target;
        break;
      }
    }
  }

  // Development-only structured debug logging
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV) {
    console.group(`[Answer Validation] Level: ${levelId ?? 'N/A'}`);
    console.log('User Answer:', rawInput);
    console.log('Normalized User Answer:', normalizedUser);
    console.log('Expected Answer(s):', accepted);
    console.log('Validation Result:', isCorrect ? 'PASS' : 'FAIL');
    if (matchedAnswer) {
      console.log('Matched On:', matchedAnswer);
    }
    console.groupEnd();
  }

  return {
    isCorrect,
    matchedAnswer,
    normalizedUserAnswer: normalizedUser,
    expectedAnswers: accepted,
  };
}

/**
 * Validate multiple-choice question by unique ID and option ID.
 */
export function validateOption(
  question: { id: number; correctOptionId?: string | number },
  selectedOptionId: string | number
): boolean {
  if (question.correctOptionId === undefined || selectedOptionId === undefined) {
    return false;
  }
  return String(question.correctOptionId) === String(selectedOptionId);
}
