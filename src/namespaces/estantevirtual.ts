import type { Scavio } from "../client.js";

// Estante Virtual (estantevirtual.com.br, Brazil's used and new book marketplace, part of Magalu)
// search, isbn, book, copies, copy, shipping, seller, seller books, seller reviews, sellers,
// category and list endpoints; Brazil only, prices in BRL, 1 credit each (copies with sellers
// ceil((1 + copies) / 5)). Generated from the backend routes: every option and its doc mirrors the
// API's own request schema. The server enforces the value rules and the one-of rules (send one of
// an id or a link). Every call raises the request timeout to ESTANTEVIRTUAL_TIMEOUT and never
// lowers a longer client timeout. Failed upstream calls and refused inputs are not charged; a
// not-found is charged (credits_used is what was charged).

/** Minimum request timeout (ms) for every estantevirtual call. */
export const ESTANTEVIRTUAL_TIMEOUT = 240_000;

export interface EstantevirtualSearchOptions {
  /** Title, author or ISBN keywords (Portuguese, as a reader types them). */
  query: string;
  /**
   * relevance (default), price_asc, price_desc, newest, best_sellers or price_plus_shipping: the
   * site's 6 sorts.
   */
  sort?: "relevance" | "price_asc" | "price_desc" | "newest" | "best_sellers" | "price_plus_shipping";
  /** Books with used or new copies (tipo-de-livro). */
  condition?: "used" | "new";
  /** Author facet value (autor, facets[].values[].value), e.g. machado-de-assis. */
  author?: string;
  /** Publisher facet value (editora). */
  publisher?: string;
  /** Seller city facet value (cidade). */
  city?: string;
  /** Category facet value (categoria). */
  category?: string;
  /**
   * Facet filters: {key: value or [values]} with facets[].key and facets[].values[].value of an
   * answer (tipo-de-livro, autor, editora, ano-de-publicacao, cidade, sebos-e-livreiros, promocoes,
   * categoria, idioma, _avaliacao, compra-corporativa). Up to 12 values.
   */
  filters?: Record<string, unknown>;
  /** Lowest price in BRL. */
  price_min?: number;
  /** Highest price in BRL. */
  price_max?: number;
  /** Results page, 1-238 (44 per page). */
  page?: number;
  [key: string]: unknown;
}

export interface EstantevirtualIsbnOptions {
  /**
   * An ISBN-10 or ISBN-13 (dashes and spaces allowed; the check digit is verified, so a typo is a
   * 400, not charged).
   */
  isbn: string;
  [key: string]: unknown;
}

export interface EstantevirtualBookOptions {
  /** The book id (items[].book_id of a search, book.book_id of an ISBN lookup). */
  book_id?: string;
  /** An estantevirtual.com.br book link, instead of book_id. */
  url?: string;
  [key: string]: unknown;
}

export interface EstantevirtualCopiesOptions {
  /** The book id (items[].book_id of a search, book.book_id of an ISBN lookup). */
  book_id?: string;
  /** An estantevirtual.com.br book link, instead of book_id. */
  url?: string;
  /** used (default) or new copies. */
  condition?: "used" | "new";
  /** price_asc (default) or price_desc. */
  sort?: "price_asc" | "price_desc";
  /** Page, 1-based. */
  page?: number;
  /** Copies per page, 1-50 (default 10). */
  page_size?: number;
  /**
   * Add each copy's seller (one extra call per copy: ceil((1 + copies) / 5) credits, e.g. 10 copies
   * = 3 credits). Default false (1 credit).
   */
  sellers?: boolean;
  /** Printing year facet (ano-de-publicacao). */
  year?: string;
  /** Publisher facet value (editora). */
  publisher?: string;
  /** Seller city facet value (cidade). */
  city?: string;
  /**
   * Facet filters {key: value or [values]}: ano-de-publicacao, editora, cidade, sebos-e-livreiros,
   * _preco (min-max in cents).
   */
  filters?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface EstantevirtualCopyOptions {
  /**
   * The copy id (items[].copy_id of copies, lowest_priced_used.copy_id of a book, copy_id of a
   * one-copy listing).
   */
  copy_id?: string;
  /** An estantevirtual.com.br copy link, instead of copy_id. */
  url?: string;
  [key: string]: unknown;
}

export interface EstantevirtualShippingOptions {
  /** A Brazilian CEP (8 digits). */
  cep: string;
  /**
   * The copy id (items[].copy_id of copies, lowest_priced_used.copy_id of a book, copy_id of a
   * one-copy listing).
   */
  copy_id?: string;
  /** An estantevirtual.com.br copy link, instead of copy_id. */
  url?: string;
  [key: string]: unknown;
}

export interface EstantevirtualSellerOptions {
  /** A seller id (sellers[].seller_id, copies[].seller.id, copy seller.id). */
  seller_id: string | number;
  /** The seller's name slug (name_slug), optional. */
  name?: string;
  [key: string]: unknown;
}

export interface EstantevirtualSellerBooksOptions {
  /** A seller id (sellers[].seller_id, copies[].seller.id, copy seller.id). */
  seller_id: string | number;
  /** Search inside the seller's catalogue. */
  query?: string;
  /** price_asc or price_desc (default: the site's order). */
  sort?: "price_asc" | "price_desc";
  /** Page, 1-based (40 per page). */
  page?: number;
  [key: string]: unknown;
}

export interface EstantevirtualSellerReviewsOptions {
  /** A seller id (sellers[].seller_id, copies[].seller.id, copy seller.id). */
  seller_id: string | number;
  /** Page, 1-based (10 per page). */
  page?: number;
  /** positive (3 to 5 stars) or negative (0 to 2), as the site's filters. */
  rating?: "positive" | "negative";
  [key: string]: unknown;
}

export interface EstantevirtualSellersOptions {
  /** A Brazilian state code (UF). Leave out for the whole country. */
  state?: string;
  /**
   * A city of that state, written as the site writes it, with accents (cities[] of the state's
   * directory).
   */
  city?: string;
  /** Page, 1-based (30 per page). */
  page?: number;
  [key: string]: unknown;
}

export interface EstantevirtualCategoryOptions {
  /**
   * A category slug or link: antropologia, artes, auto-ajuda, biografias, ciencia-politica,
   * comunicacao, direito, engenharia, filosofia, historia-do-brasil, historia-geral,
   * infanto-juvenis, literatura-brasileira, literatura-estrangeira, livros-raros, medicina,
   * psicologia, ensino-de-idiomas (the site's menu), or a categoria facet value.
   */
  category_slug: string;
  /**
   * relevance (default), price_asc, price_desc, newest, best_sellers or price_plus_shipping: the
   * site's 6 sorts.
   */
  sort?: "relevance" | "price_asc" | "price_desc" | "newest" | "best_sellers" | "price_plus_shipping";
  /** Books with used or new copies (tipo-de-livro). */
  condition?: "used" | "new";
  /** Author facet value (autor, facets[].values[].value), e.g. machado-de-assis. */
  author?: string;
  /** Publisher facet value (editora). */
  publisher?: string;
  /** Seller city facet value (cidade). */
  city?: string;
  /** Category facet value (categoria). */
  category?: string;
  /**
   * Facet filters: {key: value or [values]} with facets[].key and facets[].values[].value of an
   * answer (tipo-de-livro, autor, editora, ano-de-publicacao, cidade, sebos-e-livreiros, promocoes,
   * categoria, idioma, _avaliacao, compra-corporativa). Up to 12 values.
   */
  filters?: Record<string, unknown>;
  /** Lowest price in BRL. */
  price_min?: number;
  /** Highest price in BRL. */
  price_max?: number;
  /** Results page, 1-238 (44 per page). */
  page?: number;
  [key: string]: unknown;
}

export interface EstantevirtualListOptions {
  /**
   * A list slug or /lst/ link: black-friday, livros-baratos, saldao-de-livros, livros-frete-gratis,
   * lancamentos (black-friday is the default).
   */
  slug?: string;
  /** Page, 1-based (42 per page). */
  page?: number;
  [key: string]: unknown;
}

export class EstantevirtualNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = ESTANTEVIRTUAL_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/estantevirtual/${path}`, options, undefined, timeout);
  }

  /**
   * Search Estante Virtual (estantevirtual.com.br, Brazil's marketplace of used and new books from
   * sebos and booksellers, owned by Magalu). Scavio fetches the public estantevirtual.com.br data
   * on request; Estante Virtual has no public API. Brazil: Portuguese (pt-BR) text and prices in
   * BRL, as shown to a visitor who is not signed in. By title, author or ISBN keywords. 44 per
   * page, pages 1-238, in the site's 6 sorts, filtered by any facet (used / new, author, publisher,
   * year, seller city, seller, category, language, rating, a BRL price range). Costs 1 credit.
   */
  async search(options: EstantevirtualSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * The book for an ISBN on Estante Virtual (estantevirtual.com.br, Brazil's marketplace of used
   * and new books from sebos and booksellers, owned by Magalu). Scavio fetches the public
   * estantevirtual.com.br data on request; Estante Virtual has no public API. Brazil: Portuguese
   * (pt-BR) text and prices in BRL, as shown to a visitor who is not signed in. By ISBN-10 or
   * ISBN-13 (the check digit is verified first): the book grouping every copy of the ISBN, and
   * single copies the site did not group. Costs 1 credit.
   */
  async isbn(options: EstantevirtualIsbnOptions): Promise<Record<string, unknown>> {
    return this.post("isbn", options);
  }

  /**
   * One book of Estante Virtual (estantevirtual.com.br, Brazil's marketplace of used and new books
   * from sebos and booksellers, owned by Magalu). Scavio fetches the public estantevirtual.com.br
   * data on request; Estante Virtual has no public API. Brazil: Portuguese (pt-BR) text and prices
   * in BRL, as shown to a visitor who is not signed in. By book_id or link. Costs 1 credit.
   */
  async book(options: EstantevirtualBookOptions): Promise<Record<string, unknown>> {
    return this.post("book", options);
  }

  /**
   * Every copy of a book on sale on Estante Virtual (estantevirtual.com.br, Brazil's marketplace of
   * used and new books from sebos and booksellers, owned by Magalu). Scavio fetches the public
   * estantevirtual.com.br data on request; Estante Virtual has no public API. Brazil: Portuguese
   * (pt-BR) text and prices in BRL, as shown to a visitor who is not signed in. By book_id and
   * condition (used / new), paged (up to 50 per page), sorted by price in either direction,
   * filtered by printing year, publisher, seller city, seller or price. Costs 1 credit; with
   * sellers ceil((1 + copies) / 5) (e.g. 10 copies = 3); credits_used in the response is the exact
   * charge.
   */
  async copies(options: EstantevirtualCopiesOptions): Promise<Record<string, unknown>> {
    return this.post("copies", options);
  }

  /**
   * One seller's copy on Estante Virtual (estantevirtual.com.br, Brazil's marketplace of used and
   * new books from sebos and booksellers, owned by Magalu). Scavio fetches the public
   * estantevirtual.com.br data on request; Estante Virtual has no public API. Brazil: Portuguese
   * (pt-BR) text and prices in BRL, as shown to a visitor who is not signed in. By copy_id or link.
   * Costs 1 credit.
   */
  async copy(options: EstantevirtualCopyOptions): Promise<Record<string, unknown>> {
    return this.post("copy", options);
  }

  /**
   * The delivery quote for one copy of Estante Virtual (estantevirtual.com.br, Brazil's marketplace
   * of used and new books from sebos and booksellers, owned by Magalu). Scavio fetches the public
   * estantevirtual.com.br data on request; Estante Virtual has no public API. Brazil: Portuguese
   * (pt-BR) text and prices in BRL, as shown to a visitor who is not signed in. By copy_id and CEP.
   * Costs 1 credit.
   */
  async shipping(options: EstantevirtualShippingOptions): Promise<Record<string, unknown>> {
    return this.post("shipping", options);
  }

  /**
   * A sebo or bookseller of Estante Virtual (estantevirtual.com.br, Brazil's marketplace of used
   * and new books from sebos and booksellers, owned by Magalu). Scavio fetches the public
   * estantevirtual.com.br data on request; Estante Virtual has no public API. Brazil: Portuguese
   * (pt-BR) text and prices in BRL, as shown to a visitor who is not signed in. By seller id. Costs
   * 1 credit.
   */
  async seller(options: EstantevirtualSellerOptions): Promise<Record<string, unknown>> {
    return this.post("seller", options);
  }

  /**
   * A sebo's catalogue on Estante Virtual (estantevirtual.com.br, Brazil's marketplace of used and
   * new books from sebos and booksellers, owned by Magalu). Scavio fetches the public
   * estantevirtual.com.br data on request; Estante Virtual has no public API. Brazil: Portuguese
   * (pt-BR) text and prices in BRL, as shown to a visitor who is not signed in. By seller id,
   * optionally searched by keyword and sorted by price, 40 per page. Costs 1 credit.
   */
  async sellerBooks(options: EstantevirtualSellerBooksOptions): Promise<Record<string, unknown>> {
    return this.post("seller-books", options);
  }

  /**
   * Buyers' reviews of a sebo on Estante Virtual (estantevirtual.com.br, Brazil's marketplace of
   * used and new books from sebos and booksellers, owned by Magalu). Scavio fetches the public
   * estantevirtual.com.br data on request; Estante Virtual has no public API. Brazil: Portuguese
   * (pt-BR) text and prices in BRL, as shown to a visitor who is not signed in. By seller id, 10
   * per page, newest to oldest, optionally positive or negative. Costs 1 credit.
   */
  async sellerReviews(options: EstantevirtualSellerReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("seller-reviews", options);
  }

  /**
   * The sebo and bookseller directory of Estante Virtual (estantevirtual.com.br, Brazil's
   * marketplace of used and new books from sebos and booksellers, owned by Magalu). Scavio fetches
   * the public estantevirtual.com.br data on request; Estante Virtual has no public API. Brazil:
   * Portuguese (pt-BR) text and prices in BRL, as shown to a visitor who is not signed in. The
   * whole country, a state (UF) or a city of that state (written as the site writes it, with
   * accents), 30 per page. Costs 1 credit.
   */
  async sellers(options: EstantevirtualSellersOptions = {}): Promise<Record<string, unknown>> {
    return this.post("sellers", options);
  }

  /**
   * One category of Estante Virtual (estantevirtual.com.br, Brazil's marketplace of used and new
   * books from sebos and booksellers, owned by Magalu). Scavio fetches the public
   * estantevirtual.com.br data on request; Estante Virtual has no public API. Brazil: Portuguese
   * (pt-BR) text and prices in BRL, as shown to a visitor who is not signed in. By slug
   * (literatura-brasileira, filosofia, livros-raros ...), sorted and filtered like search. 44 per
   * page, pages 1-238, in the site's 6 sorts, filtered by any facet (used / new, author, publisher,
   * year, seller city, seller, category, language, rating, a BRL price range). Costs 1 credit.
   */
  async category(options: EstantevirtualCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * A list page of Estante Virtual (estantevirtual.com.br, Brazil's marketplace of used and new
   * books from sebos and booksellers, owned by Magalu). Scavio fetches the public
   * estantevirtual.com.br data on request; Estante Virtual has no public API. Brazil: Portuguese
   * (pt-BR) text and prices in BRL, as shown to a visitor who is not signed in. By slug or /lst/
   * link: black-friday (default), livros-baratos, saldao-de-livros, livros-frete-gratis,
   * lancamentos or another list of the site, 42 per page in the site's order. Costs 1 credit.
   */
  async list(options: EstantevirtualListOptions = {}): Promise<Record<string, unknown>> {
    return this.post("list", options);
  }
}
