/* eslint-disable no-await-in-loop */
import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import { getCustomRepository } from 'typeorm';
import parse from 'csv-parse';
import uploadConfig from '../config/upload';
import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from './CreateTransactionService';

interface RetrievedLine {
  type: 'income' | 'outcome';
  value: number;
  title: string;
  category: string;
}
class ImportTransactionsService {
  async execute(filepath: string): Promise<Transaction[]> {
    const csvFilePath = path.resolve(uploadConfig.directory, filepath);
    console.log(csvFilePath);
    const readCSVStream = fs.createReadStream(csvFilePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const lines: Transaction[] = [];
    const RTR: RetrievedLine[] = [];

    parseCSV.on('data', line => {
      RTR.push({
        title: line[0],
        type: line[1],
        value: line[2],
        category: line[3],
      });
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    // eslint-disable-next-line no-restricted-syntax
    for (const { title, type, value, category } of RTR) {
      const CreateTransaction = new CreateTransactionService();

      const CreatedTransaction = await CreateTransaction.execute({
        title,
        type,
        value,
        category,
      });

      lines.push(CreatedTransaction);
    }

    return lines;
  }
}

export default ImportTransactionsService;
