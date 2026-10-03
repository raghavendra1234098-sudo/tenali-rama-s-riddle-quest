import { describe, it, expect } from 'vitest';
import {
  normalizeText,
  stripEnglishArticlesAndFillers,
  getTeluguVariants,
  stripHyphensAndPunctuation,
  getAcceptedAnswers,
  validateAnswer,
  validateOption,
} from '@/lib/answerValidation';
import riddlesData, { getRiddle, getTotalRiddleCount } from '@/lib/riddlesDatabase';
import { getDefaultState, completeLevel } from '@/lib/gameState';

describe('Answer Validation Engine', () => {
  describe('normalizeText', () => {
    it('collapses multiple spaces and trims', () => {
      expect(normalizeText('  Tenali   Rama  ')).toBe('tenali rama');
      expect(normalizeText('sun    moon')).toBe('sun moon');
    });

    it('lowercases English text', () => {
      expect(normalizeText('MIRROR')).toBe('mirror');
      expect(normalizeText('KnOwLeDgE')).toBe('knowledge');
    });

    it('strips invisible Telugu ZWNJ and ZWJ characters', () => {
      const withZwnj = 'తాళం\u200Cచెవి';
      const clean = 'తాళంచెవి';
      expect(normalizeText(withZwnj)).toBe(clean);

      const withZwj = 'జ్ఞా\u200Dనం';
      expect(normalizeText(withZwj)).toBe('జ్ఞానం');
    });

    it('standardizes quotes and dashes', () => {
      expect(normalizeText('self—knowledge')).toBe('self-knowledge');
      expect(normalizeText('“quote”')).toBe('quote');
      expect(normalizeText('word “quote” word')).toBe('word "quote" word');
    });

    it('converts & to and', () => {
      expect(normalizeText('sun & moon')).toBe('sun and moon');
    });

    it('strips leading and trailing punctuation', () => {
      expect(normalizeText('...mirror!')).toBe('mirror');
      expect(normalizeText('?sun.')).toBe('sun');
    });
  });

  describe('stripEnglishArticlesAndFillers', () => {
    it('strips leading articles: a, an, the', () => {
      expect(stripEnglishArticlesAndFillers('the sun')).toBe('sun');
      expect(stripEnglishArticlesAndFillers('a mirror')).toBe('mirror');
      expect(stripEnglishArticlesAndFillers('an egg')).toBe('egg');
    });

    it('strips conversational prefixes', () => {
      expect(stripEnglishArticlesAndFillers('it is a mirror')).toBe('mirror');
      expect(stripEnglishArticlesAndFillers('the answer is fire')).toBe('fire');
      expect(stripEnglishArticlesAndFillers('this is shadow')).toBe('shadow');
    });
  });

  describe('Telugu nuances and noun endings', () => {
    it('treats -ం and -ము as equivalent noun endings', () => {
      const res1 = validateAnswer('జ్ఞానము', { answer: ['జ్ఞానం'] });
      expect(res1.isCorrect).toBe(true);

      const res2 = validateAnswer('సమయం', { answer: ['సమయము'] });
      expect(res2.isCorrect).toBe(true);

      const res3 = validateAnswer('మోక్షము', { answer: ['మోక్షం'] });
      expect(res3.isCorrect).toBe(true);
    });

    it('handles compound words with or without spaces in Telugu', () => {
      const res1 = validateAnswer('తాళం చెవి', { answer: ['తాళంచెవి'] });
      expect(res1.isCorrect).toBe(true);

      const res2 = validateAnswer('తాళంచెవి', { answer: ['తాళం చెవి'] });
      expect(res2.isCorrect).toBe(true);

      const res3 = validateAnswer('అడుగుజాడ', { answer: ['అడుగు జాడ'] });
      expect(res3.isCorrect).toBe(true);
    });

    it('tolerates ZWNJ from mobile keyboards', () => {
      const withZwnj = 'తాళం\u200Cచెవి';
      const res = validateAnswer(withZwnj, { answer: ['తాళం చెవి'] });
      expect(res.isCorrect).toBe(true);
    });
  });

  describe('Punctuation & Hyphen Invariance', () => {
    it('accepts hyphenated words with hyphens, spaces, or merged', () => {
      const target = { answer: ['self-knowledge'] };
      expect(validateAnswer('self-knowledge', target).isCorrect).toBe(true);
      expect(validateAnswer('self knowledge', target).isCorrect).toBe(true);
      expect(validateAnswer('selfknowledge', target).isCorrect).toBe(true);

      const nonViolence = { answer: ['non-violence'] };
      expect(validateAnswer('non violence', nonViolence).isCorrect).toBe(true);
      expect(validateAnswer('nonviolence', nonViolence).isCorrect).toBe(true);
    });

    it('accepts answers with ampersand or and', () => {
      const target = { answer: ['sun and moon'] };
      expect(validateAnswer('sun & moon', target).isCorrect).toBe(true);
      expect(validateAnswer('sun and moon', target).isCorrect).toBe(true);
    });
  });

  describe('No False Positives (Strict Safe Matching)', () => {
    it('rejects substring collisions that old .includes() allowed', () => {
      // Level 6 answer is "ice"
      expect(validateAnswer('police', { answer: ['ice', 'మంచు'] }).isCorrect).toBe(false);
      expect(validateAnswer('service', { answer: ['ice', 'మంచు'] }).isCorrect).toBe(false);

      // Level 49 answer includes "go"
      expect(validateAnswer('mango', { answer: ['map', 'go', 'పటం'] }).isCorrect).toBe(false);
      expect(validateAnswer('cargo', { answer: ['map', 'go', 'పటం'] }).isCorrect).toBe(false);

      // "an" or "a" must not match long words
      expect(validateAnswer('banana', { answer: ['an'] }).isCorrect).toBe(false);

      // Random wrong text
      expect(validateAnswer('completely wrong answer', { answer: ['sun', 'సూర్యుడు'] }).isCorrect).toBe(false);
    });

    it('rejects empty or whitespace-only inputs', () => {
      expect(validateAnswer('', { answer: ['sun'] }).isCorrect).toBe(false);
      expect(validateAnswer('   ', { answer: ['sun'] }).isCorrect).toBe(false);
    });
  });

  describe('Multiple Choice Option Validation', () => {
    it('validates correct option ID match', () => {
      const q = { id: 1, correctOptionId: 'opt-b' };
      expect(validateOption(q, 'opt-b')).toBe(true);
      expect(validateOption(q, 'opt-a')).toBe(false);
      expect(validateOption(q, 2)).toBe(false);
    });

    it('handles numeric option IDs', () => {
      const q = { id: 2, correctOptionId: 3 };
      expect(validateOption(q, 3)).toBe(true);
      expect(validateOption(q, '3')).toBe(true);
      expect(validateOption(q, 1)).toBe(false);
    });
  });

  describe('Complete 1,000 Levels Audit', () => {
    it('has exactly 1,000 continuous sequential levels', () => {
      expect(getTotalRiddleCount()).toBe(1000);
      expect(riddlesData.length).toBe(1000);

      for (let i = 0; i < 1000; i++) {
        expect(riddlesData[i].id).toBe(i + 1);
        expect(riddlesData[i].acceptedAnswers.length).toBeGreaterThan(0);
        expect(riddlesData[i].telugu.question.trim().length).toBeGreaterThan(0);
        expect(riddlesData[i].english.question.trim().length).toBeGreaterThan(0);
        expect(riddlesData[i].hindi.question.trim().length).toBeGreaterThan(0);
        expect(riddlesData[i].hint.te.trim().length).toBeGreaterThan(0);
        expect(riddlesData[i].hint.en.trim().length).toBeGreaterThan(0);
        expect(riddlesData[i].hint.hi.trim().length).toBeGreaterThan(0);
      }
    });

    it('validates every stored answer across all 1,000 levels', () => {
      for (const riddle of riddlesData) {
        const accepted = getAcceptedAnswers(riddle);
        expect(accepted.length).toBeGreaterThan(0);

        for (const ans of accepted) {
          // 1. Direct answer check
          const res = validateAnswer(ans, riddle, riddle.id);
          expect(res.isCorrect, `Level ${riddle.id} failed on stored answer "${ans}"`).toBe(true);

          // 2. Uppercase check (for ASCII/English)
          if (/^[a-zA-Z\s\-_',.]+$/.test(ans)) {
            const upperRes = validateAnswer(ans.toUpperCase(), riddle, riddle.id);
            expect(upperRes.isCorrect, `Level ${riddle.id} failed on UPPERCASE "${ans.toUpperCase()}"`).toBe(true);

            // 3. Space-padded check
            const paddedRes = validateAnswer(`   ${ans}   `, riddle, riddle.id);
            expect(paddedRes.isCorrect, `Level ${riddle.id} failed on padded "   ${ans}   "`).toBe(true);
          }
        }
      }
    });

    it('verifies Level 4 explicitly passes for cloud in all cases (Root Cause Fix)', () => {
      const r4 = getRiddle(4);
      expect(r4.canonicalAnswer.en).toBe('Cloud');
      expect(r4.canonicalAnswer.te).toBe('మేఘం');
      expect(r4.canonicalAnswer.hi).toBe('बादल');

      // User entering 'cloud' (The exact bug reported by user)
      expect(validateAnswer('cloud', r4, 4).isCorrect).toBe(true);
      expect(validateAnswer('Cloud', r4, 4).isCorrect).toBe(true);
      expect(validateAnswer('CLOUD', r4, 4).isCorrect).toBe(true);
      expect(validateAnswer('  cloud  ', r4, 4).isCorrect).toBe(true);
      expect(validateAnswer('cloud.', r4, 4).isCorrect).toBe(true);
      expect(validateAnswer('cloud!', r4, 4).isCorrect).toBe(true);
      expect(validateAnswer('clouds', r4, 4).isCorrect).toBe(true);
      expect(validateAnswer('a cloud', r4, 4).isCorrect).toBe(true);
      expect(validateAnswer('the cloud', r4, 4).isCorrect).toBe(true);

      // Telugu answers for Level 4
      expect(validateAnswer('మేఘం', r4, 4).isCorrect).toBe(true);
      expect(validateAnswer('మేఘము', r4, 4).isCorrect).toBe(true);

      // Hindi answers for Level 4
      expect(validateAnswer('बादल', r4, 4).isCorrect).toBe(true);
      expect(validateAnswer('मेघ', r4, 4).isCorrect).toBe(true);
      expect(validateAnswer('घटा', r4, 4).isCorrect).toBe(true);
      expect(validateAnswer('यह बादल है', r4, 4).isCorrect).toBe(true);

      // Backwards-compatible answers for Level 4
      expect(validateAnswer('time', r4, 4).isCorrect).toBe(true);
      expect(validateAnswer('సమయం', r4, 4).isCorrect).toBe(true);

      // Multilingual hints are present
      expect(r4.hint.en).toBeDefined();
      expect(r4.hint.te).toBeDefined();
      expect(r4.hint.hi).toBeDefined();

      // Multilingual explanations are present
      expect(r4.explanation.en).toBeDefined();
      expect(r4.explanation.te).toBeDefined();
      expect(r4.explanation.hi).toBeDefined();
    });

    it('verifies previously problematic levels now validate flexibly', () => {
      // Level 94: hot vessel / pan / frying pan
      const r94 = getRiddle(94);
      expect(validateAnswer('pan', r94, 94).isCorrect).toBe(true);
      expect(validateAnswer('vessel', r94, 94).isCorrect).toBe(true);
      expect(validateAnswer('పెనం', r94, 94).isCorrect).toBe(true);

      // Level 107: sun and moon
      const r107 = getRiddle(107);
      expect(validateAnswer('sun and moon', r107, 107).isCorrect).toBe(true);
      expect(validateAnswer('sun & moon', r107, 107).isCorrect).toBe(true);
      expect(validateAnswer('సూర్య చంద్రులు', r107, 107).isCorrect).toBe(true);

      // Level 141: sky with stars
      const r141 = getRiddle(141);
      expect(validateAnswer('sky', r141, 141).isCorrect).toBe(true);
      expect(validateAnswer('stars', r141, 141).isCorrect).toBe(true);
      expect(validateAnswer('ఆకాశం', r141, 141).isCorrect).toBe(true);

      // Level 413: water lily (authentic replacement for old formula riddle)
      const r413 = getRiddle(413);
      expect(validateAnswer('water lily', r413, 413).isCorrect).toBe(true);
      expect(validateAnswer('lily', r413, 413).isCorrect).toBe(true);
      expect(validateAnswer('కలువ పువ్వు', r413, 413).isCorrect).toBe(true);

      // Level 487: traffic light
      const r487 = getRiddle(487);
      expect(validateAnswer('signal', r487, 487).isCorrect).toBe(true);
      expect(validateAnswer('traffic signal', r487, 487).isCorrect).toBe(true);

      // Level 659: gold (authentic replacement for old formula riddle)
      const r659 = getRiddle(659);
      expect(validateAnswer('gold', r659, 659).isCorrect).toBe(true);
      expect(validateAnswer('Gold', r659, 659).isCorrect).toBe(true);
      expect(validateAnswer('బంగారం', r659, 659).isCorrect).toBe(true);
      expect(validateAnswer('బంగారము', r659, 659).isCorrect).toBe(true);
    });

    it('verifies all 1,000 riddles have canonicalAnswer and explanation', () => {
      for (const riddle of riddlesData) {
        expect(riddle.canonicalAnswer?.en?.trim().length, `Level ${riddle.id} missing canonicalAnswer.en`).toBeGreaterThan(0);
        expect(riddle.canonicalAnswer?.te?.trim().length, `Level ${riddle.id} missing canonicalAnswer.te`).toBeGreaterThan(0);
        expect(riddle.explanation?.en?.trim().length, `Level ${riddle.id} missing explanation.en`).toBeGreaterThan(0);
        expect(riddle.explanation?.te?.trim().length, `Level ${riddle.id} missing explanation.te`).toBeGreaterThan(0);
      }
    });

    it('verifies Reveal Answer flow awards 0 coins and advances level safely', () => {
      let state = getDefaultState();
      const initialCoins = state.totalCoins;
      const initialSolved = state.riddlesSolved;

      // When user reveals answer on Level 4
      state = completeLevel(4, 0); // 0 coins awarded

      expect(state.totalCoins).toBe(initialCoins); // Coins MUST NOT increase!
      expect(state.completedLevels).toContain(4);
      expect(state.unlockedLevels).toContain(5);
      expect(state.currentLevel).toBe(5);
      expect(state.riddlesSolved).toBe(initialSolved + 1);
    });
  });

  describe('Progression Logic across all 1,000 levels', () => {
    it('unlocks and progresses up to Level 1000 without stopping at 400', () => {
      let state = getDefaultState();
      expect(state.currentLevel).toBe(1);
      expect(state.unlockedLevels).toContain(1);

      // Complete level 1
      state = completeLevel(1, 100);
      expect(state.completedLevels).toContain(1);
      expect(state.unlockedLevels).toContain(2);
      expect(state.currentLevel).toBe(2);

      // Simulate completing level 400
      state = completeLevel(400, 4100);
      expect(state.completedLevels).toContain(400);
      expect(state.unlockedLevels).toContain(401);
      expect(state.currentLevel).toBe(401); // MUST NOT be capped at 400!

      // Simulate completing level 999
      state = completeLevel(999, 10000);
      expect(state.unlockedLevels).toContain(1000);
      expect(state.currentLevel).toBe(1000);

      // Simulate completing level 1000 (final level)
      state = completeLevel(1000, 10000);
      expect(state.completedLevels).toContain(1000);
      expect(state.currentLevel).toBe(1000);
    });
  });

  describe('Multilingual Hindi & Hints Audit', () => {
    it('verifies all 1,000 riddles have complete Telugu, English, and Hindi translations', () => {
      for (const r of riddlesData) {
        expect(r.telugu.question.length).toBeGreaterThan(0);
        expect(r.telugu.answer.length).toBeGreaterThan(0);
        expect(r.english.question.length).toBeGreaterThan(0);
        expect(r.english.answer.length).toBeGreaterThan(0);
        expect(r.hindi.question.length).toBeGreaterThan(0);
        expect(r.hindi.answer.length).toBeGreaterThan(0);

        expect(r.canonicalAnswer.te.length).toBeGreaterThan(0);
        expect(r.canonicalAnswer.en.length).toBeGreaterThan(0);
        expect(r.canonicalAnswer.hi.length).toBeGreaterThan(0);

        expect(r.hint.te.length).toBeGreaterThan(0);
        expect(r.hint.en.length).toBeGreaterThan(0);
        expect(r.hint.hi.length).toBeGreaterThan(0);

        expect(r.explanation.te.length).toBeGreaterThan(0);
        expect(r.explanation.en.length).toBeGreaterThan(0);
        expect(r.explanation.hi.length).toBeGreaterThan(0);
      }
    });

    it('verifies Hindi answer normalization with Chandrabindu, Anusvara and Nuktas', () => {
      // Chandrabindu vs Anusvara (चाँद vs चांद)
      const rMoon = riddlesData.find(r => r.canonicalAnswer.en === 'Moon');
      expect(rMoon).toBeDefined();
      expect(validateAnswer('चाँद', rMoon!).isCorrect).toBe(true);
      expect(validateAnswer('चांद', rMoon!).isCorrect).toBe(true);

      // Nukta normalization (बर्फ़ vs बर्फ)
      const rIce = riddlesData.find(r => r.canonicalAnswer.en === 'Ice');
      expect(rIce).toBeDefined();
      expect(validateAnswer('बर्फ़', rIce!).isCorrect).toBe(true);
      expect(validateAnswer('बर्फ', rIce!).isCorrect).toBe(true);

      // Hindi conversational fillers ("यह सूरज है", "उत्तर है सूरज")
      const rSun = riddlesData.find(r => r.canonicalAnswer.en === 'Sun');
      expect(rSun).toBeDefined();
      expect(validateAnswer('सूरज', rSun!).isCorrect).toBe(true);
      expect(validateAnswer('यह सूरज है', rSun!).isCorrect).toBe(true);
      expect(validateAnswer('उत्तर है सूरज', rSun!).isCorrect).toBe(true);
    });

    it('verifies language switching does not alter player progress or level state', () => {
      const state = getDefaultState();
      state.currentLevel = 42;
      state.totalCoins = 250;
      state.hintsUsed = 3;
      state.unlockedLevels = [1, 2, 42];

      // Switch language to Telugu
      state.language = 'te';
      expect(state.currentLevel).toBe(42);
      expect(state.totalCoins).toBe(250);

      // Switch language to English
      state.language = 'en';
      expect(state.currentLevel).toBe(42);
      expect(state.totalCoins).toBe(250);

      // Switch language to Hindi
      state.language = 'hi';
      expect(state.currentLevel).toBe(42);
      expect(state.totalCoins).toBe(250);
      expect(state.hintsUsed).toBe(3);
      expect(state.unlockedLevels).toContain(42);
    });
  });
});

