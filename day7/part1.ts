import {readFileSync } from 'fs';

enum HandScore {
  FIVE_OF_A_KIND = 7,
  FOUR_OF_A_KIND = 6,
  FULL_HOUSE = 5,
  THREE_OF_A_KIND = 4,
  TWO_PAIRS = 3,
  ONE_PAIR = 2,
  HIGH_CARD = 1,
}

type Label = 'A' | 'K' | 'Q' | 'J' | 'T' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2';

const LABEL_WEIGHT: Record<Label, number> = {
  'A': 13,
  'K': 12,
  'Q': 11,
  'J': 10,
  'T': 9,
  '9': 8,
  '8': 7,
  '7': 6,
  '6': 5,
  '5': 4,
  '4': 3,
  '3': 2,
  '2': 1,
}

class Card {
  label: Label;
  weight: number;

  constructor(label: string) {
    this.label = label as Label;
    this.weight = LABEL_WEIGHT[this.label];
  }
}

class Hand {
  handText: string;
  cards: Card[];
  score: HandScore;
  bid: number;

  constructor(handText: string, bid: number) {
    this.handText = handText;
    this.bid = bid;
    this.cards = Array.from(handText).map((label) => new Card(label));
    this.score = this.calculateScore(this.cards);
  }

  calculateScore(cards: Card[]) {
    const labelCounts = cards.reduce((acc, card) => {
      acc[card.label] = (acc[card.label] ?? 0) + 1;
      return acc;
    }, {} as Record<Label, number>);

    const [c1, c2] = Object.values(labelCounts).sort((a, b) => b - a);
    if (c1 === 5) return HandScore.FIVE_OF_A_KIND;
    if (c1 === 4) return HandScore.FOUR_OF_A_KIND;
    if (c1 === 3 && c2 === 2) return HandScore.FULL_HOUSE;
    if (c1 === 3) return HandScore.THREE_OF_A_KIND;
    if (c1 === 2 && c2 === 2) return HandScore.TWO_PAIRS;
    if (c1 === 2) return HandScore.ONE_PAIR;
    return HandScore.HIGH_CARD;
  }

  compareHighCard(otherHand: Hand) {
    for (let i = 0; i < this.cards.length; i++) {
      const myCard = this.cards[i];
      const otherCard = otherHand.cards[i];
      if (myCard.label === otherCard.label) continue;
      return myCard.weight - otherCard.weight;
    }
    return 0;
  }

  compare(otherHand: Hand) {
    if (this.score !== otherHand.score) return this.score - otherHand.score;

    return this.compareHighCard(otherHand);
  }
}

const run = (file: string) => {
  const lines = readFileSync(file, 'utf8');
  const array = lines.split('\n');
  const hands: Hand[] = [];
  array.map((line) => {
    if (!line) return;

    const [handText, bid] = line.split(' ');
    hands.push(new Hand(handText, parseInt(bid, 10)));
  });
  const sortedHands = hands.sort((a, b) => a.compare(b));
  const winnings = sortedHands.reduce((acc, hand, rank) => {
    return acc + (hand.bid * (rank + 1));
  }, 0);

  console.log(`RESULT (${file}):`, winnings);
};

console.log();
run('sample.txt');
run('input.txt');
