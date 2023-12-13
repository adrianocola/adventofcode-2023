import exec from '../exec.js';

enum HandScore {
  FIVE_OF_A_KIND = 7,
  FOUR_OF_A_KIND = 6,
  FULL_HOUSE = 5,
  THREE_OF_A_KIND = 4,
  TWO_PAIRS = 3,
  ONE_PAIR = 2,
  HIGH_CARD = 1,
}

type Label = 'A' | 'K' | 'Q' | 'T' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2' | 'J';

const LABEL_WEIGHT: Record<Label, number> = {
  'A': 13,
  'K': 12,
  'Q': 11,
  'T': 10,
  '9': 9,
  '8': 8,
  '7': 7,
  '6': 6,
  '5': 5,
  '4': 4,
  '3': 3,
  '2': 2,
  'J': 1,
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
    let wildCards = 0;
    const labelCounts = cards.reduce((acc, card) => {
      if (card.label === 'J') wildCards += 1;
      acc[card.label] = (acc[card.label] ?? 0) + 1;
      return acc;
    }, {} as Record<Label, number>);

    const [c1, c2] = Object.values(labelCounts).sort((a, b) => b - a);
    if (c1 === 5) return HandScore.FIVE_OF_A_KIND;
    if (c1 === 4) return wildCards ? HandScore.FIVE_OF_A_KIND : HandScore.FOUR_OF_A_KIND;
    if (c1 === 3 && c2 === 2) return wildCards ? HandScore.FIVE_OF_A_KIND : HandScore.FULL_HOUSE;
    if (c1 === 3) return wildCards ? HandScore.FOUR_OF_A_KIND : HandScore.THREE_OF_A_KIND;
    if (c1 === 2 && c2 === 2) {
      if (wildCards === 2) return HandScore.FOUR_OF_A_KIND;
      if (wildCards === 1) return HandScore.FULL_HOUSE;
      return HandScore.TWO_PAIRS;
    }
    if (c1 === 2) return wildCards ? HandScore. THREE_OF_A_KIND : HandScore.ONE_PAIR;
    return wildCards ? HandScore.ONE_PAIR : HandScore.HIGH_CARD;
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

const run = (lines: string) => {
  const array = lines.split('\n');
  const hands: Hand[] = [];
  array.map((line) => {
    if (!line) return;

    const [handText, bid] = line.split(' ');
    hands.push(new Hand(handText, parseInt(bid, 10)));
  });
  const sortedHands = hands.sort((a, b) => a.compare(b));
  return sortedHands.reduce((acc, hand, rank) => {
    return acc + (hand.bid * (rank + 1));
  }, 0);
};

exec('sample.txt', 5905, run);
exec('input.txt', 253907829, run);
