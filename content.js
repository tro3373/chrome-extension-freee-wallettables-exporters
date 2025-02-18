(() => {
  // "content_scripts": [
  //   {
  //     "matches": [
  //       "https://secure.freee.co.jp/wallet/walletables/"
  //     ],
  //     "js": [
  //       "jquery-3.6.0.min.js",
  //       "main.js"
  //     ]
  //   }
  // ]
  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
  // const clip = (d, s) => {
  //   const p = d.createElement('pre');
  //   p.style.webkitUserSelect = 'auto';
  //   p.style.userSelect = 'auto';
  //   p.textContent = s;
  //   d.body.appendChild(p);
  //   d.getSelection().selectAllChildren(p);
  //   const r = d.execCommand('copy');
  //   d.body.removeChild(p);
  //   return r;
  // };
  const dl = (w, d, name = 'walletables.csv', list) => {
    const data = list.map((cols) => cols.join(',')).join('\n');
    const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
    /* eslint no-undef: 0 */
    const blob = new Blob([bom, data], { type: 'text/csv' });
    const url = (w.URL || w.webkitURL).createObjectURL(blob);
    const a = d.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    (w.URL || w.webkitURL).revokeObjectURL(url);
  };
  const pushTexts = (list, baseQuery, tagRow, tagCol) => {
    console.debug(`==> pushing.. ${tagRow} ${tagCol}`);
    /* eslint no-undef: 0 */
    $(`${baseQuery} ${tagRow}`).each((i, e) => {
      const row = [];
      $(e)
        .find(tagCol)
        .each((i, ed) => {
          row.push(`"${$(ed).text()}"`);
        });
      list.push(row);
    });
    return list;
  };

  const findActivePage = () => {
    const num = $('.list-pager .sw-pagination ul li.active a').attr('data-num');
    if (!num) return -1;
    return Number(num);
  };

  const findMaxOffset = () => {
    let max = 1;
    /* eslint no-undef: 0 */
    $('.list-pager .sw-pagination ul li a').each((i, e) => {
      let n = $(e).attr('data-num');
      if (!n || !n.match(/\d+/)) return;
      n = Number(n);
      if (n && n > max) max = n;
    });
    return max;
  };

  const waitIfNeeded = async () => {
    // let c = 5;
    while ($('div.spinner').length > 0) {
      console.debug('==> Waiting spinner done..');
      await sleep(500);
      // c--;
      // if (c <= 0) break;
    }
    await sleep(1500);
  };

  const clickElementForChangePage = async (opt) => {
    console.debug(`===> Changing page...${opt}`);
    // console.debug($(`.list-pager .sw-pagination ${opt}`));
    $(`.list-pager .sw-pagination ${opt}`).click();
    await waitIfNeeded();
  };

  // const activateFirstPageIfNeeded = async () => {
  //   const active = findActivePage();
  //   if (active === 1) return;
  //   await clickElementForChangePage('li:nth-child(2) a');
  // };

  const nextPage = async () => {
    await clickElementForChangePage('li:last-child a i');
  };

  const getCsvName = () => {
    const bankName = $('div#walletables_page section.walletable-columns div div div:nth-child(1) span.walletable-name').text();
    const ymd = $('div#vb-dateInput_5 input').val();
    return `freee-${ymd}-${bankName}.csv`;
  };

  const main = async () => {
    const max = findMaxOffset();
    // activateFirstPageIfNeeded();
    const active = findActivePage();
    if (active !== 1) {
      alert(`１ページ目を選択してください. 現在=${active}`);
      return;
    }
    let all = pushTexts([], 'table.wallet-txn-list-table', 'thead', 'th');
    let cnt = 1;
    for (;;) {
      const active = findActivePage();
      console.debug(`==> ${cnt}: ${active}/${max}`);
      all = pushTexts(all, 'table.wallet-txn-list-table', 'tbody', 'td');
      if (cnt >= max) {
        console.debug(`==> breaking ${cnt}: ${active}/${max}`);
        break;
      }
      cnt++;
      await nextPage();
    }
    console.debug('Done', all);
    // clip(d, JSON.stringify(all, null, 2));
    const csvName = getCsvName();
    dl(window, document, csvName, all);
  };
  main();
})();
