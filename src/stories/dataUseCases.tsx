import { getSimpleData } from "../utils/generateData";
import { Tooltip, Checkbox } from "@material-ui/core";
import React from "react";
import { HeadersData } from "../column/types/header.type";
import { GridData } from "../types/row.interface";
import PeopleIcon from "@material-ui/icons/People";
import { CheckBox } from "@material-ui/icons";

export const getTopUseCase = () => {
  const headerData: HeadersData = [
    [
      {
        id: "deliverable",
        title: "Deliverable",
        accessor: "deliverableBody",
      },
      {
        // children: "Work Package",
        renderer: () => {
          return (
            <Tooltip
              title={"You can preview this tooltip"}
              arrow
              placement={"bottom"}
            >
              <p>Work Package</p>
            </Tooltip>
          );
        },
        id: "wp",
        title: "Work Package",
        tooltip: "You can preview the tooltip in here",
        accessor: "deliverableBody",
      },
      {
        id: "activity",
        accessor: "activityBody",
        title: "Activity",
      },
      {
        id: "order",
        accessor: "order",
        title: "",
        disableNavigation: true,
        readOnly: true,
        // width: 30
      },
      {
        id: "task",
        accessor: "taskContent",
        title: "Task",
      },
      {
        id: "dp",
        accessor: "dependencies",
        title: "DP",
      },
      {
        id: "estimatedTime",
        title: "Est. Time",
        accessor: "estimatedTime",
      },
      {
        id: "realTime",
        title: "Real Time",
        accessor: "realTime",
      },
      {
        id: "allocated",
        title: "",
        renderer: () => {
          return <PeopleIcon />;
        },
        accessor: "allocated",
      },
      {
        id: "materials",
        title: "Mat Costs",
        accessor: "materials",
      },
      {
        id: "startDate",
        title: "Start Date",
        accessor: "startDate",
      },
      {
        id: "endDate",
        title: "End Date",
        accessor: "endDate",
      },
      {
        id: "taskControl",
        title: "Task Control",
        accessor: "taskControl",
      },
      {
        id: "delete",
        title: "",
        // renderer: () => {
        //   return <Checkbox value={false} />;
        // },
        accessor: "delete",
      },
    ],
  ];

  const data: GridData = [
    [
      {
        id: "1",
        children: "My first del 1",
        rowSpan: 3,
      },
      {
        id: "wp1",
        children: "WP 1",
      },
      {
        id: "act1",
        children: "Activity 1",
      },
      {
        id: "order1",
        children: "1",
      },
      {
        id: "t1",
        children: "Task 1",
      },
      {
        id: "dp1",
        children: "[]",
      },
      {
        id: "es1",
        children: "0",
      },
      {
        id: "rt1",
        children: "0",
      },
      {
        id: "allocated1",
        children: "",
      },
      {
        id: "materials1",
        children: "0",
      },
      {
        id: "startDate1",
        children: "",
      },
      {
        id: "endDate1",
        children: "",
      },
      {
        id: "taskControl1",
        children: "",
      },
      {
        id: 'delete1',
        children: 'the trash'
      }
    ],
    [
      {
        id: "wp-id-2",
        children: "WP 2",
        rowSpan: 2,
      },
      {
        id: "act-id-111",
        children: "ACT 2",
        rowSpan: 2,
      },
      {
        id: "order2",
        children: "2",
      },
      {
        id: "t2",
        children:
          "TASK 2 ssssssssssssssssssssssssssssssssssssssssssssssssssssss ddddddddddddddddddddddddddddddddddddddd",
      },
      {
        id: "dp2",
        children: "[]",
      },
      {
        id: "est2",
        children: "0",
      },
      {
        id: "rt2",
        children: "0",
      },
      {
        id: "allocated2",
        children: "",
      },
      {
        id: "materials2",
        children: "0",
      },
      {
        id: "startDate2",
        children: "",
      },
      {
        id: "endDate2",
        children: "",
      },
      {
        id: "taskControl2",
        children: "",
      },
      {
        id: 'delete2',
        children: 'the trash'
      }
    ],
    [
      {
        id: "order3",
        children: "3",
      },
      {
        id: "t3",
        children: "Task 3",
      },
      {
        id: "dp3",
        children: "[ 1,2 ]",
      },
      {
        id: "est3",
        children: "123",
      },
      {
        id: "rt3",
        children: "4",
      },
      {
        id: "allocated3",
        children: "",
      },
      {
        id: "materials3",
        children: "0",
      },
      {
        id: "startDate3",
        children: "",
      },
      {
        id: "endDate3",
        children: "",
      },
      {
        id: "taskControl3",
        children: "",
      },
      {
        id: 'delete3',
        children: 'the trash'
      }
    ],
  ];

  return {
    data,
    headerData,
  };
};

export const getRandomUseCase = () => {
  return getSimpleData(20, 8);
};

/** @todo Children might need a row grouping but we can do that with a plugin to have rows that have groups **/
export const getFinancialUseCase = () => {
  const headerData = [
    [
      {
        children: "Test",
      },
      {
        children: "2020",
      },
      {
        children: "2019",
      },
      {
        children: "2018",
      },
      {
        children: "2017",
      },
    ],
    [
      {
        children: "Ongoing",
      },
      {
        children: "Baseline",
      },
      {
        children: "Ongoing",
      },
      {
        children: "Baseline",
      },
      {
        children: "Ongoing",
      },
    ],
  ];

  const data = [
    ...[
      [
        {
          id: "1",
          children: "My first del 1",
          rowSpan: 3,
        },
        {
          children: "WP 1",
        },
        {
          children: "Activity 1",
        },
        {
          children: "1",
        },
        {
          children: "Task 1",
        },
        {
          children: "[]",
        },
        {
          children: "0",
        },
        {
          children: "0",
        },
      ],
      [
        {
          id: "wp-id-2",
          children: "WP 2",
          rowSpan: 2,
        },
        {
          id: "act-id-111",
          children: "ACT 2",
          rowSpan: 2,
        },
        {
          children: "2",
        },
        {
          children:
            "TASK 2 ssssssssssssssssssssssssssssssssssssssssssssssssssssss ddddddddddddddddddddddddddddddddddddddd eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        },
        {
          children: "[]",
        },
        {
          children: "0",
        },
        {
          children: "0",
        },
      ],
      [
        {
          children: "3",
        },
        {
          children: "Task 3",
        },
        {
          children: "[ 1,2 ]",
        },
        {
          children: "123",
        },
        {
          children: "4",
        },
      ],
    ],
  ];

  return {
    data,
    headerData,
  };
};
