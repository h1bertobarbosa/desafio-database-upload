import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const allTransactions = await this.find();

    const sumIncome = allTransactions.reduce((acumulator, item) => {
      if (item.type === 'income') {
        return (acumulator += Number(item.value));
      }

      return acumulator;
    }, 0);
    const sumOutcome = allTransactions.reduce((acumulator, item) => {
      if (item.type === 'outcome') {
        return (acumulator += Number(item.value));
      }
      return acumulator;
    }, 0);

    return {
      income: Number(sumIncome),
      outcome: Number(sumOutcome),
      total: Number(sumIncome) - Number(sumOutcome),
    };
  }
}

export default TransactionsRepository;
