import type { Store } from 'pinia';
import type DataTableFilterParams from '@/types/dataTable/data-table-filter-params.type';

type StoreWithPagination = Store & {
  page: number;
  limit: number;
  sort_column?: string;
  sort_order?: 'asc' | 'desc';
  search_term?: string | undefined;
  loading?: boolean;
  [key: string]: any;
};

/**
 * Carrega itens de uma store Pinia de forma genérica, baseando-se nas mudanças de parâmetros da tabela.
 *
 * @param {object} options - Parâmetros da tabela de dados (page, itemsPerPage, sortBy).
 * @param {number} options.page - Página atual.
 * @param {number} options.itemsPerPage - Itens por página.
 * @param {any[]} options.sortBy - Array de ordenação (ex: [{ key: 'name', order: 'asc' }]).
 * @param {string | null} searchTerm - Termo de busca.
 * @param {StoreWithPagination} store - A store Pinia a ser utilizada (ex: useServiceStore()).
 * @param {string} fetchActionName - O nome da ação na store que busca os dados (ex: 'getServices', 'getUsers').
 * @param {string} itemsPropertyName - O nome da propriedade na store que guarda a lista de itens (ex: 'services', 'accountUsers').
 */
export default async function loadItems(
  { page, itemsPerPage, sortBy }: { page: number, itemsPerPage: number, sortBy: any[] },
  searchTerm: string | undefined,
  store: StoreWithPagination,
  fetchActionName: string,
  itemsPropertyName: string
) {
  const sortColumn = sortBy.length > 0 ? sortBy[0].key : undefined;
  const sortOrder = sortBy.length > 0 ? sortBy[0].order : undefined;
  const currentSearchTerm = searchTerm;

  let shouldFetch = false;

  if (page !== store.page) {
    store.page = page;
    shouldFetch = true;
  }

  if (itemsPerPage !== store.limit) {
    store.limit = itemsPerPage;
    store.page = 1;
    shouldFetch = true;
  }

  if (sortColumn !== store.sort_column || sortOrder !== store.sort_order) {
    store.sort_column = sortColumn;
    store.sort_order = sortOrder;
    store.page = 1;
    shouldFetch = true;
  }

  if (currentSearchTerm !== store.search_term) {
    store.search_term = currentSearchTerm;
    store.page = 1;
    shouldFetch = true;
  }

  const fetchParams: DataTableFilterParams = {
    page: store.page,
    limit: store.limit,
    sort_column: store.sort_column,
    sort_order: store.sort_order,
    search_term: store.search_term
  };

  if (shouldFetch) {
    if (typeof store[fetchActionName] === 'function') {
      await store[fetchActionName](fetchParams);
    } else {
      console.error(`Ação '${fetchActionName}' não encontrada na store.`);
    }
  } else if ((!store[itemsPropertyName] || store[itemsPropertyName].length === 0) && !store.loading) {
    if (typeof store[fetchActionName] === 'function') {
      await store[fetchActionName](fetchParams);
    }
  }
}
