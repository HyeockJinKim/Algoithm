
/**
 * url에 요청한 값을 그대로 읽음
 * @param url: 요청할 url
 * @returns {Promise<string>}: Promise<요청 데이터>
 */
export function get_url(url: string): Promise<string> {
  return fetch(url).then(data => data.text())
}

/**
 * url에 요청한 값을 html로 읽음
 * @param url: 요청할 url
 * @returns {Promise<Document>}: Promise<요청 html>
 */
export function get_html(url: string): Promise<Document> {
  return get_url(url).then(html => new DOMParser().parseFromString(html, "text/html"));
}

/**
 * html 중 특정 id 태그의 Text content 값을 읽어 오는 함수
 * @param html: 백준 문제 페이지
 * @param id: 값을 읽으려는 태그의 id
 * @returns string: id의 text content
 */
export function get_text_from_id(html: Document, id: string): string {
  const content = html.getElementById(id);
  return content != null ? html.getElementById(id)!.textContent!.trim() : '';
}

/**
 * Table 중 헤더를 제외한 첫번째 row 값을 읽어오는 함수
 * @param html: html 값
 * @param keyword: 읽으려는 table의 id
 * @returns li[]
 */
export function get_first_row(html: Document, keyword: string): HTMLTableDataCellElement[] {
  const table = html.getElementById(keyword) as HTMLTableElement;
  return Array.from(table.rows[1].cells);
}

/**
 * ul 태그의 값 중 특정 index의 값을 읽는 함수
 * @param cell: li[]
 * @param index: 읽으려는 index
 * @returns index의 값
 */
export function get_cell_index(cell: HTMLTableDataCellElement[], index: number): string {
  return cell[index].textContent!.trim();
}
