import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionRepository from '../repositories/TransactionsRepository';

interface TransacationData {
  title: string;
  value: 3000;
  type: 'income' | 'outcome';
  category: string;
}
class CreateTransactionService {
  public async execute({
    category,
    value,
    type,
    title,
  }: TransacationData): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);

    let hasCategory = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!hasCategory) {
      const newCategory = await categoryRepository.create({
        title: category,
      });

      hasCategory = await categoryRepository.save(newCategory);
    }

    let { income, outcome } = await transactionRepository.getBalance();

    if (type === 'income') {
      income += Number(value);
    }

    if (type === 'outcome') {
      outcome += Number(value);
    }

    if (outcome > income) {
      throw new AppError("You don't have enough balance");
    }

    const transaction = transactionRepository.create({
      category_id: hasCategory.id,
      value: Number(value),
      type,
      title,
    });

    return transactionRepository.save(transaction);
  }
}

export default CreateTransactionService;
