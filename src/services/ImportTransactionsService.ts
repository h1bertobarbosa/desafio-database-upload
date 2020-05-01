import path from 'path';
import { getRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import uploadConfig from '../config/upload';
import LoadCSVService from './LoadCSVService';
import Category from '../models/Category';
// Promise<Transaction[]>
class ImportTransactionsService {
  async execute(filename: string): Promise<Transaction[]> {
    const pathFile = path.join(uploadConfig.directory, filename);
    const loadCSV = new LoadCSVService();
    const dataCSV = await loadCSV.execute(pathFile);
    const transactionRepository = getRepository(Transaction);
    const categoryRepository = getRepository(Category);

    const toCreate = dataCSV.map(async item => {
      const [title, type, value, category] = item;

      let hasCategory = await categoryRepository.findOne({
        where: { title: category },
      });

      if (!hasCategory) {
        const newCategory = categoryRepository.create({
          title: category,
        });

        hasCategory = await categoryRepository.save(newCategory);
      }

      const transaction = transactionRepository.create({
        category_id: hasCategory.id,
        value: Number(value),
        type,
        title,
      });

      return transactionRepository.save(transaction);
    });

    return Promise.all(toCreate);
  }
}

export default ImportTransactionsService;
