// @ts-ignore
import faker from "faker";
import {Column, HeadersData} from "../column/types/header.type";
import {GridData, GridRow} from "../types/row.interface";

export const getSimpleData = (rows: number, columns: number) => {
  const headerData: HeadersData = [];
  const data: GridData = [];
  const headerRows: number = 2;

  for (let i = 0; i < headerRows; i += 1) {
    const row: Column[] = [];
    for (let j = 0; j < columns; j += 1) {
      if (i === 0) {
        if (j % 2 === 0) {
          row.push({
            id: "col-" + Math.random(),
            title: `Colspanned Column [${i + 1}, ${j + 1}]`,
            colSpan: 2,
            accessor: ""
          });
        }
      } else {
        row.push({
          id: "col-c-" + Math.random(),
          title: `Column [${i + 1}, ${j + 1}]`,
          accessor: ""
        });
      }
    }

    headerData.push(row);
  }

  for (let i = 0; i < columns; i += 1) {
    headerData[0].push({
      id: "col-" + Math.random(),
      title: `Column ${i + 1}`,
      accessor: "",
    });
  }

  for (let i = 0; i < rows; i += 1) {
    const row: GridRow = [];

    for (let j = 0; j < columns; j += 1) {
      if (j === 0) {
        if (i % 3 === 0) {
          row.push({
            id: "faked-" + Math.random(),
            children: `Rowspanned Cell [${i + 1}, ${j + 1}]`,
            rowSpan: 3,
          });
        }
      } else {
        row.push({
          id: "child-" + Math.random(),
          children: faker.lorem.text(1),
        });
      }
    }

    data.push(row);
  }

  return {
    headerData,
    data,
  };
};
