
import { Question } from "../types";

/**
 * Questions sur les préférences d'investissement spécialisées (crypto, souveraineté)
 */
export const specializedInvestmentsQuestions: Question[] = [
  {
    id: "sovereignty",
    text: "Votre priorité est-elle d'investir exclusivement en France et en Europe pour soutenir la souveraineté économique ?",
    options: [
      {
        id: "sovereignty-1",
        text: "Non, je préfère une allocation mondiale diversifiée",
        value: 1
      },
      {
        id: "sovereignty-2",
        text: "Je privilégie l'Europe mais sans exclusivité",
        value: 2
      },
      {
        id: "sovereignty-3",
        text: "Oui, je veux favoriser les entreprises françaises et européennes",
        value: 3
      },
      {
        id: "sovereignty-4",
        text: "Je souhaite investir exclusivement dans des entreprises contribuant à la souveraineté européenne",
        value: 4
      }
    ]
  },
  {
    id: "crypto",
    text: "Quelle est votre expérience avec les cryptomonnaies ?",
    options: [
      {
        id: "crypto-1",
        text: "Je n'ai jamais investi en cryptomonnaies et je suis réticent",
        value: 1
      },
      {
        id: "crypto-2",
        text: "Je suis curieux mais n'ai jamais investi en cryptomonnaies",
        value: 2
      },
      {
        id: "crypto-3",
        text: "J'ai déjà investi en Bitcoin/Ethereum",
        value: 3
      },
      {
        id: "crypto-4",
        text: "J'investis régulièrement dans plusieurs cryptomonnaies",
        value: 4
      }
    ]
  }
];
