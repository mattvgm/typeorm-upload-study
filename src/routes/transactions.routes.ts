import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';
import TransactionsRepository from '../repositories/TransactionsRepository';
import uploadConfig from '../config/upload';

import CreateTransactionService from '../services/CreateTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';
import Category from '../models/Category';
import DeleteTransactionService from '../services/DeleteTransactionService';

const upload = multer(uploadConfig);

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const TransRepository = getCustomRepository(TransactionsRepository);
  const transactions = await TransRepository.find();

  transactions.map(eachTransaction => {
    delete eachTransaction.category_id;
  });

  const balance = await TransRepository.getBalance();
  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;
  const TransRepository = new CreateTransactionService();

  const CreateTransactions = await TransRepository.execute({
    title,
    value,
    type,
    category,
  });

  return response.json(CreateTransactions);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const DeleteTransaction = new DeleteTransactionService();
  await DeleteTransaction.execute({ id });
  return response.send('DELETED');
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const ParseListService = new ImportTransactionsService();
    console.log(request.file.filename);
    const ImportedTransactions = await ParseListService.execute(
      request.file.filename,
    );
    console.log('====================================');
    return response.json({ ImportedTransactions });
  },
);

export default transactionsRouter;
