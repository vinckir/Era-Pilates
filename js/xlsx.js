// Leitor mínimo de planilha .xlsx (as exportações do Seu Fisio), sem biblioteca externa.
// O .xlsx é um zip com XML dentro: lê o índice do zip, descompacta com DecompressionStream
// e devolve a primeira aba como linhas de texto.

async function inflar(bytes) {
  const ds = new DecompressionStream('deflate-raw');
  return new Response(new Blob([bytes]).stream().pipeThrough(ds)).text();
}

async function arquivosDoZip(buf) {
  const dv = new DataView(buf), u8 = new Uint8Array(buf);
  let fim = buf.byteLength - 22;
  while (fim >= 0 && dv.getUint32(fim, true) !== 0x06054b50) fim--;
  if (fim < 0) throw new Error('Arquivo não é uma planilha .xlsx');
  const total = dv.getUint16(fim + 10, true);
  let p = dv.getUint32(fim + 16, true);
  const out = {};
  for (let i = 0; i < total; i++) {
    const metodo = dv.getUint16(p + 10, true), tam = dv.getUint32(p + 20, true);
    const nLen = dv.getUint16(p + 28, true), xLen = dv.getUint16(p + 30, true), cLen = dv.getUint16(p + 32, true);
    const local = dv.getUint32(p + 42, true);
    const nome = new TextDecoder().decode(u8.subarray(p + 46, p + 46 + nLen));
    const ini = local + 30 + dv.getUint16(local + 26, true) + dv.getUint16(local + 28, true);
    out[nome] = { metodo, dados: u8.subarray(ini, ini + tam) };
    p += 46 + nLen + xLen + cLen;
  }
  return out;
}

async function texto(arq) {
  if (!arq) return '';
  return arq.metodo === 0 ? new TextDecoder().decode(arq.dados) : inflar(arq.dados);
}

const colNum = ref => [...ref.replace(/\d+/g, '')].reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0) - 1;

export async function lerXlsx(buf) {
  const zip = await arquivosDoZip(buf);
  const xml = s => new DOMParser().parseFromString(s, 'application/xml');
  const ss = xml(await texto(zip['xl/sharedStrings.xml']) || '<sst/>');
  const strings = [...ss.getElementsByTagName('si')].map(si => [...si.getElementsByTagName('t')].map(t => t.textContent).join(''));
  const aba = Object.keys(zip).filter(n => /^xl\/worksheets\/sheet\d+\.xml$/.test(n)).sort()[0];
  const doc = xml(await texto(zip[aba]));
  return [...doc.getElementsByTagName('row')].map(row => {
    const linha = [];
    for (const c of row.getElementsByTagName('c')) {
      const t = c.getAttribute('t'), v = c.getElementsByTagName('v')[0]?.textContent ?? '';
      const val = t === 's' ? strings[+v] : t === 'inlineStr' ? c.getElementsByTagName('t')[0]?.textContent ?? '' : v;
      linha[colNum(c.getAttribute('r') || 'A')] = (val ?? '').toString().trim();
    }
    return [...linha].map(x => x ?? '');
  });
}

// Planilha → texto separado por tab, para usar o mesmo importador dos arquivos .tsv.
export async function xlsxParaTsv(buf) {
  return (await lerXlsx(buf)).map(l => l.map(x => x.replace(/[\t\r\n]+/g, ' ')).join('\t')).join('\n');
}
