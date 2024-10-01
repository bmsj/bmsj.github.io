// Difficulty Table
let mark = "";
let data_link = "";
const nowLang = navigator.language.slice(0, 2);
const languagePrefix =
  nowLang === "ko" ? "ko" : nowLang === "ja" ? "ja" : "en-GB";
document.addEventListener("DOMContentLoaded", function () {
  async function getJSON() {
    const response = await fetch(
      document.querySelector("meta[name=bmstable]").getAttribute("content")
    );
    const header = await response.json();
    document.getElementById("changelogText").value = "Loading...";
    if (header.symbol) mark = header.symbol;
    if (header.data_url) data_link = header.data_url;
    if (header.level_order) {
      const enumOrder = header.level_order.map((e) => mark + e);
      DataTable.enum(enumOrder);
    }
    makeBMSTable();
  }
  if (document.querySelector("meta[name=bmstable]")) getJSON();
});

// BMS table
function makeBMSTable() {
  let table = new DataTable("#tableDiff", {
    paging: false,
    info: false,
    lengthChange: false,
    order: [],

    language: {
      url: `//cdn.datatables.net/plug-ins/2.1.3/i18n/${languagePrefix}.json`,
    },

    ajax: {
      url: data_link,
      dataSrc: "",
    },

    columns:
      typeof tableColumns === "undefined" ? DEFAULT_COLUMNS : tableColumns,

    createdRow: function (row, data) {
      const rowColor = {
        1: "state1",
        2: "state2",
        3: "state3",
      };
      if (data.state) row.classList.add(rowColor[data.state]);
    },

    initComplete: function () {
      // Make Changelog
      makeChangelog(table);
      // Filter
      makeFilter(table);
    },
  });
}

// Changelog
function makeChangelog(table) {
  const data = table.ajax.json();
  data.sort((a, b) => new Date(b.date) - new Date(a.date));
  const changelogData = data
    .map(function (song) {
      const dateStr = formatDateString(song.date);
      return `(${dateStr}) ${mark}${song.level} ${song.title}`;
    })
    .join("\n");
  document.getElementById("changelogText").value = changelogData;
}

// Make Filter
function makeFilter(table) {
  const column = table.column(0);
  const filterText =
    languagePrefix === "ko"
      ? "레벨별 필터: "
      : languagePrefix === "ja"
      ? "レベルでフィルタ: "
      : "Filter by Level: ";

  const selectContainer = document.createElement("div");
  selectContainer.classList.add("dt-length");

  const select = document.createElement("select");
  select.add(new Option("All", ""));

  select.addEventListener("change", function () {
    const val = DataTable.util.escapeRegex(this.value);
    column.search(val ? "^" + val + "$" : "", true, false).draw();
  });

  selectContainer.appendChild(document.createTextNode(filterText));
  selectContainer.appendChild(select);

  document
    .querySelector("#tableDiff_wrapper > div:nth-child(1) > .dt-start")
    .prepend(selectContainer);

  column
    .data()
    .unique()
    .sort(function (a, b) {
      // a - b = asc, b - a = desc
      return parseInt(a) - parseInt(b);
    })
    .each(function (d, j) {
      const option = document.createElement("option");
      option.value = mark + d;
      option.textContent = mark + d;
      select.appendChild(option);
    });
}

// Date Format
function formatDateString(dateStr) {
  const date_ = new Date(dateStr);
  const year = date_.getFullYear();
  const month = String(date_.getMonth() + 1).padStart(2, "0");
  const day = String(date_.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

const tableData = {
  tableLevel: function (data) {
    return mark + data;
  },

  tableTitle: function (data, type, row) {
    let lr2irURL =
      "http://www.dream-pro.info/~lavalse/LR2IR/search.cgi?mode=ranking&bmsmd5=";
    lr2irURL += row.md5;
    return `<a href='${lr2irURL}' target='_blank'>${data}</a>`;
  },

  tableScore: function (data) {
    let scoreURL = "https://bms-score-viewer.pages.dev/view?md5=";
    scoreURL += data;
    if (data) {
      return `<a href='${scoreURL}' target='_blank'>♪</a>`;
    } else {
      return "";
    }
  },

  tableMovie: function (data) {
    let movieURL = "https://www.youtube.com/watch?v=";
    if (data) {
      movieURL += data.slice(-11);
      return `<a href='${movieURL}' target='_blank'>▶</a>`;
    } else {
      return "";
    }
  },

  tableArtist: function (data, type, row) {
    let artistStr = "";
    if (row.url) {
      artistStr = `<a href='${row.url}' target='_blank'>${data || row.url}</a>`;
    }
    if (row.url_pack) {
      if (row.name_pack) {
        artistStr += `<br />(<a href='${row.url_pack}' target='_blank'>${row.name_pack}</a>)`;
      } else {
        artistStr += `<br />(<a href='${row.url_pack}' target='_blank'>${row.url_pack}</a>)`;
      }
    } else if (row.name_pack) {
      artistStr += `<br />(${row.name_pack})`;
    }
    return artistStr;
  },

  tableDate: function (data) {
    if (data) {
      return formatDateString(data);
    } else {
      return "";
    }
  },

  tableChart: function (data, type, row) {
    if (row.url_diff) {
      if (data) {
        return `<a href='${row.url_diff}' target='_blank'>${data}</a>`;
      } else {
        return `<a href='${row.url_diff}'>DL</a>`;
      }
    } else {
      if (data) {
        return data;
      } else {
        if (languagePrefix === "ko") {
          return "동봉";
        } else {
          return "同梱";
        }
      }
    }
  },

  tableComment: function (data, type, row) {
    return row.comment || "";
  },

  tableZurecheck: function (data,type,row) {
    if (row.zure_check) {
		return `<span class="tooltip"> ✅ <span class="tooltiptext">${row.zure_check}</span></span>`;
	} else {
		return `<span class="tooltip"> ❌ <span class="tooltiptext">` + (languagePrefix === "ko" ? "키음 추가 또는 재배치 있음" : "キー音の追加または再配置あり") + `</span></span>`;
	}
  },  
};

const DEFAULT_COLUMNS = [
  {
    title: "Level",
    width: "1%",
    data: "level",
    type: "natural",
    orderable: false,
    searchable: false,    
    render: tableData.tableLevel,
  },
  {
    title: "♪",
    width: "1%",
    data: "md5",
    orderable: false,
    searchable: false,
    render: tableData.tableScore,
  },
  {
    title: "▶",
    width: "1%",
    data: "movie_link",
    orderable: false,
    searchable: false,
    render: tableData.tableMovie,
  },
  {
    title: "Title<br />(LR2IR)",
    width: "30%",
    data: "title",
    render: tableData.tableTitle,
  },
  {
    title: "Artist<br />(BMS DL)",
    width: "25%",
    data: "artist",
    render: tableData.tableArtist,
  },
  {
    title: "DL",
    width: "1%",
    data: "name_diff",
    className: "text-nowrap",
    render: tableData.tableChart,
  },
  {
    title: "Date",
    width: "1%",
    data: "date",
    className: "text-nowrap",
    render: tableData.tableDate,
  },
  {
    title: "Comment",
    width: "25%",
    render: tableData.tableComment,
  },
  {
    title: "Zure<br />Check",
    width: "1%",
    render: tableData.tableZurecheck,
  },
];
