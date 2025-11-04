import { Injectable } from '@angular/core';

export interface PaginationConfig {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class PaginationService {

  createPaginationConfig(totalItems: number, itemsPerPage: number = 5): PaginationConfig {
    return {
      currentPage: 1,
      itemsPerPage,
      totalItems,
      totalPages: Math.ceil(totalItems / itemsPerPage)
    };
  }

  updatePagination(config: PaginationConfig, totalItems: number): PaginationConfig {
    const totalPages = Math.ceil(totalItems / config.itemsPerPage);
    return {
      ...config,
      totalItems,
      totalPages,
      currentPage: Math.min(config.currentPage, totalPages || 1)
    };
  }

  getPaginatedItems<T>(items: T[], config: PaginationConfig): T[] {
    const startIndex = (config.currentPage - 1) * config.itemsPerPage;
    const endIndex = startIndex + config.itemsPerPage;
    return items.slice(startIndex, endIndex);
  }

  goToPage(config: PaginationConfig, page: number): PaginationConfig {
    if (page >= 1 && page <= config.totalPages) {
      return { ...config, currentPage: page };
    }
    return config;
  }

  nextPage(config: PaginationConfig): PaginationConfig {
    return this.goToPage(config, config.currentPage + 1);
  }

  prevPage(config: PaginationConfig): PaginationConfig {
    return this.goToPage(config, config.currentPage - 1);
  }
}