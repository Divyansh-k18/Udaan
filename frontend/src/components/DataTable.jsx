import { useMemo, useState } from "react";
import { speak, stopSpeaking } from "../services/speech.js";
import "../styles/questionRendering.css";

function getCellText(cell) {
  if (cell === null || cell === undefined) {
    return "";
  }

  if (typeof cell === "object") {
    return String(
      cell.text ??
        cell.value ??
        cell.label ??
        ""
    );
  }

  return String(cell);
}

function getCellLang(cell, fallbackLang) {
  if (typeof cell === "object" && cell !== null) {
    return cell.lang || cell.langCode || fallbackLang;
  }

  return fallbackLang;
}

function normaliseColumns(table, rows, fallbackLang) {
  if (Array.isArray(table?.columns) && table.columns.length > 0) {
    return table.columns.map((column, index) => {
      if (typeof column === "string") {
        return {
          key: String(index),
          label: column,
          lang: table.lang || fallbackLang,
        };
      }

      return {
        key: column.key ?? column.id ?? String(index),
        label:
          column.label ??
          column.text ??
          column.name ??
          `Column ${index + 1}`,
        lang:
          column.lang ||
          column.langCode ||
          table.lang ||
          fallbackLang,
      };
    });
  }

  const firstRow = rows[0];

  if (firstRow && !Array.isArray(firstRow)) {
    return Object.keys(firstRow).map((key) => ({
      key,
      label: key,
      lang: table?.lang || fallbackLang,
    }));
  }

  const columnCount = Array.isArray(firstRow)
    ? firstRow.length
    : 0;

  return Array.from({ length: columnCount }, (_, index) => ({
    key: String(index),
    label: `Column ${index + 1}`,
    lang: table?.lang || fallbackLang,
  }));
}

function getRowCell(row, column, columnIndex) {
  if (Array.isArray(row)) {
    return row[columnIndex];
  }

  if (row && typeof row === "object") {
    return row[column.key];
  }

  return "";
}

export function buildRowSpeech(
  row,
  columns,
  rowNumber,
  fallbackLang
) {
  const values = columns.map((column, columnIndex) => {
    const cell = getRowCell(row, column, columnIndex);

    return `${column.label}: ${getCellText(cell)}`;
  });

  return `Row ${rowNumber}. ${values.join(". ")}.`;
}

export function buildColumnSpeech(
  rows,
  columns,
  columnIndex,
  rowHeaderIndex = 0
) {
  const column = columns[columnIndex];

  if (!column) {
    return "";
  }

  const values = rows.map((row, rowIndex) => {
    const cell = getRowCell(row, column, columnIndex);

    let prefix = `Row ${rowIndex + 1}`;

    if (
      rowHeaderIndex !== null &&
      columns[rowHeaderIndex]
    ) {
      const rowHeader = getRowCell(
        row,
        columns[rowHeaderIndex],
        rowHeaderIndex
      );

      const rowHeaderText = getCellText(rowHeader);

      if (rowHeaderText) {
        prefix = rowHeaderText;
      }
    }

    return `${prefix}: ${getCellText(cell)}`;
  });

  return `Column ${column.label}. ${values.join(". ")}.`;
}

export default function DataTable({
  table,
  langCode = "en-IN",
  speechRate = 1,
  allowSpeech = true,
  onReadText,
}) {
  const rows = useMemo(() => {
    if (Array.isArray(table?.rows)) {
      return table.rows;
    }

    if (Array.isArray(table?.data)) {
      return table.data;
    }

    return [];
  }, [table]);

  const columns = useMemo(
    () => normaliseColumns(table, rows, langCode),
    [table, rows, langCode]
  );

  const [selectedRow, setSelectedRow] = useState(0);
  const [selectedColumn, setSelectedColumn] = useState(0);
  const [liveMessage, setLiveMessage] = useState("");

  const tableLang = table?.lang || table?.langCode || langCode;

  const rowHeaderIndex =
    table?.rowHeaderIndex === null
      ? null
      : table?.rowHeaderIndex ?? 0;

  const caption =
    table?.caption ||
    table?.title ||
    "Question data table";

  function readText(text, language = tableLang) {
    if (!text) {
      return;
    }

    stopSpeaking();

    if (typeof onReadText === "function") {
      onReadText(text, language);
      return;
    }

    if (!allowSpeech) {
      setLiveMessage(
        "Udaan speech is turned off. Use your screen reader to explore the table."
      );
      return;
    }

    speak(text, language, speechRate);
  }

  function readSelectedRow() {
    if (!rows[selectedRow]) {
      setLiveMessage("That row is not available.");
      return;
    }

    const text = buildRowSpeech(
      rows[selectedRow],
      columns,
      selectedRow + 1,
      tableLang
    );

    setLiveMessage(
      `Reading row ${selectedRow + 1}.`
    );

    readText(text, tableLang);
  }

  function readSelectedColumn() {
    if (!columns[selectedColumn]) {
      setLiveMessage("That column is not available.");
      return;
    }

    const text = buildColumnSpeech(
      rows,
      columns,
      selectedColumn,
      rowHeaderIndex
    );

    setLiveMessage(
      `Reading column ${columns[selectedColumn].label}.`
    );

    readText(text, columns[selectedColumn].lang);
  }

  if (!table || columns.length === 0) {
    return null;
  }

  return (
    <section
      className="data-table-region"
      aria-labelledby="data-table-heading"
    >
      <h3 id="data-table-heading">
        Table information
      </h3>

      <div
        className="table-scroll-region"
        tabIndex="0"
        role="region"
        aria-label={`${caption}. Table may be scrolled horizontally if it cannot completely reflow.`}
      >
        <table
          className="accessible-data-table"
          lang={tableLang}
        >
          <caption>{caption}</caption>

          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  lang={column.lang}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={`row-${rowIndex}`}>
                {columns.map((column, columnIndex) => {
                  const cell = getRowCell(
                    row,
                    column,
                    columnIndex
                  );

                  const text = getCellText(cell);

                  const cellLang = getCellLang(
                    cell,
                    column.lang || tableLang
                  );

                  if (columnIndex === rowHeaderIndex) {
                    return (
                      <th
                        key={`${rowIndex}-${column.key}`}
                        scope="row"
                        lang={cellLang}
                      >
                        {text}
                      </th>
                    );
                  }

                  return (
                    <td
                      key={`${rowIndex}-${column.key}`}
                      lang={cellLang}
                    >
                      {text}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        className="table-reading-tools"
        aria-label="Table reading helpers"
      >
        <div className="table-reading-control">
          <label htmlFor="table-row-selector">
            Row to read
          </label>

          <select
            id="table-row-selector"
            value={selectedRow}
            onChange={(event) =>
              setSelectedRow(Number(event.target.value))
            }
          >
            {rows.map((_, index) => (
              <option key={index} value={index}>
                Row {index + 1}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={readSelectedRow}
            disabled={rows.length === 0}
          >
            Read row
          </button>
        </div>

        <div className="table-reading-control">
          <label htmlFor="table-column-selector">
            Column to read
          </label>

          <select
            id="table-column-selector"
            value={selectedColumn}
            onChange={(event) =>
              setSelectedColumn(Number(event.target.value))
            }
          >
            {columns.map((column, index) => (
              <option key={column.key} value={index}>
                {column.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={readSelectedColumn}
          >
            Read column
          </button>
        </div>
      </div>

      <p
        className="sr-status"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {liveMessage}
      </p>
    </section>
  );
}