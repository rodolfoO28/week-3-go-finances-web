const formatDate = (date: string): string =>
  new Intl.DateTimeFormat('pt-BR').format(new Date(date));

export default formatDate;
