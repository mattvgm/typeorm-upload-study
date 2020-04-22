import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}
class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const TransactionsRepository = getCustomRepository(TransactionRepository);

    const currentBalance = await TransactionsRepository.getBalance();
    if (type === 'outcome' && value >= currentBalance.total) {
      throw new AppError('You have an invalid balance', 400);
    }

    const NewCategory = await TransactionsRepository.findCategory(category);
    const NewTransaction = { title, value, type, category: NewCategory };

    const CreatedTransaction = await TransactionsRepository.create(
      NewTransaction,
    );

    delete CreatedTransaction.created_at;
    delete CreatedTransaction.updated_at;
    delete CreatedTransaction.category_id;
    delete CreatedTransaction.category.created_at;
    delete CreatedTransaction.category.updated_at;
    const novo = await TransactionsRepository.save(CreatedTransaction);
    return novo;
  }
}

export default CreateTransactionService;
