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
      // Filter
      makeFilter(table);
    },
  });
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


const tableData = {
  tableLevel: function (data) {
    return mark + data;
  },

 tableTitle: function (data, type, row) {
    if (row.md5) {
      let irURL = "https://ez2pattern.kr/bms/ir/qwilight?md5=";
      irURL += row.md5;
      let sabunName = row.sabun_name;
      return `<a href='${irURL}' target='_blank'>${data} ${sabunName}</a>`;
    } else {
      return (data + sabunName);
    }
  },

  tableType: function (data) {
    if (data) {
      return data;
    } else {return " ";}
  },
  
  tableScore: function (data) {
    let scoreURL = "https://ez2pattern.kr/bms/chart?md5=";
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
    if (row.url) {
      let artistStr = "";
      artistStr = `<a href='${row.url}' target='_blank'>${data || row.url}</a>`;
      return artistStr;
    } else {
      return data;
    }
  },

  tableSabunArtist: function (data) {
    if (data) {
      return data;
    } else {return " ";}
  },

  tableChart: function (data, type, row) {
      if (data) {
        return `<a href='${data}'>DL</a>`;
      } else {return "　";}
  },

  tableComment: function (data, type, row) {
    return row.comment || "";
  }
};

const DEFAULT_COLUMNS = [
  {
    title: "Level",
    width: "10%",
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
    title: "Type",
    width: "10%",
    data: "type",
    render: tableData.tableType,
  },
  {
    title: "Title<br />(Qwilight IR)",
    width: "20%",
    data: "title",
    render: tableData.tableTitle,
  },
  {
    title: "Artist<br />(BMS DL)",
    width: "15%",
    data: "artist",
    render: tableData.tableArtist,
  },
  {
    title: "Sabun Artist",
    width: "15%",
    data: "sabun_artist",
    render: tableData.tableSabunArtist,
  },
  {
    title: "DL",
    width: "1%",
    data: "url_diff",
    className: "text-nowrap",
    render: tableData.tableChart,
  },
  {
    title: "Comment",
    width: "25%",
    render: tableData.tableComment,
  }
];
