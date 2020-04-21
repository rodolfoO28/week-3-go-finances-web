import React, { useState, useEffect } from 'react';
import { FiChevronDown } from 'react-icons/fi';

import income from '../../assets/income.svg';
import outcome from '../../assets/outcome.svg';
import total from '../../assets/total.svg';

import api from '../../services/api';

import Header from '../../components/Header';

import formatValue from '../../utils/formatValue';
import formatDate from '../../utils/formatDate';

import { Container, CardContainer, Card, TableContainer } from './styles';

interface Transaction {
  id: string;
  title: string;
  value: number;
  formattedValue: string;
  formattedDate: string;
  type: 'income' | 'outcome';
  category: { title: string };
  created_at: string;
}

interface Balance {
  income: string;
  outcome: string;
  total: string;
}

interface Response {
  transactions: Transaction[];
  balance: Balance;
}

interface OrderFilterList {
  title: boolean;
  value: boolean;
  category: boolean;
  date: boolean;
}

const initialOrderFilterList: OrderFilterList = {
  title: false,
  value: false,
  category: false,
  date: false,
};

const Dashboard: React.FC = () => {
  const [orderFilterList, setOrderFilterList] = useState<OrderFilterList>(
    initialOrderFilterList,
  );
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<Balance>({} as Balance);

  function handleSortlist(key: 'title' | 'value' | 'category' | 'date'): void {
    const newOrderTransactions: Transaction[] = [...transactions];
    const newOrderFilterList = {
      ...initialOrderFilterList,
      [key]: !orderFilterList[key],
    };

    switch (key) {
      case 'title':
        newOrderTransactions.sort((a, b) =>
          newOrderFilterList.title
            ? b.title.localeCompare(a.title)
            : a.title.localeCompare(b.title),
        );
        break;
      case 'value':
        newOrderTransactions.sort((a, b) =>
          newOrderFilterList.value ? a.value - b.value : b.value - a.value,
        );
        break;
      case 'category':
        newOrderTransactions.sort((a, b) =>
          newOrderFilterList.category
            ? b.category.title.localeCompare(a.category.title)
            : a.category.title.localeCompare(b.category.title),
        );
        break;
      default:
        newOrderTransactions.sort((a, b) =>
          newOrderFilterList.date
            ? b.created_at.localeCompare(a.created_at)
            : a.created_at.localeCompare(b.created_at),
        );
        break;
    }

    setTransactions(newOrderTransactions);
    setOrderFilterList(newOrderFilterList);
  }

  useEffect(() => {
    async function loadTransactions(): Promise<void> {
      const response = await api.get<Response>('transactions');

      const {
        balance: balanceResponse,
        transactions: transactionsResponse,
      } = response.data;

      const transactionsFormatted = transactionsResponse.map((transaction) => {
        const { type, value, created_at: createdAt } = transaction;

        let formattedValue = formatValue(value);
        if (type === 'outcome') formattedValue = `- ${formattedValue}`;

        const formattedDate = formatDate(String(createdAt));

        return {
          ...transaction,
          formattedValue,
          formattedDate,
        };
      });

      setTransactions(transactionsFormatted);
      setBalance({
        income: formatValue(Number(balanceResponse.income)),
        outcome: formatValue(Number(balanceResponse.outcome)),
        total: formatValue(Number(balanceResponse.total)),
      });
    }

    loadTransactions();
  }, []);

  return (
    <>
      <Header />
      <Container>
        <CardContainer>
          <Card>
            <header>
              <p>Entradas</p>
              <img src={income} alt="Income" />
            </header>
            <h1 data-testid="balance-income">{balance.income}</h1>
          </Card>
          <Card>
            <header>
              <p>Saídas</p>
              <img src={outcome} alt="Outcome" />
            </header>
            <h1 data-testid="balance-outcome">{balance.outcome}</h1>
          </Card>
          <Card total>
            <header>
              <p>Total</p>
              <img src={total} alt="Total" />
            </header>
            <h1 data-testid="balance-total">{balance.total}</h1>
          </Card>
        </CardContainer>

        <TableContainer>
          <table>
            <thead>
              <tr>
                <th>
                  <button
                    className={orderFilterList.title ? 'active' : ''}
                    type="button"
                    onClick={() => handleSortlist('title')}
                  >
                    Título
                    <FiChevronDown />
                  </button>
                </th>
                <th>
                  <button
                    className={orderFilterList.value ? 'active' : ''}
                    type="button"
                    onClick={() => handleSortlist('value')}
                  >
                    Preço
                    <FiChevronDown />
                  </button>
                </th>
                <th>
                  <button
                    className={orderFilterList.category ? 'active' : ''}
                    type="button"
                    onClick={() => handleSortlist('category')}
                  >
                    Categoria
                    <FiChevronDown />
                  </button>
                </th>
                <th>
                  <button
                    className={orderFilterList.date ? 'active' : ''}
                    type="button"
                    onClick={() => handleSortlist('date')}
                  >
                    Data
                    <FiChevronDown />
                  </button>
                </th>
              </tr>
            </thead>

            <tbody>
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={4}>Nenhum registro encontrado!</td>
                </tr>
              )}

              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="title">{transaction.title}</td>
                  <td className={transaction.type}>
                    {transaction.formattedValue}
                  </td>
                  <td>{transaction.category.title}</td>
                  <td>{transaction.formattedDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableContainer>
      </Container>
    </>
  );
};

export default Dashboard;
