var get_data_area = function () {
  return $("#data_area");
};
var data = [];
var dataStr = "";
const labels = "ABCDEFG".split("");
var linkNodes = (from, to, cost) => {
  var edge = labels[from] + "--" + labels[to] + '[label="' + cost + '"]';
  data = data.filter((d) => d != edge);
  data = [...data, edge];
  dataStr = `graph{${data.join(";")}}`;
};

/* More about syntax: http://www.graphviz.org/doc/info/lang.html */
/* Query example: https://draw.khairulin.com/chart?cht=gv&chl=digraph{1->2;2->3;1->3;3->4;1->5} */
var render_service = "https://draw.khairulin.com/";
var previous_graph = "";

var chart_url = function (graph) {
  var result = render_service + "chart?cht=gv&chl=" + graph;
  /*console.log("url: " + result);*/
  return result;
};

var render_chart = function (graph) {
  if (graph !== previous_graph) {
    history.pushState({ query: "graph" }, "graphpage", "?q=" + graph);
    $("#output").attr("src", chart_url(graph));
    previous_graph = graph;
  }
};

var show = function () {
  $("#show_button").attr("class", "success button expanded radius");
  render_chart(dataStr);
  $("#show_button").attr("class", "success hollow button expanded radius");
};

var parse_url_query = function () {
  var url = window.location.href;
  var hash = url.indexOf("#");
  if (hash >= 0) url = url.substr(0, hash);
  var qmark = url.indexOf("?");
  if (qmark < 0) return "";
  var args = decodeURI(url.substr(qmark + 1)).split("&");
  for (var i in args) {
    var pair = args[i].split("=");
    if (pair.length >= 2 && pair[0] === "q") return pair.slice(1).join("=");
  }
  return "";
};

var handle_query = function () {
  var query = parse_url_query();
  if (query.length > 0 && query[query.length - 1] === "}") {
    var graph_type = "";
    var data = "";
    if (query.substr(0, 6) === "graph{") {
      graph_type = "graph";
      data = query.substr(6, query.length - 7);
    } else if (query.substr(0, 8) === "digraph{") {
      graph_type = "digraph";
      data = query.substr(8, query.length - 9);
    } else {
      return;
    }
    $("#graph_type").val(graph_type);
    var separator = graph_type === "graph" ? "--" : "->";
    var edges = data.split(";");
    var lines = [];
    var pattern = "[label";
    for (var i in edges) {
      var e = edges[i];
      if (e.length < 1) continue;
      var sep = e.indexOf(separator);
      if (sep < 1) continue;
      var line = e.substr(0, sep);
      var brace = e.indexOf("[", sep + 3);
      if (brace < 0) {
        line += " " + e.substr(sep + 2);
        lines.push(line);
        continue;
      }
      line += " " + e.substr(sep + 2, brace - sep - 2);
      if (
        e.substr(e.length - 2) === '"]' &&
        e.substr(brace + 1, 6) !== 'label="'
      ) {
        line += " " + e.substr(brace + 8, e.length - brace - 10);
      }
      lines.push(line);
    }
    if (lines.length > 0) {
      get_data_area().val(lines.join("\n"));
      show();
    }
  }
};

var on_copy_button_click = function () {
  var data_area = get_data_area().get(0);
  data_area.select();
  data_area.setSelectionRange(0, 99999); /*For mobile devices*/
  document.execCommand("copy");
};

$(document).ready(function () {
  $("#show_button").click(show);
  $("#copy_button").click(on_copy_button_click);
  shortcut.add("Ctrl+Enter", show);
  handle_query();
});

function generateTable() {
  const nodeCount = document.getElementById("nodeCount").value;
  const tableContainer = document.getElementById("tableContainer");
  tableContainer.innerHTML = ""; // Clear previous table
  const button = document.createElement("button");
  button.textContent = "Generate Graph";
  button.setAttribute("onclick", "show()");
  button.style.display = "block";
  button.style.marginTop = "20px";

  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");

  // Create header row
  const headerRow = document.createElement("tr");
  headerRow.appendChild(document.createElement("th")); // Empty top-left cell
  labels.slice(0, nodeCount).forEach((label) => {
    const th = document.createElement("th");
    th.innerText = label;
    headerRow.appendChild(th);
  });
  headerRow.appendChild(document.createElement("th")).innerText = "Dist to O";
  headerRow.appendChild(document.createElement("th")).innerText = "Cost";
  thead.appendChild(headerRow);

  // Create body rows
  for (let i = 0; i < nodeCount; i++) {
    const row = document.createElement("tr");
    const labelCell = document.createElement("th");
    labelCell.innerText = labels[i];
    row.appendChild(labelCell);

    for (let j = 0; j < nodeCount; j++) {
      const cell = document.createElement("td");
      if (j > i) {
        cell.contentEditable = true;
        cell.oninput = function () {
          updateTable(i, j, this.innerText);
        };
      } else if (j <= i) {
        cell.innerText = "-";
      }
      row.appendChild(cell);
    }

    // Distance to O and Cost cells
    const distToOCell = document.createElement("td");
    distToOCell.contentEditable = true;
    distToOCell.oninput = function () {
      // Optionally, handle input for distance to center node
    };
    row.appendChild(distToOCell);

    const costCell = document.createElement("td");
    costCell.contentEditable = true;
    costCell.oninput = function () {
      // Optionally, handle input for cost
    };
    row.appendChild(costCell);

    tbody.appendChild(row);
  }

  table.appendChild(thead);
  table.appendChild(tbody);
  tableContainer.appendChild(table);
  tableContainer.appendChild(button);
}

function updateTable(row, col, value) {
  const table = document.querySelector("table");
  linkNodes(row, col, value);
  const cell = table.rows[col + 1].cells[row + 1]; // +1 to account for header row and label column
  cell.innerText = value;
}
