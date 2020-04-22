import { EntityRepository, Repository, getRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const IncomeValue = (await this.find({ where: { type: 'income' } }))
      .map(eachIncome => eachIncome.value)
      .reduce(
        (accumulator: number, currentValue: number) =>
          Number(accumulator) + Number(currentValue),
        0,
      );

    const OutcomeValue = (await this.find({ where: { type: 'outcome' } }))
      .map(eachOutcome => eachOutcome.value)
      .reduce(
        (accumulator, currentValue) =>
          Number(accumulator) + Number(currentValue),
        0,
      );

    const total = IncomeValue - OutcomeValue;
    return { income: IncomeValue, outcome: OutcomeValue, total };
  }

  public async findCategory(CategorieName: string): Promise<Category> {
    const CategoriesRepository = getRepository(Category);
    const CategoryExists = await CategoriesRepository.findOne({
      where: { title: CategorieName },
    });
    if (CategoryExists) {
      return CategoryExists;
    }

    // console.log('❌ [WARN] Category Not Found.Creating Instead');
    const NewCategory = await CategoriesRepository.create({
      title: CategorieName,
    });

    const createdCategory = await CategoriesRepository.save(NewCategory);
    // console.log('🟢 [WARN] Category created');
    return createdCategory;
  }
}

export default TransactionsRepository;
